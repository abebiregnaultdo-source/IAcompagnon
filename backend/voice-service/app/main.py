"""
Voice Service - STT (Speech-to-Text) + TTS (Text-to-Speech)

Technologies:
- STT: Whisper (OpenAI) - open source, haute qualité
- TTS: Piper (local, privacy) + Edge TTS (cloud, qualité)
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import logging
import asyncio
import json

from .stt_engine import STTEngine
from .tts_engine import TTSEngine
from .voice_session_manager import VoiceSessionManager

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(title="Voice Service", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Engines
stt_engine = STTEngine()
tts_engine = TTSEngine()
session_manager = VoiceSessionManager()

# ============================================================================
# MODELS
# ============================================================================

class VoiceConfig(BaseModel):
    voice_id: str = "fr-FR-DeniseNeural"
    speed: float = 1.0
    pitch: float = 1.0

class TranscribeRequest(BaseModel):
    audio_base64: str
    user_id: str

class SynthesizeRequest(BaseModel):
    text: str
    voice_config: VoiceConfig

# ============================================================================
# ENDPOINTS
# ============================================================================

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "stt_available": stt_engine.is_available(),
        "tts_available": tts_engine.is_available()
    }

@app.post("/api/transcribe")
async def transcribe(request: TranscribeRequest):
    """Transcrit l'audio en texte (STT)"""
    try:
        text = await stt_engine.transcribe(request.audio_base64)
        return {"text": text, "status": "success"}
    except Exception as e:
        logger.error(f"Transcription error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/synthesize")
async def synthesize(request: SynthesizeRequest):
    """Synthétise le texte en audio (TTS)"""
    try:
        audio_base64 = await tts_engine.synthesize(
            request.text,
            request.voice_config.voice_id,
            request.voice_config.speed,
            request.voice_config.pitch
        )
        return {"audio_base64": audio_base64, "status": "success"}
    except Exception as e:
        logger.error(f"Synthesis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/voices")
async def list_voices():
    """Liste les voix disponibles"""
    return {
        "voices": tts_engine.get_available_voices()
    }

# ============================================================================
# WEBSOCKET (pour streaming temps réel)
# ============================================================================

@app.websocket("/ws/voice/{user_id}")
async def voice_websocket(websocket: WebSocket, user_id: str):
    """
    WebSocket pour conversation vocale temps réel
    
    Flow:
    1. Client envoie audio chunks
    2. Server transcrit (STT)
    3. Server envoie au AI Engine
    4. Server synthétise réponse (TTS)
    5. Server envoie audio chunks au client
    """
    await websocket.accept()
    session_id = session_manager.create_session(user_id)
    
    logger.info(f"Voice session started: {session_id} for user {user_id}")
    
    try:
        # Récupérer config voix utilisateur
        voice_config = await session_manager.get_user_voice_config(user_id)
        
        while True:
            # Recevoir message du client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message["type"] == "audio":
                # Audio chunk reçu
                audio_base64 = message["data"]
                
                # Transcription
                text = await stt_engine.transcribe(audio_base64)
                
                # Envoyer transcription au client
                await websocket.send_json({
                    "type": "transcript",
                    "role": "user",
                    "text": text
                })
                
                # Appeler AI Engine (via HTTP)
                ai_response = await session_manager.get_ai_response(user_id, text)
                
                # Envoyer transcription réponse IA
                await websocket.send_json({
                    "type": "transcript",
                    "role": "assistant",
                    "text": ai_response
                })
                
                # Synthèse vocale
                audio_response = await tts_engine.synthesize(
                    ai_response,
                    voice_config["voice_id"],
                    voice_config["speed"],
                    voice_config["pitch"]
                )
                
                # Envoyer audio au client
                await websocket.send_json({
                    "type": "audio",
                    "data": audio_response
                })
            
            elif message["type"] == "ping":
                await websocket.send_json({"type": "pong"})
    
    except WebSocketDisconnect:
        logger.info(f"Voice session ended: {session_id}")
        session_manager.end_session(session_id)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.close(code=1011, reason=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)

