"""
Système TIPI Adaptatif - Intelligence Thérapeutique Réelle

Ce module implémente une version intelligente de TIPI (Technique d'Identification 
des Peurs Inconscientes) qui s'adapte en temps réel au processus unique de chaque personne.

Basé sur la méthode de Luc Nicon avec adaptations cliniques pour le deuil.
"""

from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class TIPIVariation(Enum):
    """Types de variations TIPI selon le profil et l'état de l'utilisateur"""
    STANDARD = "standard"
    GENTLE = "gentle"        # Pour sensibilités élevées ou dissociation légère
    FOCUSED = "focused"      # Quand l'émotion est bien localisée
    EXTENDED = "extended"    # Quand le processus est lent ou complexe


@dataclass
class TIPISignals:
    """Signaux indiquant qu'un protocole TIPI est approprié"""
    somatic_activation: float      # Conscience corporelle présente (0-1)
    emotional_flooding: bool       # Submersion émotionnelle
    mental_rumination: float       # Boucles cognitives (0-1)
    sensory_avoidance: float       # Évitement du corps (0-1, bas = bon)
    window_of_tolerance: bool      # Dans la fenêtre de tolérance (arousal modéré)
    
    def score(self) -> int:
        """Compte le nombre de signaux positifs pour TIPI"""
        signals = [
            self.somatic_activation > 0.3,
            self.emotional_flooding,
            self.mental_rumination > 0.6,
            self.sensory_avoidance < 0.2,
            self.window_of_tolerance
        ]
        return sum(signals)


@dataclass
class TIPIState:
    """État du processus TIPI en cours"""
    current_step: int
    variation: TIPIVariation
    progression_score: float       # 0-1, qualité de la progression
    user_engagement: float         # 0-1, engagement de l'utilisateur
    somatic_clarity: float         # 0-1, clarté de la sensation
    process_speed: float           # 0-1, vitesse du processus
    needs_adjustment: bool


class TIPIDetector:
    """Détection intelligente du moment propice pour TIPI"""
    
    def should_activate_tipi(
        self, 
        user_state: Dict[str, Any], 
        conversation_context: Dict[str, Any]
    ) -> Tuple[bool, TIPISignals]:
        """
        Détermine si TIPI est approprié maintenant
        
        Plus intelligent qu'une simple règle "détresse > 60"
        Analyse multi-critères avec signaux somatiques et fenêtre de tolérance
        """
        # Extraction des métriques
        detresse = user_state.get("detresse", 0)
        arousal = user_state.get("arousal", 0.5)
        body_awareness = user_state.get("body_awareness", 0)
        emotional_clarity = user_state.get("emotional_clarity", 0.5)
        cognitive_loops = user_state.get("cognitive_loops", 0)
        body_avoidance = user_state.get("body_avoidance", 0.5)
        
        # Construction des signaux TIPI
        signals = TIPISignals(
            somatic_activation=body_awareness,
            emotional_flooding=(detresse > 60 and emotional_clarity < 0.4),
            mental_rumination=cognitive_loops,
            sensory_avoidance=body_avoidance,
            window_of_tolerance=(0.3 < arousal < 0.8)  # Ni hypo ni hyper-activation
        )
        
        # Décision : au moins 3 signaux positifs
        should_activate = signals.score() >= 3
        
        # Vérification des contre-indications
        if should_activate:
            should_activate = not self._check_contraindications(user_state, conversation_context)
        
        logger.info(f"TIPI activation decision: {should_activate} (signals: {signals.score()}/5)")
        return should_activate, signals
    
    def _check_contraindications(
        self, 
        user_state: Dict[str, Any], 
        conversation_context: Dict[str, Any]
    ) -> bool:
        """Vérifie les contre-indications à TIPI"""
        contraindications = []
        
        # Détresse extrême (> 90) - besoin de stabilisation d'abord
        if user_state.get("detresse", 0) > 90:
            contraindications.append("detresse_extreme")
        
        # Dissociation active
        if user_state.get("dissociation", 0) > 0.6:
            contraindications.append("dissociation_active")
        
        # Trauma récent non stabilisé (< 48h)
        if conversation_context.get("recent_trauma_hours", 999) < 48:
            contraindications.append("trauma_recent")
        
        # Évitement corporel très élevé (> 0.8)
        if user_state.get("body_avoidance", 0) > 0.8:
            contraindications.append("body_avoidance_severe")
        
        if contraindications:
            logger.warning(f"TIPI contraindications: {contraindications}")
        
        return len(contraindications) > 0


