# Helō - IA Compagnon Thérapeutique pour le Deuil

Compagnon IA evidence-based pour l'accompagnement du deuil, basé sur 8 méthodes thérapeutiques validées scientifiquement.

---

## 🚀 Démarrage Rapide

### Windows (1 clic)
```bash
start_all_services.bat
```

Ouvre automatiquement http://localhost:5173

### Manuel

**Backend (4 services):**
```bash
# Terminal 1 - API Gateway (8000)
cd backend/api-gateway && uvicorn app.main:app --port 8000

# Terminal 2 - AI Engine (8001)
cd backend/ai-engine && uvicorn app.main:app --port 8001

# Terminal 3 - Emotions (8002)
cd backend/emotions-service && uvicorn app.main:app --port 8002

# Terminal 4 - Voice (8003)
cd backend/voice-service && uvicorn app.main:app --port 8003
```

**Frontend:**
```bash
cd frontend && npm run dev
```

---

## 🎯 Fonctionnalités

### Méthodes Thérapeutiques (8)
- ✅ **TIPI** - Régulation émotionnelle somatique (4 variations)
- ✅ **ACT** - Acceptance & Commitment Therapy (3 variations)
- ✅ **Journaling** - Écriture expressive (3 variations)
- ✅ **Continuing Bonds** - Liens continus (3 variations)
- ✅ **Narrative** - Thérapie narrative (2 variations)
- ✅ **Logothérapie** - Recherche de sens (2 variations)
- ✅ **Polyvagal** - Régulation système nerveux (2 variations)
- ✅ **Mindfulness** - Pleine conscience (2 variations)

### Détection Multi-Modale
- ✅ Analyse linguistique (patterns, métacognition)
- ✅ EmotionBERT (valence, arousal, dominance)
- ✅ Screening clinique (contraindications)
- ✅ Safety Monitor (effets indésirables)

### Système de Sécurité Optimal
- ✅ Seuils adaptatifs personnalisés (baseline + 2σ)
- ✅ Analyse tendances 4h (régression linéaire)
- ✅ Prédiction risque (5 règles expertes)
- ✅ Plans intervention (5 niveaux)

### Créations & Progression
- ✅ **Stockage créations** (journal, narratifs, poèmes, rituels)
- ✅ **Dashboard progression** (graphique évolution émotionnelle)
- ✅ **Reprise conversations** (historique 20 messages)
- ✅ **Ressources externes** (6 ressources validées)

### Interface
- ✅ Chat SMS-style thérapeutique
- ✅ Voice avec avatar 3D (STT/TTS)
- ✅ Radar émotionnel (Détresse/Espoir/Énergie)
- ✅ Settings personnalisables
- ✅ Design system cohérent

---

## 📁 Architecture

```
IAcompagnon/
├── backend/
│   ├── api-gateway/        # Orchestration (8000)
│   ├── ai-engine/          # Méthodes thérapeutiques (8001)
│   ├── emotions-service/   # EmotionBERT (8002)
│   └── voice-service/      # STT/TTS (8003)
├── frontend/               # React + Vite (5173)
└── data/                   # Stockage chiffré
```

---

## 🔧 Configuration

**Fichier `.env` requis:**
```env
MASTER_KEY=your_32_char_encryption_key_here
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
KNOWLEDGE_MODEL=gpt-4o
EMPATHY_MODEL=claude-3-5-sonnet-20241022
```

---

## 📊 Endpoints API

### API Gateway (8000)
- `POST /api/chat` - Conversation thérapeutique
- `POST /api/analyze` - Analyse émotionnelle
- `GET /api/state/history` - Historique états
- `POST /api/creations/*` - Sauvegarder créations
- `GET /api/creations/{user_id}` - Récupérer créations
- `GET /api/resources` - Ressources externes
- `GET /api/chat/history/{user_id}` - Historique conversations

### AI Engine (8001)
- `POST /api/therapeutic/intervention` - Intervention thérapeutique
- `POST /api/therapeutic/detect` - Détection méthode optimale

### Emotions (8002)
- `POST /api/score` - Score émotionnel EmotionBERT

### Voice (8003)
- `WS /ws/voice/{user_id}` - WebSocket voix temps réel

---

## 📚 Documentation

- `QUICK_START.md` - Guide démarrage détaillé
- `OPTIMAL_SAFETY_IMPLEMENTATION.md` - Système sécurité
- `ARCHITECTURE.md` - Architecture complète
- `backend/EVIDENCE_BASED_ARCHITECTURE.md` - Méthodes evidence-based
- `frontend/DESIGN_SYSTEM.md` - Design system

---

## 🧪 Tests

```bash
# Backend
cd backend/ai-engine && pytest tests/

# Frontend
cd frontend && npm test
```

---

## 🛡️ Sécurité

- ✅ Chiffrement AES-256-GCM (données utilisateur)
- ✅ Hash SHA256 (user IDs)
- ✅ Logs RGPD-compliant
- ✅ Safety monitoring temps réel
- ✅ Contraindications cliniques

---

## 📝 Licence

Propriétaire - Tous droits réservés

---

## 👥 Contact

Projet développé pour accompagnement thérapeutique du deuil.

