"""
Intégration automatique de la sauvegarde des créations
Détecte et sauvegarde automatiquement les créations thérapeutiques
"""

import httpx
from typing import Dict, Any, Optional


class CreativeIntegration:
    """Intègre la sauvegarde automatique des créations"""
    
    def __init__(self, api_gateway_url: str = "http://localhost:8000"):
        self.api_gateway_url = api_gateway_url
    
    async def auto_save_creation(
        self,
        user_id: str,
        method: str,
        content: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Sauvegarde automatique basée sur la méthode thérapeutique
        
        Args:
            user_id: ID utilisateur
            method: Méthode thérapeutique (journaling, narrative, etc.)
            content: Contenu créé
            metadata: Métadonnées additionnelles
        
        Returns:
            True si sauvegardé avec succès
        """
        
        metadata = metadata or {}
        
        # Déterminer le type de création
        if method.startswith('journaling'):
            return await self._save_journal(user_id, content, metadata)
        
        elif method.startswith('narrative'):
            return await self._save_narrative(user_id, content, metadata)
        
        elif method.startswith('poem'):
            return await self._save_poem(user_id, content, metadata)
        
        elif method.startswith('continuing_bonds') or method.startswith('ritual'):
            # Les rituels continuing bonds
            return await self._save_ritual(user_id, content, metadata)
        
        return False
    
    async def _save_journal(
        self,
        user_id: str,
        content: str,
        metadata: Dict[str, Any]
    ) -> bool:
        """Sauvegarde une entrée de journal"""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    f"{self.api_gateway_url}/api/creations/journal",
                    json={
                        "user_id": user_id,
                        "content": content,
                        "prompt": metadata.get("prompt"),
                        "therapeutic_method": metadata.get("method", "journaling")
                    }
                )
                return response.status_code == 200
        except Exception as e:
            print(f"Erreur sauvegarde journal: {e}")
            return False
    
    async def _save_narrative(
        self,
        user_id: str,
        content: str,
        metadata: Dict[str, Any]
    ) -> bool:
        """Sauvegarde un narratif thérapeutique"""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    f"{self.api_gateway_url}/api/creations/narrative",
                    json={
                        "user_id": user_id,
                        "title": metadata.get("title", "Narratif thérapeutique"),
                        "content": content,
                        "narrative_type": metadata.get("narrative_type", "reconstruction_temporelle")
                    }
                )
                return response.status_code == 200
        except Exception as e:
            print(f"Erreur sauvegarde narratif: {e}")
            return False
    
    async def _save_poem(
        self,
        user_id: str,
        content: str,
        metadata: Dict[str, Any]
    ) -> bool:
        """Sauvegarde un poème thérapeutique"""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    f"{self.api_gateway_url}/api/creations/poem",
                    json={
                        "user_id": user_id,
                        "title": metadata.get("title", "Poème"),
                        "content": content
                    }
                )
                return response.status_code == 200
        except Exception as e:
            print(f"Erreur sauvegarde poème: {e}")
            return False
    
    async def _save_ritual(
        self,
        user_id: str,
        content: str,
        metadata: Dict[str, Any]
    ) -> bool:
        """Sauvegarde un rituel d'écriture"""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    f"{self.api_gateway_url}/api/creations/ritual",
                    json={
                        "user_id": user_id,
                        "title": metadata.get("title", "Rituel de connexion"),
                        "description": content,
                        "frequency": metadata.get("frequency", "ponctuel")
                    }
                )
                return response.status_code == 200
        except Exception as e:
            print(f"Erreur sauvegarde rituel: {e}")
            return False
    
    def extract_creative_content(
        self,
        response_text: str,
        method: str
    ) -> Optional[str]:
        """
        Extrait le contenu créatif d'une réponse thérapeutique
        
        Args:
            response_text: Texte de la réponse
            method: Méthode thérapeutique
        
        Returns:
            Contenu créatif extrait ou None
        """
        
        # Marqueurs de contenu créatif
        markers = {
            "journaling": ["Voici votre entrée", "Vous avez écrit", "Journal:"],
            "narrative": ["Votre récit", "Votre histoire", "Narratif:"],
            "poem": ["Votre poème", "Poème:", "Vers:"],
            "ritual": ["Votre rituel", "Ce rituel", "Rituel:"]
        }
        
        # Chercher les marqueurs
        for method_type, method_markers in markers.items():
            if method.startswith(method_type):
                for marker in method_markers:
                    if marker in response_text:
                        # Extraire le contenu après le marqueur
                        parts = response_text.split(marker, 1)
                        if len(parts) > 1:
                            # Nettoyer et retourner
                            content = parts[1].strip()
                            # Limiter à 2000 caractères
                            return content[:2000]
        
        return None

