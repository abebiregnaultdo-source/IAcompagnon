from __future__ import annotations
from fastapi import FastAPI, Header
from pydantic import BaseModel
from typing import Dict, Optional
import re
import logging
import os

# Import du moteur EmotionBERT avancé
try:
    from .advanced_emotion import get_emotion_engine, ADVANCED_EMOTION_AVAILABLE
    EMOTIONBERT_ENABLED = ADVANCED_EMOTION_AVAILABLE
except ImportError:
    EMOTIONBERT_ENABLED = False
    logging.warning("EmotionBERT not available, using heuristic only")

# Configuration A/B testing
USE_EMOTIONBERT_BY_DEFAULT = os.getenv('USE_EMOTIONBERT', 'false').lower() == 'true'

logging.basicConfig(level=logging.INFO)

class ScoreRequest(BaseModel):
    text: str

class ScoreResponse(BaseModel):
    detresse: int
    espoir: int
    energie: int
    confidence: float = 0.5
    phase: str | None = None

app = FastAPI(title='Emotions Service')

# MVP heuristic (replace with HF EmotionBERT later)
NEG_WORDS = set(['triste','vide','peur','angoisse','colère','fatigue','épuisé','manque','douleur','pleure','seul','seule'])
POS_WORDS = set(['espoir','calme','apaisé','soulagé','merci','reconnaissant','force','envie','motivé','lumière'])


def detect_phase(detresse: int, espoir: int, energie: int) -> str:
    # Revised per specification
    if detresse > 70:
        return 'ancrage'
    elif 50 < detresse <= 70:
        return 'expression'
    elif detresse <= 60 and espoir >= 40:
        return 'sens'
    elif espoir > 60 and energie >= 50:
        return 'reconstruction'
    return 'ancrage'

@app.post('/score', response_model=ScoreResponse)
async def score(
    req: ScoreRequest,
    x_use_advanced: Optional[str] = Header(None)
):
    """
    Endpoint principal d'analyse émotionnelle

    Supporte A/B testing via header X-Use-Advanced: true/false
    Par défaut, utilise l'heuristique legacy (compatibilité)
    """
    use_advanced = (x_use_advanced == 'true') if x_use_advanced else USE_EMOTIONBERT_BY_DEFAULT

    if use_advanced and EMOTIONBERT_ENABLED:
        # Utiliser EmotionBERT avancé
        return await score_advanced_internal(req)
    else:
        # Utiliser heuristique legacy
        return score_heuristic(req)


def score_heuristic(req: ScoreRequest) -> Dict:
    """Analyse heuristique legacy (MVP)"""
    text = req.text.lower()
    neg = sum(1 for w in NEG_WORDS if re.search(r'\b'+re.escape(w)+r'\b', text))
    pos = sum(1 for w in POS_WORDS if re.search(r'\b'+re.escape(w)+r'\b', text))
    detresse = min(100, 30 + neg*15 - pos*5)
    espoir = max(0, 50 + pos*15 - neg*10)
    energie = max(0, min(100, 50 + pos*10 - neg*10))
    # phase detection per new spec
    phase = detect_phase(int(detresse), int(espoir), int(energie))
    return {'detresse': int(detresse), 'espoir': int(espoir), 'energie': int(energie), 'confidence': 0.5, 'phase': phase}


@app.post('/score_advanced', response_model=ScoreResponse)
async def score_advanced(req: ScoreRequest):
    """
    Endpoint EmotionBERT avancé (explicite)

    Utilise toujours l'analyse neuroscience-inspirée si disponible
    Fallback vers heuristique si EmotionBERT non disponible
    """
    return await score_advanced_internal(req)


async def score_advanced_internal(req: ScoreRequest) -> Dict:
    """Implémentation interne de l'analyse avancée"""
    if not EMOTIONBERT_ENABLED:
        logging.warning("EmotionBERT requested but not available, falling back to heuristic")
        return score_heuristic(req)

    try:
        # Obtenir le moteur d'émotion
        engine = get_emotion_engine(use_gpu=False)

        # Analyser le message
        emotional_state = engine.analyze(req.text, metadata=None)

        # Convertir vers format legacy
        scores = emotional_state.to_legacy_scores()

        # Logger pour comparaison A/B
        logging.info(f"EmotionBERT scores: {scores}")

        return scores

    except Exception as e:
        logging.error(f"Error in advanced emotion analysis: {e}")
        return score_heuristic(req)


@app.get('/health')
async def health():
    """Health check endpoint"""
    return {
        'status': 'healthy',
        'emotionbert_available': EMOTIONBERT_ENABLED,
        'default_mode': 'advanced' if USE_EMOTIONBERT_BY_DEFAULT else 'heuristic'
    }
