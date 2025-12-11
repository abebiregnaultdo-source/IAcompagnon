"""
Text-to-Speech Engine
Utilise Edge TTS (Microsoft, gratuit, cloud, haute qualité)
Version allégée pour déploiement cloud
"""

import base64
import logging
import tempfile
import os
from typing import List, Dict

logger = logging.getLogger(__name__)


class TTSEngine:
    """Moteur de synthèse texte → audio via Edge TTS"""

    def __init__(self):
        self.edge_available = False
        self._initialize_engine()

    def _initialize_engine(self):
        """Initialise Edge TTS"""
        try:
            import edge_tts
            self.edge_available = True
            logger.info("TTS Engine initialized with Edge TTS")
        except ImportError:
            logger.warning("Edge TTS not installed. Install with: pip install edge-tts")

    def is_available(self) -> bool:
        """Vérifie si le moteur TTS est disponible"""
        return self.edge_available

    async def synthesize(
        self,
        text: str,
        voice_id: str = "fr-FR-DeniseNeural",
        speed: float = 1.0,
        pitch: float = 1.0
    ) -> str:
        """
        Synthétise le texte en audio via Edge TTS

        Args:
            text: Texte à synthétiser
            voice_id: ID de la voix Edge TTS
            speed: Vitesse (0.5 - 2.0)
            pitch: Tonalité (0.5 - 2.0)

        Returns:
            Audio encodé en base64
        """
        if not self.edge_available:
            raise RuntimeError("Edge TTS not available")

        try:
            import edge_tts

            # Convertir rate et pitch en format Edge TTS
            rate_str = f"{int((speed - 1.0) * 100):+d}%"
            pitch_str = f"{int((pitch - 1.0) * 50):+d}Hz"

            # Créer communicator
            communicate = edge_tts.Communicate(text, voice_id, rate=rate_str, pitch=pitch_str)

            # Sauvegarder temporairement
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_file:
                temp_path = temp_file.name

            try:
                # Générer audio
                await communicate.save(temp_path)

                # Lire et encoder en base64
                with open(temp_path, "rb") as f:
                    audio_bytes = f.read()

                audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")

                logger.info(f"Synthesized: {len(text)} chars → {len(audio_bytes)} bytes")

                return audio_base64

            finally:
                # Nettoyer
                if os.path.exists(temp_path):
                    os.remove(temp_path)

        except Exception as e:
            logger.error(f"TTS synthesis error: {e}")
            raise

    def get_available_voices(self) -> List[Dict[str, str]]:
        """Retourne la liste des voix disponibles"""
        if not self.edge_available:
            return []

        return [
            {
                "id": "fr-FR-DeniseNeural",
                "name": "Denise (Féminine, douce)",
                "gender": "female",
                "quality": "high",
                "description": "Voix féminine douce et apaisante"
            },
            {
                "id": "fr-FR-HenriNeural",
                "name": "Henri (Masculine, calme)",
                "gender": "male",
                "quality": "high",
                "description": "Voix masculine calme et posée"
            },
            {
                "id": "fr-FR-EloiseNeural",
                "name": "Éloïse (Féminine, chaleureuse)",
                "gender": "female",
                "quality": "high",
                "description": "Voix féminine chaleureuse"
            },
            {
                "id": "fr-FR-RemyMultilingualNeural",
                "name": "Rémy (Masculine, neutre)",
                "gender": "male",
                "quality": "high",
                "description": "Voix masculine neutre et claire"
            }
        ]
