"""
Moteur d'Exécution TIPI avec Boucle de Régulation

Orchestre l'exécution adaptative du protocole TIPI avec monitoring en temps réel,
ajustements dynamiques, et détection de progression.
"""

from typing import Dict, Any, Optional, List
from dataclasses import dataclass, field
import json
import logging
from pathlib import Path

from .adaptive_tipi import AdaptiveTIPI, TIPIVariation, TIPIState, TIPIDetector
from .therapeutic_transitions import TherapeuticTransitionEngine, TherapeuticMethod, TransitionSignal

logger = logging.getLogger(__name__)


@dataclass
class TIPIExecutionContext:
    """Contexte d'exécution d'une session TIPI"""
    user_id: str
    session_id: str
    variation: TIPIVariation
    current_step: int = 0
    total_steps: int = 4
    start_time: float = 0.0
    user_responses: List[str] = field(default_factory=list)
    progression_scores: List[float] = field(default_factory=list)
    adjustments_made: List[str] = field(default_factory=list)
    completed: bool = False
    transition_recommended: Optional[TransitionSignal] = None


class TIPIExecutionEngine:
    """Moteur d'exécution TIPI avec intelligence adaptative"""
    
    def __init__(self, protocol_path: str = "backend/ai-engine/tipi_protocol.json"):
        self.adaptive_tipi = AdaptiveTIPI()
        self.transition_engine = TherapeuticTransitionEngine()
        self.detector = TIPIDetector()
        
        # Chargement du protocole TIPI
        self.protocol = self._load_protocol(protocol_path)
        
        # Sessions actives
        self.active_sessions: Dict[str, TIPIExecutionContext] = {}
    
    def _load_protocol(self, protocol_path: str) -> Dict[str, Any]:
        """Charge le protocole TIPI depuis le fichier JSON"""
        try:
            with open(protocol_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get("tipi_protocol", {})
        except FileNotFoundError:
            logger.warning(f"Protocol file not found: {protocol_path}, using minimal protocol")
            return self._get_minimal_protocol()
    
    def _get_minimal_protocol(self) -> Dict[str, Any]:
        """Protocole minimal si le fichier JSON n'est pas disponible"""
        return {
            "variations": {
                "standard": {
                    "steps": [
                        {"step": 1, "instruction": "Identifiez où dans votre corps vous ressentez cette émotion."},
                        {"step": 2, "instruction": "Décrivez cette sensation sans la juger."},
                        {"step": 3, "instruction": "Restez avec cette sensation, laissez-la évoluer."},
                        {"step": 4, "instruction": "Notez les changements, même subtils."}
                    ]
                }
            }
        }
    
    def should_activate_tipi(
        self,
        user_state: Dict[str, Any],
        conversation_context: Dict[str, Any]
    ) -> bool:
        """Détermine si TIPI doit être activé maintenant"""
        should_activate, signals = self.detector.should_activate_tipi(user_state, conversation_context)
        
        if should_activate:
            logger.info(f"TIPI activation recommended (signals: {signals.score()}/5)")
        
        return should_activate
    
    def start_tipi_session(
        self,
        user_id: str,
        session_id: str,
        user_profile: Dict[str, Any],
        current_state: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Démarre une nouvelle session TIPI
        
        Returns:
            Dictionnaire avec le premier prompt TIPI et le contexte
        """
        # Sélection de la variation appropriée
        variation = self.adaptive_tipi.select_tipi_variation(user_profile, current_state)
        
        # Création du contexte d'exécution
        context = TIPIExecutionContext(
            user_id=user_id,
            session_id=session_id,
            variation=variation,
            total_steps=len(self.protocol["variations"][variation.value]["steps"])
        )
        
        self.active_sessions[session_id] = context
        
        # Génération du premier prompt
        first_prompt = self._get_step_prompt(context, current_state)
        
        logger.info(f"TIPI session started: {session_id}, variation: {variation.value}")
        
        return {
            "session_id": session_id,
            "variation": variation.value,
            "prompt": first_prompt,
            "step": 1,
            "total_steps": context.total_steps
        }
    
    def process_tipi_response(
        self,
        session_id: str,
        user_response: str,
        user_state: Dict[str, Any],
        conversation_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Traite la réponse de l'utilisateur et décide de la suite
        
        Boucle de régulation :
        1. Vérifier la progression
        2. Ajuster si nécessaire
        3. Passer à l'étape suivante ou terminer
        4. Détecter les transitions vers d'autres méthodes
        """
        context = self.active_sessions.get(session_id)
        if not context:
            logger.error(f"Session not found: {session_id}")
            return {"error": "Session not found"}
        
        # Enregistrement de la réponse
        context.user_responses.append(user_response)
        
        # Création de l'état TIPI pour l'analyse
        tipi_state = TIPIState(
            current_step=context.current_step,
            variation=context.variation,
            progression_score=0.0,
            user_engagement=self._calculate_engagement(user_response),
            somatic_clarity=user_state.get("somatic_clarity", 0.5),
            process_speed=user_state.get("process_speed", 0.5),
            needs_adjustment=False
        )
        
        # 1. VÉRIFICATION DE LA PROGRESSION
        is_progressing = self.adaptive_tipi.is_tipi_progressing(user_response, tipi_state)
        context.progression_scores.append(tipi_state.progression_score)
        
        # 2. AJUSTEMENT SI NÉCESSAIRE
        if not is_progressing:
            adjustment = self.adaptive_tipi.adjust_tipi_approach(user_response, context.variation)
            context.adjustments_made.append(adjustment["adjustment"])
            
            logger.info(f"TIPI adjustment: {adjustment['adjustment']}")
            
            # Si transition vers autre méthode recommandée
            if adjustment["next_variation"] is None:
                transition = self.transition_engine.decide_transition(
                    TherapeuticMethod.TIPI,
                    user_response,
                    user_state,
                    conversation_context
                )
                
                if transition:
                    context.transition_recommended = transition
                    context.completed = True
                    
                    return {
                        "session_id": session_id,
                        "status": "transition_recommended",
                        "transition": {
                            "to_method": transition.to_method.value,
                            "reason": transition.reason,
                            "message": self.transition_engine.get_transition_message(transition)
                        }
                    }
            
            # Sinon, retourner le message d'ajustement
            return {
                "session_id": session_id,
                "status": "adjusted",
                "prompt": adjustment["message"],
                "step": context.current_step + 1,
                "total_steps": context.total_steps,
                "adjustment": adjustment["adjustment"]
            }
        
        # 3. PASSAGE À L'ÉTAPE SUIVANTE
        context.current_step += 1
        
        # Vérifier si TIPI est terminé
        if context.current_step >= context.total_steps:
            context.completed = True
            
            # Vérifier si transition recommandée
            transition = self.transition_engine.decide_transition(
                TherapeuticMethod.TIPI,
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
                    "tipi_summary": self._generate_tipi_summary(context)
                }
            
            return {
                "session_id": session_id,
                "status": "completed",
                "message": "Vous avez fait un beau travail d'observation. Comment vous sentez-vous maintenant ?",
                "tipi_summary": self._generate_tipi_summary(context)
            }
        
        # Génération du prompt pour l'étape suivante
        next_prompt = self._get_step_prompt(context, user_state)
        
        return {
            "session_id": session_id,
            "status": "in_progress",
            "prompt": next_prompt,
            "step": context.current_step + 1,
            "total_steps": context.total_steps
        }
    
    def _get_step_prompt(self, context: TIPIExecutionContext, user_state: Dict[str, Any]) -> str:
        """Génère le prompt pour l'étape actuelle"""
        variation_data = self.protocol["variations"].get(context.variation.value, {})
        steps = variation_data.get("steps", [])
        
        if context.current_step < len(steps):
            step_data = steps[context.current_step]
            instruction = step_data.get("instruction", "")
            guidance = step_data.get("guidance", "")
            
            # Adaptation selon l'état de l'utilisateur
            if "{location}" in instruction and "emotion_location" in user_state:
                instruction = instruction.replace("{location}", user_state["emotion_location"])
            
            return f"{instruction}\n\n{guidance}"
        
        return "Continuez à observer ce qui se passe dans votre corps."
    
    def _calculate_engagement(self, user_response: str) -> float:
        """Calcule le niveau d'engagement de l'utilisateur (0-1)"""
        if len(user_response) < 5:
            return 0.2
        elif len(user_response) < 20:
            return 0.5
        elif len(user_response) < 50:
            return 0.7
        else:
            return 0.9
    
    def _generate_tipi_summary(self, context: TIPIExecutionContext) -> Dict[str, Any]:
        """Génère un résumé de la session TIPI"""
        avg_progression = sum(context.progression_scores) / len(context.progression_scores) if context.progression_scores else 0
        
        return {
            "variation_used": context.variation.value,
            "steps_completed": context.current_step,
            "average_progression": round(avg_progression, 2),
            "adjustments_count": len(context.adjustments_made),
            "adjustments": context.adjustments_made
        }

