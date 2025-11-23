"""
Safety Monitor - Surveillance des Effets Indésirables

Surveillance en temps réel pendant les sessions thérapeutiques pour détecter :
- Augmentation détresse
- Flooding émotionnel
- Dissociation émergente
- Rumination augmentée
- Déréalisation/dépersonnalisation

Basé sur :
- Pennebaker & Beall (1986) : 12-18% détresse temporaire augmentée
- A-Tjak et al. (2015) : 15% risque déréalisation avec ACT digital
- Herman (1992) : Fenêtre de tolérance trauma
"""

from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import logging
import statistics
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class AdverseEffectType(Enum):
    """Types d'effets indésirables"""
    DISTRESS_INCREASE = "distress_increase"
    EMOTIONAL_FLOODING = "emotional_flooding"
    DISSOCIATION_EMERGENT = "dissociation_emergent"
    RUMINATION_INCREASE = "rumination_increase"
    DEREALIZATION = "derealization"
    DEPERSONALIZATION = "depersonalization"
    COGNITIVE_OVERLOAD = "cognitive_overload"


class SafetyAction(Enum):
    """Actions de sécurité"""
    CONTINUE = "continue"
    SLOW_DOWN = "slow_down"
    PAUSE_SESSION = "pause_session"
    STOP_SESSION = "stop_session"
    SWITCH_METHOD = "switch_method"
    STABILIZATION = "stabilization"


@dataclass
class SafetyAlert:
    """Alerte de sécurité"""
    effect_type: AdverseEffectType
    severity: float  # 0-1
    indicators: List[str]
    recommended_action: SafetyAction
    alternative_method: Optional[str] = None
    debriefing_required: bool = False


