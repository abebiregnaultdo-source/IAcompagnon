"""
Speech-to-Text Engine
Utilise Whisper (OpenAI) pour la transcription
"""

import base64
import io
import logging
from typing import Optional
import tempfile
import os

logger = logging.getLogger(__name__)

class STTEngine:
    """Moteur de transcription audio → texte"""
    
    def __init__(self):
        self.model = None
        self.model_name = "base"  # tiny, base, small, medium, large
        self._initialize_whisper()
    
    def _initialize_whisper(self):
        """Initialise le modèle Whisper"""
        try:
            import whisper
            logger.info(f"Loading Whisper model: {self.model_name}")
            self.model = whisper.load_model(self.model_name)
            logger.info("Whisper model loaded successfully")
        except ImportError:
            logger.warning("Whisper not installed. Install with: pip install openai-whisper")
            self.model = None
        except Exception as e:
            logger.error(f"Failed to load Whisper model: {e}")
            self.model = None
    
    def is_available(self) -> bool:
        """Vérifie si le moteur STT est disponible"""
        return self.model is not None
    
    async def transcribe(self, audio_base64: str) -> str:
        """
        Transcrit l'audio en texte
        
        Args:
            audio_base64: Audio encodé en base64 (format: WAV, MP3, etc.)
        
        Returns:
            Texte transcrit
        """
        if not self.is_available():
            raise RuntimeError("Whisper model not available")
        
        try:
            # Décoder base64
            audio_bytes = base64.b64decode(audio_base64)
            
            # Sauvegarder temporairement (Whisper nécessite un fichier)
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
                temp_file.write(audio_bytes)
                temp_path = temp_file.name
            
            try:
                # Transcription
                result = self.model.transcribe(
                    temp_path,
                    language="fr",  # Français
                    task="transcribe",
                    fp16=False  # CPU compatible
                )
                
                text = result["text"].strip()
                logger.info(f"Transcribed: {text[:50]}...")
                
                return text
            
            finally:
                # Nettoyer fichier temporaire
                if os.path.exists(temp_path):
                    os.remove(temp_path)
        
        except Exception as e:
            logger.error(f"Transcription error: {e}")
            raise
    
    async def transcribe_stream(self, audio_chunks: list) -> str:
        """
        Transcrit un flux audio (plusieurs chunks)
        
        Args:
            audio_chunks: Liste de chunks audio en base64
        
        Returns:
            Texte transcrit
        """
        # Combiner les chunks
        combined_audio = b"".join([base64.b64decode(chunk) for chunk in audio_chunks])
        combined_base64 = base64.b64encode(combined_audio).decode('utf-8')
        
        return await self.transcribe(combined_base64)
    
    def get_supported_languages(self) -> list:
        """Retourne les langues supportées"""
        return [
            "fr",  # Français
            "en",  # Anglais
            "es",  # Espagnol
            "de",  # Allemand
            "it",  # Italien
        ]
    
    def change_model(self, model_name: str):
        """
        Change le modèle Whisper
        
        Args:
            model_name: tiny, base, small, medium, large
        """
        if model_name not in ["tiny", "base", "small", "medium", "large"]:
            raise ValueError(f"Invalid model name: {model_name}")
        
        self.model_name = model_name
        self._initialize_whisper()
        logger.info(f"Switched to Whisper model: {model_name}")

