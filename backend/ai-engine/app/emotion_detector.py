"""
Détection Émotionnelle avec DistilBERT - État de l'art 2024/2025

Architecture basée sur la recherche:
- DistilBERT fine-tuné sur émotions (93.8% accuracy)
- 6 émotions: joy, sadness, love, anger, fear, surprise
- 60% plus rapide que BERT tout en conservant 97% des capacités

Références:
- bhadresh-savani/distilbert-base-uncased-emotion
- nBERT: Harnessing NLP for Emotion Recognition in Psychotherapy (2024)
- Emotion AWARE Framework (MDPI 2024)
"""

import logging
import os
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass

logger = logging.getLogger(__name__)

# Lazy loading pour éviter les imports lourds au démarrage
_emotion_model = None
_emotion_tokenizer = None
_emotion_pipeline = None


@dataclass
class EmotionResult:
    """Résultat de l'analyse émotionnelle"""
    primary_emotion: str
    confidence: float
    all_emotions: Dict[str, float]
    valence: float  # -1 (négatif) à +1 (positif)
    arousal: float  # 0 (calme) à 1 (activé)
    therapeutic_indicators: Dict[str, float]


# Mapping émotions vers indicateurs thérapeutiques
EMOTION_THERAPEUTIC_MAP = {
    "sadness": {
        "valence": -0.8,
        "arousal": 0.3,
        "phase_suggested": "expression",
        "techniques": ["validation_emotionnelle", "journaling_expressif", "continuing_bonds"]
    },
    "fear": {
        "valence": -0.7,
        "arousal": 0.8,
        "phase_suggested": "ancrage",
        "techniques": ["grounding_5_sens", "coherence_cardiaque", "TIPI"]
    },
    "anger": {
        "valence": -0.6,
        "arousal": 0.9,
        "phase_suggested": "ancrage",
        "techniques": ["coherence_cardiaque", "grounding_5_sens", "defusion_ACT"]
    },
    "joy": {
        "valence": 0.9,
        "arousal": 0.7,
        "phase_suggested": "reconstruction",
        "techniques": ["continuing_bonds", "meaning_reconstruction", "ressource_activation"]
    },
    "love": {
        "valence": 0.8,
        "arousal": 0.5,
        "phase_suggested": "sens",
        "techniques": ["continuing_bonds", "meaning_reconstruction"]
    },
    "surprise": {
        "valence": 0.0,  # Neutre
        "arousal": 0.6,
        "phase_suggested": "exploration",
        "techniques": ["exploration_douce", "validation_emotionnelle"]
    }
}

# Mots-clés de crise (français)
CRISIS_KEYWORDS = {
    "suicide_ideation": [
        "mourir", "en finir", "plus là", "disparaître", "me tuer",
        "suicide", "plus vivre", "fin à tout", "quitter ce monde"
    ],
    "self_harm": [
        "me faire mal", "me blesser", "me couper", "me frapper",
        "automutilation", "scarification"
    ],
    "hopelessness": [
        "plus d'espoir", "inutile", "à quoi bon", "sans issue",
        "aucune solution", "jamais mieux", "plus la force"
    ],
    "severe_distress": [
        "ne supporte plus", "trop dur", "je craque", "je peux plus",
        "c'est insupportable", "je vais exploser"
    ]
}

# Indicateurs de contexte de deuil (grief context)
GRIEF_CONTEXT_INDICATORS = [
    "décédé", "décédée", "mort", "décès", "deuil",
    "parti", "partie", "perdu", "perdue",
    "manque", "n'est plus", "n'est plus là",
    "absence", "disparition", "emporté", "emportée",
    "tombeau", "funérailles", "enterrement", "crémation"
]

# Expressions de deuil normal (à NE PAS déclencher de crise)
GRIEF_NORMAL_EXPRESSIONS = [
    "j'oublie qu'il n'est plus là", "j'oublie qu'elle n'est plus là",
    "j'oublie qu'il/elle n'est plus là",
    "ça me revient d'un coup",
    "ça me tombe dessus",
    "je n'arrive pas à réaliser",
    "c'est irréel",
    "le sol se dérobe",
    "l'irréalité",
    "c'est pas vrai",
    "impossible",
    "je n'y crois pas"
]