class SafetyMonitor:
    """
    Moniteur de sécurité pour surveillance effets indésirables
    
    Surveillance continue pendant session thérapeutique
    """
    
    def __init__(self):
        # Composants optimaux
        self.adaptive_thresholds = AdaptiveSafetyThresholds()
        self.trend_analyzer = SimpleTrendAnalyzer()
        self.predictive_engine = PredictiveSafetyWithoutML()
        self.intervention_system = OptimalInterventionSystem()

        # Seuils par défaut
        self.thresholds = {
            "distress_increase_rate": 0.20,
            "arousal_flooding": 0.9,
            "dissociation_threshold": 0.7,
            "rumination_increase": 0.3,
            "derealization_markers": 3
        }
    
    def monitor_session(
        self,
        method: str,
        current_state: Dict[str, Any],
        baseline_state: Dict[str, Any],
        user_responses: List[str],
        session_duration_minutes: int,
        user_id: str = "unknown"
    ) -> Optional[SafetyAlert]:
        """
        Surveillance complète - VERSION OPTIMALE

        Intègre seuils adaptatifs + prédiction + tendances
        """

        # NOUVEAU: Analyse tendances + prédiction
        self.trend_analyzer.add_data_point(user_id, {
            "detresse": current_state.get('detresse', 50),
            "arousal": current_state.get('arousal', 0.5),
            "dissociation": current_state.get('dissociation', 0)
        })

        risk_prediction = self.predictive_engine.predict_risk_simple(
            user_id, method, current_state
        )

        # Ajuster seuils si risque élevé
        if risk_prediction["risk_score"] > 0.6:
            self.thresholds["distress_increase_rate"] *= 0.8
            self.thresholds["arousal_flooding"] *= 0.9

        # 1. Vérifier augmentation détresse
        distress_alert = self._check_distress_increase(current_state, baseline_state, user_id)
        if distress_alert:
            return distress_alert
        
        # 2. Vérifier flooding émotionnel
        flooding_alert = self._check_emotional_flooding(current_state)
        if flooding_alert:
            return flooding_alert
        
        # 3. Vérifier dissociation émergente
        dissociation_alert = self._check_dissociation(current_state, baseline_state)
        if dissociation_alert:
            return dissociation_alert
        
        # 4. Vérifier rumination augmentée
        rumination_alert = self._check_rumination_increase(current_state, baseline_state, user_responses)
        if rumination_alert:
            return rumination_alert
        
        # 5. Vérifier déréalisation (spécifique ACT)
        if method == "act":
            derealization_alert = self._check_derealization(user_responses)
            if derealization_alert:
                return derealization_alert
        
        # 6. Vérifier surcharge cognitive
        cognitive_alert = self._check_cognitive_overload(current_state, session_duration_minutes)
        if cognitive_alert:
            return cognitive_alert
        
        return None
    
    def _check_distress_increase(
        self,
        current_state: Dict[str, Any],
        baseline_state: Dict[str, Any],
        user_id: str = "unknown"
    ) -> Optional[SafetyAlert]:
        """
        Vérifier augmentation détresse - AVEC SEUILS ADAPTATIFS
        """
        baseline_distress = baseline_state.get("detresse", 50)
        current_distress = current_state.get("detresse", 50)

        if baseline_distress == 0:
            return None

        increase_rate = (current_distress - baseline_distress) / baseline_distress

        # NOUVEAU: Seuil personnalisé
        personal_threshold = self.adaptive_thresholds.calculate_personal_threshold(
            user_id, "distress_increase_rate"
        )

        if increase_rate > personal_threshold:
            severity = min(1.0, increase_rate / 0.5)
            
            if increase_rate > 0.4:  # > 40% augmentation
                action = SafetyAction.STOP_SESSION
            elif increase_rate > 0.3:
                action = SafetyAction.PAUSE_SESSION
            else:
                action = SafetyAction.SLOW_DOWN
            
            return SafetyAlert(
                effect_type=AdverseEffectType.DISTRESS_INCREASE,
                severity=severity,
                indicators=[f"Détresse augmentée de {increase_rate*100:.1f}%"],
                recommended_action=action,
                debriefing_required=True
            )
        
        return None
    
    def _check_emotional_flooding(
        self,
        current_state: Dict[str, Any]
    ) -> Optional[SafetyAlert]:
        """Vérifier flooding émotionnel (arousal > 0.9)"""
        arousal = current_state.get("emotional_arousal", 0.5)
        
        if arousal > self.thresholds["arousal_flooding"]:
            return SafetyAlert(
                effect_type=AdverseEffectType.EMOTIONAL_FLOODING,
                severity=arousal,
                indicators=["Arousal émotionnel excessif"],
                recommended_action=SafetyAction.STABILIZATION,
                alternative_method="grounding_5_sens",
                debriefing_required=False
            )

        return None

    def _check_dissociation(
        self,
        current_state: Dict[str, Any],
        baseline_state: Dict[str, Any]
    ) -> Optional[SafetyAlert]:
        """Vérifier dissociation émergente"""
        baseline_dissociation = baseline_state.get("dissociation", 0)
        current_dissociation = current_state.get("dissociation", 0)

        # Dissociation émergente (augmentation significative)
        if current_dissociation > 0.7 or (current_dissociation - baseline_dissociation) > 0.3:
            return SafetyAlert(
                effect_type=AdverseEffectType.DISSOCIATION_EMERGENT,
                severity=current_dissociation,
                indicators=["Dissociation détectée"],
                recommended_action=SafetyAction.STOP_SESSION,
                alternative_method="grounding_5_sens",
                debriefing_required=True
            )

        return None

    def _check_rumination_increase(
        self,
        current_state: Dict[str, Any],
        baseline_state: Dict[str, Any],
        user_responses: List[str]
    ) -> Optional[SafetyAlert]:
        """Vérifier augmentation rumination"""
        baseline_rumination = baseline_state.get("rumination", 0)
        current_rumination = current_state.get("rumination", 0)

        # Analyser répétition thématique dans réponses
        if len(user_responses) >= 3:
            last_responses = user_responses[-3:]
            words_sets = [set(r.lower().split()) for r in last_responses]

            # Calculer overlap
            overlaps = []
            for i in range(len(words_sets) - 1):
                overlap = len(words_sets[i] & words_sets[i+1]) / max(1, len(words_sets[i] | words_sets[i+1]))
                overlaps.append(overlap)

            avg_overlap = sum(overlaps) / len(overlaps) if overlaps else 0

            if avg_overlap > 0.7 or (current_rumination - baseline_rumination) > self.thresholds["rumination_increase"]:
                return SafetyAlert(
                    effect_type=AdverseEffectType.RUMINATION_INCREASE,
                    severity=max(avg_overlap, current_rumination),
                    indicators=["Rumination augmentée", f"Répétition thématique: {avg_overlap:.2f}"],
                    recommended_action=SafetyAction.SWITCH_METHOD,
                    alternative_method="mindfulness",
                    debriefing_required=False
                )

        return None

    def _check_derealization(
        self,
        user_responses: List[str]
    ) -> Optional[SafetyAlert]:
        """
        Vérifier déréalisation (spécifique ACT digital)

        A-Tjak et al. (2015) : 15% risque déréalisation
        """
        derealization_markers = [
            r"\birréel\b",
            r"\bétrange\b",
            r"\bdétaché\b",
            r"\bcomme dans un rêve\b",
            r"\bpas vraiment là\b",
            r"\bobserver de l'extérieur\b"
        ]

        import re
        marker_count = 0
        detected_markers = []

        for response in user_responses[-5:]:  # 5 dernières réponses
            response_lower = response.lower()
            for marker in derealization_markers:
                if re.search(marker, response_lower):
                    marker_count += 1
                    detected_markers.append(marker)

        if marker_count >= self.thresholds["derealization_markers"]:
            return SafetyAlert(
                effect_type=AdverseEffectType.DEREALIZATION,
                severity=min(1.0, marker_count / 5),
                indicators=[f"Marqueurs déréalisation: {marker_count}"],
                recommended_action=SafetyAction.STOP_SESSION,
                alternative_method="grounding_5_sens",
                debriefing_required=True
            )

        return None

    def _check_cognitive_overload(
        self,
        current_state: Dict[str, Any],
        session_duration_minutes: int
    ) -> Optional[SafetyAlert]:
        """Vérifier surcharge cognitive"""
        cognitive_resources = current_state.get("cognitive_resources", 0.5)

        # Surcharge si ressources < 0.3 et session > 20 min
        if cognitive_resources < 0.3 and session_duration_minutes > 20:
            return SafetyAlert(
                effect_type=AdverseEffectType.COGNITIVE_OVERLOAD,
                severity=1 - cognitive_resources,
                indicators=["Ressources cognitives épuisées", f"Durée: {session_duration_minutes} min"],
                recommended_action=SafetyAction.PAUSE_SESSION,
                debriefing_required=False
            )

        return None

    def get_debriefing_protocol(self, alert: SafetyAlert) -> Dict[str, Any]:
        """
        Retourne le protocole de débriefing approprié

        Basé sur Pennebaker : débriefing obligatoire si détresse augmentée
        """
        if not alert.debriefing_required:
            return {"required": False}

        protocols = {
            AdverseEffectType.DISTRESS_INCREASE: {
                "required": True,
                "steps": [
                    "Normaliser l'augmentation temporaire de détresse (12-18% des cas)",
                    "Valider l'expérience émotionnelle",
                    "Proposer techniques de régulation (respiration, grounding)",
                    "Planifier suivi dans 24-48h"
                ],
                "safety_check": "Évaluer idéations suicidaires si détresse > 85"
            },

            AdverseEffectType.DISSOCIATION_EMERGENT: {
                "required": True,
                "steps": [
                    "Grounding immédiat (5 sens)",
                    "Réorientation temporelle et spatiale",
                    "Validation de l'expérience",
                    "Référence professionnelle si persistant"
                ],
                "safety_check": "Vérifier capacité à se réorienter"
            },

            AdverseEffectType.DEREALIZATION: {
                "required": True,
                "steps": [
                    "Arrêt immédiat exercice de défusion",
                    "Grounding sensoriel",
                    "Explication du phénomène (15% cas ACT digital)",
                    "Contre-indication temporaire ACT"
                ],
                "safety_check": "Évaluer durée et intensité déréalisation"
            }
        }

        return protocols.get(alert.effect_type, {"required": True, "steps": ["Débriefing standard"]})


