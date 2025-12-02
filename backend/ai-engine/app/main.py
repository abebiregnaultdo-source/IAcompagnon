from __future__ import annotations
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Literal, Dict, Any
import os
from dotenv import load_dotenv
from .llm_client import call_llm
from .intervention_engine import execute_intervention
from .intention_engine import run_intention
from .therapeutic_engine import TherapeuticEngine
import json, time
from hashlib import sha256
try:
    from cryptography.fernet import Fernet
except Exception:
    Fernet = None
from .aggregate_memory import aggregate as agg_compute

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env'))

class ChatMessage(BaseModel):
    role: Literal['user','assistant','system']
    content: str

class GenerateRequest(BaseModel):
    messages: List[ChatMessage]
    profile: Dict[str, Any]
    policy: Dict[str, Any]

class FeedbackExplicit(BaseModel):
    user_id_hash: str
    target: Dict[str, Any]  # e.g., { 'intention_id': '...', 'technique': '...', 'tone': '...' }
    thumbs_up: bool

class FeedbackImplicit(BaseModel):
    user_id_hash: str
    target: Dict[str, Any]
    reading_ms: int | None = None
    response_latency_ms: int | None = None

class ScoresPayload(BaseModel):
    user_id_hash: str
    scores: Dict[str, int]

class FeedbackAdd(BaseModel):
    user_id_hash: str
    helped: bool
    phase: str | None = None
    scores: Dict[str, int] | None = None
    intention_id: str | None = None
    technique: str | None = None

class StateUpdate(BaseModel):
    user_id_hash: str
    scores: Dict[str, int]

class PrefsSet(BaseModel):
    user_id_hash: str
    prefs: Dict[str, Any]

app = FastAPI(title='AI Engine')

# Validation des clés API au démarrage
def validate_api_keys():
    """Valide que les clés API sont présentes et affiche des warnings si manquantes"""
    warnings = []
    errors = []
    
    openai_key = os.getenv('OPENAI_API_KEY')
    anthropic_key = os.getenv('ANTHROPIC_API_KEY')
    
    if not openai_key or openai_key.startswith('sk-your-'):
        warnings.append("WARNING: OPENAI_API_KEY non configuree ou invalide")
    else:
        print("OK: OPENAI_API_KEY configuree")

    if not anthropic_key or anthropic_key.startswith('sk-ant-your-'):
        warnings.append("WARNING: ANTHROPIC_API_KEY non configuree ou invalide")
    else:
        print("OK: ANTHROPIC_API_KEY configuree")
    
    if warnings:
        print("\n" + "="*60)
        print("ATTENTION - Configuration API incomplète:")
        for w in warnings:
            print(f"  {w}")
        print("L'application fonctionnera en mode fallback (dummy)")
        print("Consultez ENV_SETUP.md pour configurer les clés API")
        print("="*60 + "\n")
    else:
        print("OK: Toutes les cles API sont configurees\n")

# Valider au démarrage
validate_api_keys()

engine = TherapeuticEngine()

FEEDBACK_PATH = os.path.join(os.path.dirname(__file__), 'feedback_logs.json')
IETG_PATH = os.path.join(os.path.dirname(__file__), 'ietg_state.json')
ENC_KEY = os.getenv('FEEDBACK_ENC_KEY')
fernet = None
if ENC_KEY and Fernet is not None:
    try:
        import base64
        key = sha256(ENC_KEY.encode('utf-8')).digest()
        fernet = Fernet(base64.urlsafe_b64encode(key))
    except Exception:
        fernet = None


def _persist_feedback(entry: dict):
    try:
        os.makedirs(os.path.dirname(FEEDBACK_PATH), exist_ok=True)
        if fernet:
            payload = fernet.encrypt(json.dumps(entry, ensure_ascii=False).encode('utf-8')).decode('utf-8')
        else:
            payload = json.dumps(entry, ensure_ascii=False)
        with open(FEEDBACK_PATH, 'a', encoding='utf-8') as f:
            f.write(payload + "\n")
    except Exception:
        pass


