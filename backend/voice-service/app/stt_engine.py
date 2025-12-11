"""
Speech-to-Text Engine
Utilise l'API OpenAI Whisper (cloud) pour la transcription
Version allégée pour déploiement cloud
"""

import base64
import io
import logging
import os
import tempfile
import httpx

logger = logging.getLogger(__name__)


class STTEngine:
    """Moteur de transcription audio → texte via API OpenAI Whisper"""

    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.model = "whisper-1"
        self._available = bool(self.api_key)

        if self._available:
            logger.info("STT Engine initialized with OpenAI Whisper API")
        else:
            logger.warning("OPENAI_API_KEY not set - STT will not work")

    def is_available(self) -> bool:
        """Vérifie si le moteur STT est disponible"""
        return self._available

    async def transcribe(self, audio_base64: str) -> str:
        """
        Transcrit l'audio en texte via l'API OpenAI Whisper

        Args:
            audio_base64: Audio encodé en base64 (format: WAV, MP3, etc.)

        Returns:
            Texte transcrit
        """
        if not self.is_available():
            raise RuntimeError("OpenAI API key not configured")

        try:
            # Décoder base64
            audio_bytes = base64.b64decode(audio_base64)

            # Sauvegarder temporairement (l'API OpenAI nécessite un fichier)
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
                temp_file.write(audio_bytes)
                temp_path = temp_file.name

            try:
                # Appeler l'API OpenAI Whisper
                async with httpx.AsyncClient(timeout=60.0) as client:
                    with open(temp_path, "rb") as audio_file:
                        response = await client.post(
                            "https://api.openai.com/v1/audio/transcriptions",
                            headers={
                                "Authorization": f"Bearer {self.api_key}",
                            },
                            files={
                                "file": ("audio.wav", audio_file, "audio/wav"),
                            },
                            data={
                                "model": self.model,
                                "language": "fr",
                                "response_format": "text",
                            },
                        )

                if response.status_code == 200:
                    text = response.text.strip()
                    logger.info(f"Transcribed: {text[:50]}...")
                    return text
                else:
                    logger.error(f"OpenAI API error: {response.status_code} - {response.text}")
                    raise RuntimeError(f"Transcription failed: {response.status_code}")

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
        combined_base64 = base64.b64encode(combined_audio).decode("utf-8")

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
