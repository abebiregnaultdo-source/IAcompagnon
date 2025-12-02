"""
Piper TTS Service - Open Source TTS Solution
Phase 1 implementation for IAcompagnon beta
"""

import subprocess
import tempfile
import base64
import os
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


class PiperTTS:
    """
    Service de synthèse vocale avec Piper TTS

    Avantages:
    - Gratuit et open source
    - Fonctionne sur CPU (pas besoin GPU)
    - Latence < 500ms
    - Qualité 7.5/10
    """

    def __init__(self, model_path: str = None):
        """
        Initialise le service Piper TTS

        Args:
            model_path: Chemin vers le modèle .onnx
        """
        # Chemin par défaut du modèle
        if model_path is None:
            base_dir = Path(__file__).parent.parent
            model_path = base_dir / "models" / "fr_FR-siwis-medium.onnx"

        self.model_path = str(model_path)

        # Vérifier que le modèle existe
        if not os.path.exists(self.model_path):
            logger.warning(f"Model not found: {self.model_path}")
            logger.warning("Piper TTS will not be available")
            self.available = False
        else:
            logger.info(f"Piper TTS initialized with model: {self.model_path}")
            self.available = True

    def is_available(self) -> bool:
        """Vérifie si Piper TTS est disponible"""
        return self.available

    def synthesize(self, text: str) -> bytes:
        """
        Génère audio depuis texte

        Args:
            text: Texte à synthétiser

        Returns:
            Audio au format WAV (bytes)

        Raises:
            RuntimeError: Si Piper n'est pas disponible
            subprocess.CalledProcessError: Si la synthèse échoue
        """
        if not self.is_available():
            raise RuntimeError("Piper TTS is not available (model not found)")

        # Créer fichier temporaire
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            temp_file = tmp.name

        try:
            # Appel Piper CLI
            process = subprocess.run(
                [
                    "piper",
                    "--model", self.model_path,
                    "--output_file", temp_file
                ],
                input=text.encode('utf-8'),
                capture_output=True,
                check=True,
                timeout=30  # Timeout 30s
            )

            # Lire résultat
            with open(temp_file, "rb") as f:
                audio_bytes = f.read()

            logger.info(f"Synthesized {len(text)} chars → {len(audio_bytes)} bytes")
            return audio_bytes

        except subprocess.CalledProcessError as e:
            logger.error(f"Piper synthesis failed: {e.stderr.decode()}")
            raise
        except subprocess.TimeoutExpired:
            logger.error("Piper synthesis timeout")
            raise RuntimeError("TTS synthesis timeout (>30s)")
        finally:
            # Nettoyer fichier temporaire
            if os.path.exists(temp_file):
                try:
                    os.remove(temp_file)
                except Exception as e:
                    logger.warning(f"Failed to remove temp file: {e}")

    def synthesize_base64(self, text: str) -> str:
        """
        Génère audio en base64 pour envoi au frontend

        Args:
            text: Texte à synthétiser

        Returns:
            Audio encodé en base64
        """
        audio_bytes = self.synthesize(text)
        return base64.b64encode(audio_bytes).decode('utf-8')

    @staticmethod
    def estimate_duration_ms(text: str) -> int:
        """
        Estime la durée de l'audio en millisecondes

        Basé sur ~150 mots/minute (vitesse normale)

        Args:
            text: Texte à analyser

        Returns:
            Durée estimée en ms
        """
        words = len(text.split())
        # 150 mots/min = 2.5 mots/sec = 400ms/mot
        return words * 400


# Instance globale (initialisée au démarrage du service)
piper_tts = None


def init_piper_tts(model_path: str = None):
    """
    Initialise l'instance globale de Piper TTS
    À appeler au démarrage du service
    """
    global piper_tts
    piper_tts = PiperTTS(model_path=model_path)
    return piper_tts


def get_piper_tts() -> PiperTTS:
    """
    Récupère l'instance globale de Piper TTS

    Returns:
        Instance PiperTTS

    Raises:
        RuntimeError: Si pas initialisé
    """
    if piper_tts is None:
        raise RuntimeError("Piper TTS not initialized. Call init_piper_tts() first.")
    return piper_tts
