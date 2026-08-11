from __future__ import annotations
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Literal, Dict, Any, Optional
import os
from dotenv import load_dotenv
from .therapeutic_engine import TherapeuticEngine
import json, time, logging
from hashlib import sha256

# Logger module-level (certaines fonctions le redéfinissent localement, mais on en
# a besoin au niveau module pour les endpoints qui n'ont pas leur propre logger).
logger = logging.getLogger(__name__)
try:
    from cryptography.fernet import Fernet
except Exception:
    Fernet = None
from .aggregate_memory import aggregate as agg_compute

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env'))

# Supabase client (for persistent storage of feedback, analytics, etc.)
_supabase_client = None
def get_supabase():
    global _supabase_client
    if _supabase_client is None:
        sb_url = os.getenv('SUPABASE_URL')
        sb_key = os.getenv('SUPABASE_SERVICE_KEY') or os.getenv('SUPABASE_ANON_KEY')
        if sb_url and sb_key:
            try:
                from supabase import create_client
                _supabase_client = create_client(sb_url, sb_key)
            except Exception:
                _supabase_client = None
    return _supabase_client

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
    # RGPD : consentement à l'amélioration anonyme. Défaut True pour rétro-compat,
    # mais le frontend envoie explicitement le choix de l'utilisateur.
    analytics_consent: bool = True

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
    # Try Supabase first (persistent), fall back to file
    sb = get_supabase()
    if sb:
        try:
            sb.table('feedback_logs').insert({
                'user_id_hash': entry.get('user', ''),
                'helped': entry.get('helped', 0),
                'phase': entry.get('phase'),
                'scores': entry.get('scores', {}),
                'intention_id': entry.get('intention_id'),
                'technique': entry.get('technique'),
                'data': entry,
            }).execute()
            return
        except Exception:
            pass
    # Fallback to file
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
    # Scalabilité : état global d'apprentissage dans Supabase (learning_state),
    # plus dans un fichier local (perdu au redéploiement, incohérent multi-instance).
    from .learning_store import get_state
    return get_state('ietg', {'last': []})


def _save_ietg(state: dict):
    from .learning_store import set_state
    set_state('ietg', state)


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

