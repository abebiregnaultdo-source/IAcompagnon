"""
Échelles Cliniques Validées - PHQ-2, GAD-2, Mini-WAI

État de l'art 2024/2025 pour l'évaluation en santé mentale:
- PHQ-2: Patient Health Questionnaire (dépression) - Kroenke et al.
- GAD-2: Generalized Anxiety Disorder scale - Spitzer et al.
- Mini-WAI: Working Alliance Inventory (alliance thérapeutique)

Ces échelles sont validées scientifiquement et utilisées dans la recherche
sur les chatbots thérapeutiques (Woebot, Wysa, etc.)
"""

from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import json
import os
import time


class SeverityLevel(Enum):
    MINIMAL = "minimal"
    MILD = "mild"
    MODERATE = "moderate"
    SEVERE = "severe"


@dataclass
class ScaleResult:
    """Résultat d'une échelle clinique"""
    scale_name: str
    total_score: int
    max_score: int
    severity: SeverityLevel
    needs_full_assessment: bool
    interpretation: str
    recommendations: List[str]


# === PHQ-2 (Dépression) ===
PHQ2_QUESTIONS = {
    "fr": [
        {
            "id": "phq2_1",
            "text": "Au cours des 2 dernières semaines, as-tu été gêné·e par peu d'intérêt ou de plaisir à faire les choses ?",
            "options": [
                {"value": 0, "label": "Pas du tout"},
                {"value": 1, "label": "Plusieurs jours"},
                {"value": 2, "label": "Plus de la moitié des jours"},
                {"value": 3, "label": "Presque tous les jours"}
            ]
        },
        {
            "id": "phq2_2",
            "text": "Au cours des 2 dernières semaines, as-tu été gêné·e par le sentiment d'être triste, déprimé·e ou désespéré·e ?",
            "options": [
                {"value": 0, "label": "Pas du tout"},
                {"value": 1, "label": "Plusieurs jours"},
                {"value": 2, "label": "Plus de la moitié des jours"},
                {"value": 3, "label": "Presque tous les jours"}
            ]
        }
    ]
}


def score_phq2(responses: Dict[str, int]) -> ScaleResult:
    """
    Score le PHQ-2 (0-6 points).

    Seuil clinique: >= 3 suggère dépression possible, administrer PHQ-9 complet.

    Args:
        responses: {"phq2_1": 0-3, "phq2_2": 0-3}

    Returns:
        ScaleResult avec interprétation
    """
    total = responses.get("phq2_1", 0) + responses.get("phq2_2", 0)

    if total >= 5:
        severity = SeverityLevel.SEVERE
        needs_full = True
        interpretation = "Score élevé suggérant des symptômes dépressifs significatifs."
        recommendations = [
            "Évaluation approfondie recommandée (PHQ-9)",
            "Surveillance renforcée",
            "Considérer orientation professionnelle"
        ]
    elif total >= 3:
        severity = SeverityLevel.MODERATE
        needs_full = True
        interpretation = "Score modéré suggérant une possible dépression."
        recommendations = [
            "Évaluation approfondie suggérée",
            "Continuer l'accompagnement avec attention particulière"
        ]
    elif total >= 1:
        severity = SeverityLevel.MILD
        needs_full = False
        interpretation = "Quelques symptômes présents, niveau sous-clinique."
        recommendations = [
            "Continuer le suivi régulier",
            "Réévaluer dans 2 semaines"
        ]
    else:
        severity = SeverityLevel.MINIMAL
        needs_full = False
        interpretation = "Pas de symptômes dépressifs significatifs."
        recommendations = ["Maintenir le suivi de routine"]

    return ScaleResult(
        scale_name="PHQ-2",
        total_score=total,
        max_score=6,
        severity=severity,
        needs_full_assessment=needs_full,
        interpretation=interpretation,
        recommendations=recommendations
    )


# === GAD-2 (Anxiété) ===
GAD2_QUESTIONS = {
    "fr": [
        {
            "id": "gad2_1",
            "text": "Au cours des 2 dernières semaines, as-tu été gêné·e par le sentiment de nervosité, d'anxiété ou de tension ?",
            "options": [
                {"value": 0, "label": "Pas du tout"},
                {"value": 1, "label": "Plusieurs jours"},
                {"value": 2, "label": "Plus de la moitié des jours"},
                {"value": 3, "label": "Presque tous les jours"}
            ]
        },
        {
            "id": "gad2_2",
            "text": "Au cours des 2 dernières semaines, as-tu été gêné·e par une incapacité à arrêter ou à contrôler les inquiétudes ?",
            "options": [
                {"value": 0, "label": "Pas du tout"},
                {"value": 1, "label": "Plusieurs jours"},
                {"value": 2, "label": "Plus de la moitié des jours"},
                {"value": 3, "label": "Presque tous les jours"}
            ]
        }
    ]
}


