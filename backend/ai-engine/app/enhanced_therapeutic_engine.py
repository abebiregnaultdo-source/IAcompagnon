"""
Moteur Thérapeutique Amélioré - Intégration Hybride

Architecture :
- Préserve TOUT le système existant (TherapeuticEngine, EmotionService)
- Ajoute des améliorations progressives (ContextEnhancer, ProgressiveEnhancer)
- Fallback automatique en cas de problème
"""

from typing import Dict, Any, List, Optional
from dataclasses import dataclass
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# Import du système EXISTANT (à adapter selon votre structure)
try:
    from .therapeutic_engine import TherapeuticEngine
    EXISTING_ENGINE_AVAILABLE = True
except ImportError:
    logger.warning("TherapeuticEngine not found, using mock")
    EXISTING_ENGINE_AVAILABLE = False

    # Mock pour développement
    class TherapeuticEngine:
        def generate_response(self, message: str, emotion: Dict, user_id: str) -> str:
            return f"[MOCK] Réponse thérapeutique pour: {message}"

# Import des AMÉLIORATIONS
try:
    from .advanced_rag import (
        KnowledgeGraphRAG,
        SuperSystemPromptEngine,
        ClinicalContext,
        TherapeuticPhase,
        get_rag_engine
    )
    RAG_AVAILABLE = True
except ImportError:
    logger.warning("Advanced RAG not available")
    RAG_AVAILABLE = False

try:
    import sys
    sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'emotions-service' / 'app'))
    from advanced_emotion import ClinicalEmotionEngine, EmotionalState, get_emotion_engine
    EMOTIONBERT_AVAILABLE = True
except ImportError:
    logger.warning("EmotionBERT not available")
    EMOTIONBERT_AVAILABLE = False

    # Mock EmotionalState
    @dataclass
    class EmotionalState:
        valence: float = 0.0
        arousal: float = 0.0
        dominance: float = 0.0
        grief_intensity: float = 0.5
        phase_confidence: Dict[str, float] = None


@dataclass
class EnhancedContext:
    """Enrichit le contexte existant sans le remplacer"""
    base_emotion: Dict  # Existant: {'detresse': 75, 'espoir': 30, 'energie': 20}
    advanced_emotion: EmotionalState  # Nouveau: valence, arousal, dominance
    therapeutic_phase: str  # Déduit des phases existantes
    safety_level: str  # 'normal' | 'elevated' | 'crisis'


class PhaseMapper:
    """Mappe les scores existants vers des phases thérapeutiques"""

    def deduce_phase(self, emotion_scores: Dict) -> str:
        """Déduit la phase basée sur la logique existante + améliorations"""
        detresse = emotion_scores.get('detresse', 50)
        espoir = emotion_scores.get('espoir', 50)
        energie = emotion_scores.get('energie', 50)

        if detresse >= 75:
            return "crisis"
        elif detresse >= 60:
            return "stabilization"
        elif espoir >= 60 and energie >= 40:
            return "reconstruction"
        elif detresse <= 40:
            return "exploration"
        else:
            return "expression"

    def to_therapeutic_phase_enum(self, phase_str: str):
        """Convertit vers l'enum TherapeuticPhase si RAG disponible"""
        if not RAG_AVAILABLE:
            return phase_str

        mapping = {
            'crisis': TherapeuticPhase.CRISIS,
            'stabilization': TherapeuticPhase.STABILIZATION,
            'exploration': TherapeuticPhase.EXPLORATION,
            'expression': TherapeuticPhase.EXPLORATION,
            'reconstruction': TherapeuticPhase.RECONSTRUCTION
        }
        return mapping.get(phase_str, TherapeuticPhase.STABILIZATION)


class SafetyAssessor:
    """Évalue le niveau de sécurité pour adapter le prompt"""

    def __init__(self):
        self.crisis_indicators = [
            'suicide', 'suicider', 'mort', 'mourir', 'finir', 'plus fort',
            'cris', 'hurle', 'insupportable', 'plus capable', 'abandonner'
        ]

    def assess_safety(self, emotion_scores: Dict, message: str) -> str:
        """Évalue le niveau de sécurité"""
        detresse = emotion_scores.get('detresse', 50)

        # Vérifier les indicateurs de crise
        message_lower = message.lower()
        has_crisis_indicators = any(
            indicator in message_lower for indicator in self.crisis_indicators
        )

        if detresse >= 80 or has_crisis_indicators:
            return "crisis"
        elif detresse >= 60:
            return "elevated"
        else:
            return "normal"

    def get_safety_level_score(self, safety_level: str) -> float:
        """Convertit le niveau de sécurité en score [0,1]"""
        mapping = {
            'crisis': 0.2,
            'elevated': 0.5,
            'normal': 0.9
        }
        return mapping.get(safety_level, 0.5)