def _detect_module_suggestion(response_text: str) -> dict | None:
    """
    Détecte quel module suggérer en fonction du CONTENU de la réponse IA.
    Basé sur le besoin exprimé, pas sur un compteur de messages.
    Retourne None si aucune suggestion n'est pertinente.
    """
    if not response_text:
        return None

    text_lower = response_text.lower()

    # --- Module Créativité (écriture, dessin, rituel) ---
    creativity_signals = {
        'journal': ['écrire', 'journal', 'mettre en mots', 'coucher sur papier', 'noter ce que'],
        'poem': ['poème', 'poésie', 'vers ', 'strophe'],
        'narrative': ['lettre', 'raconter', 'récit', 'narrer', 'histoire de vie'],
        'coloring': ['coloriage', 'dessiner', 'dessin', 'couleur', 'peindre'],
        'ritual': ['rituel', 'cérémonie', 'commémor', 'symboli'],
    }
    for tool, keywords in creativity_signals.items():
        # On cherche des formulations suggestives, pas juste la mention du mot
        suggestive_patterns = [
            f"pourriez {kw}" for kw in keywords
        ] + [
            f"essayer de {kw}" for kw in keywords
        ] + [
            f"vous pourriez {kw}" for kw in keywords
        ] + [
            f"tu pourrais {kw}" for kw in keywords
        ] + [
            f"peut aider de {kw}" for kw in keywords
        ] + [
            f"bienfait de {kw}" for kw in keywords
        ] + keywords  # fallback: mot-clé seul
        if any(p in text_lower for p in suggestive_patterns):
            return {
                'module': 'creativity',
                'tool': tool,
                'title': "Envie d'explorer tes émotions autrement ?",
                'message': "Tu pourrais essayer un outil créatif pour exprimer ce que tu ressens."
            }

    # --- Module Bibliothèque (lecture, ressources, livres) ---
    library_signals = [
        'livre', 'lire', 'lecture', 'ouvrage', 'ressource', 'article',
        'podcast', 'vidéo', 'documentaire', 'témoignage', 'bibliothèque',
        'recommand', 'découvrir un', 'explorer un',
    ]
    library_suggestive = [
        'je vous recommande', 'tu pourrais lire', 'un livre qui',
        'des ressources', 'approfondir par la lecture', 'témoignages d\'autres',
        'il existe des ouvrages', 'vous pourriez lire', 'vidéo', 'podcast',
    ]
    if any(p in text_lower for p in library_suggestive):
        return {
            'module': 'library',
            'tool': 'resources',
            'title': "Des ressources qui pourraient t'aider",
            'message': "Notre bibliothèque contient des livres, podcasts et articles sur ce sujet."
        }

    # --- Module Rêves (rêves, sommeil, inconscient) ---
    dream_signals = [
        'rêve ', 'rêves', 'rêver', 'cauchemar', 'sommeil', 'nuit',
        'inconscient', 'onirique',
    ]
    dream_suggestive = [
        'noter vos rêves', 'noter tes rêves', 'journal de rêves',
        'explorer vos rêves', 'explorer tes rêves', 'rêves récurrents',
        'sens de ce rêve', 'signification',
    ]
    if any(p in text_lower for p in dream_suggestive):
        return {
            'module': 'dreams',
            'tool': 'dream_journal',
            'title': "Explorer tes rêves ?",
            'message': "Le journal de rêves peut t'aider à comprendre ce qui se passe en toi."
        }

    return None


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
    # Mémoire conversationnelle
    conversation_memory = req.profile.get('conversation_memory')
    if conversation_memory:
        user_state['conversation_memory'] = conversation_memory
    # Contexte de vie sédimenté (motif d'onboarding + faits durables extraits des sessions)
    conversation_insights = req.profile.get('conversation_insights')
    if conversation_insights:
        user_state['conversation_insights'] = conversation_insights
    if req.profile.get('user_id_hash'):
        req.policy['user_id_hash'] = req.profile.get('user_id_hash')

    # Récupérer le profil étendu (spirituel, transgénérationnel, etc.)
    extended_profile = req.profile.get('extended_profile')

    # === CAS SPÉCIAL: Message de bienvenue (premier contact) ===
    is_welcome = req.policy.get('is_welcome', False) or req.profile.get('is_first_message', False)
    if is_welcome and len(req.messages) == 0:
        # Générer un message d'accueil personnalisé (avec profil étendu si disponible)
        welcome_text = engine.generate_welcome_message(user_name, user_state, extended_profile)
        return {
            'text': welcome_text,
            'intention_id': 'welcome',
            'technique': 'accueil_personnalise',
            'source': 'welcome_rag',
            'prompt_used': None,
            'model_used': None,
            'emotion_context': None,
            'rag_info': {'protocol_id': 'welcome', 'source': 'welcome'},
            'has_extended_profile': extended_profile is not None
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

    # Passer le dernier message dans user_state pour la détection de techniques
    user_state['last_user_message'] = last_user_message

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
                except Exception as e:
                    import logging
                    logging.getLogger(__name__).error(f"CRITIQUE: Impossible de logger l'alerte de crise: {e}")

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
        # emotion_detector non disponible (modèle DistilBERT absent), continuer sans
        logger = logging.getLogger(__name__)
        logger.info("emotion_detector non disponible — détection émotionnelle désactivée")
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"ALERTE: Erreur détection de crise/émotions: {e}", exc_info=True)

    req.policy['conversation_context'] = {
        'messages': messages_for_context,
        'session_count': req.profile.get('session_count', 1),
        'previous_methods': req.profile.get('previous_methods', []),
        'emotion_analysis': emotion_analysis
    }

    try:
        out = engine.run_pipeline(user_state, req.policy, extended_profile)
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Pipeline error (content filter?): {e}")
        out = {
            'text': f"Je suis là avec toi, {user_name}. Peux-tu me dire ce que tu ressens en ce moment ?",
            'intention_id': 'fallback',
            'technique': 'fallback_content_filter',
            'source': 'fallback',
            'model_used': 'fallback',
            'emotion_context': {},
            'rag_info': None,
            'crisis_detected': False,
        }

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
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"CRITIQUE: Impossible de logger l'alerte détresse: {e}")

    text = out.get('text','')
    if alert_prefix:
        text = alert_prefix + "\n\n" + text

    # Enrichir emotion_context avec l'analyse DistilBERT
    emotion_context = out.get('emotion_context') or {}
    if emotion_analysis:
        emotion_context['distilbert_analysis'] = emotion_analysis

    # Détection contextuelle de suggestion de module
    # Basée sur le BESOIN détecté dans la réponse, pas sur le nombre de messages
    suggest_module = _detect_module_suggestion(text)

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
        'suggest_module': suggest_module,
        # Backward compatibility
        'suggest_creativity': suggest_module if suggest_module and suggest_module.get('module') == 'creativity' else None,
    }


