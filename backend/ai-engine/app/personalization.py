from __future__ import annotations
from typing import Dict, Any, Optional, Tuple
import os, json, time, hashlib

# Scalabilité : les profils d'apprentissage vivent maintenant dans Supabase
# (table learning_state), pas dans un fichier local qui casse en multi-instance.
# On stocke un profil PAR utilisateur sous la clé 'perso:<user_id_hash>' — ainsi
# deux utilisateurs n'écrivent jamais le même enregistrement (pas de concurrence).
from . import learning_store


def _perso_key(user_id_hash: str) -> str:
    return f'perso:{user_id_hash}'


def _get_profile(user_id_hash: str) -> Dict[str, Any]:
    """Profil d'apprentissage d'un utilisateur (history/prefs/feedbacks)."""
    return learning_store.get_state(_perso_key(user_id_hash),
                                    {'history': [], 'prefs': {}, 'feedbacks': []})


def _put_profile(user_id_hash: str, prof: Dict[str, Any]) -> None:
    learning_store.set_state(_perso_key(user_id_hash), prof)


def normalize_user_id(raw_id: str) -> str:
    # Pseudonymize to avoid storing plain identifiers
    return hashlib.sha256((raw_id or '').encode('utf-8')).hexdigest()[:32]


def record_scores(user_id_hash: str, scores: Dict[str, int], ts: Optional[float] = None):
    prof = _get_profile(user_id_hash)
    prof['history'].append({
        'ts': ts or time.time(),
        'scores': {
            'detresse': int(scores.get('detresse', 0)),
            'espoir': int(scores.get('espoir', 0)),
            'energie': int(scores.get('energie', 0)),
        }
    })
    # Borne l'historique pour ne pas faire grossir indéfiniment l'enregistrement.
    prof['history'] = prof['history'][-200:]
    _put_profile(user_id_hash, prof)
    return prof


def record_explicit_feedback(user_id_hash: str, target: Dict[str, Any], thumbs_up: bool, ts: Optional[float] = None):
    prof = _get_profile(user_id_hash)
    prof['feedbacks'].append({
        'type': 'explicit', 'thumbs_up': bool(thumbs_up), 'target': target, 'ts': ts or time.time()
    })
    prof['feedbacks'] = prof['feedbacks'][-200:]
    # simple preference shift
    tone = target.get('tone')
    if tone:
        pref = prof.setdefault('prefs', {}).setdefault('tone_scores', {})
        pref[tone] = int(pref.get(tone, 0)) + (1 if thumbs_up else -1)
    tech = target.get('technique')
    if tech:
        pref = prof.setdefault('prefs', {}).setdefault('technique_scores', {})
        pref[tech] = int(pref.get(tech, 0)) + (1 if thumbs_up else -1)
    _put_profile(user_id_hash, prof)
    return prof


def record_implicit_feedback(user_id_hash: str, target: Dict[str, Any], reading_ms: Optional[int], response_latency_ms: Optional[int], ts: Optional[float] = None):
    prof = _get_profile(user_id_hash)
    prof['feedbacks'].append({
        'type': 'implicit',
        'reading_ms': int(reading_ms or 0),
        'response_latency_ms': int(response_latency_ms or 0),
        'target': target,
        'ts': ts or time.time()
    })
    prof['feedbacks'] = prof['feedbacks'][-200:]
    # heuristic reward shaping
    if target.get('tone'):
        pref = prof.setdefault('prefs', {}).setdefault('tone_scores', {})
        delta = 1 if (reading_ms or 0) > 4000 else 0
        delta += 1 if (response_latency_ms or 0) < 60000 else 0
        pref[target['tone']] = int(pref.get(target['tone'], 0)) + delta
    _put_profile(user_id_hash, prof)
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
    return _get_profile(user_id_hash)
