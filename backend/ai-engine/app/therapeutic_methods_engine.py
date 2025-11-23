"""
Moteur d'Exécution des Méthodes Thérapeutiques

Orchestre l'exécution adaptative de toutes les méthodes thérapeutiques :
- Logothérapie (recherche de sens)
- Expression Narrative (reconstruction)
- Ancrage Polyvagal (régulation système nerveux)
- Pleine Conscience (présence)

Architecture similaire à TIPIExecutionEngine pour cohérence.
"""

from typing import Dict, Any, Optional, List
from dataclasses import dataclass, field
from enum import Enum
import json
import logging
from pathlib import Path

from .therapeutic_transitions import TherapeuticTransitionEngine, TherapeuticMethod, TransitionSignal

logger = logging.getLogger(__name__)


class MethodVariation(Enum):
    """Variations disponibles pour chaque méthode"""
    # Logothérapie
    LOGO_EXPLORATION = "exploration_sens"
    LOGO_SOUFFRANCE = "sens_dans_souffrance"
    LOGO_DEREFLEXION = "dereflexion"
    
    # Expression Narrative
    NARRATIVE_TEMPORELLE = "reconstruction_temporelle"
    NARRATIVE_EXTERNALISATION = "externalisation"
    
    # Ancrage Polyvagal
    POLYVAGAL_VENTRAL = "regulation_ventrale"
    POLYVAGAL_COREGULATION = "co_regulation"
    POLYVAGAL_MOBILISATION = "mobilisation_douce"
    
    # Pleine Conscience
    MINDFULNESS_SOUFFLE = "ancrage_souffle"
    MINDFULNESS_BODYSCAN = "body_scan_grief"


@dataclass
class MethodExecutionContext:
    """Contexte d'exécution d'une session thérapeutique"""
    user_id: str
    session_id: str
    method: TherapeuticMethod
    variation: MethodVariation
    current_step: int = 0
    total_steps: int = 0
    start_time: float = 0.0
    user_responses: List[str] = field(default_factory=list)
    progression_scores: List[float] = field(default_factory=list)
    adjustments_made: List[str] = field(default_factory=list)
    completed: bool = False
    transition_recommended: Optional[TransitionSignal] = None