def score_gad2(responses: Dict[str, int]) -> ScaleResult:
    """
    Score le GAD-2 (0-6 points).

    Seuil clinique: >= 3 suggère anxiété possible, administrer GAD-7 complet.

    Args:
        responses: {"gad2_1": 0-3, "gad2_2": 0-3}

    Returns:
        ScaleResult avec interprétation
    """
    total = responses.get("gad2_1", 0) + responses.get("gad2_2", 0)

    if total >= 5:
        severity = SeverityLevel.SEVERE
        needs_full = True
        interpretation = "Score élevé suggérant des symptômes anxieux significatifs."
        recommendations = [
            "Évaluation approfondie recommandée (GAD-7)",
            "Techniques de régulation prioritaires",
            "Considérer orientation professionnelle"
        ]
    elif total >= 3:
        severity = SeverityLevel.MODERATE
        needs_full = True
        interpretation = "Score modéré suggérant une possible anxiété généralisée."
        recommendations = [
            "Évaluation approfondie suggérée",
            "Protocoles d'ancrage et de respiration recommandés"
        ]
    elif total >= 1:
        severity = SeverityLevel.MILD
        needs_full = False
        interpretation = "Quelques symptômes anxieux, niveau sous-clinique."
        recommendations = [
            "Techniques de gestion du stress",
            "Réévaluer dans 2 semaines"
        ]
    else:
        severity = SeverityLevel.MINIMAL
        needs_full = False
        interpretation = "Pas de symptômes anxieux significatifs."
        recommendations = ["Maintenir le suivi de routine"]

    return ScaleResult(
        scale_name="GAD-2",
        total_score=total,
        max_score=6,
        severity=severity,
        needs_full_assessment=needs_full,
        interpretation=interpretation,
        recommendations=recommendations
    )


# === Mini-WAI (Alliance Thérapeutique) ===
MINI_WAI_QUESTIONS = {
    "fr": [
        {
            "id": "wai_1",
            "text": "Je me sens compris·e dans cet accompagnement.",
            "dimension": "bond",
            "options": [
                {"value": 1, "label": "Pas du tout"},
                {"value": 2, "label": "Un peu"},
                {"value": 3, "label": "Modérément"},
                {"value": 4, "label": "Beaucoup"},
                {"value": 5, "label": "Tout à fait"}
            ]
        },
        {
            "id": "wai_2",
            "text": "Les exercices proposés me semblent utiles.",
            "dimension": "task",
            "options": [
                {"value": 1, "label": "Pas du tout"},
                {"value": 2, "label": "Un peu"},
                {"value": 3, "label": "Modérément"},
                {"value": 4, "label": "Beaucoup"},
                {"value": 5, "label": "Tout à fait"}
            ]
        },
        {
            "id": "wai_3",
            "text": "Je sens que nous travaillons vers des objectifs qui me correspondent.",
            "dimension": "goal",
            "options": [
                {"value": 1, "label": "Pas du tout"},
                {"value": 2, "label": "Un peu"},
                {"value": 3, "label": "Modérément"},
                {"value": 4, "label": "Beaucoup"},
                {"value": 5, "label": "Tout à fait"}
            ]
        },
        {
            "id": "wai_4",
            "text": "Je fais confiance à cet accompagnement.",
            "dimension": "bond",
            "options": [
                {"value": 1, "label": "Pas du tout"},
                {"value": 2, "label": "Un peu"},
                {"value": 3, "label": "Modérément"},
                {"value": 4, "label": "Beaucoup"},
                {"value": 5, "label": "Tout à fait"}
            ]
        }
    ]
}


@dataclass
class AllianceResult:
    """Résultat de l'évaluation de l'alliance thérapeutique"""
    total_score: int
    max_score: int
    bond_score: int  # Lien émotionnel
    task_score: int  # Accord sur les tâches
    goal_score: int  # Accord sur les objectifs
    alliance_level: str  # "faible", "modérée", "bonne", "excellente"
    recommendations: List[str]


