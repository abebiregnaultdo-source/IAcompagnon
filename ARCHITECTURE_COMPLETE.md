# HELŌ - Architecture Complète et Historique

> Document de référence unique pour l'architecture technique, ses évolutions et l'état actuel du système.
> Dernière mise à jour : 2026-01-25

---

## Table des matières

1. [Vue d'Ensemble](#1-vue-densemble)
2. [Architecture Actuelle](#2-architecture-actuelle)
3. [Services et Composants](#3-services-et-composants)
4. [Flux de Données](#4-flux-de-données)
5. [Frontend](#5-frontend)
6. [Backend](#6-backend)
7. [Déploiement](#7-déploiement)
8. [Historique des Évolutions](#8-historique-des-évolutions)
9. [Fichiers Clés](#9-fichiers-clés)

---

## 1. Vue d'Ensemble

### Stack Technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18 + Vite |
| Backend API | FastAPI (Python 3.11) |
| LLM Principal | Claude 3.5 Sonnet (Anthropic) |
| LLM Fallback | GPT-4 (OpenAI) |
| Auth & DB | Supabase |
| Hébergement Frontend | Vercel |
| Hébergement Backend | Render |
| Voice (prévu) | WebSocket + Whisper + Edge TTS |

### URLs Production

| Service | URL |
|---------|-----|
| Frontend | https://ia-compagnon.vercel.app |
| Backend AI Engine | https://helo-backend.onrender.com |
| Admin Dashboard | https://ia-compagnon.vercel.app/?admin=helo2024admin |
| Voice Service | Non déployé (fallback en place) |

---

## 2. Architecture Actuelle

### 2.1 Schéma Général

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Vercel)                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │   Auth   │ │   Chat   │ │Creativity│ │ VoiceChat│           │
│  │(Supabase)│ │          │ │          │ │(fallback)│           │
│  └──────────┘ └────┬─────┘ └────┬─────┘ └──────────┘           │
└────────────────────┼────────────┼───────────────────────────────┘
                     │            │
                     ▼            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Render)                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    AI Engine (FastAPI)                    │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │   │
│  │  │   Crisis    │  │ Therapeutic │  │  Creative   │       │   │
│  │  │  Detector   │  │   Engine    │  │  Prompts    │       │   │
│  │  └──────┬──────┘  └──────┬──────┘  └─────────────┘       │   │
│  │         │                │                                │   │
│  │         ▼                ▼                                │   │
│  │  ┌─────────────────────────────────────────────────┐     │   │
│  │  │              LLM Client                          │     │   │
│  │  │  Primary: Claude 3.5 Sonnet (Anthropic)         │     │   │
│  │  │  Fallback: GPT-4 (OpenAI)                       │     │   │
│  │  └─────────────────────────────────────────────────┘     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Décision Architecturale Majeure : Claude Direct

**Avant (≤ janvier 2026)** : Architecture RAG
- Embeddings sentence-transformers
- Base vectorielle ChromaDB
- Matching protocoles par similarité
- Templates de réponses pré-définis

**Problèmes rencontrés** :
- Réponses déconnectées du contexte conversationnel
- Hallucinations (ex: "défusion cognitive" proposée pour deuil simple)
- Pas de mémoire de conversation
- Ton robotique

**Après (janvier 2026)** : Claude Direct
- Claude répond directement avec prompt système expert
- Historique de conversation passé au LLM
- Règles anti-hallucination strictes
- Détection de crise par regex AVANT le LLM

---

## 3. Services et Composants

### 3.1 AI Engine (Principal)

**Fichier** : `backend/ai-engine/app/main.py`

**Endpoints** :

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/generate` | POST | Génération réponse thérapeutique |
| `/api/creative/prompts` | POST | Génération prompts créatifs personnalisés |
| `/api/creations/coloring` | POST | Sauvegarde coloriage mandala |
| `/api/creations/{user_id}` | GET | Récupération créations utilisateur |
| `/health` | GET | Health check |

**Composants internes** :

| Composant | Fichier | Rôle |
|-----------|---------|------|
| TherapeuticEngine | `therapeutic_engine.py` | Orchestration réponses + détection crise |
| LLMClient | `therapeutic_engine.py` | Appels Claude/OpenAI avec fallback |
| CreativeStorage | `main.py` | Stockage créations utilisateur |

### 3.2 Voice Service (Non déployé)

**Fichier** : `backend/voice-service/app/main.py`

**Composants** :
- STT Engine (Whisper API)
- TTS Engine (Edge TTS - Microsoft gratuit)
- WebSocket pour streaming temps réel

**État actuel** : Code prêt, non déployé sur Render. Frontend affiche message fallback.

### 3.3 Emotions Service (Legacy)

**Fichier** : `backend/emotions-service/`

**État** : Partiellement intégré. Analyse DistilBERT disponible mais peu utilisée depuis passage à Claude Direct.

---

## 4. Flux de Données

### 4.1 Flux Conversation Chat

```
1. User envoie message
   │
   ▼
2. Chat.jsx → POST /generate
   {
     messages: [{role, content}, ...],
     profile: {first_name, user_id_hash, ...},
     policy: {tone, phase, scores, ...}
   }
   │
   ▼
3. therapeutic_engine.py
   │
   ├─► detect_crisis(message)
   │   Si crise détectée → Réponse crise immédiate (3114)
   │
   └─► generate_response(messages, profile, policy)
       │
       ▼
4. LLMClient.call()
   Primary: Claude 3.5 Sonnet
   Fallback: GPT-4
   │
   ▼
5. Réponse JSON
   {
     text: "...",
     technique: "...",
     source: "claude_direct",
     crisis_detected: false
   }
   │
   ▼
6. Chat.jsx affiche réponse
   + Sauvegarde localStorage pour créativité
```

### 4.2 Flux Prompts Créatifs

```
1. User ouvre Créativité → Écriture
   │
   ▼
2. Creativity.jsx charge historique depuis localStorage
   │
   ▼
3. POST /api/creative/prompts
   {
     user_id, tool, first_name,
     conversation_history: [...]
   }
   │
   ▼
4. Claude génère prompts personnalisés
   basés sur thèmes de la conversation
   │
   ▼
5. Affichage prompts contextualisés
```

### 4.3 Flux Authentification

```
1. LandingPage → "Créer un compte"
   │
   ▼
2. Auth.jsx → Supabase Auth
   │
   ├─► Nouvel utilisateur → Onboarding (4 étapes)
   │   │
   │   ▼
   │   App.jsx → updateProfile(onboarding_completed: true)
   │
   └─► Utilisateur existant → Vérification session
       │
       ▼
       getProfile() → onboarding_completed === true ?
       │
       ├─► Oui → Home directement
       └─► Non → Onboarding
```

---

## 5. Frontend

### 5.1 Structure

```
frontend/src/
├── ui/
│   ├── App.jsx              # Routage principal, état global
│   ├── Auth.jsx             # Connexion/Inscription
│   ├── Onboarding.jsx       # 4 étapes d'onboarding
│   ├── Home.jsx             # Page d'accueil post-login
│   ├── Chat.jsx             # Interface conversation
│   ├── VoiceChat.jsx        # Appel vocal (+ fallback)
│   ├── Creativity.jsx       # Module créatif
│   ├── creativity/
│   │   ├── ColoringCanvas.jsx
│   │   └── Mandalas.js
│   ├── avatar/
│   │   ├── AvatarRoom.jsx
│   │   ├── AvatarView.jsx   # SVG avatar neutre
│   │   └── VoiceVisualization.jsx
│   └── components/          # Composants réutilisables
├── lib/
│   └── supabase.js          # Client Supabase
└── hooks/
    └── useDeviceDetection.js
```

### 5.2 État Global

Pas de Redux/Zustand. État géré par :
- `useState` dans App.jsx (user, navigation)
- `localStorage` pour persistance chat history
- Supabase pour profil utilisateur

### 5.3 Design System

Voir `frontend/DESIGN_SYSTEM.md` pour détails complets.

**Principes clés** :
- Pas de blanc pur (#FFFFFF) → Crèmes (#F2F6F7)
- Pas de noir pur → Gris chauds (#3A4048)
- Transitions lentes (4 secondes)
- Contrastes doux

---

## 6. Backend

### 6.1 Therapeutic Engine (Cœur du système)

**Fichier** : `backend/ai-engine/app/therapeutic_engine.py`

```python
# Structure simplifiée

THERAPEUTIC_SYSTEM_PROMPT = """
Tu es Helō, un compagnon thérapeutique bienveillant.

## RÈGLES ABSOLUES
### 1. ANTI-HALLUCINATION
- Ne mentionne JAMAIS quelque chose que l'utilisateur n'a pas dit
- Ne fais JAMAIS de suppositions
- ATTENDS que l'utilisateur te dise ce qu'il vit

### 2. STRUCTURE DE RÉPONSE
- Validation émotionnelle d'abord
- Questions ouvertes, pas de conseils directs
- Maximum 3-4 phrases
"""

class LLMClient:
    def call(self, messages, system_prompt):
        # 1. Essayer Claude
        # 2. Si échec → Fallback OpenAI
        # 3. Si échec → Réponse par défaut

def detect_crisis(message):
    # Patterns regex pour idéation suicidaire
    # Retourne réponse crise + numéro 3114
```

### 6.2 Variables d'Environnement

```env
# Requis
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Optionnel
MASTER_KEY=... (chiffrement)
```

### 6.3 Dépendances Principales

```
fastapi==0.104.1
anthropic>=0.18.0
openai>=1.0.0
pydantic==2.5.0
python-dotenv==1.0.0
```

---

## 7. Déploiement

### 7.1 Frontend (Vercel)

**Commande** :
```bash
cd frontend && npx vercel --prod --yes
```

**Compte** : chris-projects (auto-détecté)

**Variables Vercel** :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 7.2 Backend (Render)

**Service existant** : helo-backend

**Déploiement** : Automatique sur push GitHub (branche main)

**Variables Render** :
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`

### 7.3 Voice Service (À déployer)

**Instructions** :
1. Render Dashboard → New Web Service
2. Repo : `abebiregnaultdo-source/IAcompagnon`
3. Root Directory : `backend/voice-service`
4. Environment : Docker
5. Variables : `OPENAI_API_KEY`, `AI_ENGINE_URL`

---

## 8. Historique des Évolutions

### Phase 1 : Architecture Initiale (2024-2025)

- Architecture RAG avec ChromaDB
- 8 méthodes thérapeutiques (TCC, ACT, TIPI, etc.)
- Avatar avec silhouette neutre
- Détection émotionnelle DistilBERT

### Phase 2 : Refonte Claude Direct (Janvier 2026)

| Date | Changement | Fichiers |
|------|------------|----------|
| 2026-01-24 | Remplacement RAG par Claude Direct | `therapeutic_engine.py` |
| 2026-01-24 | Ajout règles anti-hallucination | `therapeutic_engine.py` |
| 2026-01-24 | Suppression biais "deuil/mère" | `therapeutic_engine.py` |
| 2026-01-24 | Connexion prompts créatifs à historique | `main.py`, `Creativity.jsx` |
| 2026-01-24 | Sauvegarde chat dans localStorage | `Chat.jsx` |

### Phase 3 : Corrections et Améliorations (Janvier 2026)

| Date | Changement | Fichiers |
|------|------------|----------|
| 2026-01-25 | Fix visio marqué "indispo" | `Home.jsx` |
| 2026-01-25 | Fix lien coloriage | `Creativity.jsx` |
| 2026-01-25 | Fix mandalas non cliquables | `ColoringCanvas.jsx`, `Mandalas.js` |
| 2026-01-25 | Fix onboarding répété | `App.jsx` |
| 2026-01-25 | Enrichissement palettes couleurs | `Mandalas.js` |
| 2026-01-25 | Responsive mandalas | `ColoringCanvas.jsx` |
| 2026-01-25 | Fallback voice-service | `VoiceChat.jsx` |
| 2026-01-25 | Revert modifications avatar (halo, inclinaison) | `AvatarView.jsx`, `AvatarRoom.jsx` |

### Évolutions Abandonnées

| Proposition | Raison abandon |
|-------------|----------------|
| Halo émotionnel autour avatar | Viole principe "pas de réaction" |
| Inclinaison avatar selon état | Idem |
| Mouvement bras quand parle | Idem |

---

## 9. Fichiers Clés

### Backend

| Fichier | Description |
|---------|-------------|
| `backend/ai-engine/app/main.py` | Endpoints FastAPI |
| `backend/ai-engine/app/therapeutic_engine.py` | Logique thérapeutique + LLM |
| `backend/ai-engine/app/llm_client.py` | Client LLM legacy (moins utilisé) |
| `backend/voice-service/app/main.py` | Service voix (non déployé) |

### Frontend

| Fichier | Description |
|---------|-------------|
| `frontend/src/ui/App.jsx` | Routage, état global, auth |
| `frontend/src/ui/Chat.jsx` | Interface conversation principale |
| `frontend/src/ui/Creativity.jsx` | Module créatif (écriture, coloriage) |
| `frontend/src/ui/avatar/AvatarView.jsx` | SVG avatar neutre |
| `frontend/src/lib/supabase.js` | Client Supabase |

### Configuration

| Fichier | Description |
|---------|-------------|
| `CLAUDE.md` | Instructions pour Claude Code |
| `.env` | Variables d'environnement (local) |
| `frontend/vercel.json` | Config Vercel |
| `backend/ai-engine/Dockerfile` | Image Docker backend |

---

## Navigation

- **Fondements théoriques** : Voir `ETAT_DE_LART.md`
- **Design System** : Voir `frontend/DESIGN_SYSTEM.md`
- **Protocoles thérapeutiques** : Voir `backend/EVIDENCE_BASED_ARCHITECTURE.md`
- **Avatar** : Voir `frontend/src/ui/avatar/README.md`
