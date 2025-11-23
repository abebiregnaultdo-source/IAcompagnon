from __future__ import annotations
from typing import Dict, Any, Optional
import json, os
from jinja2 import Template

INTERVENTIONS_CACHE: Dict[str, Dict[str, Any]] = {}

def _base_dir() -> str:
    return os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))

def load_interventions(module: str = 'grief') -> Dict[str, Any]:
    global INTERVENTIONS_CACHE
    if module in INTERVENTIONS_CACHE:
        return INTERVENTIONS_CACHE[module]
    base = _base_dir()
    path = os.path.join(base, 'backend', 'modules', module, 'interventions.json')
    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception:
        data = {}
    INTERVENTIONS_CACHE[module] = data
    return data

def reload_interventions(module: str = 'grief') -> None:
    if module in INTERVENTIONS_CACHE:
        del INTERVENTIONS_CACHE[module]
    load_interventions(module)

def render_dynamic_prompt(intervention: Dict[str, Any], user_state: Dict[str, Any]) -> str:
    tpl_lines = intervention.get('template')
    if not tpl_lines:
        # fallback legacy prompt/script
        for key in ('prompt','script'):
            val = intervention.get(key)
            if isinstance(val, list):
                return " ".join(val)
            if isinstance(val, str):
                return val
        return ''
    try:
        template = Template("\n".join(tpl_lines))
        return template.render(**user_state).strip()
    except Exception:
        return " ".join(tpl_lines)

def select_intervention(user_state: Dict[str, Any], module: str = 'grief', preferences: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
    interventions = load_interventions(module)
    phase = user_state.get('phase', 'ancrage')
    avoid_types = set((preferences or {}).get('avoid_types', []))
    # simple first-match selection honoring avoid_types
    for _id, itv in interventions.items():
        cond = itv.get('conditions', {})
        if cond.get('phase') != phase:
            continue
        if itv.get('type') in avoid_types:
            continue
        itv2 = dict(itv)
        itv2['id'] = itv.get('id', _id)
        return itv2
    # fallback: if all avoided, ignore avoid and return first
    for _id, itv in interventions.items():
        if itv.get('conditions', {}).get('phase') == phase:
            itv2 = dict(itv)
            itv2['id'] = itv.get('id', _id)
            return itv2
    return None

def execute_intervention(user_state: Dict[str, Any], module: str = 'grief', preferences: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    itv = select_intervention(user_state, module=module, preferences=preferences)
    if not itv:
        return { 'text': "Je reste là avec toi. Quand tu veux, on pose un repère simple: une inspiration douce et une expiration tranquille.", 'intervention_id': None }
    text = render_dynamic_prompt(itv, user_state)
    return { 'text': text, 'intervention_id': itv.get('id'), 'type': itv.get('type') }
