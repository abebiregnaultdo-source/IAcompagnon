from __future__ import annotations
from pathlib import Path
from typing import Any, Dict, List
from .security import CryptoBox

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
DATA_DIR = BASE_DIR / 'data'
DATA_DIR.mkdir(parents=True, exist_ok=True)

class EncryptedKV:
    def __init__(self, name: str, box: CryptoBox):
        self.path = DATA_DIR / f'{name}.json'
        self.box = box
        if not self.path.exists():
            self.path.write_text('{}', encoding='utf-8')

    def get_all(self) -> Dict[str, Any]:
        raw = self.path.read_text(encoding='utf-8')
        data = {} if not raw.strip() else __import__('json').loads(raw)
        out: Dict[str, Any] = {}
        for k, v in data.items():
            try:
                out[k] = self.box.decrypt(v)
            except Exception:
                continue
        return out

    def put(self, key: str, value: Dict[str, Any]) -> None:
        raw = self.path.read_text(encoding='utf-8')
        data = {} if not raw.strip() else __import__('json').loads(raw)
        data[key] = self.box.encrypt(value)
        self.path.write_text(__import__('json').dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')

    def get(self, key: str) -> Dict[str, Any] | None:
        raw = self.path.read_text(encoding='utf-8')
        data = {} if not raw.strip() else __import__('json').loads(raw)
        blob = data.get(key)
        if not blob:
            return None
        try:
            return self.box.decrypt(blob)
        except Exception:
            return None

class PlainLog:
    def __init__(self, name: str):
        self.path = DATA_DIR / f'{name}.jsonl'
        if not self.path.exists():
            self.path.touch()

    def append(self, record: Dict[str, Any]) -> None:
        line = __import__('json').dumps(record, ensure_ascii=False)
        with self.path.open('a', encoding='utf-8') as f:
            f.write(line + '\n')

    def read_all(self) -> List[Dict[str, Any]]:
        out: List[Dict[str, Any]] = []
        if not self.path.exists():
            return out
        for line in self.path.read_text(encoding='utf-8').splitlines():
            if not line.strip():
                continue
            try:
                out.append(__import__('json').loads(line))
            except Exception:
                continue
        return out