def get_emotion_pipeline():
    """Lazy load le pipeline DistilBERT-emotion"""
    global _emotion_pipeline

    if _emotion_pipeline is not None:
        return _emotion_pipeline

    try:
        from transformers import pipeline

        # Utiliser le modèle DistilBERT fine-tuné sur les émotions
        model_name = os.getenv("EMOTION_MODEL", "bhadresh-savani/distilbert-base-uncased-emotion")

        _emotion_pipeline = pipeline(
            "text-classification",
            model=model_name,
            top_k=None,  # Retourner toutes les émotions avec leurs scores
            device=-1  # CPU (utiliser 0 pour GPU si disponible)
        )

        logger.info(f"DistilBERT-emotion pipeline loaded: {model_name}")
        return _emotion_pipeline

    except ImportError:
        logger.warning("transformers not installed, using fallback emotion detection")
        return None
    except Exception as e:
        logger.error(f"Error loading emotion model: {e}")
        return None


def detect_emotion(text: str, use_fallback: bool = True) -> EmotionResult:
    """
    Détecte les émotions dans un texte avec DistilBERT.

    Args:
        text: Texte à analyser
        use_fallback: Utiliser NRCLex si DistilBERT indisponible

    Returns:
        EmotionResult avec émotion primaire, scores, et indicateurs thérapeutiques
    """
    pipeline = get_emotion_pipeline()

    if pipeline is not None:
        return _detect_with_distilbert(text, pipeline)
    elif use_fallback:
        return _detect_with_nrclex(text)
    else:
        return _default_emotion_result()


def _detect_with_distilbert(text: str, pipeline) -> EmotionResult:
    """Détection avec DistilBERT-emotion"""
    try:
        # Limiter la longueur pour le modèle
        text_truncated = text[:512]

        # Obtenir les scores pour toutes les émotions
        results = pipeline(text_truncated)

        # Convertir en dictionnaire
        all_emotions = {}
        for item in results[0]:
            emotion = item['label'].lower()
            score = item['score']
            all_emotions[emotion] = score

        # Trouver l'émotion dominante
        primary_emotion = max(all_emotions, key=all_emotions.get)
        confidence = all_emotions[primary_emotion]

        # Obtenir les indicateurs thérapeutiques
        therapeutic_info = EMOTION_THERAPEUTIC_MAP.get(primary_emotion, {
            "valence": 0.0,
            "arousal": 0.5,
            "phase_suggested": "exploration",
            "techniques": ["validation_emotionnelle"]
        })

        # Calculer valence et arousal pondérés
        valence = 0.0
        arousal = 0.0
        for emotion, score in all_emotions.items():
            if emotion in EMOTION_THERAPEUTIC_MAP:
                valence += EMOTION_THERAPEUTIC_MAP[emotion]["valence"] * score
                arousal += EMOTION_THERAPEUTIC_MAP[emotion]["arousal"] * score

        return EmotionResult(
            primary_emotion=primary_emotion,
            confidence=confidence,
            all_emotions=all_emotions,
            valence=valence,
            arousal=arousal,
            therapeutic_indicators={
                "phase_suggested": therapeutic_info["phase_suggested"],
                "recommended_techniques": therapeutic_info["techniques"],
                "emotional_intensity": arousal
            }
        )

    except Exception as e:
        logger.error(f"DistilBERT emotion detection error: {e}")
        return _detect_with_nrclex(text)


