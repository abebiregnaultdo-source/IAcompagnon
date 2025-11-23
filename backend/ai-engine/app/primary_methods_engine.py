"""
Moteur Adaptatif pour les Méthodes Thérapeutiques Principales
- ACT (Acceptation et Engagement)
- Journaling Expressif
- Continuing Bonds

Même niveau d'intelligence que TIPI : détection, variations, monitoring, transitions
"""

import json
import logging
from pathlib import Path
from typing import Dict, Any, List, Tuple, Optional
from enum import Enum
from dataclasses import dataclass, field
from datetime import datetime

logger = logging.getLogger(__name__)

# ============================================================================
# ENUMS
# ============================================================================

class PrimaryMethod(Enum):
    ACT = "act"
    JOURNALING = "journaling_expressif"
    CONTINUING_BONDS = "continuing_bonds"

class ACTVariation(Enum):
    DEFUSION = "defusion_cognitive"
    VALEURS = "valeurs_et_action"
    ACCEPTATION = "acceptation_experiencielle"

class JournalingVariation(Enum):
    LETTRE = "lettre_non_envoyee"
    RECIT = "journal_guide_recit"
    GRATITUDE = "gratitude_post_traumatique"

class BondsVariation(Enum):
    RITUEL = "rituel_connexion"
    CONVERSATION = "conversation_interieure"
    OBJET = "objet_transitionnel"

# ============================================================================
# DATACLASSES
# ============================================================================

@dataclass
class MethodExecutionContext:
    """Contexte d'exécution d'une session"""
    user_id: str
    session_id: str
    method: PrimaryMethod
    variation: Enum
    current_step: int = 0
    total_steps: int = 0
    started_at: datetime = field(default_factory=datetime.now)
    user_responses: List[str] = field(default_factory=list)
    progression_scores: List[float] = field(default_factory=list)
    adjustments_made: List[str] = field(default_factory=list)
    completed: bool = False
    transition_recommended: Optional[str] = None

# ============================================================================
# MOTEUR PRINCIPAL
# ============================================================================

