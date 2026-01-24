from __future__ import annotations
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

class AnalyticsEvent(BaseModel):
    user_id_hash: str
    event_type: str  # session_start, session_end, message_exchange, fallback_used
    session_duration_ms: int | None = None
    message_count: int | None = None
    timestamp: str | None = None
    technique: str | None = None
    response_time_ms: int | None = None
    phase: str | None = None
    reason: str | None = None

app = FastAPI(title='AI Engine')

# CORS configuration for Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ia-compagnon.vercel.app",
        "https://ia-compagnon-1.vercel.app",
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
CREATIVE_STORE_DIR = os.path.join(os.path.dirname(__file__), 'creative_store')
os.makedirs(CREATIVE_STORE_DIR, exist_ok=True)


# ============================================================================
# CREATIVE STORAGE (stockage des créations utilisateur)
# ============================================================================
class CreativeStorage:
    """Stockage simple des créations utilisateur pour ai-engine"""

    def __init__(self, store_dir: str):
        self.store_dir = store_dir

    def _get_user_file(self, user_id: str) -> str:
        user_hash = sha256(user_id.encode()).hexdigest()[:16]
        return os.path.join(self.store_dir, f"{user_hash}_creations.json")

    def _load_user_creations(self, user_id: str) -> dict:
        file_path = self._get_user_file(user_id)
        if not os.path.exists(file_path):
            return {"journal_entries": [], "narratives": [], "poems": [], "rituals": [], "colorings": []}
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return {"journal_entries": [], "narratives": [], "poems": [], "rituals": [], "colorings": []}

    def _save_user_creations(self, user_id: str, data: dict):
        file_path = self._get_user_file(user_id)
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def save_journal_entry(self, user_id: str, content: str, prompt: str = None, therapeutic_method: str = None) -> dict:
        from datetime import datetime
        data = self._load_user_creations(user_id)
        entry = {
            "id": datetime.now().isoformat(),
            "type": "journal",
            "content": content,
            "prompt": prompt,
            "therapeutic_method": therapeutic_method,
            "created_at": datetime.now().isoformat(),
            "word_count": len(content.split())
        }
        data["journal_entries"].append(entry)
        self._save_user_creations(user_id, data)
        return entry

    def save_narrative(self, user_id: str, title: str, content: str, narrative_type: str = "reconstruction_temporelle") -> dict:
        from datetime import datetime
        data = self._load_user_creations(user_id)
        narrative = {
            "id": datetime.now().isoformat(),
            "type": "narrative",
            "title": title,
            "content": content,
            "narrative_type": narrative_type,
            "created_at": datetime.now().isoformat(),
            "word_count": len(content.split())
        }
        data["narratives"].append(narrative)
        self._save_user_creations(user_id, data)
        return narrative

    def save_poem(self, user_id: str, title: str, content: str, poem_style: str = None, ai_assisted: bool = False) -> dict:
        from datetime import datetime
        data = self._load_user_creations(user_id)
        poem = {
            "id": datetime.now().isoformat(),
            "type": "poem",
            "title": title,
            "content": content,
            "poem_style": poem_style,
            "ai_assisted": ai_assisted,
            "created_at": datetime.now().isoformat(),
            "line_count": len(content.split('\n'))
        }
        data["poems"].append(poem)
        self._save_user_creations(user_id, data)
        return poem

    def save_ritual(self, user_id: str, title: str, description: str, frequency: str = "ponctuel") -> dict:
        from datetime import datetime
        data = self._load_user_creations(user_id)
        ritual = {
            "id": datetime.now().isoformat(),
            "type": "ritual",
            "title": title,
            "description": description,
            "frequency": frequency,
            "created_at": datetime.now().isoformat(),
            "last_practiced": None,
            "practice_count": 0
        }
        data["rituals"].append(ritual)
        self._save_user_creations(user_id, data)
        return ritual

    def save_coloring(self, user_id: str, image_data: str, title: str = "Coloriage") -> dict:
        from datetime import datetime
        data = self._load_user_creations(user_id)
        coloring = {
            "id": datetime.now().isoformat(),
            "type": "coloring",
            "title": title,
            "image_data": image_data,
            "created_at": datetime.now().isoformat()
        }
        data["colorings"].append(coloring)
        self._save_user_creations(user_id, data)
        return coloring

    def get_all_creations(self, user_id: str, creation_type: str = None) -> list:
        data = self._load_user_creations(user_id)
        if creation_type:
            type_map = {"journal": "journal_entries", "narrative": "narratives", "poem": "poems", "ritual": "rituals", "coloring": "colorings"}
            key = type_map.get(creation_type, "journal_entries")
            return data.get(key, [])
        all_creations = []
        for key in ["journal_entries", "narratives", "poems", "rituals", "colorings"]:
            all_creations.extend(data.get(key, []))
        all_creations.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return all_creations


