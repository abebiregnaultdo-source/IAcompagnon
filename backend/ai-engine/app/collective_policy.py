from __future__ import annotations
from typing import Dict, Any, Tuple
import os, json

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
AGG_DIR = os.path.join(BASE_DIR, 'backend', 'ai-engine', 'aggregates')
AGG_PATH = os.path.join(AGG_DIR, 'clinical_patterns.json')

os.makedirs(AGG_DIR, exist_ok=True)
if not os.path.exists(AGG_PATH):
    with open(AGG_PATH, 'w', encoding='utf-8') as f:
        json.dump({ 'technique_phase_effectiveness': {}, 'transitions': {} }, f)


def _load_patterns() -> Dict[str, Any]:
    try:
        with open(AGG_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return { 'technique_phase_effectiveness': {}, 'transitions': {} }


def suggest_from_collective(user_state: Dict[str, Any]) -> Tuple[str, float]:
    patterns = _load_patterns()
    phase = user_state.get('phase', 'ancrage')
    eff = patterns.get('technique_phase_effectiveness', {}).get(phase, {})
    if not eff:
        return 'TIPI', 0.0
    # choose best technique for phase
    tech = max(eff, key=lambda k: eff[k])
    score = float(eff.get(tech, 0.0))
    return tech, score