def _load_ietg():
    try:
        with open(IETG_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return { 'last': [] }


def _save_ietg(state: dict):
    try:
        with open(IETG_PATH, 'w', encoding='utf-8') as f:
            json.dump(state, f, ensure_ascii=False, indent=2)
    except Exception:
        pass


def _update_ietg(outcome: int, scores_before: dict, scores_after: dict | None = None):
    b = scores_before or {}
    es = int(b.get('espoir', 50)) - 50
    en = int(b.get('energie', 50)) - 50
    de = 50 - int(b.get('detresse', 50))
    delta = (de + es + en) / 150.0
    score = 0.6*(1 if outcome > 0 else -1) + 0.4*delta
    state = _load_ietg()
    last = state.get('last', [])
    last.append({ 'ts': time.time(), 'score': score })
    state['last'] = last[-20:]
    state['ietg_mean'] = sum(x['score'] for x in state['last'])/len(state['last']) if state['last'] else 0.0
    _save_ietg(state)
    return state

# Simple pluggable provider interface
async def call_provider(messages: List[ChatMessage], profile: Dict[str, Any], policy: Dict[str, Any]) -> str:
    provider = os.getenv('AI_PROVIDER', 'openai')
    if provider == 'openai':
        return await openai_generate(messages, profile, policy)
    return await dummy_generate(messages, profile, policy)

async def dummy_generate(messages: List[ChatMessage], profile: Dict[str, Any], policy: Dict[str, Any]) -> str:
    tone = policy.get('tone', 'neutre')
    phase = policy.get('phase', 'ancrage')
    tone_prompt = {
        'lent': "doucement, sans te forcer",
        'neutre': "simplement, comme c’est",
        'enveloppant': "en te laissant entourer par ce qui te soutient",
    }.get(tone, "simplement")
    scores = policy.get('scores', {}) if isinstance(policy.get('scores'), dict) else {}
    user_state = {
        'user_name': profile.get('first_name', 'ami'),
        'detresse': scores.get('detresse', 50),
        'espoir': scores.get('espoir', 50),
        'energie': scores.get('energie', 50),
        'phase': phase,
        'tone_prompt': tone_prompt,
    }
    # Run new therapeutic pipeline (dual-model abstraction)
    out = engine.run_pipeline(user_state, policy)
    return out.get('text','')

async def openai_generate(messages: List[ChatMessage], profile: Dict[str, Any], policy: Dict[str, Any]) -> str:
    """
    Génère une réponse en utilisant réellement OpenAI.
    Utilise le pipeline thérapeutique qui orchestre OpenAI (knowledge) et Claude (empathy).
    """
    # Le pipeline thérapeutique utilise déjà le LLMRouter qui appelle réellement OpenAI et Claude
    # On utilise donc le même pipeline que dummy_generate mais avec les vraies intégrations
    tone = policy.get('tone', 'neutre')
    phase = policy.get('phase', 'ancrage')
    tone_prompt = {
        'lent': "doucement, sans te forcer",
        'neutre': "simplement, comme c'est",
        'enveloppant': "en te laissant entourer par ce qui te soutient",
    }.get(tone, "simplement")
    scores = policy.get('scores', {}) if isinstance(policy.get('scores'), dict) else {}
    user_state = {
        'user_name': profile.get('first_name', 'ami'),
        'detresse': scores.get('detresse', 50),
        'espoir': scores.get('espoir', 50),
        'energie': scores.get('energie', 50),
        'phase': phase,
        'tone_prompt': tone_prompt,
    }
    # Le engine.run_pipeline utilise maintenant réellement OpenAI et Claude via LLMRouter
    out = engine.run_pipeline(user_state, policy)
    return out.get('text', '')

@app.post('/generate')
async def generate(req: GenerateRequest):
    tone = req.policy.get('tone', 'neutre')
    phase = req.policy.get('phase', 'ancrage')
    tone_prompt = {
        'lent': "doucement, sans te forcer",
        'neutre': "simplement, comme c’est",
        'enveloppant': "en te laissant entourer par ce qui te soutient",
    }.get(tone, "simplement")
    scores = req.policy.get('scores', {}) if isinstance(req.policy.get('scores'), dict) else {}
    user_state = {
        'user_name': req.profile.get('first_name', 'ami'),
        'detresse': scores.get('detresse', 50),
        'espoir': scores.get('espoir', 50),
        'energie': scores.get('energie', 50),
        'phase': phase,
        'tone_prompt': tone_prompt,
        'user_id_hash': req.profile.get('user_id_hash')
    }
    if req.profile.get('user_id_hash'):
        req.policy['user_id_hash'] = req.profile.get('user_id_hash')
    out = engine.run_pipeline(user_state, req.policy)

    # Supervision clinique: alerte 3114 si détresse élevée
    alert_prefix = None
    if int(user_state.get('detresse', 50)) >= 80:
        alert_prefix = "Si tu te sens en danger, tu peux appeler le 3114."
        try:
            base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
            alert_path = os.path.join(base_dir, 'backend', 'ai-engine', 'alert_logs.jsonl')
            with open(alert_path, 'a', encoding='utf-8') as f:
                f.write(json.dumps({
                    'ts': time.time(),
                    'user': req.profile.get('user_id_hash'),
                    'detresse': int(user_state.get('detresse', 50)),
                    'phase': phase,
                    'note': 'detresse>=80'
                }, ensure_ascii=False) + "\n")
        except Exception:
            pass

    text = out.get('text','')
    if alert_prefix:
        text = alert_prefix + "\n\n" + text

    return {
        'text': text,
        'intention_id': out.get('intention_id'),
        'technique': out.get('technique'),
        'source': out.get('source'),
        'prompt_used': out.get('prompt_used'),
        'model_used': out.get('model_used'),
        'emotion_context': out.get('emotion_context'),
    }

@app.post('/detect')
async def detect_therapeutic_method(req: Dict[str, Any]):
    """
    Détecte la méthode thérapeutique appropriée basée sur l'analyse du message utilisateur
    
    Request body:
    {
        "user_message": "...",
        "user_state": {...},
        "conversation_history": [...],
        "therapeutic_context": {...}
    }
    
    Returns:
    {
        "signals": [
            {
                "method": "journaling_expressif",
                "confidence": 0.85,
                "indicators": [...],
                "contraindications": [...],
                "recommended_variation": "journal_guide_recit"
            },
            ...
        ]
    }
    """
    try:
        from .advanced_detection import AdvancedDetectionEngine
        
        user_message = req.get('user_message', '')
        user_state = req.get('user_state', {})
        conversation_history = req.get('conversation_history', [])
        therapeutic_context = req.get('therapeutic_context', {})
        
        # Instancier le moteur de détection avancée
        detector = AdvancedDetectionEngine()
        
        # Déterminer l'historique conversation au bon format
        formatted_history = []
        for entry in conversation_history:
            if isinstance(entry, dict):
                # Si c'est une entrée de journal, on l'utilise comme contexte
                if 'content' in entry:
                    formatted_history.append({
                        'role': 'user',
                        'content': entry['content']
                    })
        
        # Ajouter le message actuel
        if user_message:
            formatted_history.append({
                'role': 'user',
                'content': user_message
            })
        
        # Exécuter la détection avancée
        signals = detector.detect_all_methods(
            user_message=user_message,
            user_state=user_state,
            conversation_history=formatted_history,
            therapeutic_context=therapeutic_context
        )
        
        # Convertir les signaux en dict pour sérialisation JSON
        signals_dict = []
        for signal in signals:
            signals_dict.append({
                'method': signal.method,
                'confidence': signal.confidence,
                'indicators': signal.indicators,
                'contraindications': signal.contraindications,
                'recommended_variation': signal.recommended_variation
            })
        
        return {'signals': signals_dict}
        
    except ImportError:
        # Si AdvancedDetectionEngine pas disponible, retourner un signal par défaut
        return {
            'signals': [{
                'method': 'journaling_expressif',
                'confidence': 0.6,
                'indicators': ['Contenu émotionnel détecté'],
                'contraindications': [],
                'recommended_variation': 'journal_guide_recit'
            }]
        }
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Erreur détection: {e}")
        return {
            'signals': [],
            'error': str(e)
        }

@app.post('/feedback/explicit')
async def feedback_explicit(req: FeedbackExplicit):
    from .personalization import record_explicit_feedback
    prof = record_explicit_feedback(req.user_id_hash, req.target, req.thumbs_up)
    return { 'status': 'ok', 'prefs': prof.get('prefs', {}) }

@app.post('/feedback/implicit')
async def feedback_implicit(req: FeedbackImplicit):
    from .personalization import record_implicit_feedback
    prof = record_implicit_feedback(req.user_id_hash, req.target, req.reading_ms, req.response_latency_ms)
    return { 'status': 'ok', 'prefs': prof.get('prefs', {}) }

@app.post('/scores')
async def scores(req: ScoresPayload):
    from .personalization import record_scores
    prof = record_scores(req.user_id_hash, req.scores)
    return { 'status': 'ok', 'history_len': len(prof.get('history', [])) }

@app.post('/api/feedback/add')
async def feedback_add(req: FeedbackAdd):
    entry = {
        'ts': time.time(),
        'user': req.user_id_hash,
        'helped': 1 if req.helped else -1,
        'phase': req.phase,
        'scores': req.scores or {},
        'intention_id': req.intention_id,
        'technique': req.technique,
    }
    _persist_feedback(entry)
    state = _update_ietg(1 if req.helped else -1, req.scores or {})
    return { 'status': 'ok', 'ietg_mean': state.get('ietg_mean', 0.0) }

@app.post('/api/state/update')
async def state_update(req: StateUpdate):
    return { 'status': 'ok', 'scores': req.scores }

@app.get('/api/prefs')
async def prefs_get(user_id_hash: str):
    from .personalization import get_profile
    prof = get_profile(user_id_hash)
    return { 'status': 'ok', 'prefs': prof.get('prefs', {}) }

@app.post('/api/prefs')
async def prefs_set(req: PrefsSet):
    from .personalization import _load_profiles, _save_profiles
    data = _load_profiles()
    prof = data.setdefault(req.user_id_hash, { 'history': [], 'prefs': {}, 'feedbacks': [] })
    prof['prefs'] = { **(prof.get('prefs') or {}), **(req.prefs or {}) }
    _save_profiles(data)
    return { 'status': 'ok', 'prefs': prof.get('prefs', {}) }

@app.post('/api/learning/aggregate')
async def learning_aggregate():
    res = agg_compute()
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
    out_path = os.path.join(base_dir, 'backend', 'modules', 'grief', 'grief_patterns.json')
    try:
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(res, f, ensure_ascii=False, indent=2)
    except Exception:
        pass
    return { 'status': 'ok', 'written': True }

@app.get('/api/learning/patterns')
async def learning_patterns():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
    out_path = os.path.join(base_dir, 'backend', 'modules', 'grief', 'grief_patterns.json')
    try:
        with open(out_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception:
        data = {}
    return data

# Voice stubs (Lot 7)
@app.post('/api/voice_input')
async def voice_input():
    return { 'status': 'stub', 'message': 'voice input not yet implemented' }

@app.get('/api/voice_output')
async def voice_output():
    return { 'status': 'stub', 'message': 'voice output not yet implemented' }