@app.post('/generate/stream')
async def generate_stream(req: GenerateRequest):
    """Endpoint SSE pour streaming des réponses thérapeutiques."""
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
    # Mémoire conversationnelle
    conversation_memory = req.profile.get('conversation_memory')
    if conversation_memory:
        user_state['conversation_memory'] = conversation_memory
    # Contexte de vie sédimenté (motif d'onboarding + faits durables extraits des sessions)
    conversation_insights = req.profile.get('conversation_insights')
    if conversation_insights:
        user_state['conversation_insights'] = conversation_insights
    if req.profile.get('user_id_hash'):
        req.policy['user_id_hash'] = req.profile.get('user_id_hash')

    extended_profile = req.profile.get('extended_profile')

    # Welcome messages are not streamed (short)
    is_welcome = req.policy.get('is_welcome', False) or req.profile.get('is_first_message', False)
    if is_welcome and len(req.messages) == 0:
        welcome_text = engine.generate_welcome_message(user_name, user_state, extended_profile)
        async def welcome_stream():
            yield f"data: {json.dumps({'type': 'chunk', 'text': welcome_text})}\n\n"
            yield f"data: {json.dumps({'type': 'done', 'technique': 'accueil_personnalise'})}\n\n"
        return StreamingResponse(welcome_stream(), media_type="text/event-stream")

    messages_for_context = [
        {'role': msg.role, 'content': msg.content}
        for msg in req.messages
    ]

    last_user_message = ""
    for msg in reversed(req.messages):
        if msg.role == "user":
            last_user_message = msg.content
            break

    # Passer le dernier message dans user_state pour la détection de techniques
    user_state['last_user_message'] = last_user_message

    # Crisis detection (not streamed — immediate response)
    crisis_response = None
    emotion_analysis = None
    try:
        from .emotion_detector import detect_crisis, detect_emotion, get_crisis_response
        if last_user_message:
            crisis_info = detect_crisis(last_user_message)
            if crisis_info["is_crisis"] and crisis_info["crisis_level"] in ["critical", "high"]:
                crisis_response = get_crisis_response(crisis_info["crisis_level"], user_name)
                async def crisis_stream():
                    yield f"data: {json.dumps({'type': 'chunk', 'text': crisis_response})}\n\n"
                    yield f"data: {json.dumps({'type': 'done', 'technique': 'crisis_intervention', 'crisis_detected': True})}\n\n"
                return StreamingResponse(crisis_stream(), media_type="text/event-stream")

            emotion_result = detect_emotion(last_user_message)
            emotion_analysis = {
                'primary_emotion': emotion_result.primary_emotion,
                'confidence': emotion_result.confidence,
                'valence': emotion_result.valence,
                'arousal': emotion_result.arousal,
                'therapeutic_indicators': emotion_result.therapeutic_indicators
            }
            user_state['detected_emotion'] = emotion_result.primary_emotion
            user_state['emotional_arousal'] = emotion_result.arousal
            user_state['emotional_valence'] = emotion_result.valence
            suggested_phase = emotion_result.therapeutic_indicators.get('phase_suggested')
            if suggested_phase and emotion_result.confidence > 0.7:
                user_state['emotion_suggested_phase'] = suggested_phase
    except ImportError:
        pass
    except Exception as e:
        logging.getLogger(__name__).error(f"Error in crisis/emotion detection: {e}")

    req.policy['conversation_context'] = {
        'messages': messages_for_context,
        'session_count': req.profile.get('session_count', 1),
        'previous_methods': req.profile.get('previous_methods', []),
        'emotion_analysis': emotion_analysis
    }

    # Alert prefix for high distress
    alert_prefix = None
    if int(user_state.get('detresse', 50)) >= 80:
        alert_prefix = "Si tu te sens en danger, tu peux appeler le 3114."

    def event_stream():
        accumulated_text = ""
        if alert_prefix:
            yield f"data: {json.dumps({'type': 'chunk', 'text': alert_prefix + chr(10) + chr(10)})}\n\n"
            accumulated_text += alert_prefix + "\n\n"

        try:
            for chunk in engine.run_pipeline_stream(user_state, req.policy, extended_profile):
                yield f"data: {json.dumps({'type': 'chunk', 'text': chunk})}\n\n"
                accumulated_text += chunk
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Stream error: {error_msg}")
            # Fallback doux si le modèle bloque (content filter, rate limit, etc.)
            if not accumulated_text:
                fallback = f"Je suis là avec toi, {user_name}. Peux-tu me dire ce que tu ressens en ce moment ?"
                yield f"data: {json.dumps({'type': 'chunk', 'text': fallback})}\n\n"
                accumulated_text = fallback

        # Détection contextuelle de suggestion de module
        suggest_module = _detect_module_suggestion(accumulated_text)

        if suggest_module:
            yield f"data: {json.dumps({'type': 'suggest_module', **suggest_module})}\n\n"
            # Backward compatibility
            if suggest_module.get('module') == 'creativity':
                yield f"data: {json.dumps({'type': 'suggest_creativity', **suggest_module})}\n\n"

        yield f"data: {json.dumps({'type': 'done', 'technique': 'conversational_therapy'})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


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
    from .personalization import _get_profile, _put_profile
    prof = _get_profile(req.user_id_hash)
    prof['prefs'] = { **(prof.get('prefs') or {}), **(req.prefs or {}) }
    _put_profile(req.user_id_hash, prof)
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