creative_storage = CreativeStorage(CREATIVE_STORE_DIR)
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
        'neutre': "simplement, comme c'est",
        'enveloppant': "en te laissant entourer par ce qui te soutient",
    }.get(tone, "simplement")
    scores = req.policy.get('scores', {}) if isinstance(req.policy.get('scores'), dict) else {}
    user_name = req.profile.get('first_name', 'ami')
    user_state = {
        'user_name': user_name,
        'detresse': scores.get('detresse', 50),
        'espoir': scores.get('espoir', 50),
        'energie': scores.get('energie', 50),
        'phase': phase,
        'tone_prompt': tone_prompt,
        'user_id_hash': req.profile.get('user_id_hash')
    }
    if req.profile.get('user_id_hash'):
        req.policy['user_id_hash'] = req.profile.get('user_id_hash')

    # === CAS SPÉCIAL: Message de bienvenue (premier contact) ===
    is_welcome = req.policy.get('is_welcome', False) or req.profile.get('is_first_message', False)
    if is_welcome and len(req.messages) == 0:
        # Générer un message d'accueil personnalisé via RAG
        welcome_text = engine.generate_welcome_message(user_name, user_state)
        return {
            'text': welcome_text,
            'intention_id': 'welcome',
            'technique': 'accueil_personnalise',
            'source': 'welcome_rag',
            'prompt_used': None,
            'model_used': None,
            'emotion_context': None,
            'rag_info': {'protocol_id': 'welcome', 'source': 'welcome'}
        }

    # IMPORTANT: Passer les messages au pipeline pour le RAG vectoriel
    # Convertir les messages Pydantic en dicts
    messages_for_context = [
        {'role': msg.role, 'content': msg.content}
        for msg in req.messages
    ]

    # Extraire le dernier message utilisateur pour analyse
    last_user_message = ""
    for msg in reversed(req.messages):
        if msg.role == "user":
            last_user_message = msg.content
            break

    # === DÉTECTION DE CRISE ACTIVE (État de l'art 2024) ===
    crisis_response = None
    emotion_analysis = None
    try:
        from .emotion_detector import detect_crisis, detect_emotion, get_crisis_response

        # 1. Détection de crise (prioritaire)
        if last_user_message:
            crisis_info = detect_crisis(last_user_message)

            if crisis_info["is_crisis"] and crisis_info["crisis_level"] in ["critical", "high"]:
                # INTERRUPTION ACTIVE - Réponse de sécurité immédiate
                crisis_response = get_crisis_response(crisis_info["crisis_level"], user_name)

                # Logger l'alerte de crise
                try:
                    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
                    alert_path = os.path.join(base_dir, 'backend', 'ai-engine', 'alert_logs.jsonl')
                    with open(alert_path, 'a', encoding='utf-8') as f:
                        f.write(json.dumps({
                            'ts': time.time(),
                            'user': req.profile.get('user_id_hash'),
                            'crisis_level': crisis_info["crisis_level"],
                            'detected_patterns': crisis_info["detected_patterns"],
                            'phase': phase,
                            'note': 'CRISIS_ACTIVE_DETECTION'
                        }, ensure_ascii=False) + "\n")
                except Exception:
                    pass

                # Retourner immédiatement la réponse de crise
                return {
                    'text': crisis_response,
                    'intention_id': 'crisis_intervention',
                    'technique': 'safety_check_active',
                    'source': 'crisis_detector',
                    'prompt_used': None,
                    'model_used': None,
                    'emotion_context': {
                        'crisis_level': crisis_info["crisis_level"],
                        'detected_patterns': crisis_info["detected_patterns"]
                    },
                    'rag_info': None,
                    'crisis_detected': True
                }

            # 2. Analyse émotionnelle avec DistilBERT
            emotion_result = detect_emotion(last_user_message)
            emotion_analysis = {
                'primary_emotion': emotion_result.primary_emotion,
                'confidence': emotion_result.confidence,
                'valence': emotion_result.valence,
                'arousal': emotion_result.arousal,
                'therapeutic_indicators': emotion_result.therapeutic_indicators
            }

            # Enrichir user_state avec les émotions détectées
            user_state['detected_emotion'] = emotion_result.primary_emotion
            user_state['emotional_arousal'] = emotion_result.arousal
            user_state['emotional_valence'] = emotion_result.valence

            # Ajuster la phase suggérée si pertinent
            suggested_phase = emotion_result.therapeutic_indicators.get('phase_suggested')
            if suggested_phase and emotion_result.confidence > 0.7:
                user_state['emotion_suggested_phase'] = suggested_phase

    except ImportError:
        # emotion_detector non disponible, continuer sans
        pass
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning(f"Emotion detection error: {e}")

    req.policy['conversation_context'] = {
        'messages': messages_for_context,
        'session_count': req.profile.get('session_count', 1),
        'previous_methods': req.profile.get('previous_methods', []),
        'emotion_analysis': emotion_analysis
    }

    out = engine.run_pipeline(user_state, req.policy)

    # Supervision clinique: alerte 3114 si détresse élevée (fallback passif)
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

    # Enrichir emotion_context avec l'analyse DistilBERT
    emotion_context = out.get('emotion_context') or {}
    if emotion_analysis:
        emotion_context['distilbert_analysis'] = emotion_analysis

    return {
        'text': text,
        'intention_id': out.get('intention_id'),
        'technique': out.get('technique'),
        'source': out.get('source'),
        'prompt_used': out.get('prompt_used'),
        'model_used': out.get('model_used'),
        'emotion_context': emotion_context,
        # RAG info for debugging
        'rag_info': out.get('rag_info'),
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

# Health check endpoint for Railway
@app.get('/')
async def health_check():
    return { 'status': 'healthy', 'service': 'AI Engine', 'version': '1.0.0' }

@app.get('/health')
async def health():
    return { 'status': 'ok' }

# ==================== ANALYTICS ====================
ANALYTICS_PATH = os.path.join(os.path.dirname(__file__), 'analytics_logs.jsonl')

@app.post('/analytics/track')
async def analytics_track(req: AnalyticsEvent):
    """Track analytics events (silent, non-blocking for frontend)"""
    try:
        entry = {
            'ts': time.time(),
            'user_id_hash': req.user_id_hash,
            'event_type': req.event_type,
            'session_duration_ms': req.session_duration_ms,
            'message_count': req.message_count,
            'timestamp': req.timestamp,
            'technique': req.technique,
            'response_time_ms': req.response_time_ms,
            'phase': req.phase,
            'reason': req.reason,
        }
        with open(ANALYTICS_PATH, 'a', encoding='utf-8') as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    except Exception:
        pass
    return { 'status': 'ok' }

class CreativePromptsRequest(BaseModel):
    user_id: str
    tool: str  # journal, narrative, creative, poem
    first_name: str | None = None
    conversation_history: List[Dict[str, Any]] | None = None  # Historique des conversations récentes

@app.post('/api/creative/prompts')
async def creative_prompts(req: CreativePromptsRequest):
    """
    Génère des prompts d'écriture personnalisés pour l'espace créatif
    BASÉS SUR L'HISTORIQUE DES CONVERSATIONS pour une vraie personnalisation
    """
    tool = req.tool
    first_name = req.first_name or "ami"
    conversation_history = req.conversation_history or []

    # Prompts par défaut par outil
    default_prompts = {
        'journal': [
            f"Comment te sens-tu en ce moment, {first_name}, vraiment ?",
            "Qu'est-ce qui t'a traversé l'esprit aujourd'hui que tu n'as dit à personne ?",
            "Si tu pouvais parler à quelqu'un qui te manque, que lui dirais-tu ?",
            "Quelle petite chose t'a apporté un peu de lumière récemment ?",
            "Qu'est-ce que tu portes en toi et que tu aimerais déposer ici, maintenant ?",
        ],
        'narrative': [
            "Raconte un souvenir qui te revient souvent, même dans les petits détails...",
            "Décris un moment où tu t'es senti(e) vraiment compris(e)...",
            "Qu'est-ce que cette personne t'a appris de plus précieux ?",
            "Si tu devais écrire une lettre à toi-même d'il y a un an...",
            "Quel chapitre de ton histoire es-tu en train d'écrire ?",
        ],
        'creative': [
            "La lumière ce matin ressemblait à...",
            "Je porte en moi un silence qui...",
            "Si ma douleur avait une couleur, elle serait...",
            "Il y a des mots que je n'ai jamais prononcés, comme...",
            "Dans mes rêves, je retrouve parfois...",
        ],
        'poem': [
            "La lumière ce matin ressemblait à...",
            "Je porte en moi un silence qui...",
            "Si mon cœur pouvait parler, il dirait...",
            "Entre l'ombre et la lumière, il y a...",
            "Les mots s'échappent comme...",
        ],
    }

    # Si on a un historique de conversation, générer des prompts personnalisés
    if conversation_history and len(conversation_history) > 0:
        try:
            # Extraire les thèmes des conversations récentes
            user_messages = [msg.get('content', '') for msg in conversation_history if msg.get('role') == 'user']
            conversation_summary = "\n".join(user_messages[-5:])  # 5 derniers messages utilisateur

            # Utiliser Claude pour générer des prompts basés sur les conversations
            system_prompt = f"""Tu es un accompagnant bienveillant spécialisé dans l'écriture thérapeutique.

L'utilisateur s'appelle {first_name}. Voici ce qu'il/elle a partagé récemment dans ses conversations:

---
{conversation_summary}
---

Génère 5 prompts d'écriture pour l'outil "{tool}" qui sont:
- DIRECTEMENT LIÉS à ce que l'utilisateur a partagé (ses émotions, ses situations, ses personnes mentionnées)
- Doux et non-intrusifs
- Qui l'invitent à approfondir ce qu'il/elle vit
- Sans JAMAIS supposer des choses non dites

IMPORTANT: Ne mentionne PAS explicitement les détails (pas de "ton chien Rex" ou "ta mère") - fais des allusions délicates.

Réponds UNIQUEMENT avec les 5 prompts, un par ligne, sans numérotation."""

            # Appeler le LLM
            response = engine.llm.generate(
                system_prompt=system_prompt,
                messages=[{"role": "user", "content": "Génère les prompts personnalisés."}],
                temperature=0.8,
                max_tokens=500
            )

            if response and isinstance(response, str):
                prompts = [p.strip().strip('-').strip('•').strip('"').strip() for p in response.strip().split('\n') if p.strip()]
                prompts = [p for p in prompts if len(p) > 10 and len(p) < 250]

                if len(prompts) >= 3:
                    return {
                        'prompts': prompts[:5],
                        'personalized': True,
                        'based_on_conversation': True
                    }
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"Personalized creative prompts failed: {e}")

    # Fallback: essayer de générer des prompts génériques via IA
    try:
        system_prompt = f"""Tu es un accompagnant bienveillant spécialisé dans l'écriture thérapeutique.

Génère 5 prompts d'écriture pour l'outil "{tool}" qui sont:
- Doux et non-intrusifs
- Ouverts à l'interprétation
- Thérapeutiques sans être cliniques

L'utilisateur s'appelle {first_name}.

Réponds UNIQUEMENT avec les 5 prompts, un par ligne, sans numérotation."""

        response = engine.llm.generate(
            system_prompt=system_prompt,
            messages=[{"role": "user", "content": "Génère les prompts."}],
            temperature=0.8,
            max_tokens=400
        )

        if response and isinstance(response, str):
            prompts = [p.strip().strip('-').strip('•').strip('"').strip() for p in response.strip().split('\n') if p.strip()]
            prompts = [p for p in prompts if len(p) > 10 and len(p) < 200]

            if len(prompts) >= 3:
                return {'prompts': prompts[:5], 'personalized': True, 'based_on_conversation': False}
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning(f"Creative prompts generation failed: {e}")

    # Fallback final aux prompts par défaut
    return {'prompts': default_prompts.get(tool, default_prompts['journal']), 'personalized': False, 'based_on_conversation': False}

