"""
learning_store — accès à l'état d'apprentissage/personnalisation (scalabilité).

Remplace les fichiers locaux (profiles.json, ietg_state.json) par la table Supabase
`learning_state` (clé-valeur JSONB). Rend le backend STATELESS : multi-instance OK,
plus de perte au redéploiement.

Best-effort : si Supabase est indisponible, on retombe sur un fichier local pour
ne jamais bloquer la réponse à l'utilisateur (le fichier reste un simple cache de
secours, pas la source de vérité).

Clés : 'ietg' (état global), 'perso:<user_id_hash>' (profil d'apprentissage).
"""
from __future__ import annotations
from typing import Dict, Any, Optional
import os
import json
import logging

logger = logging.getLogger(__name__)

# Cache de secours local (utilisé seulement si Supabase échoue).
_FALLBACK_DIR = os.path.join(os.path.dirname(__file__), 'user_store')
os.makedirs(_FALLBACK_DIR, exist_ok=True)


def _supabase():
    """Récupère le client Supabase du backend (service_role)."""
    try:
        from .main import get_supabase
        return get_supabase()
    except Exception:
        return None


def _fallback_path(key: str) -> str:
    safe = key.replace(':', '_').replace('/', '_')
    return os.path.join(_FALLBACK_DIR, f'ls_{safe}.json')


def get_state(key: str, default: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Lit une valeur de learning_state (Supabase d'abord, fichier en secours)."""
    if default is None:
        default = {}
    sb = _supabase()
    if sb is not None:
        try:
            res = sb.table('learning_state').select('value').eq('key', key).limit(1).execute()
            rows = res.data or []
            if rows:
                return rows[0].get('value') or default
            return default
        except Exception as e:
            logger.warning(f"learning_store.get_state Supabase KO ({e}), fallback fichier")
    # Fallback fichier
    try:
        with open(_fallback_path(key), 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return default


def set_state(key: str, value: Dict[str, Any]) -> None:
    """Écrit une valeur dans learning_state (upsert). Best-effort, ne lève jamais."""
    sb = _supabase()
    if sb is not None:
        try:
            sb.table('learning_state').upsert(
                {'key': key, 'value': value},
                on_conflict='key',
            ).execute()
            return
        except Exception as e:
            logger.warning(f"learning_store.set_state Supabase KO ({e}), fallback fichier")
    # Fallback fichier
    try:
        with open(_fallback_path(key), 'w', encoding='utf-8') as f:
            json.dump(value, f, ensure_ascii=False)
    except Exception as e:
        logger.warning(f"learning_store.set_state fichier KO: {e}")
