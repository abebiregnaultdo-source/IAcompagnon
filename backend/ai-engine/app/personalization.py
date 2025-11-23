from __future__ import annotations
from typing import Dict, Any, Optional, Tuple
import os, json, time, hashlib

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
STORE_DIR = os.path.join(BASE_DIR, 'backend', 'ai-engine', 'user_store')
PROFILE_PATH = os.path.join(STORE_DIR, 'profiles.json')

os.makedirs(STORE_DIR, exist_ok=True)
if not os.path.exists(PROFILE_PATH):
    with open(PROFILE_PATH, 'w', encoding='utf-8') as f:
        json.dump({}, f)


def _load_profiles() -> Dict[str, Any]:
    try:
        with open(PROFILE_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return {}


def _save_profiles(data: Dict[str, Any]) -> None:
    with open(PROFILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def normalize_user_id(raw_id: str) -> str:
    # Pseudonymize to avoid storing plain identifiers
    return hashlib.sha256((raw_id or '').encode('utf-8')).hexdigest()[:32]


def record_scores(user_id_hash: str, scores: Dict[str, int], ts: Optional[float] = None):
    data = _load_profiles()
    prof = data.get(user_id_hash, { 'history': [], 'prefs': {}, 'feedbacks': [] })
    prof['history'].append({
        'ts': ts or time.time(),
        'scores': {
            'detresse': int(scores.get('detresse', 0)),
            'espoir': int(scores.get('espoir', 0)),
            'energie': int(scores.get('energie', 0)),
        }
    })
    data[user_id_hash] = prof
    _save_profiles(data)
    return prof


def record_explicit_feedback(user_id_hash: str, target: Dict[str, Any], thumbs_up: bool, ts: Optional[float] = None):
    data = _load_profiles()
    prof = data.get(user_id_hash, { 'history': [], 'prefs': {}, 'feedbacks': [] })
    prof['feedbacks'].append({
        'type': 'explicit', 'thumbs_up': bool(thumbs_up), 'target': target, 'ts': ts or time.time()
    })
    # simple preference shift
    tone = target.get('tone')
    if tone:
        pref = prof.setdefault('prefs', {}).setdefault('tone_scores', {})
        pref[tone] = int(pref.get(tone, 0)) + (1 if thumbs_up else -1)
    tech = target.get('technique')
    if tech:
        pref = prof.setdefault('prefs', {}).setdefault('technique_scores', {})
        pref[tech] = int(pref.get(tech, 0)) + (1 if thumbs_up else -1)
    data[user_id_hash] = prof
    _save_profiles(data)
    return prof


def record_implicit_feedback(user_id_hash: str, target: Dict[str, Any], reading_ms: Optional[int], response_latency_ms: Optional[int], ts: Optional[float] = None):
    data = _load_profiles()
    prof = data.get(user_id_hash, { 'history': [], 'prefs': {}, 'feedbacks': [] })
    prof['feedbacks'].append({
        'type': 'implicit',
        'reading_ms': int(reading_ms or 0),
        'response_latency_ms': int(response_latency_ms or 0),
        'target': target,
        'ts': ts or time.time()
    })
    # heuristic reward shaping
    if target.get('tone'):
        pref = prof.setdefault('prefs', {}).setdefault('tone_scores', {})
        delta = 1 if (reading_ms or 0) > 4000 else 0
        delta += 1 if (response_latency_ms or 0) < 60000 else 0
        pref[target['tone']] = int(pref.get(target['tone'], 0)) + delta
    data[user_id_hash] = prof
    _save_profiles(data)
    return prof


def suggest_action(user_profile: Dict[str, Any], user_state: Dict[str, Any]) -> Tuple[str, str, str]:
    # Returns (technique, tone, length_class)
    # length_class: 'short'|'medium'|'long'
    tone_scores = (user_profile.get('prefs', {}) or {}).get('tone_scores', {})
    technique_scores = (user_profile.get('prefs', {}) or {}).get('technique_scores', {})

    # choose tone
    tone = max(tone_scores, key=tone_scores.get) if tone_scores else user_state.get('tone', 'neutre')
    # choose technique (fallback TIPI in early ancrage)
    if technique_scores:
        technique = max(technique_scores, key=technique_scores.get)
    else:
        technique = 'TIPI' if user_state.get('phase') == 'ancrage' else 'logotherapie'
    # choose length
    detresse = int(user_state.get('detresse', 50))
    length_class = 'short' if detresse >= 70 else ('medium' if detresse >= 40 else 'short')
    return technique, tone, length_class


def get_profile(user_id_hash: str) -> Dict[str, Any]:
    return _load_profiles().get(user_id_hash, { 'history': [], 'prefs': {}, 'feedbacks': [] })