@app.post('/api/tts')
async def tts(request: dict):
    """OpenAI TTS — génère audio MP3 à partir de texte. Voix neuronale, qualité naturelle."""
    from fastapi.responses import Response
    text = (request.get('text') or '').strip()
    if not text:
        return Response(content=b'', status_code=400)
    if len(text) > 4000:
        text = text[:4000]
    voice = request.get('voice', 'shimmer')  # alloy, echo, fable, onyx, nova, shimmer
    if voice not in ('alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'):
        voice = 'shimmer'
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        return Response(content=b'TTS unavailable', status_code=503)
    try:
        import httpx
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.post(
                'https://api.openai.com/v1/audio/speech',
                headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'},
                json={'model': 'tts-1', 'voice': voice, 'input': text, 'response_format': 'mp3'},
            )
            if r.status_code != 200:
                return Response(content=r.content, status_code=r.status_code)
            return Response(content=r.content, media_type='audio/mpeg')
    except Exception as e:
        return Response(content=str(e).encode(), status_code=500)

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
    # RGPD : si l'utilisateur a retiré son consentement à l'amélioration anonyme,
    # on ne journalise RIEN. Le toggle "Mes données" est donc réellement appliqué.
    if not req.analytics_consent:
        return { 'status': 'skipped', 'reason': 'analytics_consent_withdrawn' }
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
    # Try Supabase first, fall back to file
    sb = get_supabase()
    if sb:
        try:
            sb.table('analytics_events').insert({
                'user_id_hash': req.user_id_hash,
                'event_type': req.event_type,
                'data': entry,
            }).execute()
            return { 'status': 'ok' }
        except Exception:
            pass
    # Fallback to file
    try:
        with open(ANALYTICS_PATH, 'a', encoding='utf-8') as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    except Exception:
        pass
    return { 'status': 'ok' }


class SessionEndRequest(BaseModel):
    messages: List[ChatMessage]
    conversation_insights: Optional[Dict[str, Any]] = None  # insights existants du profil