@app.get('/api/creative/presentation')
async def creative_presentation():
    """Retourne la présentation de l'espace créatif"""
    return {
        'presentation_globale': {
            'outils': [
                {
                    'icone': '📖',
                    'nom': 'Journal guidé - Adaptation intelligente aux émotions',
                    'description': 'Questions guidées qui s\'adaptent à votre contexte émotionnel',
                    'key': 'journal'
                },
                {
                    'icone': '✍️',
                    'nom': 'Poésie-thérapie - Assistance IA discrète',
                    'description': 'Assistance IA pour vous aider à formuler des images poétiques',
                    'key': 'poem'
                },
                {
                    'icone': '🎨',
                    'nom': 'Coloriage thérapeutique - Mobile-friendly et intentionnel',
                    'description': 'Méditation active et coloriage guidé, optimisé mobile',
                    'key': 'coloring'
                },
                {
                    'icone': '🕯️',
                    'nom': 'Rituels d\'écriture - Pour les transitions importantes',
                    'description': 'Ritualiser les moments importants par l\'écriture',
                    'key': 'ritual'
                }
            ]
        }
    }

# ============================================================================
# CREATIVE STORAGE ENDPOINTS
# ============================================================================

from fastapi import Request

@app.post('/api/creations/journal')
async def save_journal_entry(request: Request):
    """Sauvegarde une entrée de journal"""
    data = await request.json()
    user_id = data.get('user_id')
    content = data.get('content')
    prompt = data.get('prompt')
    method = data.get('therapeutic_method')
    entry = creative_storage.save_journal_entry(user_id, content, prompt, method)
    return {'success': True, 'entry': entry}


