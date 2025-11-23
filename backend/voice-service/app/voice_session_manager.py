"""
Voice Session Manager
Gère les sessions de conversation vocale
"""

import logging
import uuid
from typing import Dict, Any, Optional
import httpx
import os

logger = logging.getLogger(__name__)

class VoiceSessionManager:
    """Gestionnaire de sessions vocales"""
    
    def __init__(self):
        self.sessions: Dict[str, Dict[str, Any]] = {}
        self.ai_engine_url = os.getenv("AI_ENGINE_URL", "http://localhost:8001")
        self.api_gateway_url = os.getenv("API_GATEWAY_URL", "http://localhost:8000")
    
    def create_session(self, user_id: str) -> str:
        """Crée une nouvelle session vocale"""
        session_id = str(uuid.uuid4())
        
        self.sessions[session_id] = {
            "user_id": user_id,
            "messages": [],
            "started_at": None,
            "ended_at": None
        }
        
        logger.info(f"Created voice session: {session_id} for user {user_id}")
        return session_id
    
    def end_session(self, session_id: str):
        """Termine une session vocale"""
        if session_id in self.sessions:
            del self.sessions[session_id]
            logger.info(f"Ended voice session: {session_id}")
    
    async def get_user_voice_config(self, user_id: str) -> Dict[str, Any]:
        """Récupère la configuration voix de l'utilisateur"""
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.api_gateway_url}/api/prefs/{user_id}"
                )
                
                if response.status_code == 200:
                    prefs = response.json().get("prefs", {})
                    return {
                        "voice_id": prefs.get("voiceId", "fr-FR-DeniseNeural"),
                        "speed": prefs.get("voiceSpeed", 1.0),
                        "pitch": prefs.get("voicePitch", 1.0)
                    }
        except Exception as e:
            logger.warning(f"Failed to get user voice config: {e}")
        
        # Défaut
        return {
            "voice_id": "fr-FR-DeniseNeural",
            "speed": 1.0,
            "pitch": 1.0
        }
    
    async def get_ai_response(self, user_id: str, user_message: str) -> str:
        """
        Appelle l'AI Engine pour obtenir une réponse
        
        Args:
            user_id: ID utilisateur
            user_message: Message transcrit
        
        Returns:
            Réponse de l'IA
        """
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Appeler l'API Gateway /api/chat
                response = await client.post(
                    f"{self.api_gateway_url}/api/chat",
                    json={
                        "user_id": user_id,
                        "messages": [
                            {"role": "user", "content": user_message}
                        ]
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data.get("text", "Je suis désolé, je n'ai pas pu générer de réponse.")
                else:
                    logger.error(f"AI Engine error: {response.status_code}")
                    return "Je suis désolé, une erreur s'est produite."
        
        except Exception as e:
            logger.error(f"Failed to get AI response: {e}")
            return "Je suis désolé, je ne peux pas répondre pour le moment."
    
    def add_message(self, session_id: str, role: str, content: str):
        """Ajoute un message à l'historique de la session"""
        if session_id in self.sessions:
            self.sessions[session_id]["messages"].append({
                "role": role,
                "content": content
            })
    
    def get_session_history(self, session_id: str) -> list:
        """Récupère l'historique d'une session"""
        if session_id in self.sessions:
            return self.sessions[session_id]["messages"]
        return []