class PrimaryMethodsEngine:
    """Moteur unifié pour ACT, Journaling, Continuing Bonds"""
    
    def __init__(self):
        # Charger les protocoles
        protocol_path = Path(__file__).parent.parent / "primary_methods_protocols.json"
        with open(protocol_path, 'r', encoding='utf-8') as f:
            self.protocols = json.load(f)
        
        self.active_sessions: Dict[str, MethodExecutionContext] = {}
        logger.info("PrimaryMethodsEngine initialized")
    
    # ========================================================================
    # ACT - DÉTECTION
    # ========================================================================
    
    def should_activate_act(
        self,
        user_state: Dict[str, Any],
        conversation_context: Dict[str, Any]
    ) -> bool:
        """Détecte si ACT est appropriée"""
        
        user_message = conversation_context.get("last_message", "").lower()
        
        # Mots-clés ACT
        fusion_words = ["je suis", "je ne peux pas", "c'est impossible", "toujours", "jamais"]
        avoidance_words = ["éviter", "fuir", "oublier", "ne pas penser", "distraire"]
        values_words = ["important", "compte", "sens", "direction", "vouloir"]
        
        has_fusion = any(word in user_message for word in fusion_words)
        has_avoidance = any(word in user_message for word in avoidance_words)
        has_values_seeking = any(word in user_message for word in values_words)
        
        detresse = user_state.get("detresse", 50)
        dissociation = user_state.get("dissociation", 0)
        rumination = user_state.get("cognitive_loops", 0)
        
        # Conditions
        appropriate_state = (
            detresse < 90 and  # Pas trop intense
            dissociation < 0.8 and  # Pas dissocié
            (has_fusion or has_avoidance or has_values_seeking or rumination > 0.5)
        )
        
        return appropriate_state
    
    def select_act_variation(
        self,
        user_state: Dict[str, Any],
        conversation_context: Dict[str, Any]
    ) -> ACTVariation:
        """Sélectionne la variation ACT appropriée"""
        
        user_message = conversation_context.get("last_message", "").lower()
        
        # Détection de fusion cognitive
        fusion_words = ["je suis", "toujours", "jamais", "je ne peux pas"]
        if any(word in user_message for word in fusion_words):
            return ACTVariation.DEFUSION
        
        # Détection d'évitement
        avoidance_words = ["éviter", "fuir", "ne pas penser"]
        if any(word in user_message for word in avoidance_words):
            return ACTVariation.ACCEPTATION
        
        # Défaut → Valeurs et action
        return ACTVariation.VALEURS
    
    # ========================================================================
    # JOURNALING - DÉTECTION
    # ========================================================================
    
    def should_activate_journaling(
        self,
        user_state: Dict[str, Any],
        conversation_context: Dict[str, Any]
    ) -> bool:
        """Détecte si Journaling Expressif est approprié"""
        
        user_message = conversation_context.get("last_message", "").lower()
        
        # Mots-clés journaling
        expression_words = ["dire", "écrire", "raconter", "exprimer", "lettre"]
        regret_words = ["regret", "pas dit", "aurais dû", "si seulement"]
        story_words = ["histoire", "souvenir", "avant", "maintenant"]
        
        has_expression_need = any(word in user_message for word in expression_words)
        has_regret = any(word in user_message for word in regret_words)
        has_story_need = any(word in user_message for word in story_words)
        
        detresse = user_state.get("detresse", 50)
        message_length = len(user_message)
        
        # Conditions
        appropriate_state = (
            detresse < 85 and  # Pas trop intense
            (has_expression_need or has_regret or has_story_need or message_length > 100)
        )
        
        return appropriate_state
    
    def select_journaling_variation(
        self,
        user_state: Dict[str, Any],
        conversation_context: Dict[str, Any]
    ) -> JournalingVariation:
        """Sélectionne la variation Journaling appropriée"""
        
        user_message = conversation_context.get("last_message", "").lower()
        
        # Détection de regrets / choses non dites
        regret_words = ["regret", "pas dit", "aurais dû", "dire"]
        if any(word in user_message for word in regret_words):
            return JournalingVariation.LETTRE
        
        # Détection de besoin de gratitude
        gratitude_words = ["reconnaissant", "merci", "apprécier", "lumière"]
        if any(word in user_message for word in gratitude_words):
            return JournalingVariation.GRATITUDE
        
        # Défaut → Journal guidé récit
        return JournalingVariation.RECIT

    # ========================================================================
    # CONTINUING BONDS - DÉTECTION
    # ========================================================================

    def should_activate_continuing_bonds(
        self,
        user_state: Dict[str, Any],
        conversation_context: Dict[str, Any]
    ) -> bool:
        """Détecte si Continuing Bonds est approprié"""

        user_message = conversation_context.get("last_message", "").lower()

        # Mots-clés continuing bonds
        connection_words = ["lien", "connexion", "présence", "avec moi", "près de moi"]
        ritual_words = ["rituel", "geste", "habitude", "faire ensemble"]
        conversation_words = ["parler", "dire", "conversation", "répondre"]

        has_connection_need = any(word in user_message for word in connection_words)
        has_ritual_interest = any(word in user_message for word in ritual_words)
        has_conversation_need = any(word in user_message for word in conversation_words)

        detresse = user_state.get("detresse", 50)

        # Conditions
        appropriate_state = (
            detresse < 80 and  # Pas trop intense
            (has_connection_need or has_ritual_interest or has_conversation_need)
        )

        return appropriate_state

    def select_bonds_variation(
        self,
        user_state: Dict[str, Any],
        conversation_context: Dict[str, Any]
    ) -> BondsVariation:
        """Sélectionne la variation Continuing Bonds appropriée"""

        user_message = conversation_context.get("last_message", "").lower()

        # Détection de besoin de conversation
        conversation_words = ["parler", "dire", "répondre", "demander"]
        if any(word in user_message for word in conversation_words):
            return BondsVariation.CONVERSATION

        # Détection d'objet
        object_words = ["objet", "photo", "vêtement", "bijou", "lettre"]
        if any(word in user_message for word in object_words):
            return BondsVariation.OBJET

        # Défaut → Rituel de connexion
        return BondsVariation.RITUEL

    # ========================================================================
    # EXÉCUTION UNIFIÉE
    # ========================================================================

    def start_session(
        self,
        user_id: str,
        session_id: str,
        method: PrimaryMethod,
        user_state: Dict[str, Any],
        conversation_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Démarre une session thérapeutique"""

        # Sélection de la variation
        if method == PrimaryMethod.ACT:
            variation = self.select_act_variation(user_state, conversation_context)
            protocol_key = "act"
        elif method == PrimaryMethod.JOURNALING:
            variation = self.select_journaling_variation(user_state, conversation_context)
            protocol_key = "journaling_expressif"
        elif method == PrimaryMethod.CONTINUING_BONDS:
            variation = self.select_bonds_variation(user_state, conversation_context)
            protocol_key = "continuing_bonds"
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

        # Premier prompt (avec intelligence LLM)
        first_prompt = self._get_step_prompt_with_llm(context, user_state, conversation_context)

        logger.info(f"Session started: {method.value}, variation: {variation.value}")

        return {
            "session_id": session_id,
            "method": method.value,
            "variation": variation.value,
            "prompt": first_prompt,
            "step": 1,
            "total_steps": context.total_steps,
            "llm_guidance": self._get_llm_guidance(context, 0)
        }

    def process_response(
        self,
        session_id: str,
        user_response: str,
        user_state: Dict[str, Any],
        conversation_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Traite la réponse utilisateur avec intelligence LLM"""

        context = self.active_sessions.get(session_id)
        if not context:
            return {"error": "Session not found"}

        # Enregistrement
        context.user_responses.append(user_response)

        # Vérification de progression (avec LLM)
        progression_score = self._calculate_progression_with_llm(user_response, context)
        context.progression_scores.append(progression_score)

        # Vérifier si réponse adaptative nécessaire
        adaptive_response = self._check_adaptive_response(user_response, context)
        if adaptive_response:
            context.adjustments_made.append(adaptive_response["trigger"])
            return {
                "session_id": session_id,
                "status": "adaptive_response",
                "prompt": adaptive_response["response"],
                "step": context.current_step + 1,
                "total_steps": context.total_steps
            }

        # Passage à l'étape suivante
        context.current_step += 1

        # Vérifier si terminé
        if context.current_step >= context.total_steps:
            context.completed = True

            return {
                "session_id": session_id,
                "status": "completed",
                "message": "Merci pour ce partage. Comment vous sentez-vous maintenant ?",
                "summary": self._generate_summary(context)
            }

        # Prompt suivant (avec intelligence LLM)
        next_prompt = self._get_step_prompt_with_llm(context, user_state, conversation_context)

        return {
            "session_id": session_id,
            "status": "in_progress",
            "prompt": next_prompt,
            "step": context.current_step + 1,
            "total_steps": context.total_steps,
            "llm_guidance": self._get_llm_guidance(context, context.current_step)
        }

    # ========================================================================
    # INTELLIGENCE LLM
    # ========================================================================

    def _get_step_prompt_with_llm(
        self,
        context: MethodExecutionContext,
        user_state: Dict[str, Any],
        conversation_context: Dict[str, Any]
    ) -> str:
        """Génère le prompt avec guidance LLM"""

        protocol_keys = {
            PrimaryMethod.ACT: "act",
            PrimaryMethod.JOURNALING: "journaling_expressif",
            PrimaryMethod.CONTINUING_BONDS: "continuing_bonds"
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

            # Combiner instruction + guidance
            return f"{instruction}\n\n{guidance}"

        return "Continuons ensemble."

    def _get_llm_guidance(self, context: MethodExecutionContext, step_index: int) -> Dict[str, Any]:
        """Récupère la guidance LLM pour l'étape"""

        protocol_keys = {
            PrimaryMethod.ACT: "act",
            PrimaryMethod.JOURNALING: "journaling_expressif",
            PrimaryMethod.CONTINUING_BONDS: "continuing_bonds"
        }

        protocol_key = protocol_keys.get(context.method)
        protocol = self.protocols.get(protocol_key, {})
        variation_data = protocol.get("variations", {}).get(context.variation.value, {})
        steps = variation_data.get("steps", [])

        if step_index < len(steps):
            step_data = steps[step_index]
            return {
                "llm_role": step_data.get("llm_role", ""),
                "llm_prompts": step_data.get("llm_prompts", []),
                "success_indicators": step_data.get("success_indicators", [])
            }

        return {}

    def _calculate_progression_with_llm(self, user_response: str, context: MethodExecutionContext) -> float:
        """Calcule la progression avec indicateurs de succès"""

        protocol_keys = {
            PrimaryMethod.ACT: "act",
            PrimaryMethod.JOURNALING: "journaling_expressif",
            PrimaryMethod.CONTINUING_BONDS: "continuing_bonds"
        }

        protocol_key = protocol_keys.get(context.method)
        protocol = self.protocols.get(protocol_key, {})
        variation_data = protocol.get("variations", {}).get(context.variation.value, {})
        steps = variation_data.get("steps", [])

        if context.current_step < len(steps):
            step_data = steps[context.current_step]
            success_indicators = step_data.get("success_indicators", [])

            # Vérifier présence des indicateurs dans la réponse
            response_lower = user_response.lower()
            indicators_present = sum(1 for indicator in success_indicators if indicator in response_lower)

            # Score basé sur indicateurs + longueur
            indicator_score = indicators_present / len(success_indicators) if success_indicators else 0.5
            length_score = min(len(user_response) / 100, 1.0)

            return (indicator_score * 0.7 + length_score * 0.3)

        return 0.5

    def _check_adaptive_response(self, user_response: str, context: MethodExecutionContext) -> Optional[Dict[str, str]]:
        """Vérifie si une réponse adaptative est nécessaire"""

        protocol_keys = {
            PrimaryMethod.ACT: "act",
            PrimaryMethod.JOURNALING: "journaling_expressif",
            PrimaryMethod.CONTINUING_BONDS: "continuing_bonds"
        }

        protocol_key = protocol_keys.get(context.method)
        protocol = self.protocols.get(protocol_key, {})
        variation_data = protocol.get("variations", {}).get(context.variation.value, {})
        adaptive_responses = variation_data.get("adaptive_responses", {})

        response_lower = user_response.lower()

        # Vérifier chaque trigger
        for key, adaptive_data in adaptive_responses.items():
            trigger = adaptive_data.get("trigger", "").lower()

            # Détection simple par mots-clés (peut être amélioré avec LLM)
            if any(word in response_lower for word in trigger.split()):
                return {
                    "trigger": key,
                    "response": adaptive_data.get("response", "")
                }

        return None

    def _generate_summary(self, context: MethodExecutionContext) -> Dict[str, Any]:
        """Génère un résumé de la session"""
        avg_progression = sum(context.progression_scores) / len(context.progression_scores) if context.progression_scores else 0

        return {
            "method": context.method.value,
            "variation": context.variation.value,
            "steps_completed": context.current_step,
            "average_progression": round(avg_progression, 2),
            "adjustments_count": len(context.adjustments_made),
            "duration_minutes": (datetime.now() - context.started_at).total_seconds() / 60
        }