@app.post('/api/creations/narrative')
async def save_narrative(request: Request):
    """Sauvegarde un narratif thérapeutique"""
    data = await request.json()
    user_id = data.get('user_id')
    title = data.get('title', 'Sans titre')
    content = data.get('content')
    narrative_type = data.get('narrative_type', 'reconstruction_temporelle')
    narrative = creative_storage.save_narrative(user_id, title, content, narrative_type)
    return {'success': True, 'narrative': narrative}


@app.post('/api/creations/poem')
async def save_poem(request: Request):
    """Sauvegarde un poème"""
    data = await request.json()
    user_id = data.get('user_id')
    title = data.get('title', 'Sans titre')
    content = data.get('content')
    poem_style = data.get('poem_style')
    ai_assisted = data.get('ai_assisted', False)
    poem = creative_storage.save_poem(user_id, title, content, poem_style, ai_assisted)
    return {'success': True, 'poem': poem}


@app.post('/api/creations/ritual')
async def save_ritual(request: Request):
    """Sauvegarde un rituel d'écriture"""
    data = await request.json()
    user_id = data.get('user_id')
    title = data.get('title')
    description = data.get('description')
    frequency = data.get('frequency', 'ponctuel')
    ritual = creative_storage.save_ritual(user_id, title, description, frequency)
    return {'success': True, 'ritual': ritual}


