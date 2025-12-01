from __future__ import annotations
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
import httpx
import base64
import tempfile
import os
import json
import asyncio
from pathlib import Path
from typing import List, Dict
import logging
from .config import settings
from .security import CryptoBox
from .storage import EncryptedKV, PlainLog
from .models import (
    UserProfile, ChatRequest, AnalyzeRequest, EmotionScores, StateRecord,
    ConsentLog, AccessLog, AlertLog, ModulesDeclaration, OnboardingNextRequest
)
from .modules_loader import registry
from .adjustment import adjust_tone, detect_phase
from .creative_storage import CreativeStorage
from .resources_catalog import ResourcesCatalog
from .routes import subscription as subscription_routes
from .database import Base, engine
from .models_sql import Subscription, FeatureUsage
# Import temporairement commenté (dossiers avec tirets non importables)
# from ...ai-engine.app.creative_tools import (
#     CreativeToolsDefinition,
#     CreativeToolsPresentation,
#     ToolsFunctioningDetails,
#     ContextualToolSuggestions,
# )

logger = logging.getLogger(__name__)

app = FastAPI(title="IA Compagnon - API Gateway")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

box = CryptoBox.from_master(settings.MASTER_KEY)
profiles = EncryptedKV('user_profiles', box)
session_logs = EncryptedKV('session_logs', box)
state_store = EncryptedKV('user_state_history', box)  # global
consent_logs = PlainLog('consent_logs')
access_logs = PlainLog('access_logs')
alert_logs = PlainLog('alert_logs')
feedback_logs = PlainLog('feedback_logs')
class UserPreferences:
    def __init__(self, path: str = 'user_preferences.json'):
        self.prefs_file = Path(path)
        self._prefs = self._load_prefs()

    def _load_prefs(self) -> Dict:
        if self.prefs_file.exists():
            try:
                with open(self.prefs_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception:
                return {}
        return {}

    def _save_prefs(self):
        try:
            with open(self.prefs_file, 'w', encoding='utf-8') as f:
                json.dump(self._prefs, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.error(f"Error saving prefs: {e}")

    def get(self, user_id: str) -> Dict:
        return self._prefs.get(user_id, {})

    def set(self, user_id: str, prefs: Dict):
        self._prefs[user_id] = prefs
        self._save_prefs()


# Persistent user preferences
user_prefs = UserPreferences()
creative_storage = CreativeStorage()
resources_catalog = ResourcesCatalog()
# Temporairement commenté (imports avec tirets)
# creative_definitions = CreativeToolsDefinition()
# creative_presentation = CreativeToolsPresentation()
# creative_mechanics = ToolsFunctioningDetails()
# creative_suggestions = ContextualToolSuggestions()

@app.on_event('startup')
async def startup_event():
    registry.load()
    # Init DB tables if not exist
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        logger.error(f"DB init error: {e}")
    # Include subscription routes
    app.include_router(subscription_routes.router)

@app.middleware('http')
async def audit_access(request: Request, call_next):
    try:
        access_logs.append({
            'user_id': request.headers.get('x-user-id'),
            'ts': datetime.utcnow().isoformat(),
            'resource': request.url.path,
            'action': request.method,
            'purpose': request.headers.get('x-purpose', 'care'),
            'ip': request.client.host if request.client else None,
        })
    except Exception:
        pass
    response = await call_next(request)
    return response

@app.get('/api/modules')
async def list_modules():
    return registry.modules

@app.post('/api/modules/reload')
async def reload_modules():
    registry.load()
    return {'status': 'reloaded'}

@app.post('/api/profile')
async def upsert_profile(req: Request):
    data = await req.json()
    if 'consent' not in data:
        raise HTTPException(400, 'Consent is required')
    profile = UserProfile(**data)
    
    # Générer user_id_hash pour la personnalisation (anonymisé)
    import hashlib
    user_id_hash = hashlib.sha256(profile.id.encode('utf-8')).hexdigest()[:32]
    profile_dict = profile.model_dump()
    profile_dict['user_id_hash'] = user_id_hash
    
    profiles.put(profile.id, profile_dict)
    # log consent
    try:
        c = profile.consent
        consent_logs.append({
            'user_id': profile.id,
            'ts': datetime.utcnow().isoformat(),
            'version': c.version,
            'scope': c.scope,
            'user_agent': req.headers.get('user-agent'),
            'ip': req.client.host if req.client else None,
        })
    except Exception:
        pass
    return {'status': 'ok'}

@app.get('/api/state/history')
async def get_state_history(user_id: str):
    history = state_store.get(user_id) or {'history': []}
    return history

@app.post('/api/onboarding/next')
async def onboarding_next(payload: OnboardingNextRequest):
    module_key = (profiles.get(payload.user_id) or {}).get('active_module', registry.get_active_module() or 'grief')
    module_conf = registry.get_module(module_key)
    if not module_conf:
        raise HTTPException(404, 'Module not found')
    mod = registry.import_onboarding(module_conf['onboarding'])
    step_out = mod.next_step(payload.step, payload.payload)  # type: ignore
    return step_out

@app.post('/api/analyze')
async def analyze_text(req: AnalyzeRequest):
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.post(f"{settings.EMOTIONS_SERVICE_URL}/score", json={'text': req.text})
    if r.status_code != 200:
        raise HTTPException(r.status_code, 'Emotion service error')
    return r.json()

@app.post('/api/chat')
async def chat(req: ChatRequest):
    profile = profiles.get(req.user_id)
    if not profile:
        raise HTTPException(404, 'Profile not found')
    # analyze last user message
    user_msg = next((m for m in reversed(req.messages) if m['role'] == 'user'), None)
    scores: EmotionScores | None = None
    if user_msg:
        async with httpx.AsyncClient(timeout=10.0) as client:
            ar = await client.post(f"{settings.EMOTIONS_SERVICE_URL}/score", json={'text': user_msg['content']})
        if ar.status_code == 200:
            scores = EmotionScores(**ar.json())
    # tone and phase using global history
    now = datetime.utcnow().isoformat()
    history_data = state_store.get(req.user_id) or {'history': []}
    history = [StateRecord(**h) for h in history_data.get('history', [])]
    current = StateRecord(
        user_id=req.user_id,
        ts=now,
        detresse=int(scores.detresse) if scores else 50,
        espoir=int(scores.espoir) if scores else 50,
        energie=int(scores.energie) if scores else 50,
        tone=profile.get('tone', 'neutre'),
        phase='ancrage',
        last_active_module=profile.get('active_module'),
    )
    current.phase = detect_phase(history, current)
    new_tone = adjust_tone(history, current)

    # clinical policy by phase
    allow_grief_cause = current.phase != 'ancrage'
    system_policy = {
        'no_grief_cause': not allow_grief_cause,
        'phase': current.phase,
        'tone': new_tone,
        'rhythm': profile.get('rhythm', 2),
        'module': profile.get('active_module', 'grief'),
        'scores': scores.model_dump() if scores else {'detresse': current.detresse, 'espoir': current.espoir, 'energie': current.energie}
    }
    async with httpx.AsyncClient(timeout=20.0) as client:
        r = await client.post(f"{settings.AI_ENGINE_URL}/generate", json={
            'messages': [m.model_dump() if hasattr(m, 'model_dump') else m for m in req.messages],
            'profile': profile,
            'policy': system_policy,
        })
    if r.status_code != 200:
        raise HTTPException(r.status_code, 'AI engine error')
    gen_payload = r.json()
    ai_text = gen_payload.get('text', '')
    intervention_id = gen_payload.get('intervention_id')
    intervention_type = gen_payload.get('intervention_type')

    # log session (for clinical supervision)
    logs = session_logs.get(req.user_id) or {'logs': []}
    logs['logs'].append({
        'ts': now,
        'messages': [m if isinstance(m, dict) else m.model_dump() for m in req.messages],
        'reply': ai_text,
        'tone_used': new_tone,
        'phase': current.phase,
        'scores': scores.model_dump() if scores else None,
        'intervention_id': intervention_id,
        'intervention_type': intervention_type
    })
    session_logs.put(req.user_id, logs)

    # update state history
    history.append(current)
    state_store.put(req.user_id, {'history': [h.model_dump() for h in history]})

    # update scores with phase for frontend convenience
    if scores:
        scores.phase = current.phase

    # alerting
    if scores and scores.detresse >= 80:
        alert_logs.append({'user_id': req.user_id, 'ts': now, 'score_type': 'detresse', 'value': scores.detresse, 'threshold': 80, 'note': 'High distress'})

    return {'text': ai_text, 'tone': new_tone, 'scores': scores.model_dump() if scores else None}

@app.post('/api/feedback')
async def feedback(req: Request):
    data = await req.json()
    # expected: { user_id, intervention_id, outcome: 1|-1, phase, scores }
    rec = {
        'user_id': data.get('user_id'),
        'intervention_id': data.get('intervention_id'),
        'outcome': 1 if data.get('outcome') in (1, '1', True, 'true', 'up', '+') else -1,
        'phase': data.get('phase'),
        'scores': data.get('scores'),
        'ts': datetime.utcnow().isoformat()
    }
    feedback_logs.append(rec)
    return {'status': 'ok'}

@app.get('/api/prefs/{user_id}')
async def get_user_prefs(user_id: str):
    """Récupère les préférences utilisateur"""
    prefs = user_prefs.get(user_id)
    return {'prefs': prefs}

@app.post('/api/prefs/{user_id}')
async def save_user_prefs(user_id: str, req: Request):
    """Sauvegarde les préférences utilisateur"""
    data = await req.json()
    user_prefs.set(user_id, data)
    return {'success': True}


# ============================================================================
# CREATIVE STORAGE ENDPOINTS
# ============================================================================

@app.post('/api/creations/journal')
async def save_journal_entry(req: Request):
    """Sauvegarde une entrée de journal"""
    data = await req.json()
    user_id = data.get('user_id')
    content = data.get('content')
    prompt = data.get('prompt')
    method = data.get('therapeutic_method')

    entry = creative_storage.save_journal_entry(user_id, content, prompt, method)
    return {'success': True, 'entry': entry}


@app.post('/api/creations/narrative')
async def save_narrative(req: Request):
    """Sauvegarde un narratif thérapeutique"""
    data = await req.json()
    user_id = data.get('user_id')
    title = data.get('title', 'Sans titre')
    content = data.get('content')
    narrative_type = data.get('narrative_type', 'reconstruction_temporelle')

    narrative = creative_storage.save_narrative(user_id, title, content, narrative_type)
    return {'success': True, 'narrative': narrative}


@app.post('/api/creations/poem')
async def save_poem(req: Request):
    """Sauvegarde un poème"""
    data = await req.json()
    user_id = data.get('user_id')
    title = data.get('title', 'Sans titre')
    content = data.get('content')
    poem_style = data.get('poem_style')
    ai_assisted = data.get('ai_assisted', False)

    poem = creative_storage.save_poem(user_id, title, content, poem_style, ai_assisted)
    return {'success': True, 'poem': poem}


@app.post('/api/creations/ritual')
async def save_ritual(req: Request):
    """Sauvegarde un rituel d'écriture"""
    data = await req.json()
    user_id = data.get('user_id')
    title = data.get('title')
    description = data.get('description')
    frequency = data.get('frequency', 'ponctuel')

    ritual = creative_storage.save_ritual(user_id, title, description, frequency)
    return {'success': True, 'ritual': ritual}


@app.get('/api/recent-entries/{user_id}')
async def get_recent_journal_entries(user_id: str, limit: int = 10):
    """Récupère les dernières entrées de journal pour contexte historique"""
    try:
        creations = creative_storage.get_all_creations(user_id, 'journal')
        recent = sorted(creations, key=lambda x: x.get('created_at', ''), reverse=True)[:limit]
        
        # Extraire contenu + metadata
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
        logger.error(f"Erreur chargement récentes entrées: {e}")
        return {'entries': [], 'count': 0}


@app.post('/api/analyze-context')
async def analyze_context(req: Request):
    """
    Analyse le contexte du message utilisateur et retourne des prompts personnalisés
    
    Request body:
    {
        "user_id": "...",
        "current_message": "...",
        "tool": "journal|narrative|poem|ritual",
        "conversation_history": [{"content": "...", "created_at": "..."}, ...]
    }
    
    Returns:
    {
        "recommended_prompts": ["prompt1", "prompt2", ...],
        "personalization_context": "...",
        "detected_method": "journaling_expressif",
        "variation": "journal_guide_recit",
        "confidence": 0.85
    }
    """
    try:
        data = await req.json()
        user_id = data.get('user_id')
        current_message = data.get('current_message', '')
        tool = data.get('tool', 'journal')
        conversation_history = data.get('conversation_history', [])
        
        # Validation minimale
        if not user_id:
            raise HTTPException(400, 'User ID required')

        # Récupérer le profil utilisateur pour contexte
        user_profile = profiles.get(user_id) or {}

        # Appeler l'AI Engine pour détection avancée (with timeout and graceful fallback)
        detection_response = None
        try:
            detection_response = await asyncio.wait_for(
                _call_ai_engine_detection(
                    user_id=user_id,
                    message=current_message,
                    conversation_history=conversation_history,
                    user_state=user_profile.get('state', {})
                ),
                timeout=6.0
            )
        except asyncio.TimeoutError:
            logger.warning('AI Engine detection timed out')
            detection_response = None
        except Exception as e:
            logger.warning(f'AI Engine detection error: {e}')
            detection_response = None
        
        if not detection_response:
            return {
                'recommended_prompts': _get_default_prompts(tool),
                'personalization_context': f"Bienvenue dans votre espace {tool}.",
                'detected_method': None,
                'variation': None,
                'confidence': 0.0
            }
        
        # Générer les prompts personnalisés basés sur la détection
        signals = detection_response.get('signals', [])
        recommended_prompts = _generate_personalized_prompts(
            tool=tool,
            signals=signals,
            current_message=current_message,
            user_profile=user_profile
        )
        
        # Générer contexte personnalisé
        personalization_context = _generate_personalization_context(
            signals=signals,
            tool=tool,
            user_profile=user_profile
        )
        
        primary_signal = signals[0] if signals else None
        
        return {
            'recommended_prompts': recommended_prompts,
            'personalization_context': personalization_context,
            'detected_method': primary_signal.get('method') if primary_signal else None,
            'variation': primary_signal.get('recommended_variation') if primary_signal else None,
            'confidence': primary_signal.get('confidence', 0.0) if primary_signal else 0.0,
            'indicators': primary_signal.get('indicators', []) if primary_signal else []
        }
        
    except Exception as e:
        logger.error(f"Erreur analyse contextuelle: {e}")
        return {
            'recommended_prompts': _get_default_prompts(tool),
            'personalization_context': "Continuez à explorer vos pensées...",
            'detected_method': None,
            'variation': None,
            'confidence': 0.0,
            'error': str(e)
        }


@app.get('/api/creations/{user_id}')
async def get_user_creations(user_id: str, creation_type: str = None):
    """Récupère les créations d'un utilisateur"""
    creations = creative_storage.get_all_creations(user_id, creation_type)
    return {'creations': creations, 'count': len(creations)}


#


# ============================================================================
# RESOURCES CATALOG ENDPOINTS
# ============================================================================

@app.get('/api/resources')
async def get_all_resources():
    """Liste toutes les ressources"""
    resources = resources_catalog.get_all_resources()
    return {
        'resources': [
            {
                'id': r.id,
                'name': r.name,
                'type': r.type,
                'category': r.category,
                'description': r.description,
                'url': r.url,
                'evidence_level': r.evidence_level
            }
            for r in resources
        ]
    }


@app.get('/api/resources/category/{category}')
async def get_resources_by_category(category: str):
    """Ressources par catégorie"""
    resources = resources_catalog.get_resources_by_category(category)
    return {
        'category': category,
        'resources': [
            {
                'id': r.id,
                'name': r.name,
                'description': r.description,
                'url': r.url,
                'strengths': r.strengths,
                'best_for': r.best_for
            }
            for r in resources
        ]
    }


@app.get('/api/resources/{resource_id}')
async def get_resource_detail(resource_id: str):
    """Détail d'une ressource"""
    resource = resources_catalog.get_resource(resource_id)
    if not resource:
        raise HTTPException(404, 'Resource not found')

    return {
        'id': resource.id,
        'name': resource.name,
        'type': resource.type,
        'category': resource.category,
        'url': resource.url,
        'description': resource.description,
        'strengths': resource.strengths,
        'limitations': resource.limitations,
        'evidence_level': resource.evidence_level,
        'content_warnings': resource.content_warnings,
        'best_for': resource.best_for
    }


@app.get('/api/chat/history/{user_id}')
async def get_chat_history(user_id: str, limit: int = 50):
    """Récupère l'historique des conversations"""
    logs = session_logs.get(user_id) or {'logs': []}
    history = logs.get('logs', [])[-limit:]

    return {
        'user_id': user_id,
        'messages': history,
        'count': len(history)
    }


@app.post('/api/voice_input')
async def voice_input(request: Request):
    """Traite l'audio utilisateur → texte (proxy vers Voice Service puis fallback local Whisper)
    Attendu: { audio_data: base64, user_id: str }
    """
    try:
        data = await request.json()
        audio_base64 = data.get('audio_data') or data.get('audio_base64')
        user_id = data.get('user_id')

        if not audio_base64:
            raise HTTPException(400, 'Audio data required')

        # Essayer d'appeler le Voice Service local
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                r = await client.post(f"{settings.VOICE_SERVICE_URL}/api/transcribe", json={
                    'audio_base64': audio_base64,
                    'user_id': user_id
                })
            if r.status_code == 200:
                return r.json()
            else:
                logger.warning(f"Voice service transcribe failed: {r.status_code}")
        except Exception as e:
            logger.warning(f"Voice service unavailable: {e}")

        # Fallback local whisper if available
        try:
            import base64 as _b64
            import tempfile as _tmp
            import os as _os
            audio_bytes = _b64.b64decode(audio_base64)
            with _tmp.NamedTemporaryFile(delete=False, suffix='.wav') as tf:
                tf.write(audio_bytes)
                tmp_path = tf.name
            try:
                import whisper
                model = whisper.load_model('base')
                res = model.transcribe(tmp_path, language='fr')
                return {'text': res.get('text', ''), 'language': res.get('language', 'fr'), 'confidence': res.get('confidence', 0.8)}
            finally:
                try:
                    if _os.path.exists(tmp_path):
                        _os.remove(tmp_path)
                except Exception:
                    pass
        except Exception as e:
            logger.error(f"Voice input processing failed: {e}")
            raise HTTPException(500, 'Voice processing failed')


@app.post('/api/voice_output')
async def voice_output(request: Request):
    """Synthèse texte → audio (TTS). Proxy vers Voice Service /api/synthesize et fallback local Edge TTS.
    Reçoit: { text: str, voice_id?: str, speed?: float, pitch?: float }
    Retourne: { audio_data: base64, voice_id, text_length }
    """
    try:
        data = await request.json()
        text = data.get('text')
        voice_id = data.get('voice_id', 'fr-FR-DeniseNeural')
        speed = float(data.get('speed', 1.0))
        pitch = float(data.get('pitch', 1.0))

        if not text:
            raise HTTPException(400, 'Text required')

        # Essayer voice service
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                r = await client.post(f"{settings.VOICE_SERVICE_URL}/api/synthesize", json={
                    'text': text,
                    'voice_config': {
                        'voice_id': voice_id,
                        'speed': speed,
                        'pitch': pitch
                    }
                })
            if r.status_code == 200:
                payload = r.json()
                return {'audio_data': payload.get('audio_base64'), 'voice_id': voice_id, 'text_length': len(text)}
            else:
                logger.warning(f"Voice service synthesize failed: {r.status_code}")
        except Exception as e:
            logger.warning(f"Voice service unavailable for synthesize: {e}")

        # Fallback: call local TTS engine via direct import (Edge)
        try:
            from ..voice_service.app.tts_engine import TTSEngine
        except Exception:
            # Path import fallback to package style
            try:
                from backend.voice_service.app.tts_engine import TTSEngine
            except Exception:
                TTSEngine = None

        if TTSEngine:
            try:
                tts = TTSEngine()
                audio_b64 = await tts.synthesize(text, voice_id, speed, pitch)
                return {'audio_data': audio_b64, 'voice_id': voice_id, 'text_length': len(text)}
            except Exception as e:
                logger.error(f"Local TTS fallback failed: {e}")

        raise HTTPException(500, 'TTS synthesis failed')

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Voice output error: {e}")
        raise HTTPException(500, 'TTS synthesis failed')


# ============================================================================
# HELPERS FOR PERSONALIZED GUIDANCE
# ============================================================================

async def _call_ai_engine_detection(
    user_id: str,
    message: str,
    conversation_history: List[Dict],
    user_state: Dict
) -> Dict:
    """Appelle l'AI Engine pour la détection avancée"""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                f"{settings.AI_ENGINE_URL}/detect",
                json={
                    "user_message": message,
                    "user_state": user_state,
                    "conversation_history": conversation_history,
                    "therapeutic_context": {}
                }
            )
            if response.status_code == 200:
                return response.json()
            else:
                logger.warning(f"AI Engine détection échouée: {response.status_code}")
                return None
    except Exception as e:
        logger.error(f"Erreur appel AI Engine: {e}")
        return None


def _get_default_prompts(tool: str) -> List[str]:
    """Prompts par défaut si pas de détection"""
    defaults = {
        'journal': [
            "Qu'est-ce qui m'a le plus marqué aujourd'hui ?",
            "Qu'aurais-je voulu exprimer ?",
            "Comment je me sens en ce moment ?"
        ],
        'narrative': [
            "Racontez l'histoire de ce moment important",
            "Comment cette expérience vous a changé ?",
            "Quel sens donnez-vous à cela ?"
        ],
        'poem': [
            "Utilisez des métaphores pour exprimer",
            "Écrivez ce que vous ne pouvez pas dire autrement",
            "Laissez les mots vous guider librement"
        ],
        'ritual': [
            "Créez un rituel symbolique",
            "Définissez une pratique régulière",
            "Établissez un moment de reconnexion"
        ]
    }
    return defaults.get(tool, [])


def _generate_personalized_prompts(
    tool: str,
    signals: List[Dict],
    current_message: str,
    user_profile: Dict
) -> List[str]:
    """
    Génère des prompts personnalisés basés sur les signaux de détection
    
    Adapte les suggestions selon:
    - La méthode détectée (journaling, ACT, TIPI, etc.)
    - La variation recommandée
    - Le contenu actuel du message
    - L'historique utilisateur
    """
    prompts = []
    
    if not signals:
        return _get_default_prompts(tool)
    
    primary_signal = signals[0]
    method = primary_signal.get('method', '')
    variation = primary_signal.get('recommended_variation', '')
    
    # Prompts basés sur méthode détectée + variation
    if method == 'journaling_expressif':
        if variation == 'lettre_non_envoyee':
            prompts = [
                "Écrivez une lettre à cette personne ou à cette situation...",
                "Dites tout ce que vous auriez voulu dire...",
                "Laissez vos vraies émotions s'exprimer",
                "Commencez par 'J'aurais voulu...'",
                "Qu'est-ce que vous regrettez de ne pas avoir dit ?"
            ]
        elif variation == 'journal_guide_recit':
            prompts = [
                "Racontez cette histoire du début à la fin",
                "Comment cette expérience s'est-elle déroulée ?",
                "Décrivez les moments clés",
                "Qu'avez-vous découvert au cours de ce parcours ?",
                "Comment cette histoire continue-t-elle aujourd'hui ?"
            ]
        elif variation == 'gratitude_post_traumatique':
            prompts = [
                "Malgré la douleur, y a-t-il quelque chose pour lequel vous êtes reconnaissant ?",
                "Qu'avez-vous appris qui vous a fortifié ?",
                "Qui ou qu'est-ce qui vous a soutenu ?",
                "Quels petits moments de lumière avez-vous trouvés ?"
            ]
    
    elif method == 'tipi':
        prompts = [
            "Où sentez-vous cette émotion dans votre corps ?",
            "Respirez doucement avec cette sensation...",
            "Observez-la sans la combattre",
            "Que vous dit votre corps en ce moment ?"
        ]
    
    elif method == 'act':
        prompts = [
            "Qu'est-ce qui est vraiment important pour vous ?",
            "Malgré cette douleur, qu'aimeriez-vous accomplir ?",
            "Vers quelles valeurs voulez-vous avancer ?",
            "Comment cette difficulté peut-elle devenir une opportunité ?"
        ]
    
    # Fallback aux prompts par défaut
    if not prompts:
        prompts = _get_default_prompts(tool)
    
    # Limiter à 5 suggestions
    return prompts[:5]


def _generate_personalization_context(
    signals: List[Dict],
    tool: str,
    user_profile: Dict
) -> str:
    """Génère le contexte personnalisé affiché à l'utilisateur"""
    
    if not signals:
        return f"Bienvenue dans votre espace d'{tool}. Prenez votre temps pour explorer."
    
    primary_signal = signals[0]
    method = primary_signal.get('method', '')
    confidence = primary_signal.get('confidence', 0)
    indicators = primary_signal.get('indicators', [])
    
    # Générer texte de contexte
    context_parts = []
    
    if method == 'journaling_expressif':
        context_parts.append("📝 J'ai détecté des non-dits et une charge émotionnelle.")
        context_parts.append("L'écriture expressive peut vous aider à transformer cette charge en compréhension.")
    
    elif method == 'tipi':
        context_parts.append("🫁 Je sens une activation émotionnelle importante.")
        context_parts.append("Commencez par explorer cette sensation dans votre corps.")
    
    elif method == 'act':
        context_parts.append("🎯 Je détecte une tension entre votre douleur et vos valeurs.")
        context_parts.append("Explorons comment avancer malgré cette douleur.")
    
    elif method == 'continuing_bonds':
        context_parts.append("💫 Je sens une recherche de connexion et de sens.")
        context_parts.append("Votre lien peut être transformé et honorer votre parcours.")
    
    # Ajouter niveau de confiance
    if confidence >= 0.8:
        context_parts.append("Cette détection est très fiable pour vous.")
    elif confidence >= 0.6:
        context_parts.append("Cette détection correspond à ce que vous me dites.")
    
    return " ".join(context_parts) if context_parts else "Continuez à explorer vos pensées..."

