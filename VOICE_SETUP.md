# 🎙️ Setup Voice Service - Piper TTS

## Installation Rapide (5 minutes)

### Étape 1 : Docker (Recommandé)

```bash
cd backend/voice-service
docker build -t iacompagnon-voice:latest .
docker run -d -p 8003:8003 --name voice-service iacompagnon-voice:latest
```

**Taille image** : ~300MB (inclut Piper + modèle français)

### Étape 2 : Vérifier service

```bash
# Healthcheck
curl http://localhost:8003/health

# Devrait retourner:
{
  "status": "ok",
  "stt_available": true,
  "tts_available": true
}
```

### Étape 3 : Test TTS

```bash
curl -X POST http://localhost:8003/api/synthesize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Bonjour, je suis Helō. Je suis là pour vous accompagner.",
    "voice_config": {
      "voice_id": "piper-fr-siwis",
      "speed": 1.0
    }
  }'
```

---

## Installation Manuelle (alternative)

### 1. Installer Piper TTS

```bash
pip install piper-tts
```

### 2. Télécharger modèle français

```bash
cd backend/voice-service
mkdir -p models
cd models

# Voix féminine douce (recommandé)
wget https://github.com/rhasspy/piper/releases/download/v1.2.0/fr_FR-siwis-medium.onnx
wget https://github.com/rhasspy/piper/releases/download/v1.2.0/fr_FR-siwis-medium.onnx.json
```

**Taille modèle** : ~15MB

### 3. Tester Piper CLI

```bash
echo "Bonjour Helō" | piper --model models/fr_FR-siwis-medium.onnx --output_file test.wav
```

Écoute `test.wav` pour vérifier la voix.

### 4. Lancer service

```bash
cd backend/voice-service
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8003 --reload
```

---

## Voix Disponibles

### Piper TTS (Open Source - Gratuit)

| Voice ID | Nom | Genre | Qualité | Latence |
|----------|-----|-------|---------|---------|
| `piper-fr-siwis` | Siwis | Féminine douce | 7.5/10 | <500ms |
| `piper-fr-upmc` | UPMC | Féminine claire | 7/10 | <500ms |

### Edge TTS (Cloud - Fallback)

| Voice ID | Nom | Genre | Qualité | Latence |
|----------|-----|-------|---------|---------|
| `fr-FR-DeniseNeural` | Denise | Féminine douce | 8/10 | 1-2s |
| `fr-FR-HenriNeural` | Henri | Masculine calme | 8/10 | 1-2s |

---

## Configuration

### Variables d'environnement

Le service Voice utilise les variables du `.env` principal :

```bash
# STT (Whisper API)
OPENAI_API_KEY=sk-...

# Fallback TTS (si Piper indisponible)
# (Edge TTS ne nécessite pas de clé)
```

### Choix de la voix par défaut

Éditer `backend/voice-service/app/tts_engine.py` :

```python
# Ligne 84
voice_id: str = "piper-fr-siwis"  # Voix par défaut
```

---

## Troubleshooting

### Problème 1 : "Piper not found"

```bash
# Vérifier installation
which piper
piper --version

# Réinstaller si nécessaire
pip uninstall piper-tts
pip install piper-tts
```

### Problème 2 : "Model not found"

```bash
# Vérifier chemin modèle
ls -lh backend/voice-service/models/

# Devrait afficher:
# fr_FR-siwis-medium.onnx (15MB)
# fr_FR-siwis-medium.onnx.json
```

### Problème 3 : Qualité audio faible

**Solutions** :
1. Utiliser `fr_FR-upmc-medium` (voix alternative)
2. Upgrade vers Coqui XTTS-v2 (Phase 2) pour qualité 9/10

---

## Upgrade vers Coqui (Phase 2)

Si >30% users utilisent vocal et MRR >2000€ :

### 1. Installer Coqui TTS

```bash
pip install TTS
```

### 2. Lancer avec GPU

Nécessite :
- GPU NVIDIA (RTX 3060+)
- CUDA 11.8+
- 3GB VRAM minimum

```python
from TTS.api import TTS

tts = TTS(
    model_name="tts_models/multilingual/multi-dataset/xtts_v2",
    gpu=True
)

tts.tts_to_file(
    text="Bonjour je suis Helō",
    file_path="output.wav",
    language="fr"
)
```

**Qualité** : 9/10 (vs 7.5/10 Piper)
**Coût** : ~220€/mois (GPU 24/7) ou 0.30$/h on-demand

---

## Architecture Actuelle

```
Frontend (VoiceChat.jsx)
    ↓
WebSocket ws://localhost:8003/ws/voice/{user_id}
    ↓
Voice Service (Port 8003)
    ├─ STT: Whisper (OpenAI API)
    │   → Coût: 0.006$/min = 0.11€/user/mois
    │
    └─ TTS: Piper (Open Source)
        → Coût: 0€
        → Qualité: 7.5/10
        → Latence: <500ms
```

**Coût total** : 0.11€/user/mois 🎉

---

## Prochaines Étapes

- [ ] Tester vocal depuis frontend (bouton 📞)
- [ ] Vérifier latence <500ms
- [ ] Tester sur mobile
- [ ] Collecter feedback qualité voix
- [ ] Si succès → Upgrade Coqui (Phase 2)

---

**Voir aussi** : [SOLUTIONS_VOCALES_OPEN_SOURCE.md](SOLUTIONS_VOCALES_OPEN_SOURCE.md) pour comparatif détaillé.