class TherapeuticMethodsEngine:
    """Moteur unifié pour toutes les méthodes thérapeutiques"""
    
    def __init__(self, protocol_path: str = "backend/ai-engine/therapeutic_methods_protocols.json"):
        self.transition_engine = TherapeuticTransitionEngine()
        
        # Chargement des protocoles
        self.protocols = self._load_protocols(protocol_path)
        
        # Sessions actives
        self.active_sessions: Dict[str, MethodExecutionContext] = {}
    
    def _load_protocols(self, protocol_path: str) -> Dict[str, Any]:
        """Charge tous les protocoles thérapeutiques"""
        try:
            with open(protocol_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            logger.warning(f"Protocol file not found: {protocol_path}")
            return {}
    
    # ========================================================================
    # LOGOTHÉRAPIE
    # ========================================================================
    
    def should_activate_logotherapie(
        self,
        user_state: Dict[str, Any],
        conversation_context: Dict[str, Any]
    ) -> bool:
        """Détecte si Logothérapie est appropriée"""
        
        # Signaux de recherche de sens
        meaning_words = ["pourquoi", "sens", "raison", "comprendre", "signifie", "absurde"]
        user_message = conversation_context.get("last_message", "").lower()
        has_meaning_seeking = any(word in user_message for word in meaning_words)
        
        # État approprié
        detresse = user_state.get("detresse", 100)
        dissociation = user_state.get("dissociation", 0)
        
        # Conditions
        appropriate_state = (
            detresse < 90 and  # Pas en crise extrême
            dissociation < 0.7 and  # Pas dissocié
            has_meaning_seeking  # Recherche de sens active
        )
        
        return appropriate_state
    
    def select_logotherapie_variation(
        self,
        user_state: Dict[str, Any],
        conversation_context: Dict[str, Any]
    ) -> MethodVariation:
        """Sélectionne la variation de Logothérapie appropriée"""
        
        detresse = user_state.get("detresse", 50)
        rumination = user_state.get("cognitive_loops", 0)
        
        # Rumination excessive → Déréflexion
        if rumination > 0.7:
            return MethodVariation.LOGO_DEREFLEXION
        
        # Souffrance intense → Sens dans la souffrance
        if detresse > 70:
            return MethodVariation.LOGO_SOUFFRANCE
        
        # Défaut → Exploration du sens
        return MethodVariation.LOGO_EXPLORATION
    
    # ========================================================================
    # EXPRESSION NARRATIVE
    # ========================================================================
    
    def should_activate_narrative(
        self,
        user_state: Dict[str, Any],
        conversation_context: Dict[str, Any]
    ) -> bool:
        """Détecte si Expression Narrative est appropriée"""
        
        # Signaux narratifs
        narrative_words = ["raconter", "histoire", "avant", "maintenant", "futur", "vie"]
        user_message = conversation_context.get("last_message", "").lower()
        has_narrative_need = any(word in user_message for word in narrative_words)
        
        # Longueur du message (besoin d'expression)
        message_length = len(conversation_context.get("last_message", ""))
        
        # État approprié
        detresse = user_state.get("detresse", 100)
        dissociation = user_state.get("dissociation", 0)
        
        appropriate_state = (
            detresse < 85 and  # Pas submergé
            dissociation < 0.7 and  # Pas dissocié
            (has_narrative_need or message_length > 150)  # Besoin d'expression
        )
        
        return appropriate_state
    
    def select_narrative_variation(
        self,
        user_state: Dict[str, Any],
        conversation_context: Dict[str, Any]
    ) -> MethodVariation:
        """Sélectionne la variation de Narrative appropriée"""
        
        user_message = conversation_context.get("last_message", "").lower()
        
        # Fusion identitaire ("je suis mon deuil") → Externalisation
        identity_fusion_words = ["je suis", "je ne suis plus", "je ne suis que"]
        if any(phrase in user_message for phrase in identity_fusion_words):
            return MethodVariation.NARRATIVE_EXTERNALISATION
        
        # Défaut → Reconstruction temporelle
        return MethodVariation.NARRATIVE_TEMPORELLE
    
    # ========================================================================
    # ANCRAGE POLYVAGAL
    # ========================================================================
    
    def should_activate_polyvagal(
        self,
        user_state: Dict[str, Any],
        conversation_context: Dict[str, Any]
    ) -> bool:
        """Détecte si Ancrage Polyvagal est approprié"""
        
        arousal = user_state.get("arousal", 0.5)
        detresse = user_state.get("detresse", 50)
        
        # Hyper-activation (anxiété, panique)
        hyper_activation = arousal > 0.8 or detresse > 85
        
        # Hypo-activation (engourdissement, léthargie)
        hypo_activation = arousal < 0.2 or user_state.get("emotional_numbness", 0) > 0.7
        
        return hyper_activation or hypo_activation
    
    def select_polyvagal_variation(
        self,
        user_state: Dict[str, Any],
        conversation_context: Dict[str, Any]
    ) -> MethodVariation:
        """Sélectionne la variation de Polyvagal appropriée"""
        
        arousal = user_state.get("arousal", 0.5)
        emotional_numbness = user_state.get("emotional_numbness", 0)
        
        # Hypo-activation → Mobilisation douce
        if arousal < 0.2 or emotional_numbness > 0.7:
            return MethodVariation.POLYVAGAL_MOBILISATION
        
        # Besoin de connexion → Co-régulation
        if user_state.get("loneliness", 0) > 0.7:
            return MethodVariation.POLYVAGAL_COREGULATION
        
        # Défaut → Régulation ventrale
        return MethodVariation.POLYVAGAL_VENTRAL

    # ========================================================================
    # PLEINE CONSCIENCE
    # ========================================================================

    def should_activate_mindfulness(
        self,
        user_state: Dict[str, Any],
        conversation_context: Dict[str, Any]
    ) -> bool:
        """Détecte si Pleine Conscience est appropriée"""

        detresse = user_state.get("detresse", 50)
        dissociation = user_state.get("dissociation", 0)
        rumination = user_state.get("cognitive_loops", 0)

        # Conditions
        appropriate_state = (
            detresse < 80 and  # Pas trop intense
            dissociation < 0.7 and  # Pas dissocié
            rumination > 0.4  # Agitation mentale
        )

        return appropriate_state

    def select_mindfulness_variation(
        self,
        user_state: Dict[str, Any],
        conversation_context: Dict[str, Any]
    ) -> MethodVariation:
        """Sélectionne la variation de Mindfulness appropriée"""

        body_awareness = user_state.get("body_awareness", 0)

        # Conscience corporelle élevée → Body scan
        if body_awareness > 0.6:
            return MethodVariation.MINDFULNESS_BODYSCAN

        # Défaut → Ancrage souffle
        return MethodVariation.MINDFULNESS_SOUFFLE

    # ========================================================================
    # EXÉCUTION UNIFIÉE
    # ========================================================================

    def start_session(
        self,
        user_id: str,
        session_id: str,
        method: TherapeuticMethod,
        user_state: Dict[str, Any],
        conversation_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Démarre une session thérapeutique (méthode unifiée)"""

        # Sélection de la variation selon la méthode
        if method == TherapeuticMethod.LOGOTHERAPIE:
            variation = self.select_logotherapie_variation(user_state, conversation_context)
            protocol_key = "logotherapie"
        elif method == TherapeuticMethod.NARRATIVE:
            variation = self.select_narrative_variation(user_state, conversation_context)
            protocol_key = "expression_narrative"
        elif method == TherapeuticMethod.POLYVAGAL:
            variation = self.select_polyvagal_variation(user_state, conversation_context)
            protocol_key = "ancrage_polyvagal"
        elif method == TherapeuticMethod.MINDFULNESS:
            variation = self.select_mindfulness_variation(user_state, conversation_context)
            protocol_key = "pleine_conscience"
        else:
            return {"error": f"Method {method} not supported"}

        # Récupération du protocole
        protocol = self.protocols.get(protocol_key, {})
        variation_data = protocol.get("variations", {}).get(variation.value, {})
        steps = variation_data.get("steps", [])

        # Création du contexte
        context = MethodExecutionContext(
            user_id=user_id,
            session_id=session_id,
            method=method,
            variation=variation,
            total_steps=len(steps)
        )

        self.active_sessions[session_id] = context

        # Premier prompt
        first_prompt = self._get_step_prompt(context, user_state)

        logger.info(f"Session started: {method.value}, variation: {variation.value}")

        return {
            "session_id": session_id,
            "method": method.value,
            "variation": variation.value,
            "prompt": first_prompt,
            "step": 1,
            "total_steps": context.total_steps
        }

    def process_response(
        self,
        session_id: str,
        user_response: str,
        user_state: Dict[str, Any],
        conversation_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Traite la réponse utilisateur et décide de la suite"""

        context = self.active_sessions.get(session_id)
        if not context:
            return {"error": "Session not found"}

        # Enregistrement
        context.user_responses.append(user_response)

        # Vérification de progression (simplifié pour l'instant)
        progression_score = self._calculate_progression(user_response, context)
        context.progression_scores.append(progression_score)

        # Passage à l'étape suivante
        context.current_step += 1

        # Vérifier si terminé
        if context.current_step >= context.total_steps:
            context.completed = True

            # Vérifier transition
            transition = self.transition_engine.decide_transition(
                context.method,
                user_response,
                user_state,
                conversation_context
            )

            if transition:
                context.transition_recommended = transition

                return {
                    "session_id": session_id,
                    "status": "completed_with_transition",
                    "transition": {
                        "to_method": transition.to_method.value,
                        "reason": transition.reason,
                        "message": self.transition_engine.get_transition_message(transition)
                    },
                    "summary": self._generate_summary(context)
                }

            return {
                "session_id": session_id,
                "status": "completed",
                "message": "Merci pour ce partage. Comment vous sentez-vous maintenant ?",
                "summary": self._generate_summary(context)
            }

        # Prompt suivant
        next_prompt = self._get_step_prompt(context, user_state)

        return {
            "session_id": session_id,
            "status": "in_progress",
            "prompt": next_prompt,
            "step": context.current_step + 1,
            "total_steps": context.total_steps
        }

    def _get_step_prompt(self, context: MethodExecutionContext, user_state: Dict[str, Any]) -> str:
        """Génère le prompt pour l'étape actuelle"""

        # Mapping méthode → clé protocole
        protocol_keys = {
            TherapeuticMethod.LOGOTHERAPIE: "logotherapie",
            TherapeuticMethod.NARRATIVE: "expression_narrative",
            TherapeuticMethod.POLYVAGAL: "ancrage_polyvagal",
            TherapeuticMethod.MINDFULNESS: "pleine_conscience"
        }

        protocol_key = protocol_keys.get(context.method)
        if not protocol_key:
            return "Continuons ensemble."

        protocol = self.protocols.get(protocol_key, {})
        variation_data = protocol.get("variations", {}).get(context.variation.value, {})
        steps = variation_data.get("steps", [])

        if context.current_step < len(steps):
            step_data = steps[context.current_step]
            instruction = step_data.get("instruction", "")
            guidance = step_data.get("guidance", "")

            return f"{instruction}\n\n{guidance}"

        return "Continuons ensemble."

    def _calculate_progression(self, user_response: str, context: MethodExecutionContext) -> float:
        """Calcule la progression (simplifié)"""
        # Basé sur la longueur et l'engagement
        if len(user_response) < 10:
            return 0.3
        elif len(user_response) < 50:
            return 0.6
        else:
            return 0.9

    def _generate_summary(self, context: MethodExecutionContext) -> Dict[str, Any]:
        """Génère un résumé de la session"""
        avg_progression = sum(context.progression_scores) / len(context.progression_scores) if context.progression_scores else 0

        return {
            "method": context.method.value,
            "variation": context.variation.value,
            "steps_completed": context.current_step,
            "average_progression": round(avg_progression, 2),
            "adjustments_count": len(context.adjustments_made)
        }