class ContextEnhancer:
    """Améliore le contexte sans modifier la logique existante"""

    def __init__(self):
        self.phase_mapper = PhaseMapper()
        self.safety_assessor = SafetyAssessor()

    def enhance_context(
        self,
        existing_emotion: Dict,
        user_message: str
    ) -> EnhancedContext:
        """Enrichit le contexte existant avec des analyses avancées"""

        # Conversion des émotions existantes vers format avancé
        advanced_emotion = self._map_to_advanced_emotion(existing_emotion, user_message)

        # Déduction de la phase thérapeutique
        therapeutic_phase = self.phase_mapper.deduce_phase(existing_emotion)

        # Évaluation de la sécurité
        safety_level = self.safety_assessor.assess_safety(existing_emotion, user_message)

        return EnhancedContext(
            base_emotion=existing_emotion,
            advanced_emotion=advanced_emotion,
            therapeutic_phase=therapeutic_phase,
            safety_level=safety_level
        )

    def _map_to_advanced_emotion(
        self,
        existing_emotion: Dict,
        user_message: str
    ) -> EmotionalState:
        """Convertit les scores existants vers EmotionalState avancé"""

        # Si EmotionBERT disponible, utiliser l'analyse avancée
        if EMOTIONBERT_AVAILABLE:
            try:
                engine = get_emotion_engine(use_gpu=False)
                return engine.analyze(user_message)
            except Exception as e:
                logger.warning(f"EmotionBERT analysis failed: {e}, using fallback")

        # Sinon, mapping heuristique depuis les scores existants
        detresse = existing_emotion.get('detresse', 50)
        espoir = existing_emotion.get('espoir', 50)
        energie = existing_emotion.get('energie', 50)

        # Mapping approximatif vers circumplex
        valence = (espoir - detresse) / 100.0  # [-1, 1]
        arousal = (detresse + energie) / 100.0 - 1.0  # [-1, 1]
        dominance = (energie - 50) / 50.0  # [-1, 1]
        grief_intensity = detresse / 100.0  # [0, 1]

        # Phase confidence basée sur les scores
        phase_confidence = self._estimate_phase_confidence(detresse, espoir, energie)

        return EmotionalState(
            valence=max(-1.0, min(1.0, valence)),
            arousal=max(-1.0, min(1.0, arousal)),
            dominance=max(-1.0, min(1.0, dominance)),
            grief_intensity=max(0.0, min(1.0, grief_intensity)),
            phase_confidence=phase_confidence
        )

    def _estimate_phase_confidence(
        self,
        detresse: float,
        espoir: float,
        energie: float
    ) -> Dict[str, float]:
        """Estime les probabilités de phases depuis les scores existants"""

        # Logique simplifiée (à améliorer avec des données réelles)
        if detresse >= 75:
            return {
                'choc_deni': 0.7,
                'colere': 0.15,
                'marchandage': 0.08,
                'depression': 0.05,
                'acceptation': 0.02
            }
        elif detresse >= 60:
            return {
                'choc_deni': 0.2,
                'colere': 0.4,
                'marchandage': 0.2,
                'depression': 0.15,
                'acceptation': 0.05
            }
        elif espoir >= 60:
            return {
                'choc_deni': 0.05,
                'colere': 0.1,
                'marchandage': 0.15,
                'depression': 0.2,
                'acceptation': 0.5
            }
        else:
            return {
                'choc_deni': 0.1,
                'colere': 0.2,
                'marchandage': 0.3,
                'depression': 0.3,
                'acceptation': 0.1
            }


