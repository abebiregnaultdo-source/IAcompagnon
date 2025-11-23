"""
Système de Transitions Thérapeutiques Intelligentes

Décide quand et comment passer d'une méthode thérapeutique à une autre
en fonction de l'évolution de l'utilisateur et des signaux émergents.

Méthodes supportées :
- TIPI (régulation sensorielle)
- Logothérapie (recherche de sens)
- Expression narrative (reconstruction)
- Polyvagal (sécurité interne)
- Pleine conscience (présence)
"""

from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class TherapeuticMethod(Enum):
    """Méthodes thérapeutiques disponibles"""
    TIPI = "tipi"
    LOGOTHERAPIE = "logotherapie"
    NARRATIVE = "expression_narrative"
    POLYVAGAL = "ancrage_polyvagal"
    MINDFULNESS = "pleine_conscience"
    RESPIRATION = "respiration_regulation"
    VALIDATION = "validation_emotionnelle"


@dataclass
class TransitionSignal:
    """Signal indiquant qu'une transition est appropriée"""
    from_method: TherapeuticMethod
    to_method: TherapeuticMethod
    confidence: float  # 0-1
    reason: str
    user_signals: List[str]


class TherapeuticTransitionEngine:
    """Moteur de décision pour les transitions entre méthodes"""
    
    def __init__(self):
        self.transition_rules = self._load_transition_rules()
    
    def decide_transition(
        self,
        current_method: TherapeuticMethod,
        user_response: str,
        user_state: Dict[str, Any],
        conversation_context: Dict[str, Any]
    ) -> Optional[TransitionSignal]:
        """
        Décide si une transition vers une autre méthode est appropriée
        
        Args:
            current_method: Méthode actuellement utilisée
            user_response: Dernière réponse de l'utilisateur
            user_state: État émotionnel et somatique actuel
            conversation_context: Contexte de la conversation
        
        Returns:
            TransitionSignal si transition recommandée, None sinon
        """
        # Analyse des signaux émergents
        signals = self._detect_transition_signals(
            user_response, 
            user_state, 
            conversation_context
        )
        
        # Règles de transition spécifiques selon la méthode actuelle
        if current_method == TherapeuticMethod.TIPI:
            return self._tipi_transition_logic(signals, user_response, user_state)
        
        elif current_method == TherapeuticMethod.VALIDATION:
            return self._validation_transition_logic(signals, user_response, user_state)
        
        elif current_method == TherapeuticMethod.LOGOTHERAPIE:
            return self._logotherapie_transition_logic(signals, user_response, user_state)
        
        elif current_method == TherapeuticMethod.NARRATIVE:
            return self._narrative_transition_logic(signals, user_response, user_state)
        
        return None
    
    def _detect_transition_signals(
        self,
        user_response: str,
        user_state: Dict[str, Any],
        conversation_context: Dict[str, Any]
    ) -> Dict[str, bool]:
        """Détecte les signaux indiquant qu'une transition pourrait être bénéfique"""
        response_lower = user_response.lower()
        
        return {
            # Signaux de recherche de sens
            "meaning_emerging": any(word in response_lower for word in [
                "pourquoi", "sens", "raison", "comprendre", "signifie"
            ]),
            
            # Signaux de besoin d'expression
            "need_for_expression": any(word in response_lower for word in [
                "raconter", "dire", "parler", "exprimer", "partager"
            ]) or len(user_response) > 200,
            
            # Signaux de régulation somatique réussie
            "somatic_integration_achieved": (
                user_state.get("detresse", 100) < 50 and
                user_state.get("somatic_clarity", 0) > 0.6
            ),
            
            # Signaux de submersion
            "emotional_overwhelm": (
                user_state.get("detresse", 0) > 85 or
                any(word in response_lower for word in ["trop", "submergé", "débordé"])
            ),
            
            # Signaux de dissociation
            "dissociation_increasing": (
                user_state.get("dissociation", 0) > 0.6 or
                any(word in response_lower for word in ["vide", "rien", "engourdi", "absent"])
            ),
            
            # Signaux de rumination mentale
            "mental_loops": (
                user_state.get("cognitive_loops", 0) > 0.7 or
                conversation_context.get("repetition_count", 0) > 2
            ),
            
            # Signaux de besoin d'ancrage
            "need_grounding": (
                user_state.get("arousal", 0.5) > 0.8 or
                any(word in response_lower for word in ["perdu", "flotte", "déconnecté"])
            ),
            
            # Signaux de reconstruction narrative
            "narrative_reconstruction": any(word in response_lower for word in [
                "avant", "maintenant", "futur", "histoire", "vie"
            ])
        }
    
    def _tipi_transition_logic(
        self,
        signals: Dict[str, bool],
        user_response: str,
        user_state: Dict[str, Any]
    ) -> Optional[TransitionSignal]:
        """Logique de transition depuis TIPI"""
        
        # TIPI → Logothérapie (le sens émerge après régulation)
        if signals["meaning_emerging"] and signals["somatic_integration_achieved"]:
            return TransitionSignal(
                from_method=TherapeuticMethod.TIPI,
                to_method=TherapeuticMethod.LOGOTHERAPIE,
                confidence=0.85,
                reason="Régulation somatique réussie, recherche de sens émerge",
                user_signals=["meaning_emerging", "somatic_integration_achieved"]
            )
        
        # TIPI → Expression narrative (besoin de verbaliser)
        if signals["need_for_expression"] and user_state.get("detresse", 100) < 60:
            return TransitionSignal(
                from_method=TherapeuticMethod.TIPI,
                to_method=TherapeuticMethod.NARRATIVE,
                confidence=0.80,
                reason="Besoin d'expression narrative après régulation",
                user_signals=["need_for_expression"]
            )
        
        # TIPI → Respiration (consolider la régulation)
        if signals["somatic_integration_achieved"]:
            return TransitionSignal(
                from_method=TherapeuticMethod.TIPI,
                to_method=TherapeuticMethod.RESPIRATION,
                confidence=0.75,
                reason="Consolider la régulation somatique",
                user_signals=["somatic_integration_achieved"]
            )
        
        # TIPI → Polyvagal (submersion ou dissociation)
        if signals["emotional_overwhelm"] or signals["dissociation_increasing"]:
            return TransitionSignal(
                from_method=TherapeuticMethod.TIPI,
                to_method=TherapeuticMethod.POLYVAGAL,
                confidence=0.90,
                reason="Besoin de stabilisation avant de continuer",
                user_signals=["emotional_overwhelm" if signals["emotional_overwhelm"] else "dissociation_increasing"]
            )

        return None

    def _validation_transition_logic(
        self,
        signals: Dict[str, bool],
        user_response: str,
        user_state: Dict[str, Any]
    ) -> Optional[TransitionSignal]:
        """Logique de transition depuis Validation Émotionnelle"""

        # Validation → TIPI (conscience corporelle émerge)
        if user_state.get("body_awareness", 0) > 0.4 and not signals["dissociation_increasing"]:
            return TransitionSignal(
                from_method=TherapeuticMethod.VALIDATION,
                to_method=TherapeuticMethod.TIPI,
                confidence=0.80,
                reason="Conscience corporelle présente, prêt pour régulation somatique",
                user_signals=["body_awareness"]
            )

        # Validation → Logothérapie (recherche de sens)
        if signals["meaning_emerging"]:
            return TransitionSignal(
                from_method=TherapeuticMethod.VALIDATION,
                to_method=TherapeuticMethod.LOGOTHERAPIE,
                confidence=0.75,
                reason="Recherche de sens émerge après validation",
                user_signals=["meaning_emerging"]
            )

        # Validation → Expression narrative (besoin de raconter)
        if signals["need_for_expression"]:
            return TransitionSignal(
                from_method=TherapeuticMethod.VALIDATION,
                to_method=TherapeuticMethod.NARRATIVE,
                confidence=0.70,
                reason="Besoin d'expression narrative",
                user_signals=["need_for_expression"]
            )

        return None

    def _logotherapie_transition_logic(
        self,
        signals: Dict[str, bool],
        user_response: str,
        user_state: Dict[str, Any]
    ) -> Optional[TransitionSignal]:
        """Logique de transition depuis Logothérapie"""

        # Logothérapie → Expression narrative (reconstruction)
        if signals["narrative_reconstruction"]:
            return TransitionSignal(
                from_method=TherapeuticMethod.LOGOTHERAPIE,
                to_method=TherapeuticMethod.NARRATIVE,
                confidence=0.85,
                reason="Reconstruction narrative après recherche de sens",
                user_signals=["narrative_reconstruction"]
            )

        # Logothérapie → TIPI (détresse somatique émerge)
        if user_state.get("detresse", 0) > 70 and user_state.get("body_awareness", 0) > 0.5:
            return TransitionSignal(
                from_method=TherapeuticMethod.LOGOTHERAPIE,
                to_method=TherapeuticMethod.TIPI,
                confidence=0.75,
                reason="Détresse somatique nécessite régulation",
                user_signals=["somatic_distress"]
            )

        return None

    def _narrative_transition_logic(
        self,
        signals: Dict[str, bool],
        user_response: str,
        user_state: Dict[str, Any]
    ) -> Optional[TransitionSignal]:
        """Logique de transition depuis Expression Narrative"""

        # Narrative → Logothérapie (recherche de sens dans le récit)
        if signals["meaning_emerging"]:
            return TransitionSignal(
                from_method=TherapeuticMethod.NARRATIVE,
                to_method=TherapeuticMethod.LOGOTHERAPIE,
                confidence=0.80,
                reason="Recherche de sens émerge du récit",
                user_signals=["meaning_emerging"]
            )

        # Narrative → TIPI (émotion intense émerge)
        if user_state.get("detresse", 0) > 75 and user_state.get("body_awareness", 0) > 0.4:
            return TransitionSignal(
                from_method=TherapeuticMethod.NARRATIVE,
                to_method=TherapeuticMethod.TIPI,
                confidence=0.85,
                reason="Émotion intense émerge du récit, besoin de régulation",
                user_signals=["emotional_activation"]
            )

        # Narrative → Polyvagal (submersion)
        if signals["emotional_overwhelm"]:
            return TransitionSignal(
                from_method=TherapeuticMethod.NARRATIVE,
                to_method=TherapeuticMethod.POLYVAGAL,
                confidence=0.90,
                reason="Submersion émotionnelle, besoin de stabilisation",
                user_signals=["emotional_overwhelm"]
            )

        return None

    def _load_transition_rules(self) -> Dict[str, Any]:
        """Charge les règles de transition (pour extension future)"""
        return {
            "tipi_to_logotherapie": {
                "conditions": ["somatic_integration", "meaning_emerging"],
                "confidence_threshold": 0.7
            },
            "tipi_to_narrative": {
                "conditions": ["need_for_expression", "detresse_moderate"],
                "confidence_threshold": 0.7
            },
            "validation_to_tipi": {
                "conditions": ["body_awareness", "no_dissociation"],
                "confidence_threshold": 0.7
            }
        }

    def get_transition_message(self, transition: TransitionSignal) -> str:
        """Génère un message de transition fluide pour l'utilisateur"""

        transition_messages = {
            (TherapeuticMethod.TIPI, TherapeuticMethod.LOGOTHERAPIE):
                "Je sens que quelque chose d'important émerge. Voulez-vous qu'on explore ensemble le sens de ce que vous vivez ?",

            (TherapeuticMethod.TIPI, TherapeuticMethod.NARRATIVE):
                "Il semble que vous ayez besoin d'exprimer ce qui se passe. Voulez-vous me raconter votre histoire ?",

            (TherapeuticMethod.TIPI, TherapeuticMethod.RESPIRATION):
                "Vous avez fait un beau travail d'observation. Voulez-vous qu'on consolide cette régulation avec quelques respirations ?",

            (TherapeuticMethod.TIPI, TherapeuticMethod.POLYVAGAL):
                "C'est très intense. Prenons d'abord un moment pour vous stabiliser. D'accord ?",

            (TherapeuticMethod.VALIDATION, TherapeuticMethod.TIPI):
                "Je remarque que vous mentionnez des sensations dans votre corps. Voulez-vous qu'on y porte attention ensemble ?",

            (TherapeuticMethod.VALIDATION, TherapeuticMethod.LOGOTHERAPIE):
                "Vous semblez chercher à comprendre le sens de ce qui vous arrive. Explorons cela ensemble ?",

            (TherapeuticMethod.LOGOTHERAPIE, TherapeuticMethod.NARRATIVE):
                "Voulez-vous reconstruire votre histoire à la lumière de ce sens que vous découvrez ?",

            (TherapeuticMethod.NARRATIVE, TherapeuticMethod.LOGOTHERAPIE):
                "Votre récit soulève des questions importantes. Voulez-vous qu'on explore le sens de tout cela ?",

            (TherapeuticMethod.NARRATIVE, TherapeuticMethod.TIPI):
                "Je sens que cette émotion est très présente. Voulez-vous qu'on l'observe ensemble dans votre corps ?",

            (TherapeuticMethod.NARRATIVE, TherapeuticMethod.POLYVAGAL):
                "C'est beaucoup à la fois. Prenons un moment pour vous ancrer. D'accord ?"
        }

        key = (transition.from_method, transition.to_method)
        return transition_messages.get(key, "Voulez-vous qu'on explore autrement ?")