def _detect_with_nrclex(text: str) -> EmotionResult:
    """Fallback avec NRCLex (lexical)"""
    try:
        from nrclex import NRCLex

        emotion = NRCLex(text)
        frequencies = emotion.affect_frequencies

        # Mapper NRCLex vers notre format
        emotion_mapping = {
            "fear": frequencies.get("fear", 0.0),
            "anger": frequencies.get("anger", 0.0),
            "sadness": frequencies.get("sadness", 0.0),
            "joy": frequencies.get("joy", 0.0),
            "surprise": frequencies.get("surprise", 0.0),
            "love": frequencies.get("trust", 0.0) * 0.5 + frequencies.get("positive", 0.0) * 0.5
        }

        # Normaliser
        total = sum(emotion_mapping.values())
        if total > 0:
            emotion_mapping = {k: v/total for k, v in emotion_mapping.items()}
        else:
            emotion_mapping = {"sadness": 0.3, "fear": 0.2, "anger": 0.1, "joy": 0.2, "love": 0.1, "surprise": 0.1}

        primary_emotion = max(emotion_mapping, key=emotion_mapping.get)
        confidence = emotion_mapping[primary_emotion]

        therapeutic_info = EMOTION_THERAPEUTIC_MAP.get(primary_emotion, {
            "valence": 0.0, "arousal": 0.5, "phase_suggested": "exploration", "techniques": []
        })

        return EmotionResult(
            primary_emotion=primary_emotion,
            confidence=confidence,
            all_emotions=emotion_mapping,
            valence=therapeutic_info["valence"],
            arousal=therapeutic_info["arousal"],
            therapeutic_indicators={
                "phase_suggested": therapeutic_info["phase_suggested"],
                "recommended_techniques": therapeutic_info["techniques"],
                "emotional_intensity": therapeutic_info["arousal"],
                "source": "nrclex_fallback"
            }
        )

    except ImportError:
        logger.warning("NRCLex not available, using default")
        return _default_emotion_result()
    except Exception as e:
        logger.error(f"NRCLex error: {e}")
        return _default_emotion_result()


def _default_emotion_result() -> EmotionResult:
    """Résultat par défaut si aucune détection possible"""
    return EmotionResult(
        primary_emotion="sadness",
        confidence=0.5,
        all_emotions={"sadness": 0.5, "fear": 0.2, "anger": 0.1, "joy": 0.1, "love": 0.05, "surprise": 0.05},
        valence=-0.3,
        arousal=0.4,
        therapeutic_indicators={
            "phase_suggested": "exploration",
            "recommended_techniques": ["validation_emotionnelle"],
            "emotional_intensity": 0.4,
            "source": "default_fallback"
        }
    )


def _is_panic_attack_context(text_lower: str) -> bool:
    """
    Détecte si le contexte est une description de crise de panique/anxiété
    plutôt qu'une idéation suicidaire réelle.

    Exemples de faux positifs à filtrer :
    - "j'ai l'impression que je vais mourir" + symptômes physiques
    - "mon cœur s'emballe, j'ai du mal à respirer, je vais mourir"
    """
    panic_indicators = [
        "crise d'angoisse", "crise de panique", "panique",
        "cœur s'emballe", "coeur s'emballe", "cœur qui bat",
        "mal à respirer", "du mal à respirer", "souffle coupé",
        "j'étouffe", "je suffoque", "transpire", "je tremble",
        "impression que", "l'impression que", "sensation de",
        "vertige", "nausée", "oppression", "thorax",
        "attaque de panique", "anxiété", "angoisse",
        "peur de mourir",  # Symptôme classique de la crise de panique
    ]
    return sum(1 for indicator in panic_indicators if indicator in text_lower) >= 2


def _is_existential_grief_context(text_lower: str) -> bool:
    """
    Détecte si 'à quoi bon' ou 'mourir' est dans un contexte de deuil/désespoir
    existentiel qui mérite au minimum un medium-level check.
    """
    grief_despair_indicators = [
        "à quoi bon continuer", "plus de sens", "plus aucun sens",
        "envie de le rejoindre", "la rejoindre", "les rejoindre",
        "plus la force de vivre", "plus envie de vivre",
        "pourquoi continuer", "je veux partir",
    ]
    return any(indicator in text_lower for indicator in grief_despair_indicators)