# ============================================================================
# SEUILS ADAPTATIFS PERSONNALISÉS
# ============================================================================

@dataclass
class TrendAnalysis:
    """Analyse de tendance simple"""
    detresse_slope: float
    emotional_variability: float
    data_points: int
    trend_direction: str

    @staticmethod
    def insufficient_data():
        return TrendAnalysis(0, 0, 0, "unknown")


class AdaptiveSafetyThresholds:
    """Seuils de sécurité adaptatifs sans ML"""

    def __init__(self):
        self.user_baselines = {}
        self.session_history = {}

        # Seuils par défaut evidence-based
        self.default_thresholds = {
            "distress_increase_rate": 0.20,
            "arousal_flooding": 0.9,
            "dissociation_threshold": 0.7,
            "rumination_increase": 0.25,
            "cognitive_overload": 0.8
        }

    def calculate_personal_threshold(self, user_id: str, metric: str) -> float:
        """Calcule seuils personnalisés basés sur historique"""
        user_history = self.session_history.get(user_id, [])

        if len(user_history) < 5:
            return self._get_default_threshold(metric)

        # Baseline personnelle
        metric_values = [session.get(metric, 0) for session in user_history]
        baseline = statistics.mean(metric_values)
        variability = statistics.stdev(metric_values) if len(metric_values) > 1 else 0.1

        # Seuil = baseline + 2 écarts-types
        personal_threshold = baseline + (2 * variability)

        return max(personal_threshold, self._get_default_threshold(metric))

    def _get_default_threshold(self, metric: str) -> float:
        return self.default_thresholds.get(metric, 0.7)

    def update_history(self, user_id: str, session_data: Dict[str, Any]):
        """Met à jour l'historique utilisateur"""
        if user_id not in self.session_history:
            self.session_history[user_id] = []

        self.session_history[user_id].append({
            **session_data,
            "timestamp": datetime.now()
        })

        # Garder seulement 30 dernières sessions
        if len(self.session_history[user_id]) > 30:
            self.session_history[user_id] = self.session_history[user_id][-30:]