@app.post('/api/session/end')
async def session_end(req: SessionEndRequest):
    """
    Fin de session : sédimentation du contexte de vie.

    Extrait (via Haiku, conservateur strict) les faits de vie durables de la
    conversation, les FUSIONNE avec les insights existants, et renvoie le nouveau
    conversation_insights. Le frontend le persiste ensuite dans profiles.
    Best-effort : ne bloque jamais, ne lève jamais côté client.
    """
    try:
        from .insight_extractor import extract_insights
        history = [{'role': m.role, 'content': m.content} for m in req.messages]
        updated = extract_insights(
            engine.llm,
            history,
            existing_insights=req.conversation_insights,
        )
        return {'status': 'ok', 'conversation_insights': updated}
    except Exception as e:
        logger.warning(f"session_end extraction failed: {e}")
        # On renvoie l'existant inchangé plutôt qu'une erreur.
        return {'status': 'ok', 'conversation_insights': req.conversation_insights}


# Tables de données personnelles rattachées par user_id (miroir du frontend).
# feedback_logs / analytics_events (user_id_hash) sont anonymisés → conservés.
_USER_DATA_TABLES = [
    'conversations', 'dreams', 'creations',
    'journal_entries', 'emotional_logs', 'progress',
]


class AccountDeleteRequest(BaseModel):
    user_id: str


@app.post('/api/account/delete')
async def account_delete(req: AccountDeleteRequest):
    """
    RGPD Art. 17 — Effacement complet du compte.

    Défense en profondeur : efface toutes les données personnelles (au cas où le
    client aurait échoué), puis supprime le compte AUTH lui-même (ce que le client
    ne peut pas faire, faute de service_role). Les données anonymisées
    (user_id_hash) sont conservées — non rattachables, conformes au considérant 26.
    """
    uid = req.user_id
    if not uid:
        return {'status': 'error', 'message': 'user_id manquant'}

    sb = get_supabase()
    if sb is None:
        return {'status': 'error', 'message': 'stockage indisponible'}

    deleted, failed = [], []
    # 1. Effacer les tables de données (user_id)
    for table in _USER_DATA_TABLES:
        try:
            sb.table(table).delete().eq('user_id', uid).execute()
            deleted.append(table)
        except Exception as e:
            failed.append({'table': table, 'error': str(e)})
    # 2. Effacer le profil (id)
    try:
        sb.table('profiles').delete().eq('id', uid).execute()
        deleted.append('profiles')
    except Exception as e:
        failed.append({'table': 'profiles', 'error': str(e)})

    # 3. Supprimer le compte AUTH (nécessite service_role — côté serveur uniquement)
    auth_deleted = False
    try:
        sb.auth.admin.delete_user(uid)
        auth_deleted = True
    except Exception as e:
        logger.warning(f"account_delete: suppression auth échouée: {e}")
        failed.append({'table': 'auth.users', 'error': str(e)})

    return {
        'status': 'ok' if not failed else 'partial',
        'deleted': deleted,
        'auth_deleted': auth_deleted,
        'failed': failed,
    }


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


@app.get('/api/parcours/{user_id}')
async def get_parcours(user_id: str):
    """
    Synthèse d'ÉVOLUTION du parcours d'une personne (thèmes récurrents, ce qui
    émerge, ce qui s'apaise), analysée par Haiku à partir de ses conversations.
    Reflète les mots de la personne — ne diagnostique jamais.
    """
    sb = get_supabase()
    if not sb:
        return {'available': False, 'reason': 'no_db'}
    try:
        res = (sb.table('conversations')
               .select('created_at, messages')
               .eq('user_id', user_id)
               .order('created_at', desc=False)
               .limit(50)
               .execute())
        conversations = res.data or []
    except Exception as e:
        logger.warning("get_parcours: lecture Supabase échouée: %s", e)
        return {'available': False, 'reason': 'db_error'}

    from .parcours_analyzer import analyze_parcours
    synthese = analyze_parcours(engine.llm, conversations)
    if synthese is None:
        return {'available': False, 'reason': 'analysis_unavailable'}

    has_content = bool(synthese.get('themes_recurrents')) or bool(synthese.get('reflet'))
    return {'available': has_content, 'parcours': synthese}