def _is_normal_grief_expression(text_lower: str) -> bool:
    """
    Détecte si le texte contient une expression de deuil NORMAL
    (expériences courantes de deuil qui ne sont pas des indicateurs de crise).

    Exemples:
    - "j'oublie qu'il n'est plus là" (temporary forgetting)
    - "ça me revient d'un coup" (sudden realization)
    - "je n'arrive pas à réaliser" (disbelief)
    - "c'est irréel" (unreality of loss)
    """
    return any(expr in text_lower for expr in GRIEF_NORMAL_EXPRESSIONS)


def _has_grief_context(text_lower: str) -> bool:
    """
    Détecte si le texte contient un contexte de deuil.
    Compte le nombre d'indicateurs de deuil présents.

    Returns True si au moins un indicateur de deuil est détecté.
    """
    grief_count = sum(1 for indicator in GRIEF_CONTEXT_INDICATORS if indicator in text_lower)
    return grief_count > 0


def _reduce_crisis_score_for_grief(
    detected_patterns: List[str],
    text_lower: str,
    crisis_level: str
) -> Tuple[List[str], str]:
    """
    Réduit le score de crise si les patterns apparaissent dans un contexte de deuil.

    Logique:
    1. Si expression de deuil normal détectée → retourner "none"
    2. Si contexte de deuil + patterns de suicide_ideation → rétrograder le niveau
    3. Sinon → garder le niveau original

    Returns: (updated_patterns, updated_crisis_level)
    """
    # Vérifier si c'est une expression normale de deuil
    if _is_normal_grief_expression(text_lower):
        return detected_patterns + ["context: normal_grief_expression"], "none"

    # Vérifier si y a un contexte de deuil
    has_grief = _has_grief_context(text_lower)

    if not has_grief:
        return detected_patterns, crisis_level

    # Si deuil + patterns de suicide_ideation
    has_suicide = any("suicide_ideation" in p for p in detected_patterns)

    if has_suicide and has_grief:
        # Rétrograder "critical" → "medium" ou "medium" → "low"
        if crisis_level == "critical":
            return (
                detected_patterns + ["context: grief_context_downgrade"],
                "medium"
            )
        elif crisis_level == "medium":
            return (
                detected_patterns + ["context: grief_context_downgrade"],
                "low"
            )

    return detected_patterns, crisis_level