@app.post('/api/creations/coloring')
async def save_coloring(request: Request):
    """Sauvegarde un coloriage"""
    data = await request.json()
    user_id = data.get('user_id')
    image_data = data.get('image_data')
    title = data.get('title', 'Coloriage')
    coloring = creative_storage.save_coloring(user_id, image_data, title)
    return {'success': True, 'coloring': coloring}


@app.get('/api/creations/{user_id}')
async def get_user_creations(user_id: str, creation_type: str = None):
    """Récupère les créations d'un utilisateur"""
    creations = creative_storage.get_all_creations(user_id, creation_type)
    return {'creations': creations, 'count': len(creations)}


@app.get('/api/recent-entries/{user_id}')
async def get_recent_journal_entries(user_id: str, limit: int = 10):
    """Récupère les dernières entrées de journal pour contexte historique"""
    try:
        creations = creative_storage.get_all_creations(user_id, 'journal')
        recent = sorted(creations, key=lambda x: x.get('created_at', ''), reverse=True)[:limit]
        entries = [
            {
                'id': e.get('id'),
                'content': e.get('content', ''),
                'prompt': e.get('prompt'),
                'created_at': e.get('created_at'),
                'therapeutic_method': e.get('therapeutic_method')
            }
            for e in recent
        ]
        return {'entries': entries, 'count': len(entries)}
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Erreur chargement récentes entrées: {e}")
        return {'entries': [], 'count': 0}


