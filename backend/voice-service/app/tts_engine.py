"""
Text-to-Speech Engine
Supporte :
- Edge TTS (Microsoft, gratuit, cloud, haute qualité)
- Piper TTS (open source, local, privacy)
"""

import base64
import logging
from typing import Optional, List, Dict
import asyncio
import tempfile
import os

logger = logging.getLogger(__name__)

class TTSEngine:
    """Moteur de synthèse texte → audio"""
    
    def __init__(self):
        self.edge_available = False
        self.piper_available = False
        self._initialize_engines()
    
    def _initialize_engines(self):
        """Initialise les moteurs TTS disponibles"""
        
        # Edge TTS
        try:
            import edge_tts
            self.edge_available = True
            logger.info("Edge TTS available")
        except ImportError:
            logger.warning("Edge TTS not installed. Install with: pip install edge-tts")
        
        # Piper TTS
        try:
            import piper
            self.piper_available = True
            logger.info("Piper TTS available")
        except ImportError:
            logger.warning("Piper TTS not installed. Install with: pip install piper-tts")
        
        # Coqui TTS (python package 'TTS')
        try:
            import TTS
            self.coqui_available = True
            logger.info("Coqui TTS (TTS) available")
        except Exception:
            self.coqui_available = False
            logger.warning("Coqui TTS not installed. Install with: pip install TTS")

        # Silero TTS (lightweight models, CPU-friendly)
        try:
            import torch
            # silero TTS utilities may be available via silero_tts or a local helper
            import silero_tts
            self.silero_available = True
            logger.info("Silero TTS available")
        except Exception:
            self.silero_available = False
            logger.info("Silero TTS not available (optional).")
    
    def is_available(self) -> bool:
        """Vérifie si au moins un moteur TTS est disponible"""
        return self.edge_available or self.piper_available
    
    async def synthesize(
        self,
        text: str,
        voice_id: str = "fr-FR-DeniseNeural",
        speed: float = 1.0,
        pitch: float = 1.0
    ) -> str:
        """
        Synthétise le texte en audio
        
        Args:
            text: Texte à synthétiser
            voice_id: ID de la voix (Edge ou Piper)
            speed: Vitesse (0.5 - 2.0)
            pitch: Tonalité (0.5 - 2.0)
        
        Returns:
            Audio encodé en base64
        """
        # Déterminer le moteur selon le voice_id prefix
        if voice_id.startswith("piper-"):
            return await self._synthesize_piper(text, voice_id, speed)
        if voice_id.startswith("silero-") and self.silero_available:
            return await self._synthesize_silero(text, voice_id, speed)
        if voice_id.startswith("coqui-") and self.coqui_available:
            return await self._synthesize_coqui(text, voice_id, speed)

        # Par défaut, utiliser Edge (cloud) si disponible
        return await self._synthesize_edge(text, voice_id, speed, pitch)

    async def _synthesize_silero(self, text: str, voice_id: str, speed: float) -> str:
        """Synthèse avec Silero TTS (CPU-friendly). Best-effort wrapper.
        Requires `silero_tts` or a compatible helper and `torch` installed.
        """
        if not self.silero_available:
            raise RuntimeError("Silero TTS not available")
        try:
            import base64 as _base64
            import tempfile as _tempfile
            import os as _os

            # Attempt to call silero_tts helper; API varies across wrappers
            try:
                from silero_tts import silero_tts
                wav_bytes = silero_tts(text)
            except Exception:
                # Try a different API shape
                try:
                    import torch
                    from silero_tts import TTS
                    t = TTS()
                    wav_bytes = t.tts(text)
                except Exception as e:
                    raise RuntimeError(f"Silero TTS synth failed: {e}")

            # If we have raw bytes or a numpy array, write and encode
            with _tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tf:
                tmp = tf.name
                if isinstance(wav_bytes, (bytes, bytearray)):
                    tf.write(wav_bytes)
                else:
                    # try to convert (numpy array)
                    try:
                        import numpy as _np
                        _imported = _np.asarray(wav_bytes)
                        _imported.tofile(tmp)
                    except Exception:
                        raise RuntimeError('Unsupported Silero audio format')

            try:
                with open(tmp, 'rb') as f:
                    audio_bytes = f.read()
                return _base64.b64encode(audio_bytes).decode('utf-8')
            finally:
                try:
                    if _os.path.exists(tmp):
                        _os.remove(tmp)
                except Exception:
                    pass

        except Exception as e:
            logger.error(f"Silero TTS error: {e}")
            # Fallback to Edge
            return await self._synthesize_edge(text, 'fr-FR-DeniseNeural', speed, 1.0)

    async def _synthesize_coqui(self, text: str, voice_id: str, speed: float) -> str:
        """Synthèse avec Coqui TTS (package `TTS`). Best-effort wrapper.
        This requires the `TTS` package and a downloaded model compatible with it.
        """
        if not self.coqui_available:
            raise RuntimeError("Coqui TTS not available")
        try:
            import base64 as _base64
            import tempfile as _tempfile
            import os as _os
            from TTS.api import TTS as CoquiTTS

            # Try to instantiate default model (relies on local cache or internet)
            model_name = voice_id.replace('coqui-', '') or 'tts_models/fr/css10'
            tts = CoquiTTS(model_name)

            with _tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tf:
                tmp = tf.name

            try:
                tts.tts_to_file(text=text, file_path=tmp)
                with open(tmp, 'rb') as f:
                    audio_bytes = f.read()
                return _base64.b64encode(audio_bytes).decode('utf-8')
            finally:
                try:
                    if _os.path.exists(tmp):
                        _os.remove(tmp)
                except Exception:
                    pass

        except Exception as e:
            logger.error(f"Coqui TTS error: {e}")
            # Fallback to Edge
            return await self._synthesize_edge(text, 'fr-FR-DeniseNeural', speed, 1.0)
    
    async def _synthesize_edge(
        self,
        text: str,
        voice: str,
        rate: float,
        pitch: float
    ) -> str:
        """Synthèse avec Edge TTS"""
        
        if not self.edge_available:
            raise RuntimeError("Edge TTS not available")
        
        try:
            import edge_tts
            
            # Convertir rate et pitch en format Edge TTS
            rate_str = f"{int((rate - 1.0) * 100):+d}%"
            pitch_str = f"{int((pitch - 1.0) * 50):+d}Hz"
            
            # Créer communicator
            communicate = edge_tts.Communicate(text, voice, rate=rate_str, pitch=pitch_str)
            
            # Sauvegarder temporairement
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_file:
                temp_path = temp_file.name
            
            try:
                # Générer audio
                await communicate.save(temp_path)
                
                # Lire et encoder en base64
                with open(temp_path, "rb") as f:
                    audio_bytes = f.read()
                
                audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
                
                logger.info(f"Synthesized with Edge TTS: {len(text)} chars → {len(audio_bytes)} bytes")
                
                return audio_base64
            
            finally:
                # Nettoyer
                if os.path.exists(temp_path):
                    os.remove(temp_path)
        
        except Exception as e:
            logger.error(f"Edge TTS synthesis error: {e}")
            raise
    
    async def _synthesize_piper(
        self,
        text: str,
        voice_id: str,
        speed: float
    ) -> str:
        """Synthèse avec Piper TTS (local)"""
        
        if not self.piper_available:
            raise RuntimeError("Piper TTS not available")
        
        try:
            # Implémentation prudente en s'appuyant sur l'API Python de Piper
            # (API effective dépend de la version installée). Le code ci-dessous
            # suit la convention d'une API fournissant un objet voice.synthesize()
            # qui renvoie des bytes audio.
            import base64 as _base64
            import tempfile as _tempfile
            import os as _os

            try:
                # Importer l'API Piper (si disponible)
                import piper
                from piper.voice import PiperVoice
            except Exception:
                # Si l'import échoue, forcer fallback sur Edge
                raise RuntimeError("Piper library not usable")

            # Mapping minimal des voix attendues vers des modèles locaux
            VOICE_MODELS = {
                "piper-fr-siwis-medium": {
                    "path": str(_os.path.join("models", "piper", "fr_FR-siwis_medium.onnx")),
                    "config": str(_os.path.join("models", "piper", "fr_FR-siwis_medium.onnx.json"))
                }
            }

            voice_config = VOICE_MODELS.get(voice_id)
            if not voice_config:
                raise ValueError(f"Voice {voice_id} not found in VOICE_MODELS")

            # Charger la voix (API dépendante de la distribution piper)
            pv = PiperVoice.load(voice_config["path"], config_path=voice_config.get("config"))

            # Créer un fichier temporaire pour écrire le wav
            with _tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
                tmp_path = tmp.name

            try:
                # La méthode synthesize peut produire chunks d'octets
                with open(tmp_path, "wb") as f:
                    for chunk in pv.synthesize(text, speed=speed):
                        if isinstance(chunk, (bytes, bytearray)):
                            f.write(chunk)
                        else:
                            # Si la synthèse retourne frames ou arrays, essayer encodage
                            try:
                                f.write(bytes(chunk))
                            except Exception:
                                pass

                # Lire et encoder
                with open(tmp_path, "rb") as f:
                    audio_bytes = f.read()

                audio_base64 = _base64.b64encode(audio_bytes).decode("utf-8")
                logger.info(f"Synthesized with Piper: {len(text)} chars → {len(audio_bytes)} bytes")
                return audio_base64

            finally:
                try:
                    if _os.path.exists(tmp_path):
                        _os.remove(tmp_path)
                except Exception:
                    pass
        
        except Exception as e:
            logger.error(f"Piper TTS synthesis error: {e}")
            # Fallback sur Edge TTS si disponible
            try:
                return await self._synthesize_edge(text, "fr-FR-DeniseNeural", speed, 1.0)
            except Exception:
                raise
    
    def get_available_voices(self) -> List[Dict[str, str]]:
        """Retourne la liste des voix disponibles"""
        
        voices = []
        
        # Voix Edge TTS
        if self.edge_available:
            voices.extend([
                {
                    "id": "fr-FR-DeniseNeural",
                    "name": "Denise (Féminine, douce)",
                    "gender": "female",
                    "engine": "edge",
                    "quality": "high"
                },
                {
                    "id": "fr-FR-HenriNeural",
                    "name": "Henri (Masculine, calme)",
                    "gender": "male",
                    "engine": "edge",
                    "quality": "high"
                },
                {
                    "id": "fr-FR-EloiseNeural",
                    "name": "Éloïse (Féminine, chaleureuse)",
                    "gender": "female",
                    "engine": "edge",
                    "quality": "high"
                },
                {
                    "id": "fr-FR-RemyMultilingualNeural",
                    "name": "Rémy (Masculine, neutre)",
                    "gender": "male",
                    "engine": "edge",
                    "quality": "high"
                }
            ])
        
        # Voix Piper TTS
        if self.piper_available:
            voices.extend([
                {
                    "id": "piper-fr-siwis-medium",
                    "name": "Siwis (Neutre, locale)",
                    "gender": "neutral",
                    "engine": "piper",
                    "quality": "medium",
                    "opensource": True
                }
            ])
        
        return voices

