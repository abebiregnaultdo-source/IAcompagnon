# 🎙️ SOLUTIONS VOCALES OPEN SOURCE - IAcompagnon

## 🎯 OBJECTIF

Implémenter une voix **naturelle, apaisante, gratuite** pour l'avatar thérapeutique.

**Critères** :
- ✅ Open source (gratuit)
- ✅ Qualité proche d'ElevenLabs
- ✅ Voix française naturelle
- ✅ Latence acceptable (<2s)
- ✅ Self-hosted ou API gratuite

---

## 🏆 MEILLEURES SOLUTIONS OPEN SOURCE 2025

### 1. 🥇 COQUI TTS (XTTS-v2) ⭐ RECOMMANDÉ

**Description** : Le meilleur TTS open source actuel, qualité proche ElevenLabs

**Qualité** : 9/10 ⭐⭐⭐⭐⭐  
**Facilité** : 7/10  
**Coût** : GRATUIT  

**Avantages** :
- ✅ Voix **ultra réalistes** (deep learning avancé)
- ✅ Support français natif excellent
- ✅ Voice cloning possible (11 secondes d'audio suffisent)
- ✅ Multi-locuteurs (choix de voix)
- ✅ Émotions dans la voix
- ✅ Latence ~1-2s par phrase

**Inconvénients** :
- ⚠️ Nécessite GPU (ou CPU puissant)
- ⚠️ Installation un peu technique
- ⚠️ 2-3 GB VRAM minimum

**Voix françaises incluses** :
- `tts_models/fr/css10/vits` - Voix féminine claire
- `tts_models/multilingual/multi-dataset/xtts_v2` - Multi-langues (le meilleur)

**Installation** :

```bash
# Avec pip
pip install TTS

# Avec Docker (recommandé)
docker pull ghcr.io/coqui-ai/tts

# Lancer serveur TTS
docker run -it -p 5002:5002 ghcr.io/coqui-ai/tts --model_name tts_models/multilingual/multi-dataset/xtts_v2
```

**API Endpoint** :

```python
# backend/api-gateway/app/routes/voice.py

from TTS.api import TTS
import base64
import io

# Init TTS (au démarrage serveur)
tts = TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2", progress_bar=False, gpu=True)

@router.post("/api/voice/synthesize")
async def synthesize_coqui(text: str, voice: str = "default"):
    """
    Génère audio avec Coqui TTS
    """
    # Fichier temporaire
    temp_file = "/tmp/output.wav"
    
    # Générer audio
    tts.tts_to_file(
        text=text,
        file_path=temp_file,
        language="fr",
        speaker_wav=None  # Ou path vers voix custom
    )
    
    # Lire et encoder en base64
    with open(temp_file, "rb") as f:
        audio_bytes = f.read()
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
    
    return {
        "audio": audio_base64,
        "format": "wav",
        "model": "coqui-xtts-v2"
    }
```

**Voice Cloning (optionnel)** :

Si vous voulez une voix **spécifique** pour Helō :

```python
# 1. Enregistrer 10-15 secondes de voix souhaitée
speaker_wav = "/path/to/voice_sample.wav"

# 2. Utiliser cette voix
tts.tts_to_file(
    text=text,
    file_path=temp_file,
    language="fr",
    speaker_wav=speaker_wav  # Clone cette voix !
)
```

**Démo en ligne** : https://huggingface.co/spaces/coqui/xtts

---

### 2. 🥈 PIPER TTS ⚡ Plus rapide

**Description** : TTS ultra rapide, qualité très correcte

**Qualité** : 7.5/10  
**Facilité** : 9/10  
**Coût** : GRATUIT  

**Avantages** :
- ✅ **Très rapide** (<500ms par phrase)
- ✅ Fonctionne sur CPU (pas besoin GPU)
- ✅ Petit (~50MB par voix)
- ✅ Installation simple
- ✅ Support français

**Inconvénients** :
- ⚠️ Qualité légèrement inférieure à Coqui
- ⚠️ Moins naturel pour longues phrases

**Voix françaises disponibles** :
- `fr_FR-siwis-medium` - Voix féminine douce
- `fr_FR-upmc-medium` - Voix féminine claire

**Installation** :

```bash
# Installer Piper
pip install piper-tts

# Télécharger voix française
wget https://github.com/rhasspy/piper/releases/download/v1.2.0/fr_FR-siwis-medium.onnx
wget https://github.com/rhasspy/piper/releases/download/v1.2.0/fr_FR-siwis-medium.onnx.json

# Utiliser
echo "Bonjour, je suis Helō" | piper --model fr_FR-siwis-medium.onnx --output_file output.wav
```

**API Endpoint** :

```python
import subprocess
import base64

@router.post("/api/voice/synthesize")
async def synthesize_piper(text: str):
    """
    Génère audio avec Piper TTS
    """
    temp_file = "/tmp/output.wav"
    
    # Appel Piper
    subprocess.run([
        "piper",
        "--model", "/path/to/fr_FR-siwis-medium.onnx",
        "--output_file", temp_file
    ], input=text.encode(), check=True)
    
    # Lire et encoder
    with open(temp_file, "rb") as f:
        audio_bytes = f.read()
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
    
    return {
        "audio": audio_base64,
        "format": "wav",
        "model": "piper"
    }
```

**Démo** : https://rhasspy.github.io/piper-samples/

---

### 3. 🥉 MOZILLA TTS / COQUI-AI (Ancienne version)

**Description** : Prédécesseur de Coqui TTS, toujours valable

**Qualité** : 7/10  
**Facilité** : 6/10  
**Coût** : GRATUIT  

**Note** : Remplacé par XTTS-v2, utiliser plutôt option 1

---

### 4. 🌐 STYLETTS 2

**Description** : TTS émergent avec style expressif

**Qualité** : 8.5/10  
**Facilité** : 5/10  
**Coût** : GRATUIT  

**Avantages** :
- ✅ Très naturel
- ✅ Contrôle émotions
- ✅ Qualité excellente

**Inconvénients** :
- ⚠️ Moins mature
- ⚠️ Installation complexe
- ⚠️ Support français limité

**GitHub** : https://github.com/yl4579/StyleTTS2

---

## 📊 COMPARATIF DÉTAILLÉ

| Solution | Qualité voix | Vitesse | GPU requis | Français | Facilité | Recommandation |
|----------|--------------|---------|------------|----------|----------|----------------|
| **Coqui XTTS-v2** | 9/10 ⭐⭐⭐ | 1-2s | Oui (ou CPU lent) | Excellent | Moyenne | **BETA** |
| **Piper TTS** | 7.5/10 | <500ms ⚡ | Non | Bon | Facile | MVP rapide |
| **StyleTTS 2** | 8.5/10 | 2-3s | Oui | Limité | Difficile | Future |
| **Web Speech API** | 7/10 | Temps réel | Non | Bon | Très facile | Backup |

---

## 🎯 RECOMMANDATION POUR IACOMPAGNON

### PHASE 1 : MVP (Semaine 1) - PIPER TTS ⚡

**Pourquoi Piper d'abord** :
- ✅ Installation en 10 minutes
- ✅ Fonctionne sur n'importe quel serveur
- ✅ Latence ultra faible (<500ms)
- ✅ Qualité correcte (7.5/10)
- ✅ Pas besoin GPU (économies hébergement)

**Code complet** :

```python
# backend/api-gateway/app/services/tts.py

import subprocess
import tempfile
import base64
import os

class PiperTTS:
    def __init__(self, model_path="/app/models/fr_FR-siwis-medium.onnx"):
        self.model_path = model_path
        
        # Vérifier modèle existe
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found: {model_path}")
    
    def synthesize(self, text: str) -> bytes:
        """
        Génère audio depuis texte
        Retourne bytes WAV
        """
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            temp_file = tmp.name
        
        try:
            # Appel Piper
            process = subprocess.run(
                [
                    "piper",
                    "--model", self.model_path,
                    "--output_file", temp_file
                ],
                input=text.encode('utf-8'),
                capture_output=True,
                check=True
            )
            
            # Lire résultat
            with open(temp_file, "rb") as f:
                audio_bytes = f.read()
            
            return audio_bytes
            
        finally:
            # Nettoyer
            if os.path.exists(temp_file):
                os.remove(temp_file)
    
    def synthesize_base64(self, text: str) -> str:
        """
        Retourne audio en base64 pour frontend
        """
        audio_bytes = self.synthesize(text)
        return base64.b64encode(audio_bytes).decode('utf-8')

# Init global
piper_tts = PiperTTS()
```

**Endpoint API** :

```python
# backend/api-gateway/app/routes/voice.py

from fastapi import APIRouter
from app.services.tts import piper_tts

router = APIRouter()

@router.post("/api/voice/synthesize")
async def synthesize_speech(text: str):
    """
    Synthèse vocale avec Piper TTS
    """
    try:
        audio_base64 = piper_tts.synthesize_base64(text)
        
        return {
            "audio": audio_base64,
            "format": "wav",
            "duration_ms": estimate_duration(text),  # ~150 mots/min
            "model": "piper-fr-siwis"
        }
    except Exception as e:
        return {
            "error": str(e),
            "fallback": "web_speech_api"  # Frontend peut fallback
        }

def estimate_duration(text: str) -> int:
    """Estime durée audio en ms"""
    words = len(text.split())
    # ~150 mots/minute = 2.5 mots/sec = 400ms/mot
    return words * 400
```

**Docker** :

```dockerfile
# Dockerfile

FROM python:3.11-slim

# Installer Piper
RUN pip install piper-tts

# Télécharger modèle français
WORKDIR /app/models
RUN wget https://github.com/rhasspy/piper/releases/download/v1.2.0/fr_FR-siwis-medium.onnx
RUN wget https://github.com/rhasspy/piper/releases/download/v1.2.0/fr_FR-siwis-medium.onnx.json

WORKDIR /app
COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Taille image Docker** : ~300MB (léger !)

---

### PHASE 2 : BETA (Mois 2) - COQUI XTTS-v2 🚀

**Après validation MVP**, upgrader vers Coqui pour qualité premium.

**Pourquoi attendre** :
- Nécessite GPU → Coût hébergement plus élevé
- Installation plus complexe
- Mais qualité 9/10 (vs 7.5/10 Piper)

**Hébergement avec GPU** :

**Option A : RunPod (Recommandé)**
- GPU RTX 3060 : ~0.30$/heure = ~220€/mois si 24/7
- Ou on-demand : Payer que quand utilisé
- Autoscaling possible

**Option B : Hetzner Cloud GPU**
- GPU instances : À partir 1€/heure
- Ou CPU puissant : CCX33 à 63€/mois (fonctionne mais lent)

**Code Coqui** :

```python
# backend/api-gateway/app/services/tts.py

from TTS.api import TTS
import torch

class CoquiTTS:
    def __init__(self):
        # Charger modèle XTTS-v2
        self.tts = TTS(
            model_name="tts_models/multilingual/multi-dataset/xtts_v2",
            progress_bar=False,
            gpu=torch.cuda.is_available()
        )
        
        # Voix par défaut (optionnel : voice cloning)
        self.speaker_wav = None
    
    def synthesize(self, text: str) -> bytes:
        """
        Génère audio haute qualité
        """
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            temp_file = tmp.name
        
        try:
            self.tts.tts_to_file(
                text=text,
                file_path=temp_file,
                language="fr",
                speaker_wav=self.speaker_wav,
                speed=0.95  # Légèrement plus lent = plus apaisant
            )
            
            with open(temp_file, "rb") as f:
                audio_bytes = f.read()
            
            return audio_bytes
            
        finally:
            if os.path.exists(temp_file):
                os.remove(temp_file)
    
    def set_voice(self, speaker_wav_path: str):
        """
        Change la voix (voice cloning)
        """
        self.speaker_wav = speaker_wav_path

# Init
coqui_tts = CoquiTTS()
```

---

## 🎤 STT (SPEECH-TO-TEXT) - Solutions Open Source

### Option 1 : Whisper (OpenAI) ⭐ RECOMMANDÉ

**Qualité** : 9.5/10  
**Coût** : 0.006$/minute via API OU Gratuit si self-hosted  

**API OpenAI** (Simple) :

```python
import openai

@router.post("/api/voice/transcribe")
async def transcribe_audio(audio: UploadFile):
    """
    Transcrit audio en texte avec Whisper API
    """
    audio_bytes = await audio.read()
    
    # Sauvegarder temporairement
    temp_path = f"/tmp/{audio.filename}"
    with open(temp_path, "wb") as f:
        f.write(audio_bytes)
    
    # Transcription
    with open(temp_path, "rb") as audio_file:
        transcript = openai.Audio.transcribe(
            model="whisper-1",
            file=audio_file,
            language="fr"
        )
    
    os.remove(temp_path)
    
    return {"text": transcript.text}
```

**Coût** : 0.006$/min = ~0.36€/heure de transcription

**Self-hosted Whisper** (Gratuit) :

```python
import whisper

# Charger modèle (une fois au démarrage)
model = whisper.load_model("medium")  # Ou "large" si GPU puissant

@router.post("/api/voice/transcribe")
async def transcribe_audio(audio: UploadFile):
    """
    Transcrit avec Whisper local
    """
    audio_bytes = await audio.read()
    temp_path = f"/tmp/{audio.filename}"
    
    with open(temp_path, "wb") as f:
        f.write(audio_bytes)
    
    # Transcription
    result = model.transcribe(temp_path, language="fr")
    
    os.remove(temp_path)
    
    return {"text": result["text"]}
```

**Taille modèles** :
- `tiny` : 75MB, rapide, qualité 6/10
- `base` : 140MB, qualité 7/10
- `small` : 460MB, qualité 8/10
- `medium` : 1.5GB, qualité 9/10 ⭐
- `large` : 3GB, qualité 9.5/10

**Recommandation** : `medium` pour bon compromis qualité/vitesse

---

### Option 2 : Vosk (Ultra rapide)

**Qualité** : 7/10  
**Coût** : GRATUIT  
**Vitesse** : Temps réel  

**Avantages** :
- ✅ Fonctionne hors ligne
- ✅ Très léger
- ✅ Temps réel (pas de latence)

**Inconvénients** :
- ⚠️ Qualité inférieure à Whisper

```python
from vosk import Model, KaldiRecognizer
import wave

model = Model(lang="fr")

def transcribe_vosk(audio_path: str) -> str:
    wf = wave.open(audio_path, "rb")
    rec = KaldiRecognizer(model, wf.getframerate())
    
    result = ""
    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            result += rec.Result()
    
    return result
```

---

## 💰 COÛTS FINAUX PAR SOLUTION

### Solution 1 : Piper + Whisper API (Recommandé Beta)

```
TTS (Piper) : 0€ (self-hosted)
STT (Whisper API) : 0.006$/min

User moyen : 20 min vocal/mois
Coût : 20 × 0.006$ = 0.12$/mois = 0.11€/user/mois

Hébergement : Hetzner CPX31 (13.90€/mois)
  → Peut gérer 200 users simultanés

COÛT TOTAL : 0.11€/user/mois
```

### Solution 2 : Coqui + Whisper Self-hosted (Premium)

```
TTS (Coqui) : 0€ (mais nécessite GPU)
STT (Whisper local) : 0€

Hébergement GPU : RunPod RTX 3060 = 220€/mois
  → Ou on-demand : 0.30$/heure × usage réel

Si usage 8h/jour : ~72€/mois
Si 100 users actifs : 0.72€/user/mois

COÛT TOTAL : 0.72€/user/mois (avec GPU on-demand)
```

### Solution 3 : Web Speech API (Fallback gratuit)

```
TTS : 0€ (navigateur)
STT : 0€ (navigateur)

COÛT TOTAL : 0€ (mais qualité 7/10)
```

---

## 🎯 ARCHITECTURE RECOMMANDÉE (Multi-niveaux)

```
┌─────────────────────────────────────────┐
│  FRONTEND                               │
│  1. Web Speech API (fallback gratuit)  │
│  2. API backend TTS si disponible      │
└─────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│  BACKEND                                │
│  Phase 1 : Piper TTS + Whisper API     │
│    → Coût : 0.11€/user/mois            │
│                                         │
│  Phase 2 : Coqui XTTS-v2 (si succès)   │
│    → Coût : 0.72€/user/mois            │
│    → Qualité premium 9/10              │
└─────────────────────────────────────────┘
```

**Frontend détecte** :
1. Navigateur supporte Web Speech ? → Utiliser
2. Backend TTS disponible ? → Utiliser (meilleure qualité)
3. Sinon → Message "Vocal non disponible"

---

## ✅ PLAN D'IMPLÉMENTATION

### Semaine 1 : STT + TTS Basique

**Jour 1** : Backend STT
- [ ] Installer Whisper API (ou local)
- [ ] Endpoint `/api/voice/transcribe`
- [ ] Tests transcription française

**Jour 2** : Backend TTS
- [ ] Installer Piper TTS
- [ ] Télécharger voix fr_FR-siwis
- [ ] Endpoint `/api/voice/synthesize`
- [ ] Tests génération voix

**Jour 3** : Frontend integration
- [ ] Hook useSpeechRecognition (fallback Web Speech)
- [ ] Hook useBackendVoice (appel API)
- [ ] Bouton micro dans chat
- [ ] Tests enregistrement → transcription

**Jour 4** : Overlay vocal
- [ ] Avatar fullscreen mode vocal
- [ ] Lecture audio avatar
- [ ] Animation synchronisée
- [ ] Tests conversation complète

**Jour 5** : Polish + Tests
- [ ] Gestion erreurs
- [ ] Feedback visuel utilisateur
- [ ] Tests mobile
- [ ] Tests Chrome/Edge/Safari

---

### Mois 2 : Upgrade Coqui (Si succès)

**Uniquement si** :
- >30% users utilisent vocal
- MRR >2000€ (peut absorber coût GPU)
- Feedback "améliorer qualité voix"

**Actions** :
- [ ] Louer GPU RunPod on-demand
- [ ] Installer Coqui XTTS-v2
- [ ] Voice cloning pour voix Helō unique
- [ ] Tests A/B Piper vs Coqui
- [ ] Switch production

---

## 🎨 VOICE CLONING - Créer voix unique Helō

### Avec Coqui XTTS-v2

**Étapes** :

1. **Enregistrer échantillon voix** (10-15 secondes)
   - Phrase calme, apaisante
   - Bonne qualité audio
   - Pas de bruit de fond
   - Exemple : "Bonjour, je suis Helō. Je suis là pour vous accompagner avec douceur. Prenez votre temps, nous avançons ensemble à votre rythme."

2. **Sauvegarder** : `backend/models/helo_voice.wav`

3. **Utiliser** :

```python
# Dans CoquiTTS.__init__
self.speaker_wav = "/app/models/helo_voice.wav"

# Maintenant toutes les synthèses utilisent cette voix !
```

**Résultat** : Voix 100% unique à IAcompagnon ✨

---

## 🔊 EXEMPLES DE VOIX DISPONIBLES

### Écouter avant de choisir

**Piper français** :
- https://rhasspy.github.io/piper-samples/ → Chercher "French"
- `fr_FR-siwis-medium` : Voix féminine douce ⭐
- `fr_FR-upmc-medium` : Voix féminine claire

**Coqui XTTS-v2** :
- https://huggingface.co/spaces/coqui/xtts → Tester avec texte français
- Qualité excellente, très naturelle

---

## ✅ CHECKLIST DÉVELOPPEUR

### Backend

- [ ] Installer Piper TTS (`pip install piper-tts`)
- [ ] Télécharger modèle fr_FR-siwis-medium.onnx
- [ ] Créer service `app/services/tts.py` (classe PiperTTS)
- [ ] Endpoint `/api/voice/synthesize` (POST)
- [ ] Installer Whisper (`pip install openai` ou `pip install whisper`)
- [ ] Endpoint `/api/voice/transcribe` (POST)
- [ ] Variables env : OPENAI_API_KEY (si Whisper API)
- [ ] Dockerfile avec Piper + modèles
- [ ] Tests unitaires endpoints

### Frontend

- [ ] Hook `hooks/useBackendVoice.js` (appel API TTS/STT)
- [ ] Fallback Web Speech API si backend indisponible
- [ ] Bouton micro dans Chat.jsx
- [ ] Overlay avatar mode vocal
- [ ] Lecture audio base64 → HTMLAudioElement
- [ ] Animation avatar synchronisée avec audio
- [ ] Gestion erreurs (micro refusé, API down, etc.)

---

## 💡 QUESTIONS FINALES

### Q1 : Quelle voix pour Helō ?

**Options** :
1. Utiliser `fr_FR-siwis-medium` (Piper) → Douce, féminine
2. Voice cloning avec Coqui → Voix 100% unique
3. Tester plusieurs et choisir

**Ma suggestion** : Commencer avec siwis-medium, puis voice cloning si budget

### Q2 : Hébergement GPU nécessaire ?

**Phase 1 (Piper)** : NON
- Fonctionne sur CPU
- Hetzner CPX31 (13.90€/mois) suffit

**Phase 2 (Coqui)** : OUI
- RunPod on-demand : 0.30$/heure
- Ou Hetzner CPU puissant (lent mais fonctionne)

### Q3 : Latence acceptable ?

**Piper** : 300-500ms → Excellent ✅  
**Coqui (GPU)** : 1-2s → Acceptable ✅  
**Coqui (CPU)** : 5-10s → Trop lent ❌  

---

## 🚀 VALIDATION

**Êtes-vous d'accord avec** :

1. ✅ Phase 1 : Piper TTS (gratuit, qualité 7.5/10)
2. ✅ STT : Whisper API (0.11€/user/mois)
3. ✅ Phase 2 : Upgrade Coqui si succès (qualité 9/10)
4. ✅ Voice cloning pour voix unique Helō

**C'est bon pour vous ?** 🎙️