# ============================================================================
# ANALYSE DE TENDANCES SANS ML
# ============================================================================

class SimpleTrendAnalyzer:
    """Analyse de tendances simples sans ML"""

    def __init__(self):
        self.user_data = {}

    def analyze_4h_trend(self, user_id: str) -> TrendAnalysis:
        """Analyse tendances sur 4 heures"""
        recent_data = self._get_last_4h_data(user_id)

        if len(recent_data) < 3:
            return TrendAnalysis.insufficient_data()

        # Calcul pente simple
        detresse_values = [point.get('detresse', 50) for point in recent_data]
        times = list(range(len(detresse_values)))

        slope = self._calculate_simple_slope(times, detresse_values)

        # Variabilité normalisée
        variability = statistics.stdev(detresse_values) / 100 if len(detresse_values) > 1 else 0

        return TrendAnalysis(
            detresse_slope=slope,
            emotional_variability=variability,
            data_points=len(recent_data),
            trend_direction="up" if slope > 0.05 else "down" if slope < -0.05 else "stable"
        )

    def _get_last_4h_data(self, user_id: str) -> List[Dict]:
        """Récupère données des 4 dernières heures"""
        if user_id not in self.user_data:
            return []

        cutoff_time = datetime.now() - timedelta(hours=4)
        return [
            point for point in self.user_data.get(user_id, [])
            if point.get('timestamp', datetime.now()) > cutoff_time
        ]

    def _calculate_simple_slope(self, x: List, y: List) -> float:
        """Calcule pente simple (régression linéaire)"""
        n = len(x)
        if n < 2:
            return 0

        sum_x = sum(x)
        sum_y = sum(y)
        sum_xy = sum(x[i] * y[i] for i in range(n))
        sum_x2 = sum(xi * xi for xi in x)

        denominator = (n * sum_x2 - sum_x * sum_x)
        if denominator == 0:
            return 0

        slope = (n * sum_xy - sum_x * sum_y) / denominator
        return slope

    def add_data_point(self, user_id: str, data: Dict[str, Any]):
        """Ajoute un point de données"""
        if user_id not in self.user_data:
            self.user_data[user_id] = []

        self.user_data[user_id].append({
            **data,
            "timestamp": datetime.now()
        })

        # Garder seulement 24h de données
        cutoff_time = datetime.now() - timedelta(hours=24)
        self.user_data[user_id] = [
            point for point in self.user_data[user_id]
            if point.get('timestamp', datetime.now()) > cutoff_time
        ]