class AdaptiveTIPI:
    """Moteur TIPI adaptatif avec variations intelligentes"""
    
    def __init__(self):
        self.detector = TIPIDetector()
        self.current_state: Optional[TIPIState] = None
    
    def select_tipi_variation(
        self, 
        user_profile: Dict[str, Any], 
        current_state: Dict[str, Any]
    ) -> TIPIVariation:
        """
        Sélectionne la variation TIPI la plus appropriée
        
        Args:
            user_profile: Profil utilisateur (sensibilité, historique)
            current_state: État émotionnel et somatique actuel
        
        Returns:
            TIPIVariation appropriée
        """
        # GENTLE : Pour haute sensibilité ou dissociation légère
        if user_profile.get("high_sensitivity", False):
            return TIPIVariation.GENTLE
        
        if 0.3 < current_state.get("dissociation", 0) < 0.6:
            return TIPIVariation.GENTLE
        
        # FOCUSED : Émotion bien localisée dans le corps
        if current_state.get("somatic_clarity", 0) > 0.7:
            return TIPIVariation.FOCUSED

        # EXTENDED : Processus lent ou émotion complexe
        if current_state.get("process_speed", 0.5) < 0.3:
            return TIPIVariation.EXTENDED

        if current_state.get("emotional_complexity", 0) > 0.7:
            return TIPIVariation.EXTENDED

        # STANDARD : Cas général
        return TIPIVariation.STANDARD

    def is_tipi_progressing(
        self,
        user_response: str,
        tipi_state: TIPIState
    ) -> bool:
        """
        Vérifie si le processus TIPI progresse sainement

        Signaux de progression :
        - Descriptions sensorielles (pas intellectuelles)
        - Changements dans la sensation
        - Engagement présent (pas de fuite)
        """
        # Indicateurs de progression
        progression_indicators = {
            "sensory_description": any(word in user_response.lower() for word in [
                "chaud", "froid", "lourd", "léger", "serré", "ouvert",
                "pression", "tension", "picotement", "vibration"
            ]),
            "location_clarity": any(word in user_response.lower() for word in [
                "gorge", "poitrine", "ventre", "épaules", "dos", "tête"
            ]),
            "change_noticed": any(word in user_response.lower() for word in [
                "change", "bouge", "diminue", "augmente", "se déplace", "évolue"
            ]),
            "present_engagement": len(user_response) > 10 and not any(word in user_response.lower() for word in [
                "je ne sais pas", "rien", "je ne sens rien", "je ne comprends pas"
            ])
        }

        progression_score = sum(progression_indicators.values()) / len(progression_indicators)
        tipi_state.progression_score = progression_score

        # Progression si au moins 2 indicateurs sur 4
        return progression_score >= 0.5

    def adjust_tipi_approach(
        self,
        user_response: str,
        current_variation: TIPIVariation
    ) -> Dict[str, Any]:
        """
        Ajuste l'approche TIPI si la progression stagne

        Returns:
            Dictionnaire avec la nouvelle approche et le message adapté
        """
        # Détection du type de blocage
        if "je ne sens rien" in user_response.lower() or "vide" in user_response.lower():
            # Blocage : Engourdissement / Évitement somatique
            return {
                "adjustment": "tipi_of_emptiness",
                "message": "Parfois le vide est une sensation en soi. Si vous le souhaitez, nous pouvons simplement porter attention à cette absence de sensation, cet espace vide dans le corps. Sans attente, juste être présent à ce qui est.",
                "next_variation": TIPIVariation.GENTLE
            }

        elif "trop" in user_response.lower() or "intense" in user_response.lower():
            # Blocage : Submersion
            return {
                "adjustment": "grounding_first",
                "message": "C'est très intense. Prenons d'abord un moment pour vous ancrer. Sentez vos pieds sur le sol, votre dos contre le support. Puis, si vous le souhaitez, nous pourrons revenir à cette sensation.",
                "next_variation": TIPIVariation.GENTLE
            }

        elif "je ne comprends pas" in user_response.lower():
            # Blocage : Intellectualisation
            return {
                "adjustment": "redirect_to_sensation",
                "message": "Il n'y a rien à comprendre, juste à observer. Comme si vous regardiez un paysage. Où dans votre corps ressentez-vous quelque chose en ce moment ?",
                "next_variation": current_variation
            }

        else:
            # Blocage général : Transition vers autre méthode
            return {
                "adjustment": "transition_to_other_method",
                "message": "Je sens que cette approche ne vous convient pas en ce moment. C'est tout à fait normal. Voulez-vous qu'on explore autrement ?",
                "next_variation": None
            }

    def get_tipi_step_prompt(
        self,
        step_number: int,
        variation: TIPIVariation,
        user_state: Dict[str, Any]
    ) -> str:
        """
        Génère le prompt pour une étape TIPI spécifique

        Adapté à la variation et à l'état de l'utilisateur
        """
        # Import du protocole TIPI (sera créé ensuite)
        # Pour l'instant, version simplifiée

        base_steps = {
            1: "Identifiez où dans votre corps vous ressentez cette émotion difficile.",
            2: "Décrivez cette sensation physique sans la juger.",
            3: "Restez avec cette sensation, laissez-la évoluer naturellement.",
            4: "Notez les changements, même subtils."
        }

        # Adaptation selon la variation
        if variation == TIPIVariation.GENTLE:
            gentle_prefix = "Très doucement, si vous le souhaitez, "
            return gentle_prefix + base_steps.get(step_number, "").lower()

        elif variation == TIPIVariation.FOCUSED:
            if step_number == 1:
                location = user_state.get("emotion_location", "votre corps")
                return f"Vous avez mentionné une sensation au niveau de {location}. Pouvez-vous y porter votre attention ?"
            return base_steps.get(step_number, "")

        elif variation == TIPIVariation.EXTENDED:
            extended_suffix = " Prenez tout le temps dont vous avez besoin."
            return base_steps.get(step_number, "") + extended_suffix

        else:  # STANDARD
            return base_steps.get(step_number, "")

