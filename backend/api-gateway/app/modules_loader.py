from __future__ import annotations
from pathlib import Path
from typing import Dict, Any
import importlib.util
import json

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
MODULES_DIR = BASE_DIR / 'backend' / 'modules'

class ModulesRegistry:
    def __init__(self):
        self.modules: Dict[str, Dict[str, Any]] = {}
        self.config_path = MODULES_DIR / 'modules.json'

    def load(self):
        with self.config_path.open('r', encoding='utf-8') as f:
            conf = json.load(f)
        self.modules = conf

    def get_active_module(self) -> str | None:
        for k, v in self.modules.items():
            if v.get('active'):
                return k
        return None

    def get_module(self, key: str) -> Dict[str, Any] | None:
        return self.modules.get(key)

    def import_onboarding(self, path_str: str):
        path = (BASE_DIR / path_str.lstrip('/')).resolve()
        spec = importlib.util.spec_from_file_location('onboarding_module', path)
        module = importlib.util.module_from_spec(spec)
        assert spec and spec.loader
        spec.loader.exec_module(module)  # type: ignore
        return module

registry = ModulesRegistry()