# ============================================================================
# PRÉDICTION DE RISQUE SANS ML
# ============================================================================

class PredictiveSafetyWithoutML:
    """Prédiction de sécurité sans machine learning"""

    def __init__(self):
        self.trend_analyzer = SimpleTrendAnalyzer()

    def predict_risk_simple(self, user_id: str, method: str, current_state: Dict) -> Dict:
        """Prédiction basée sur règles expertes"""

        # 1. Analyse tendances récentes
        recent_trend = self.trend_analyzer.analyze_4h_trend(user_id)

        # 2. Prédiction par règles
        risk_prediction = self._expert_rules_prediction(
            recent_trend, current_state, method
        )

        return risk_prediction

    def _expert_rules_prediction(self, trend: TrendAnalysis,
                                 current_state: Dict, method: str) -> Dict:
        """Règles expertes pour prédiction"""

        risk_score = 0
        risk_factors = []

        # Règle 1: Tendance croissante détresse
        if trend.detresse_slope > 0.1:
            risk_score += 0.3
            risk_factors.append("detresse_croissante")

        # Règle 2: Variabilité émotionnelle élevée
        if trend.emotional_variability > 0.7:
            risk_score += 0.2
            risk_factors.append("instabilite_emotionnelle")

        # Règle 3: État de fatigue
        if current_state.get('fatigue', 0) > 0.8:
            risk_score += 0.15
            risk_factors.append("fatigue_elevee")

        # Règle 4: Heure de la journée
        current_hour = datetime.now().hour
        if 22 <= current_hour or current_hour <= 6:
            risk_score += 0.15
            risk_factors.append("periode_nocturne")

        # Règle 5: Dissociation baseline
        if current_state.get('dissociation', 0) > 0.5:
            risk_score += 0.2
            risk_factors.append("dissociation_baseline")

        return {
            "risk_score": min(risk_score, 1.0),
            "risk_factors": risk_factors,
            "confidence": 0.8 - (len(risk_factors) * 0.1),
            "trend_direction": trend.trend_direction
        }


# ============================================================================
# SYSTÈME D'INTERVENTION OPTIMAL
# ============================================================================

@dataclass
class OptimalInterventionPlan:
    """Plan d'intervention optimal"""
    strategy: str
    immediate_actions: List[Dict[str, Any]]
    adaptive_changes: List[str]
    monitoring_plan: Dict[str, Any]
    success_metrics: List[str]


