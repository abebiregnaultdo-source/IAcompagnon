# Architecture Système Voix - Helō

## 🎯 Objectif

Permettre aux utilisateurs de **converser vocalement** avec l'IA thérapeutique, comme lors d'un appel avec un thérapeute.

---

## 🏗️ Architecture Proposée

### Composants

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐         ┌──────────────┐                │
│  │   Settings   │         │  VoiceChat   │                │
│  │              │         │              │                │
│  │ - Mode       │         │ - Micro      │                │
│  │ - Voix       │         │ - Speaker    │                │
│  │ - Vitesse    │         │ - WebRTC     │                │
│  └──────────────┘         └──────────────┘                │
│                                  │                          │
└──────────────────────────────────┼──────────────────────────┘
                                   │
                                   │ WebSocket
                                   │
┌──────────────────────────────────┼──────────────────────────┐
│                        BACKEND                              │
├──────────────────────────────────┼──────────────────────────┤
│                                  ▼                          │
│  ┌─────────────────────────────────────────────────┐       │
│  │           API GATEWAY (port 8000)               │       │
│  │                                                 │       │
│  │  /ws/voice  ← WebSocket endpoint                │       │
│  └─────────────────────────────────────────────────┘       │
│                     │                │                      │
│                     ▼                ▼                      │
│  ┌──────────────────────┐  ┌──────────────────────┐       │
│  │   VOICE SERVICE      │  │   AI ENGINE          │       │
│  │   (port 8003)        │  │   (port 8001)        │       │
│  │                      │  │                      │       │
│  │  - STT (Whisper)     │  │  - TherapeuticEngine │       │
│  │  - TTS (Piper/Edge)  │  │  - LLM Router        │       │
│  │  - Audio Processing  │  │  - Methods Engine    │       │
│  └──────────────────────┘  └──────────────────────┘       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Technologies Recommandées

### 1. Speech-to-Text (STT)

**Option 1 : Whisper (OpenAI) - RECOMMANDÉ**
- ✅ Open source
- ✅ Très haute qualité
- ✅ Support français excellent
- ✅ Peut tourner localement (GPU) ou via API
- ⚠️ Nécessite GPU pour temps réel local

**Installation :**
```bash
pip install openai-whisper
# ou
pip install faster-whisper  # Version optimisée
```

**Option 2 : Vosk**
- ✅ 100% offline
- ✅ Léger
- ⚠️ Qualité inférieure à Whisper

### 2. Text-to-Speech (TTS)

**Option 1 : Piper TTS - RECOMMANDÉ pour privacy**
- ✅ 100% open source
- ✅ Fonctionne offline
- ✅ Voix naturelles
- ✅ Rapide (temps réel)
- ✅ Respect vie privée

**Installation :**
```bash
pip install piper-tts
```

**Voix françaises disponibles :**
- `fr_FR-siwis-medium` (neutre)
- `fr_FR-upmc-medium` (féminine)
- `fr_FR-tom-medium` (masculine)

**Option 2 : Edge TTS - RECOMMANDÉ pour qualité**
- ✅ Gratuit (utilise API Microsoft Edge)
- ✅ Voix très naturelles
- ✅ Facile à utiliser
- ⚠️ Nécessite connexion internet
- ⚠️ Données envoyées à Microsoft

**Installation :**
```bash
pip install edge-tts
```

**Voix françaises disponibles :**
- `fr-FR-DeniseNeural` (féminine, douce)
- `fr-FR-HenriNeural` (masculine, calme)
- `fr-FR-EloiseNeural` (féminine, chaleureuse)
- `fr-FR-RemyMultilingualNeural` (masculine, neutre)

### 3. Streaming Audio

**WebRTC** (Web Real-Time Communication)
- ✅ Standard web pour audio/vidéo temps réel
- ✅ Faible latence
- ✅ Support navigateurs

**WebSocket** (pour contrôle)
- ✅ Bidirectionnel
- ✅ Temps réel
- ✅ Facile à implémenter

---

## 📁 Structure de Fichiers Proposée

```
backend/
├── voice-service/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI app
│   │   ├── stt_engine.py              # Speech-to-Text
│   │   ├── tts_engine.py              # Text-to-Speech
│   │   ├── audio_processor.py         # Traitement audio
│   │   └── voice_session_manager.py   # Gestion sessions
│   ├── models/                        # Modèles Whisper/Piper
│   ├── requirements.txt
│   └── Dockerfile
│
├── api-gateway/
│   └── app/
│       └── voice_websocket.py         # WebSocket handler (NOUVEAU)
│
frontend/
└── src/
    ├── ui/
    │   ├── VoiceChat.jsx              # Interface voix (NOUVEAU)
    │   └── Settings.jsx               # ✅ CRÉÉ
    │
    └── styles/
        ├── voice-chat.css             # Styles voix (NOUVEAU)
        └── settings.css               # ✅ CRÉÉ
```

---

## 🔄 Flux de Conversation Vocale

### 1. Initialisation

```
User clicks "Démarrer conversation vocale"
    │
    ▼
Frontend: VoiceChat.jsx
    │
    ├─ Request microphone permission
    ├─ Load user voice preferences (voiceId, speed, pitch)
    └─ Connect WebSocket to /ws/voice
    │
    ▼
Backend: API Gateway
    │
    └─ Create voice session
        └─ Initialize STT + TTS engines
```

### 2. Conversation Loop

