"""
Système de stockage pour créations utilisateur
- Journal guidé
- Narratifs thérapeutiques
- Poèmes
- Rituels d'écriture
- Coloriages
"""

from pathlib import Path
from typing import Dict, Any, List, Optional
import json
from datetime import datetime
import hashlib

BASE_DIR = Path(__file__).parent.parent.parent.parent
CREATIVE_STORE_DIR = BASE_DIR / 'backend' / 'api-gateway' / 'creative_store'
CREATIVE_STORE_DIR.mkdir(exist_ok=True)


class CreativeStorage:
    """Stockage des créations utilisateur"""
    
    def __init__(self):
        self.store_dir = CREATIVE_STORE_DIR
    
    def _get_user_file(self, user_id: str) -> Path:
        """Fichier JSON pour un utilisateur"""
        user_hash = hashlib.sha256(user_id.encode()).hexdigest()[:16]
        return self.store_dir / f"{user_hash}_creations.json"
    
    def _load_user_creations(self, user_id: str) -> Dict:
        """Charge les créations d'un utilisateur"""
        file_path = self._get_user_file(user_id)
        if not file_path.exists():
            return {
                "journal_entries": [],
                "narratives": [],
                "poems": [],
                "rituals": [],
                "colorings": []
            }
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return {
                "journal_entries": [],
                "narratives": [],
                "poems": [],
                "rituals": [],
                "colorings": []
            }
    
    def _save_user_creations(self, user_id: str, data: Dict):
        """Sauvegarde les créations"""
        file_path = self._get_user_file(user_id)
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    def save_journal_entry(self, user_id: str, content: str, 
                          prompt: Optional[str] = None,
                          therapeutic_method: Optional[str] = None) -> Dict:
        """Sauvegarde une entrée de journal"""
        data = self._load_user_creations(user_id)
        
        entry = {
            "id": datetime.now().isoformat(),
            "type": "journal",
            "content": content,
            "prompt": prompt,
            "therapeutic_method": therapeutic_method,
            "created_at": datetime.now().isoformat(),
            "word_count": len(content.split())
        }
        
        data["journal_entries"].append(entry)
        self._save_user_creations(user_id, data)
        
        return entry
    
    def save_narrative(self, user_id: str, title: str, content: str,
                      narrative_type: str = "reconstruction_temporelle") -> Dict:
        """Sauvegarde un narratif thérapeutique"""
        data = self._load_user_creations(user_id)
        
        narrative = {
            "id": datetime.now().isoformat(),
            "type": "narrative",
            "title": title,
            "content": content,
            "narrative_type": narrative_type,
            "created_at": datetime.now().isoformat(),
            "word_count": len(content.split())
        }
        
        data["narratives"].append(narrative)
        self._save_user_creations(user_id, data)
        
        return narrative
    
    def save_poem(self, user_id: str, title: str, content: str,
                 poem_style: Optional[str] = None,
                 ai_assisted: bool = False) -> Dict:
        """Sauvegarde un poème"""
        data = self._load_user_creations(user_id)
        
        poem = {
            "id": datetime.now().isoformat(),
            "type": "poem",
            "title": title,
            "content": content,
            "poem_style": poem_style,
            "ai_assisted": ai_assisted,
            "created_at": datetime.now().isoformat(),
            "line_count": len(content.split('\n'))
        }
        
        data["poems"].append(poem)
        self._save_user_creations(user_id, data)
        
        return poem
    
    def save_ritual(self, user_id: str, title: str, description: str,
                   frequency: str = "ponctuel") -> Dict:
        """Sauvegarde un rituel d'écriture"""
        data = self._load_user_creations(user_id)
        
        ritual = {
            "id": datetime.now().isoformat(),
            "type": "ritual",
            "title": title,
            "description": description,
            "frequency": frequency,
            "created_at": datetime.now().isoformat(),
            "last_practiced": None,
            "practice_count": 0
        }
        
        data["rituals"].append(ritual)
        self._save_user_creations(user_id, data)
        
        return ritual
    
    def get_all_creations(self, user_id: str, 
                         creation_type: Optional[str] = None) -> List[Dict]:
        """Récupère toutes les créations (ou filtrées par type)"""
        data = self._load_user_creations(user_id)
        
        if creation_type:
            type_map = {
                "journal": "journal_entries",
                "narrative": "narratives",
                "poem": "poems",
                "ritual": "rituals",
                "coloring": "colorings"
            }
            key = type_map.get(creation_type, "journal_entries")
            return data.get(key, [])
        
        # Toutes les créations
        all_creations = []
        for key in ["journal_entries", "narratives", "poems", "rituals", "colorings"]:
            all_creations.extend(data.get(key, []))
        
        # Trier par date
        all_creations.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return all_creations

