"""
Clinical Screening Engine - Evidence-Based Safety Checks

Basé sur les guidelines internationales et méta-analyses :
- ACT : Hayes et al. (2006), A-Tjak et al. (2015)
- TIPI : Nicon (2007), validation empirique limitée
- Journaling : Pennebaker & Beall (1986), Frattaroli (2006)
- Continuing Bonds : Klass et al. (1996), Stroebe & Schut (1999)
"""

from typing import Dict, Any, List, Tuple, Optional
from dataclasses import dataclass
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class RiskLevel(Enum):
    """Niveaux de risque clinique"""
    SAFE = "safe"
    CAUTION = "caution"
    CONTRAINDICATED = "contraindicated"


@dataclass
class ScreeningResult:
    """Résultat du screening clinique"""
    approved: bool
    risk_level: RiskLevel
    risk_factors: List[str]
    recommendations: List[str]
    alternative_methods: List[str]


class ClinicalScreeningEngine:
    """
    Moteur de screening clinique evidence-based
    
    Évalue la sécurité et l'appropriation de chaque méthode thérapeutique
    avant activation, basé sur la recherche scientifique.
    """
    
    def __init__(self):
        self.contraindications = self._load_contraindications()
        self.prerequisites = self._load_prerequisites()
        self.risk_thresholds = self._load_risk_thresholds()
    
    def _load_contraindications(self) -> Dict[str, Dict[str, Any]]:
        """
        Contre-indications basées sur la littérature scientifique
        
        Sources :
        - ACT : A-Tjak et al. (2015) meta-analysis
        - TIPI : Clinical observations (Nicon, 2007)
        - Journaling : Frattaroli (2006) meta-analysis
        """
        return {
            "tipi": {
                "absolute": [
                    {
                        "condition": "dissociation_active",
                        "threshold": 0.7,
                        "reason": "Risque de dépersonnalisation et déréalisation",
                        "source": "Van der Hart et al. (2006)"
                    },
                    {
                        "condition": "psychotic_symptoms",
                        "threshold": True,
                        "reason": "Risque de décompensation psychotique",
                        "source": "Clinical consensus"
                    },
                    {
                        "condition": "trauma_complex_untreated",
                        "threshold": True,
                        "reason": "Risque de réactivation sans résolution",
                        "source": "Herman (1992)"
                    }
                ],
                "relative": [
                    {
                        "condition": "interoceptive_awareness",
                        "threshold": 0.3,
                        "operator": "<",
                        "reason": "Capacité insuffisante de perception corporelle",
                        "source": "Mehling et al. (2012)"
                    },
                    {
                        "condition": "emotional_arousal",
                        "threshold": 0.9,
                        "operator": ">",
                        "reason": "Submersion émotionnelle - régulation impossible",
                        "source": "Porges (2011) - Polyvagal Theory"
                    }
                ]
            },
            
            "act": {
                "absolute": [
                    {
                        "condition": "mentalization_capacity",
                        "threshold": 0.3,
                        "operator": "<",
                        "reason": "Capacité de mentalisation insuffisante pour travail métacognitif",
                        "source": "Fonagy & Target (1997)"
                    },
                    {
                        "condition": "detresse",
                        "threshold": 85,
                        "operator": ">",
                        "reason": "Détresse trop élevée pour travail cognitif complexe",
                        "source": "Hayes et al. (2006)"
                    }
                ],
                "relative": [
                    {
                        "condition": "therapeutic_alliance",
                        "threshold": 0.6,
                        "operator": "<",
                        "reason": "Alliance thérapeutique insuffisante (30% de l'efficacité)",
                        "source": "Wampold (2015)"
                    },
                    {
                        "condition": "dissociation",
                        "threshold": 0.6,
                        "operator": ">",
                        "reason": "Risque de déréalisation avec exercices de défusion",
                        "source": "A-Tjak et al. (2015)"
                    }
                ]
            },
            
            "journaling_expressif": {
                "absolute": [
                    {
                        "condition": "emotional_flooding",
                        "threshold": True,
                        "reason": "Risque de retraumatisation sans cadre sécurisé",
                        "source": "Pennebaker & Beall (1986)"
                    },
                    {
                        "condition": "severe_rumination",
                        "threshold": 0.8,
                        "operator": ">",
                        "reason": "Risque d'augmentation de la rumination (7% des cas)",
                        "source": "Frattaroli (2006)"
                    }
                ],
                "relative": [
                    {
                        "condition": "emotional_arousal",
                        "threshold": 0.4,
                        "operator": "<",
                        "reason": "Arousal insuffisant pour bénéfice thérapeutique",
                        "source": "Pennebaker (1997)"
                    },
                    {
                        "condition": "emotional_arousal",
                        "threshold": 0.8,
                        "operator": ">",
                        "reason": "Arousal trop élevé - zone optimale dépassée",
                        "source": "Smyth (1998) meta-analysis"
                    },
                    {
                        "condition": "social_isolation",
                        "threshold": 0.7,
                        "operator": ">",
                        "reason": "Risque de substitution aux relations sociales",
                        "source": "Lepore & Smyth (2002)"
                    }
                ]
            },
            
            "continuing_bonds": {
                "absolute": [
                    {
                        "condition": "complicated_grief",
                        "threshold": True,
                        "reason": "Risque de fixation pathologique dans le deuil",
                        "source": "Stroebe & Schut (2005)"
                    }
                ],
                "relative": [
                    {
                        "condition": "grief_avoidance",
                        "threshold": 0.8,
                        "operator": ">",
                        "reason": "Évitement excessif - besoin de confrontation d'abord",
                        "source": "Dual Process Model (Stroebe & Schut, 1999)"
                    }
                ]
            }
        }

    def _load_prerequisites(self) -> Dict[str, List[Dict[str, Any]]]:
        """Prérequis pour chaque méthode basés sur la recherche"""
        return {
            "tipi": [
                {"condition": "interoceptive_awareness", "threshold": 0.4, "operator": ">"},
                {"condition": "safety_perceived", "threshold": 0.7, "operator": ">"},
                {"condition": "dissociation", "threshold": 0.3, "operator": "<"}
            ],
            "act": [
                {"condition": "mentalization_capacity", "threshold": 0.4, "operator": ">"},
                {"condition": "cognitive_resources", "threshold": 0.4, "operator": ">"},
                {"condition": "therapeutic_alliance", "threshold": 0.6, "operator": ">"}
            ],
            "journaling_expressif": [
                {"condition": "emotional_arousal", "threshold": 0.4, "operator": ">"},
                {"condition": "emotional_arousal", "threshold": 0.8, "operator": "<"},
                {"condition": "cognitive_processing", "threshold": 0.3, "operator": ">"}
            ],
            "continuing_bonds": [
                {"condition": "grief_acceptance", "threshold": 0.3, "operator": ">"},
                {"condition": "complicated_grief", "threshold": False, "operator": "=="}
            ]
        }

    def _load_risk_thresholds(self) -> Dict[str, Dict[str, float]]:
        """Seuils de risque pour chaque indicateur"""
        return {
            "detresse": {"safe": 60, "caution": 75, "danger": 85},
            "dissociation": {"safe": 0.3, "caution": 0.6, "danger": 0.8},
            "emotional_arousal": {"safe": 0.6, "caution": 0.8, "danger": 0.9},
            "rumination": {"safe": 0.5, "caution": 0.7, "danger": 0.8}
        }

    def screen_method(
        self,
        method: str,
        user_state: Dict[str, Any],
        emotion_analysis: Dict[str, Any],
        therapeutic_context: Dict[str, Any]
    ) -> ScreeningResult:
        """
        Screening clinique complet pour une méthode

        Args:
            method: Nom de la méthode (tipi, act, journaling_expressif, etc.)
            user_state: État utilisateur (détresse, phase, etc.)
            emotion_analysis: Analyse EmotionBERT enrichie
            therapeutic_context: Contexte thérapeutique (alliance, historique, etc.)

        Returns:
            ScreeningResult avec approbation et recommandations
        """
        # Enrichir l'état avec les analyses
        enriched_state = self._enrich_state(user_state, emotion_analysis, therapeutic_context)

        # Vérifier contre-indications absolues
        absolute_risks = self._check_absolute_contraindications(method, enriched_state)
        if absolute_risks:
            return ScreeningResult(
                approved=False,
                risk_level=RiskLevel.CONTRAINDICATED,
                risk_factors=absolute_risks,
                recommendations=self._get_safety_recommendations(absolute_risks),
                alternative_methods=self._suggest_alternatives(method, enriched_state)
            )

        # Vérifier contre-indications relatives
        relative_risks = self._check_relative_contraindications(method, enriched_state)

        # Vérifier prérequis
        missing_prerequisites = self._check_prerequisites(method, enriched_state)

        # Déterminer niveau de risque
        if relative_risks or missing_prerequisites:
            return ScreeningResult(
                approved=False,
                risk_level=RiskLevel.CAUTION,
                risk_factors=relative_risks + missing_prerequisites,
                recommendations=self._get_caution_recommendations(method, relative_risks, missing_prerequisites),
                alternative_methods=self._suggest_alternatives(method, enriched_state)
            )

        # Approuvé
        return ScreeningResult(
            approved=True,
            risk_level=RiskLevel.SAFE,
            risk_factors=[],
            recommendations=self._get_best_practices(method),
            alternative_methods=[]
        )

    def _enrich_state(
        self,
        user_state: Dict[str, Any],
        emotion_analysis: Dict[str, Any],
        therapeutic_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Enrichit l'état utilisateur avec toutes les données disponibles"""
        return {
            **user_state,
            # Données émotionnelles (EmotionBERT)
            "emotional_arousal": emotion_analysis.get("arousal", 0),
            "emotional_valence": emotion_analysis.get("valence", 0),
            "cognitive_fusion": emotion_analysis.get("cognitive_fusion", 0),
            "experiential_avoidance": emotion_analysis.get("experiential_avoidance", 0),
            "rumination": emotion_analysis.get("rumination", 0),

            # Contexte thérapeutique
            "therapeutic_alliance": therapeutic_context.get("alliance", 0.5),
            "session_count": therapeutic_context.get("session_count", 0),
            "previous_methods": therapeutic_context.get("previous_methods", []),

            # Capacités cognitives
            "mentalization_capacity": self._estimate_mentalization(emotion_analysis, therapeutic_context),
            "cognitive_resources": self._estimate_cognitive_resources(user_state, emotion_analysis),
            "interoceptive_awareness": self._estimate_interoception(user_state, emotion_analysis),

            # Sécurité
            "safety_perceived": therapeutic_context.get("safety_perceived", 0.7),
            "emotional_flooding": emotion_analysis.get("arousal", 0) > 0.85,
            "dissociation_active": user_state.get("dissociation", 0) > 0.7
        }

    def _estimate_mentalization(self, emotion_analysis: Dict, context: Dict) -> float:
        """
        Estime la capacité de mentalisation

        Basé sur Fonagy & Target (1997) - Reflective Functioning
        """
        indicators = [
            emotion_analysis.get("emotional_awareness", 0),
            emotion_analysis.get("perspective_taking", 0),
            1.0 - emotion_analysis.get("alexithymia", 0),
            context.get("metacognitive_markers", 0)
        ]
        return sum(indicators) / len(indicators)

    def _estimate_cognitive_resources(self, user_state: Dict, emotion_analysis: Dict) -> float:
        """Estime les ressources cognitives disponibles"""
        detresse = user_state.get("detresse", 50) / 100
        arousal = emotion_analysis.get("arousal", 0)

        # Ressources diminuent avec détresse et arousal élevés
        return max(0, 1.0 - (detresse * 0.6 + arousal * 0.4))

    def _estimate_interoception(self, user_state: Dict, emotion_analysis: Dict) -> float:
        """
        Estime la conscience intéroceptive

        Basé sur Mehling et al. (2012) - MAIA scale
        """
        body_awareness = user_state.get("body_awareness", 0.5)
        somatic_markers = emotion_analysis.get("somatic_markers", 0.5)

        return (body_awareness + somatic_markers) / 2

    def _check_absolute_contraindications(self, method: str, state: Dict[str, Any]) -> List[str]:
        """Vérifie les contre-indications absolues"""
        risks = []
        contraindications = self.contraindications.get(method, {}).get("absolute", [])

        for ci in contraindications:
            condition = ci["condition"]
            threshold = ci["threshold"]
            operator = ci.get("operator", "==")

            value = state.get(condition)
            if value is None:
                continue

            is_contraindicated = self._evaluate_condition(value, operator, threshold)

            if is_contraindicated:
                risks.append(f"{condition}: {ci['reason']} (Source: {ci['source']})")

        return risks

    def _check_relative_contraindications(self, method: str, state: Dict[str, Any]) -> List[str]:
        """Vérifie les contre-indications relatives"""
        risks = []
        contraindications = self.contraindications.get(method, {}).get("relative", [])

        for ci in contraindications:
            condition = ci["condition"]
            threshold = ci["threshold"]
            operator = ci.get("operator", "==")

            value = state.get(condition)
            if value is None:
                continue

            is_contraindicated = self._evaluate_condition(value, operator, threshold)

            if is_contraindicated:
                risks.append(f"{condition}: {ci['reason']}")

        return risks

    def _check_prerequisites(self, method: str, state: Dict[str, Any]) -> List[str]:
        """Vérifie les prérequis"""
        missing = []
        prerequisites = self.prerequisites.get(method, [])

        for prereq in prerequisites:
            condition = prereq["condition"]
            threshold = prereq["threshold"]
            operator = prereq.get("operator", ">")

            value = state.get(condition)
            if value is None:
                missing.append(f"Donnée manquante: {condition}")
                continue

            is_met = self._evaluate_condition(value, operator, threshold)

            if not is_met:
                missing.append(f"Prérequis non rempli: {condition} {operator} {threshold} (actuel: {value:.2f})")

        return missing

    def _evaluate_condition(self, value: Any, operator: str, threshold: Any) -> bool:
        """Évalue une condition avec opérateur"""
        if operator == ">":
            return value > threshold
        elif operator == "<":
            return value < threshold
        elif operator == ">=":
            return value >= threshold
        elif operator == "<=":
            return value <= threshold
        elif operator == "==":
            return value == threshold
        elif operator == "!=":
            return value != threshold
        else:
            return False

    def _get_safety_recommendations(self, risks: List[str]) -> List[str]:
        """Recommandations de sécurité en cas de contre-indication absolue"""
        return [
            "⚠️ Méthode contre-indiquée pour raisons de sécurité clinique",
            "Recommandation: Stabilisation émotionnelle prioritaire",
            "Considérer: Régulation physiologique (respiration, ancrage sensoriel)",
            "Si détresse persistante: Orienter vers professionnel de santé mentale"
        ]

    def _get_caution_recommendations(
        self,
        method: str,
        relative_risks: List[str],
        missing_prerequisites: List[str]
    ) -> List[str]:
        """Recommandations en cas de précautions"""
        recommendations = [
            f"⚠️ Précautions nécessaires pour {method}",
        ]

        if relative_risks:
            recommendations.append("Risques identifiés:")
            recommendations.extend([f"  - {risk}" for risk in relative_risks])

        if missing_prerequisites:
            recommendations.append("Prérequis manquants:")
            recommendations.extend([f"  - {prereq}" for prereq in missing_prerequisites])

        recommendations.append("Recommandation: Préparer le terrain avant d'activer cette méthode")

        return recommendations

    def _get_best_practices(self, method: str) -> List[str]:
        """Bonnes pratiques pour chaque méthode"""
        best_practices = {
            "tipi": [
                "✓ Méthode appropriée",
                "Durée recommandée: 3-5 minutes",
                "Monitoring: Observer signes de dissociation",
                "Débriefing: Valider l'expérience après"
            ],
            "act": [
                "✓ Méthode appropriée",
                "Durée recommandée: 15-20 minutes",
                "Focus: Défusion cognitive progressive",
                "Monitoring: Vérifier compréhension des métaphores"
            ],
            "journaling_expressif": [
                "✓ Méthode appropriée",
                "Protocole Pennebaker: 15-20 minutes",
                "Thème unique: Explorer en profondeur",
                "Débriefing obligatoire: Normaliser détresse temporaire possible"
            ],
            "continuing_bonds": [
                "✓ Approche appropriée",
                "Principe: Accompagner, ne pas diriger",
                "Monitoring: Éviter fixation pathologique",
                "Équilibre: Loss-oriented ↔ Restoration-oriented"
            ]
        }

        return best_practices.get(method, ["✓ Méthode appropriée"])

    def _suggest_alternatives(self, method: str, state: Dict[str, Any]) -> List[str]:
        """Suggère des méthodes alternatives plus appropriées"""
        detresse = state.get("detresse", 50)
        dissociation = state.get("dissociation", 0)
        arousal = state.get("emotional_arousal", 0)

        alternatives = []

        # Si détresse très élevée → régulation physiologique
        if detresse > 80 or arousal > 0.85:
            alternatives.append("coherence_cardiaque")
            alternatives.append("ancrage_sensoriel")

        # Si dissociation → grounding
        if dissociation > 0.6:
            alternatives.append("grounding_5_sens")
            alternatives.append("orientation_spatiale")

        # Si capacités cognitives faibles → approches corporelles
        if state.get("cognitive_resources", 1.0) < 0.4:
            alternatives.append("respiration_guidee")
            alternatives.append("relaxation_progressive")

        # Si alliance faible → renforcement relation
        if state.get("therapeutic_alliance", 1.0) < 0.6:
            alternatives.append("validation_empathique")
            alternatives.append("ecoute_active")

        return alternatives