class ProgressiveEnhancer:
    """Intègre progressivement les améliorations sans casser l'existant"""

    def __init__(self):
        self.enhancement_level = "basic"  # basic | moderate | advanced
        self.performance_tracker = {}

    def enhance_response(
        self,
        existing_response: str,
        context: EnhancedContext
    ) -> str:
        """Améliore progressivement la réponse existante"""

        if self.enhancement_level == "basic":
            return existing_response  # Garde l'existant

        elif self.enhancement_level == "moderate":
            return self._moderate_enhancement(existing_response, context)

        elif self.enhancement_level == "advanced":
            return self._advanced_enhancement(existing_response, context)

        return existing_response

    def _moderate_enhancement(
        self,
        response: str,
        context: EnhancedContext
    ) -> str:
        """Améliorations légères qui préservent le style existant"""

        if context.safety_level == "crisis":
            # Renforce la sécurité pour les crises
            crisis_indicators = ["Respirez", "Ancrez", "Présent", "Maintenant"]
            if not any(indicator in response for indicator in crisis_indicators):
                response = "Prenons un moment pour respirer ensemble. " + response

        elif context.therapeutic_phase == "reconstruction":
            # Ajoute des éléments de reconstruction si manquants
            if "sens" not in response.lower() and "valeur" not in response.lower():
                response += " Chaque petit pas a du sens dans ce chemin."

        return response

    def _advanced_enhancement(
        self,
        response: str,
        context: EnhancedContext
    ) -> str:
        """Améliorations avancées avec EmotionBERT"""

        # Adaptation basée sur la valence/arousal
        valence = context.advanced_emotion.valence
        arousal = context.advanced_emotion.arousal

        if arousal > 0.7 and valence < -0.5:  # Détresse aiguë
            response = self._apply_crisis_template(response, context)
        elif valence < -0.3:  # Émotions négatives
            response = self._enhance_validation(response, context)

        return response

    def _apply_crisis_template(self, response: str, context: EnhancedContext) -> str:
        """Applique un template de crise"""
        # Simplifie et raccourcit la réponse
        sentences = response.split('.')
        if len(sentences) > 2:
            response = '. '.join(sentences[:2]) + '.'

        # Ajoute ancrage
        if "respir" not in response.lower():
            response = "Respirez avec moi. " + response

        return response

    def _enhance_validation(self, response: str, context: EnhancedContext) -> str:
        """Renforce la validation émotionnelle"""
        validation_phrases = [
            "Ce que vous ressentez est légitime. ",
            "Vos émotions sont valides. ",
            "C'est normal de ressentir cela. "
        ]

        # Ajoute validation si absente
        if not any(phrase.lower() in response.lower() for phrase in validation_phrases):
            response = validation_phrases[0] + response

        return response



class IntegratedTherapeuticEngine:
    """Moteur final qui combine l'existant et les améliorations"""

    def __init__(self, enhancement_level: str = "moderate"):
        # GARDE TOUT L'EXISTANT
        self.existing_engine = TherapeuticEngine()

        # AJOUTE LES AMÉLIORATIONS
        self.context_enhancer = ContextEnhancer()
        self.response_enhancer = ProgressiveEnhancer()
        self.response_enhancer.enhancement_level = enhancement_level

        logger.info(f"IntegratedTherapeuticEngine initialized with enhancement_level={enhancement_level}")

    def process_message(
        self,
        user_message: str,
        existing_emotion: Dict,
        user_id: str = "default"
    ) -> str:
        """Processus qui préserve la logique existante"""

        try:
            # ÉTAPE 1: Utilise le système existant (garantie de stabilité)
            existing_response = self.existing_engine.generate_response(
                user_message, existing_emotion, user_id
            )

            # ÉTAPE 2: Améliore progressivement si bénéfique
            enhanced_context = self.context_enhancer.enhance_context(
                existing_emotion, user_message
            )

            final_response = self.response_enhancer.enhance_response(
                existing_response, enhanced_context
            )

            # ÉTAPE 3: Logging pour tracking
            self._log_enhancement(
                user_message, existing_response, final_response, enhanced_context
            )

            return final_response

        except Exception as e:
            logger.error(f"Error in enhanced processing: {e}, falling back to existing")
            return self.fallback_to_existing(user_message, existing_emotion, user_id)

    def fallback_to_existing(
        self,
        user_message: str,
        existing_emotion: Dict,
        user_id: str
    ) -> str:
        """Retour au système existant en cas de problème"""
        logger.warning("Using fallback to existing engine")
        return self.existing_engine.generate_response(
            user_message, existing_emotion, user_id
        )

    def _log_enhancement(
        self,
        user_message: str,
        existing_response: str,
        final_response: str,
        context: EnhancedContext
    ):
        """Log les améliorations pour analyse"""
        if existing_response != final_response:
            logger.info(
                f"Response enhanced | "
                f"Phase: {context.therapeutic_phase} | "
                f"Safety: {context.safety_level} | "
                f"Grief: {context.advanced_emotion.grief_intensity:.2f}"
            )


# Instance globale
_integrated_engine_instance = None

def get_integrated_engine(enhancement_level: str = "moderate") -> IntegratedTherapeuticEngine:
    """Retourne l'instance singleton du moteur intégré"""
    global _integrated_engine_instance
    if _integrated_engine_instance is None:
        _integrated_engine_instance = IntegratedTherapeuticEngine(enhancement_level)
    return _integrated_engine_instance

