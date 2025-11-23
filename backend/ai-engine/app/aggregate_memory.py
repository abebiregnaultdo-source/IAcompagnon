from __future__ import annotations
from typing import Dict, Any, List
import os, json

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
MEM_PATH = os.path.join(BASE_DIR, 'backend', 'ai-engine', 'memory_store.jsonl')
AGG_DIR = os.path.join(BASE_DIR, 'backend', 'ai-engine', 'aggregates')
AGG_PATH = os.path.join(AGG_DIR, 'clinical_patterns.json')

os.makedirs(AGG_DIR, exist_ok=True)


def _iter_logs() -> List[Dict[str, Any]]:
    if not os.path.exists(MEM_PATH):
        return []
    out: List[Dict[str, Any]] = []
    with open(MEM_PATH, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                out.append(json.loads(line))
            except Exception:
                continue
    return out


def aggregate() -> Dict[str, Any]:
    logs = _iter_logs()
    # Simple metrics: average (proxy) effectiveness by technique per phase based on scores if present
    tech_phase: Dict[str, Dict[str, List[float]]] = {}
    # transitions placeholder (not deeply implemented without before/after chains)
    transitions: Dict[str, Dict[str, int]] = {}

    for e in logs:
        phase = e.get('phase')
        tech = e.get('technique')
        scores = e.get('scores') or {}
        if not phase or not tech:
            continue
        eff = (100 - int(scores.get('detresse', 50)))  # crude proxy; higher is better
        tech_phase.setdefault(phase, {}).setdefault(tech, []).append(eff)

    technique_phase_effectiveness: Dict[str, Dict[str, float]] = {}
    for phase, per_tech in tech_phase.items():
        technique_phase_effectiveness[phase] = {
            tech: (sum(vals)/len(vals) if vals else 0.0) for tech, vals in per_tech.items()
        }

    agg = {
        'technique_phase_effectiveness': technique_phase_effectiveness,
        'transitions': transitions,
    }
    with open(AGG_PATH, 'w', encoding='utf-8') as f:
        json.dump(agg, f, ensure_ascii=False, indent=2)
    return agg

if __name__ == '__main__':
    aggregate()