```
User speaks
    │
    ▼
Frontend: Capture audio (MediaRecorder)
    │
    └─ Send audio chunks via WebSocket
    │
    ▼
Backend: Voice Service
    │
    ├─ STT: Audio → Text
    │   └─ Whisper.transcribe(audio)
    │
    ├─ AI Engine: Text → Response
    │   └─ TherapeuticEngine.run_pipeline()
    │
    ├─ TTS: Response → Audio
    │   └─ Piper/Edge.synthesize(text, voiceId, speed, pitch)
    │
    └─ Send audio chunks back via WebSocket
    │
    ▼
Frontend: Play audio (AudioContext)
    │
    └─ Display transcript + avatar animation
```

### 3. Gestion d'Erreurs

```
Network error
    │
    └─ Fallback to text chat
    
Microphone unavailable
    │
    └─ Show error + suggest text chat
    
TTS service down
    │
    └─ Display text only
```

---

## 🎨 Interface Utilisateur (VoiceChat.jsx)

### Composants Visuels

```jsx
<VoiceChat>
  <AvatarRoom 
    mode="voice" 
    isSpeaking={isAISpeaking}
    audioLevel={audioLevel}
  />
  
  <VoiceControls>
    <MicButton 
      isRecording={isRecording}
      onClick={toggleRecording}
    />
    <VolumeSlider />
    <EndCallButton />
  </VoiceControls>
  
  <TranscriptDisplay>
    {messages.map(msg => (
      <TranscriptMessage role={msg.role}>
        {msg.text}
      </TranscriptMessage>
    ))}
  </TranscriptDisplay>
</VoiceChat>
```

### États

- `isRecording` : Micro actif
- `isAISpeaking` : IA en train de parler
- `audioLevel` : Niveau audio (pour visualisation)
- `messages` : Historique transcriptions
- `connectionStatus` : 'connecting' | 'connected' | 'disconnected'

---

## 🔐 Sécurité et Vie Privée

### Données Audio

**Option 1 : Piper TTS (100% local)**
- ✅ Aucune donnée envoyée à l'extérieur
- ✅ Conforme RGPD
- ✅ Pas de dépendance externe

**Option 2 : Edge TTS (cloud)**
- ⚠️ Audio envoyé à Microsoft
- ⚠️ Nécessite consentement explicite
- ✅ Qualité supérieure

### Recommandation

**Offrir les deux options :**
- Par défaut : **Piper TTS** (privacy-first)
- Option avancée : **Edge TTS** (qualité supérieure)
- Afficher clairement dans Settings quelle option envoie des données

---

## 📊 Estimation Ressources

### CPU/GPU

| Composant | CPU | GPU | RAM |
|-----------|-----|-----|-----|
| Whisper (tiny) | 1 core | - | 1 GB |
| Whisper (base) | 2 cores | - | 2 GB |
| Whisper (small) | 4 cores | CUDA | 4 GB |
| Piper TTS | 1 core | - | 500 MB |
| Edge TTS | Minimal | - | Minimal |

### Latence

| Étape | Latence |
|-------|---------|
| STT (Whisper tiny) | 200-500ms |
| AI Response | 1-3s |
| TTS (Piper) | 100-300ms |
| **Total** | **1.5-4s** |

---

## 🚀 Plan d'Implémentation

### Phase 1 : Backend Voice Service (2-3 jours)

1. Créer `backend/voice-service/`
2. Implémenter STT avec Whisper
3. Implémenter TTS avec Piper + Edge
4. Créer WebSocket handler
5. Tests unitaires

### Phase 2 : Frontend VoiceChat (2-3 jours)

1. Créer `VoiceChat.jsx`
2. Intégrer WebRTC/WebSocket
3. Créer contrôles audio
4. Animer avatar selon audio
5. Tests utilisateur

### Phase 3 : Intégration (1-2 jours)

1. Connecter Settings → VoiceChat
2. Persister préférences voix
3. Tests end-to-end
4. Optimisation latence

---

## 📝 Exemple Code

### Backend : TTS Engine (Piper)

```python
from piper import PiperVoice

class TTSEngine:
    def __init__(self):
        self.voices = {
            'piper-fr-siwis-medium': PiperVoice.load('fr_FR-siwis-medium')
        }
    
    def synthesize(self, text: str, voice_id: str, speed: float = 1.0):
        voice = self.voices.get(voice_id)
        audio = voice.synthesize(text, speed=speed)
        return audio  # bytes
```

### Frontend : WebSocket Connection

```javascript
const ws = new WebSocket('ws://localhost:8000/ws/voice')

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  
  if (data.type === 'audio') {
    playAudio(data.audio)  // Base64 → AudioContext
  } else if (data.type === 'transcript') {
    addMessage(data.text, data.role)
  }
}

// Send audio
mediaRecorder.ondataavailable = (event) => {
  ws.send(event.data)
}
```

---

## ✅ Checklist Complète

- [ ] Créer `backend/voice-service/`
- [ ] Installer Whisper + Piper/Edge
- [ ] Implémenter STT engine
- [ ] Implémenter TTS engine
- [ ] Créer WebSocket handler
- [ ] Créer `frontend/src/ui/VoiceChat.jsx`
- [ ] Intégrer WebRTC
- [ ] Créer contrôles audio
- [ ] Animer avatar selon audio
- [ ] Tester latence
- [ ] Documenter API
- [ ] Tests utilisateur