class OptimalInterventionSystem:
    """Système d'intervention optimal sans ML"""

    def get_optimal_intervention(self, safety_level: str,
                               risk_prediction: Dict,
                               user_context: Dict) -> OptimalInterventionPlan:
        """Plan d'intervention optimal basé sur sécurité"""

        intervention_strategy = self._select_optimal_strategy(
            safety_level, risk_prediction, user_context
        )

        return OptimalInterventionPlan(
            strategy=intervention_strategy,
            immediate_actions=self._get_immediate_actions(intervention_strategy),
            adaptive_changes=self._get_adaptive_changes(intervention_strategy),
            monitoring_plan=self._get_monitoring_plan(intervention_strategy),
            success_metrics=self._get_success_metrics(intervention_strategy)
        )

    def _select_optimal_strategy(self, safety_level: str,
                               risk_prediction: Dict,
                               context: Dict) -> str:
        """Sélection stratégie optimale"""

        strategies = {
            "optimal": "enhanced_therapy",
            "good": "standard_therapy",
            "caution": "adapted_therapy",
            "warning": "supported_therapy",
            "unsafe": "safety_first"
        }

        base_strategy = strategies.get(safety_level, "safety_first")

        # Ajustements basés sur prédiction
        if risk_prediction.get("risk_score", 0) > 0.7:
            base_strategy = "safety_first"
        elif risk_prediction.get("risk_score", 0) > 0.5:
            base_strategy = "supported_therapy"

        # Ajustements contextuels
        if context.get('evening_session', False) and safety_level != "optimal":
            base_strategy = self._escalate_strategy(base_strategy)

        return base_strategy

    def _escalate_strategy(self, strategy: str) -> str:
        """Escalade vers stratégie plus sécuritaire"""
        escalation = {
            "enhanced_therapy": "standard_therapy",
            "standard_therapy": "adapted_therapy",
            "adapted_therapy": "supported_therapy",
            "supported_therapy": "safety_first"
        }
        return escalation.get(strategy, "safety_first")

    def _get_immediate_actions(self, strategy: str) -> List[Dict]:
        """Actions immédiates optimales"""

        actions_library = {
            "enhanced_therapy": [
                {"action": "method_activation", "intensity": "high", "duration": "standard"},
                {"action": "progress_tracking", "intensity": "detailed", "frequency": "high"}
            ],
            "standard_therapy": [
                {"action": "method_activation", "intensity": "medium", "duration": "standard"},
                {"action": "safety_check", "intensity": "baseline", "frequency": "medium"}
            ],
            "adapted_therapy": [
                {"action": "method_activation", "intensity": "low", "duration": "reduced"},
                {"action": "grounding_exercise", "intensity": "preparatory", "duration": "5min"},
                {"action": "safety_check", "intensity": "enhanced", "frequency": "high"}
            ],
            "supported_therapy": [
                {"action": "method_activation", "intensity": "minimal", "duration": "brief"},
                {"action": "safety_contract", "intensity": "explicit", "content": "crisis_plan"},
                {"action": "resource_activation", "intensity": "high", "resources": ["breathing", "grounding"]},
                {"action": "safety_check", "intensity": "continuous", "frequency": "very_high"}
            ],
            "safety_first": [
                {"action": "method_suspension", "intensity": "immediate", "duration": "24h"},
                {"action": "crisis_protocol", "intensity": "full", "protocol": "emergency"},
                {"action": "human_support", "intensity": "maximum", "options": ["emergency_contacts"]},
                {"action": "safety_monitoring", "intensity": "intensive", "frequency": "continuous"}
            ]
        }

        return actions_library.get(strategy, actions_library["safety_first"])

    def _get_adaptive_changes(self, strategy: str) -> List[str]:
        """Changements adaptatifs"""

        changes = {
            "enhanced_therapy": ["Augmenter profondeur exploration"],
            "standard_therapy": ["Maintenir rythme actuel"],
            "adapted_therapy": ["Réduire intensité", "Augmenter pauses"],
            "supported_therapy": ["Ralentir significativement", "Grounding fréquent"],
            "safety_first": ["Suspendre méthode", "Stabilisation uniquement"]
        }

        return changes.get(strategy, ["Stabilisation"])

    def _get_monitoring_plan(self, strategy: str) -> Dict[str, Any]:
        """Plan de surveillance"""

        plans = {
            "enhanced_therapy": {"frequency": "every_10min", "metrics": ["progress", "engagement"]},
            "standard_therapy": {"frequency": "every_5min", "metrics": ["detresse", "arousal"]},
            "adapted_therapy": {"frequency": "every_3min", "metrics": ["detresse", "dissociation", "arousal"]},
            "supported_therapy": {"frequency": "every_2min", "metrics": ["all_safety_metrics"]},
            "safety_first": {"frequency": "continuous", "metrics": ["crisis_indicators"]}
        }

        return plans.get(strategy, plans["safety_first"])

    def _get_success_metrics(self, strategy: str) -> List[str]:
        """Métriques de succès"""

        metrics = {
            "enhanced_therapy": ["Insight gained", "Emotional processing"],
            "standard_therapy": ["Session completion", "Stable arousal"],
            "adapted_therapy": ["No adverse effects", "Grounding maintained"],
            "supported_therapy": ["Safety maintained", "No escalation"],
            "safety_first": ["Crisis averted", "Stabilization achieved"]
        }

        return metrics.get(strategy, ["Safety maintained"])

