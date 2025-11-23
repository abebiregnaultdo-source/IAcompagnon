from __future__ import annotations
from typing import Dict, Any, List
import os, json

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
MEM_PATH = os.path.join(BASE_DIR, 'backend', 'ai-engine', 'memory_store.jsonl')
DATA_DIR = os.path.join(BASE_DIR, 'backend', 'ai-engine', 'datasets')
KNOW_PATH = os.path.join(DATA_DIR, 'knowledge_dataset.jsonl')
EMPA_PATH = os.path.join(DATA_DIR, 'empathy_dataset.jsonl')

os.makedirs(DATA_DIR, exist_ok=True)


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


def build_datasets():
    logs = _iter_logs()
    # Placeholder: build minimal pairs from logs. Real implementation would join with stored micro-protocols and outputs.
    # For now we only synthesize pseudo-entries to structure files.
    with open(KNOW_PATH, 'w', encoding='utf-8') as fk, open(EMPA_PATH, 'w', encoding='utf-8') as fe:
        for e in logs:
            intention_id = e.get('intention_id','')
            technique = e.get('technique','')
            scores = e.get('scores') or {}
            weight = max(0.1, (100 - int(scores.get('detresse', 50))) / 100.0)
            # knowledge pair
            fk.write(json.dumps({
                'prompt_clinique': {
                    'intention_id': intention_id,
                    'technique': technique,
                    'phase': e.get('phase')
                },
                'micro_protocole_valide': '',
                'poids': weight
            }, ensure_ascii=False) + "\n")
            # empathy pair
            fe.write(json.dumps({
                'micro_protocole': '',
                'reponse_non_directive': '',
                'poids': weight
            }, ensure_ascii=False) + "\n")
    return {'knowledge_path': KNOW_PATH, 'empathy_path': EMPA_PATH}

if __name__ == '__main__':
    build_datasets()