@app.post('/api/analyze-context')
async def analyze_context(request: Request):
    """
    Analyse le contexte du message utilisateur et retourne des prompts personnalisés
    """
    data = await request.json()
    current_message = data.get('current_message', '')
    tool = data.get('tool', 'journal')

    # Prompts génériques basés sur le contexte
    prompts_suggestions = {
        'journal': [
            "Qu'est-ce que vous ressentez en écrivant cela ?",
            "Y a-t-il autre chose que vous aimeriez explorer ?",
            "Comment vous sentez-vous maintenant ?",
        ],
        'narrative': [
            "Que s'est-il passé ensuite ?",
            "Comment avez-vous réagi à ce moment ?",
            "Qu'est-ce que cela vous a appris ?",
        ],
        'creative': [
            "Si cette émotion était une couleur...",
            "Trouvez une image pour exprimer cela...",
            "Laissez les mots venir librement...",
        ],
        'poem': [
            "Continuez avec une métaphore...",
            "Qu'est-ce qui rime avec vos émotions ?",
            "Laissez le rythme vous guider...",
        ],
    }

    return {
        'recommended_prompts': prompts_suggestions.get(tool, prompts_suggestions['journal']),
        'personalization_context': "Continuez à explorer vos pensées...",
        'detected_method': None,
        'variation': None,
        'confidence': 0.0
    }


@app.get('/admin/analytics')
async def admin_analytics(key: str = ''):
    """Dashboard analytics pour l'admin (protégé par clé)"""
    # Clé simple pour protéger l'accès - à changer en production
    ADMIN_KEY = os.getenv('ADMIN_KEY', 'helo2024admin')
    if key != ADMIN_KEY:
        return { 'error': 'Unauthorized' }

    # Charger les logs analytics
    analytics_logs = []
    if os.path.exists(ANALYTICS_PATH):
        with open(ANALYTICS_PATH, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        analytics_logs.append(json.loads(line))
                    except:
                        pass

    # Charger les logs mémoire (interactions)
    memory_logs = []
    mem_path = os.path.join(os.path.dirname(__file__), 'memory_store.jsonl')
    if os.path.exists(mem_path):
        with open(mem_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        memory_logs.append(json.loads(line))
                    except:
                        pass

    # Calculer les métriques
    now = time.time()
    day_ago = now - 86400
    week_ago = now - 604800

    # Sessions
    sessions_today = [e for e in analytics_logs if e.get('event_type') == 'session_start' and e.get('ts', 0) > day_ago]
    sessions_week = [e for e in analytics_logs if e.get('event_type') == 'session_start' and e.get('ts', 0) > week_ago]

    # Utilisateurs uniques
    users_today = set(e.get('user_id_hash') for e in sessions_today if e.get('user_id_hash'))
    users_week = set(e.get('user_id_hash') for e in sessions_week if e.get('user_id_hash'))

    # Messages échangés
    messages_today = [e for e in analytics_logs if e.get('event_type') == 'message_exchange' and e.get('ts', 0) > day_ago]
    messages_week = [e for e in analytics_logs if e.get('event_type') == 'message_exchange' and e.get('ts', 0) > week_ago]

    # Durée moyenne des sessions
    session_ends = [e for e in analytics_logs if e.get('event_type') == 'session_end' and e.get('session_duration_ms')]
    avg_session_duration = sum(e['session_duration_ms'] for e in session_ends) / len(session_ends) / 1000 / 60 if session_ends else 0

    # Techniques les plus utilisées
    technique_counts = {}
    for e in memory_logs:
        tech = e.get('technique')
        if tech:
            technique_counts[tech] = technique_counts.get(tech, 0) + 1

    # Phases les plus fréquentes
    phase_counts = {}
    for e in memory_logs:
        phase = e.get('phase')
        if phase:
            phase_counts[phase] = phase_counts.get(phase, 0) + 1

    # Fallbacks (erreurs backend)
    fallbacks = [e for e in analytics_logs if e.get('event_type') == 'fallback_used']

    # Temps de réponse moyen
    response_times = [e.get('response_time_ms') for e in messages_week if e.get('response_time_ms')]
    avg_response_time = sum(response_times) / len(response_times) if response_times else 0

    return {
        'summary': {
            'sessions_today': len(sessions_today),
            'sessions_week': len(sessions_week),
            'users_today': len(users_today),
            'users_week': len(users_week),
            'messages_today': len(messages_today),
            'messages_week': len(messages_week),
            'avg_session_duration_minutes': round(avg_session_duration, 1),
            'avg_response_time_ms': round(avg_response_time, 0),
            'total_fallbacks': len(fallbacks),
        },
        'techniques': dict(sorted(technique_counts.items(), key=lambda x: -x[1])[:10]),
        'phases': phase_counts,
        'total_interactions': len(memory_logs),
    }