def detect_crisis(text: str) -> Dict[str, any]:
    """
    Détecte les indicateurs de crise dans le message.
    Inclut une analyse contextuelle pour réduire les faux positifs
    (ex: symptômes de panique vs. idéation suicidaire réelle, deuil normal vs. crise).

    Returns:
        {
            "is_crisis": bool,
            "crisis_level": "none" | "low" | "medium" | "high" | "critical",
            "detected_patterns": List[str],
            "recommended_action": str
        }
    """
    text_lower = text.lower()
    detected_patterns = []

    # Vérifier chaque catégorie de crise
    for category, keywords in CRISIS_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text_lower:
                detected_patterns.append(f"{category}: {keyword}")

    # Déterminer le niveau de crise
    if not detected_patterns:
        return {
            "is_crisis": False,
            "crisis_level": "none",
            "detected_patterns": [],
            "recommended_action": "continue_normal"
        }

    # === FILTRAGE CONTEXTUEL DEUIL ===
    # Vérifier si c'est une expression normale de deuil (faux positif courant)
    detected_patterns, crisis_level = _reduce_crisis_score_for_grief(
        detected_patterns, text_lower, "critical"
    )

    if crisis_level == "none":
        return {
            "is_crisis": False,
            "crisis_level": "none",
            "detected_patterns": detected_patterns,
            "recommended_action": "continue_normal"
        }

    # === FILTRAGE CONTEXTUEL PANIQUE ===
    # Si les mots-clés de suicide_ideation apparaissent dans un contexte
    # de crise de panique (symptômes physiques), ne PAS déclencher le safety check
    has_suicide = any("suicide_ideation" in p for p in detected_patterns)
    is_panic = _is_panic_attack_context(text_lower)

    if has_suicide and is_panic:
        # Contexte de panique : "j'ai l'impression que je vais mourir" + symptômes
        # → Rétrograder de "critical" à "low" (monitorer sans alarme)
        only_suicide_patterns = [p for p in detected_patterns if "suicide_ideation" in p]
        other_patterns = [p for p in detected_patterns if "suicide_ideation" not in p]

        # S'il y a UNIQUEMENT des patterns suicide_ideation et que c'est un contexte panique
        if not other_patterns or all("severe_distress" in p for p in other_patterns):
            return {
                "is_crisis": True,
                "crisis_level": "low",
                "detected_patterns": detected_patterns + ["context: panic_attack_symptoms"],
                "recommended_action": "stabilization"
            }

    # Vérifier le désespoir existentiel dans le deuil (qui mérite attention)
    has_hopelessness = any("hopelessness" in p for p in detected_patterns)
    if has_hopelessness and _is_existential_grief_context(text_lower):
        # Monter le niveau à "medium" pour une attention accrue
        return {
            "is_crisis": True,
            "crisis_level": "medium",
            "detected_patterns": detected_patterns + ["context: existential_grief"],
            "recommended_action": "enhanced_support"
        }

    # Prioriser par gravité (logique originale)
    has_self_harm = any("self_harm" in p for p in detected_patterns)
    has_severe = any("severe_distress" in p for p in detected_patterns)

    if has_suicide:
        return {
            "is_crisis": True,
            "crisis_level": "critical",
            "detected_patterns": detected_patterns,
            "recommended_action": "immediate_safety_check"
        }
    elif has_self_harm:
        return {
            "is_crisis": True,
            "crisis_level": "high",
            "detected_patterns": detected_patterns,
            "recommended_action": "safety_assessment"
        }
    elif has_hopelessness:
        return {
            "is_crisis": True,
            "crisis_level": "medium",
            "detected_patterns": detected_patterns,
            "recommended_action": "enhanced_support"
        }
    elif has_severe:
        return {
            "is_crisis": True,
            "crisis_level": "low",
            "detected_patterns": detected_patterns,
            "recommended_action": "stabilization"
        }

    return {
        "is_crisis": True,
        "crisis_level": "low",
        "detected_patterns": detected_patterns,
        "recommended_action": "monitor_closely"
    }


def get_crisis_response(crisis_level: str, user_name: str = "") -> str:
    """
    Génère une réponse de crise appropriée au niveau détecté.

    IMPORTANT: Ces réponses sont des interventions de sécurité, pas des conseils médicaux.
    """
    responses = {
        "critical": f"""Je t'entends, {user_name}. Ce que tu décris me préoccupe beaucoup.

Ta sécurité est la priorité absolue en ce moment.

Es-tu en sécurité là où tu es maintenant ?

Si tu as des pensées de te faire du mal, je t'encourage vraiment à appeler le 3114 (numéro national de prévention du suicide, gratuit, 24h/24). Quelqu'un peut t'écouter maintenant.""",

        "high": f"""Je t'entends, {user_name}. Ce que tu traverses semble vraiment difficile.

Avant de continuer, j'aimerais m'assurer que tu es en sécurité.

Comment te sens-tu en ce moment, physiquement ? Es-tu dans un endroit où tu te sens en sécurité ?

Le 3114 est disponible 24h/24 si tu ressens le besoin de parler à quelqu'un.""",

        "medium": f"""Merci de partager ça avec moi, {user_name}. Je sens que c'est un moment difficile.

Ce que tu ressens est important. Tu n'es pas seul·e.

Qu'est-ce qui pourrait t'aider à te sentir un peu plus ancré·e en ce moment ?""",

        "low": f"""Je t'entends, {user_name}. Ce que tu décris semble intense.

Prenons un moment ensemble. Comment te sens-tu physiquement là, maintenant ?"""
    }

    return responses.get(crisis_level, responses["low"])


# Export pour utilisation dans le pipeline
__all__ = [
    "EmotionResult",
    "detect_emotion",
    "detect_crisis",
    "get_crisis_response",
    "EMOTION_THERAPEUTIC_MAP"
]
