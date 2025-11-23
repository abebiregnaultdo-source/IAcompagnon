from __future__ import annotations
from typing import Dict, Any, Optional
import os, json

INTENTIONS_CACHE: Dict[str, Dict[str, Any]] = {}

def _base_dir() -> str:
    return os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))

def load_intentions(module: str = 'grief') -> Dict[str, Any]:
    global INTENTIONS_CACHE
    if module in INTENTIONS_CACHE:
        return INTENTIONS_CACHE[module]
    base = _base_dir()
    path = os.path.join(base, 'backend', 'modules', module, 'intentions.json')
    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception:
        data = {}
    INTENTIONS_CACHE[module] = data
    return data

def reload_intentions(module: str = 'grief') -> None:
    if module in INTENTIONS_CACHE:
        del INTENTIONS_CACHE[module]
    load_intentions(module)

def _eval_condition(expr: str, ctx: Dict[str, Any]) -> bool:
    try:
        return bool(eval(expr, {"__builtins__": {}}, ctx))
    except Exception:
        return False

def eligible_intentions(user_state: Dict[str, Any], module: str = 'grief') -> list[Dict[str, Any]]:
    intents = load_intentions(module)
    out = []
    for _id, it in intents.items():
        cond = it.get('entry_condition') or ''
        if not cond or _eval_condition(cond, user_state):
            it2 = dict(it)
            it2['id'] = it.get('id', _id)
            out.append(it2)
    return out

def build_prompt(method: Dict[str, Any], user_state: Dict[str, Any], policy: Dict[str, Any]) -> str:
    safety_rules = method.get('safety', '')
    if policy.get('no_grief_cause'):
        safety_rules += "; ne pas évoquer la cause du deuil en phase d'ancrage"
    tone = policy.get('tone', 'neutre')
    rhythm = policy.get('rhythm', 2)
    return (
        "Tu es une IA thérapeutique empathique et non-directive.\n"
        f"Intention clinique: {method.get('intent','')}\n"
        f"Sécurité: {safety_rules}\n"
        f"État utilisateur: {user_state}\n"
        f"Consignes: Conduis une micro-séquence (2-3 phrases), dans un ton {tone}, adaptée à cet instant.\n"
        "Évite les scripts figés; reformule naturellement; ajuste au rythme; n'interprète pas."
    )

def run_intention(user_state: Dict[str, Any], policy: Dict[str, Any], module: str = 'grief') -> Optional[Dict[str, Any]]:
    cands = eligible_intentions(user_state, module)
    if not cands:
        return None
    # simple choix: première intention éligible
    method = cands[0]
    prompt = build_prompt(method, user_state, policy)

    # Appel LLM (fallback stub si clé absente)
    text = None
    try:
        from .llm_client import call_llm
        text = call_llm(prompt)
    except Exception:
        pass
    if not text:
        pre = {
            'lent': "(ton doux, phrases courtes) ",
            'neutre': "",
            'enveloppant': "(ton contenant et rassurant) ",
        }.get(policy.get('tone','neutre'), "")
        text = pre + "Je reste avec toi. Observe simplement ce qui est là en ce moment. Si une sensation apparaît, laisse-la exister quelques instants, sans chercher à changer."

    return {
        'text': text,
        'method_id': method['id'],
        'method_type': 'intention',
        'prompt_used': prompt,
        'model_used': os.getenv('KNOWLEDGE_MODEL', os.getenv('MODEL_NAME', 'gpt-4o-mini')),
        'emotion_context': {
            'detresse': int(user_state.get('detresse', 50)),
            'espoir': int(user_state.get('espoir', 50)),
            'energie': int(user_state.get('energie', 50)),
            'phase': user_state.get('phase', 'ancrage')
        }
    }