def score_mini_wai(responses: Dict[str, int]) -> AllianceResult:
    """
    Score le Mini-WAI (4-20 points).

    L'alliance thérapeutique prédit 7% de la variance des outcomes.

    Args:
        responses: {"wai_1": 1-5, "wai_2": 1-5, "wai_3": 1-5, "wai_4": 1-5}

    Returns:
        AllianceResult avec sous-scores et recommandations
    """
    # Calculer les sous-scores par dimension
    bond_score = responses.get("wai_1", 3) + responses.get("wai_4", 3)
    task_score = responses.get("wai_2", 3)
    goal_score = responses.get("wai_3", 3)

    total = bond_score + task_score + goal_score

    if total >= 17:
        alliance_level = "excellente"
        recommendations = ["Maintenir l'approche actuelle", "Alliance forte, explorer des techniques plus avancées"]
    elif total >= 14:
        alliance_level = "bonne"
        recommendations = ["Continuer à construire la confiance", "L'alliance est solide"]
    elif total >= 10:
        alliance_level = "modérée"
        recommendations = [
            "Renforcer le lien émotionnel",
            "Vérifier l'adéquation des exercices proposés",
            "Clarifier les objectifs ensemble"
        ]
    else:
        alliance_level = "faible"
        recommendations = [
            "Prioriser la construction du lien",
            "Adapter l'approche aux besoins exprimés",
            "Réduire l'intensité des exercices",
            "Augmenter la validation émotionnelle"
        ]

    return AllianceResult(
        total_score=total,
        max_score=20,
        bond_score=bond_score,
        task_score=task_score,
        goal_score=goal_score,
        alliance_level=alliance_level,
        recommendations=recommendations
    )


# === Fonction utilitaire pour l'onboarding ===
def get_baseline_assessment_questions(lang: str = "fr") -> Dict:
    """
    Retourne les questions PHQ-2 + GAD-2 pour l'évaluation initiale.

    À utiliser dans l'onboarding après les questions démographiques.
    """
    return {
        "phq2": PHQ2_QUESTIONS.get(lang, PHQ2_QUESTIONS["fr"]),
        "gad2": GAD2_QUESTIONS.get(lang, GAD2_QUESTIONS["fr"]),
        "instructions": {
            "fr": "Ces questions nous aident à mieux comprendre comment tu te sens. Réponds honnêtement, il n'y a pas de bonne ou mauvaise réponse."
        }
    }


def get_alliance_questions(lang: str = "fr") -> Dict:
    """
    Retourne les questions Mini-WAI pour l'évaluation de l'alliance.

    À administrer après la 3ème session, puis mensuellement.
    """
    return {
        "mini_wai": MINI_WAI_QUESTIONS.get(lang, MINI_WAI_QUESTIONS["fr"]),
        "instructions": {
            "fr": "Comment te sens-tu par rapport à notre accompagnement jusqu'ici ?"
        }
    }


def compute_baseline_score(phq2_responses: Dict[str, int], gad2_responses: Dict[str, int]) -> Dict:
    """
    Calcule le score baseline combiné PHQ-2 + GAD-2.

    Retourne un résumé pour stockage dans le profil utilisateur.
    """
    phq2_result = score_phq2(phq2_responses)
    gad2_result = score_gad2(gad2_responses)

    # Déterminer le niveau global
    combined_severity = max(
        phq2_result.severity.value,
        gad2_result.severity.value,
        key=lambda x: ["minimal", "mild", "moderate", "severe"].index(x)
    )

    return {
        "timestamp": time.time(),
        "phq2": {
            "score": phq2_result.total_score,
            "severity": phq2_result.severity.value,
            "needs_full": phq2_result.needs_full_assessment
        },
        "gad2": {
            "score": gad2_result.total_score,
            "severity": gad2_result.severity.value,
            "needs_full": gad2_result.needs_full_assessment
        },
        "combined_severity": combined_severity,
        "recommendations": list(set(phq2_result.recommendations + gad2_result.recommendations)),
        "suggested_phase": _determine_initial_phase(phq2_result, gad2_result)
    }


def _determine_initial_phase(phq2: ScaleResult, gad2: ScaleResult) -> str:
    """Détermine la phase thérapeutique initiale basée sur les scores."""
    # Si anxiété ou dépression sévère → ancrage
    if phq2.severity in [SeverityLevel.SEVERE, SeverityLevel.MODERATE] or \
       gad2.severity in [SeverityLevel.SEVERE, SeverityLevel.MODERATE]:
        return "ancrage"

    # Si symptômes légers → exploration
    if phq2.severity == SeverityLevel.MILD or gad2.severity == SeverityLevel.MILD:
        return "exploration"

    # Sinon → sens
    return "sens"


# Export
__all__ = [
    "PHQ2_QUESTIONS",
    "GAD2_QUESTIONS",
    "MINI_WAI_QUESTIONS",
    "score_phq2",
    "score_gad2",
    "score_mini_wai",
    "get_baseline_assessment_questions",
    "get_alliance_questions",
    "compute_baseline_score",
    "ScaleResult",
    "AllianceResult",
    "SeverityLevel"
]
