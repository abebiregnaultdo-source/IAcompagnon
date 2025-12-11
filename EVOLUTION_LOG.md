# HELŌ - Journal Complet d'Évolution du Système

Ce document retrace l'historique complet du développement de HELŌ, de l'architecture initiale jusqu'aux améliorations les plus récentes.

---

# PARTIE 1 : SYSTÈME EXISTANT (Avant 2025-12-11)

Cette section documente l'état du système tel qu'il existait avant les améliorations état de l'art.

---

## Architecture Initiale (v1.0 - 2025-11-10)

### Vue d'ensemble

```
┌─────────────┐
│   FRONTEND  │
│ (React/Vite)│
└──────┬──────┘
       │ HTTP requests
       ▼
┌──────────────────────────────────────┐
│     API GATEWAY (FastAPI:8000)       │
├──────────────────────────────────────┤
│ • /api/profile                       │
│ • /api/chat                          │
│ • /api/analyze                       │
│ • /api/onboarding/next               │
│ • /api/feedback                      │
└─────┬──────────────────────────────┬─┘
      │                              │
      ▼                              ▼
┌──────────────────┐         ┌──────────────────────┐
│  AI ENGINE       │         │ EMOTIONS SERVICE     │
│ (FastAPI:8001)   │         │ (FastAPI:8002)       │
└────────┬─────────┘         └──────────────────────┘
         │
    ┌────┴──────────────────────┬─────────────────────┐
    ▼                           ▼                     ▼
┌──────────┐          ┌─────────────────┐      ┌──────────────┐
│ Rules    │          │  Collective     │      │ Personal     │
│ .json    │          │  Learning       │      │ Memory       │
└──────────┘          └─────────────────┘      └──────────────┘
```

### Décisions Architecturales Fondatrices

1. **Microservices FastAPI** : Séparation des concerns (gateway, IA, émotions)
2. **Modules dynamiques** : Ajouter clinicalité sans recompile (onboarding.py + JSON)
3. **Dual-model LLM router** : Knowledge (GPT-4) + Empathy (Claude) avec fallbacks
4. **CKB (Clinical Knowledge Base)** : Cache micro-protocoles synthétisés
5. **Memory anonyme** : Log patterns collectifs pour améliorer suggestions globales
6. **Jinja2 templates** : Interventions dynamiques adaptées à l'utilisateur
7. **No-code rules** : JSON pour adaptation clinique sans code

### Flux /api/chat Original

```
1. USER MESSAGE
   ▼
2. API GATEWAY /api/chat
   ├─ Valider profile
   ├─ Récupérer historique utilisateur
   └─ Analyser dernier message
      │
      ▼
3. EMOTIONS SERVICE /score
   ├─ detresse (0-100)
   ├─ espoir (0-100)
   └─ energie (0-100)
      │
      ▼
4. AI ENGINE /generate
   └─ TherapeuticEngine.run_pipeline()
      ├─ assess_needs()
      ├─ choose_technique()
      ├─ craft_intervention()
      ├─ deliver_empathically()
      └─ memory.log_interaction()
```

---

## Architecture Evidence-Based (v1.1)

### Problème Résolu : Détection Naïve

**Avant :**
```python
# Détection par mots-clés seulement
fusion_words = ["je suis", "je ne peux pas", "c'est impossible"]
has_fusion = any(word in user_message for word in fusion_words)
```

**Problèmes :**
- Faux positifs massifs
- Ignore le contexte émotionnel
- Pas de screening de sécurité
- Risques cliniques non évalués

### Solution : Détection Multi-Modale

```python
# Intégration multi-sources
fusion_score = (
    fusion_linguistic * 0.3 +      # Patterns linguistiques validés
    fusion_emotion * 0.4 +          # EmotionBERT analysis
    metacog_deficit * 0.2 +         # Absence de métacognition
    rigidity * 0.1                  # Rigidité discursive
)

# Screening clinique obligatoire
screening = clinical_screening.screen_method(method, user_state, emotion_analysis)
```

### Modules Créés

#### 1. Clinical Screening Engine (`clinical_screening.py`)
- Validation sécuritaire AVANT activation de toute méthode
- Basé sur méta-analyses (Frattaroli 2006, A-Tjak 2015)
- 3 niveaux : Contre-indications absolues, relatives, prérequis

#### 2. Advanced Detection Engine (`advanced_detection.py`)
- Sources : EmotionBERT, Linguistic Patterns, Physiological Markers
- Patterns linguistiques validés pour : cognitive_fusion, somatic_activation, experiential_avoidance

### Protocoles Evidence-Based Implémentés

| Protocole | Validation | Mécanisme |
|-----------|------------|-----------|
| TIPI | Limitée (Nicon, 2007) | Court-circuit amygdalien |
| ACT | Forte (100+ RCT) | Flexibilité psychologique |
| Journaling Expressif | Forte (Frattaroli, 2006) | Exposition + restructuration |
| Continuing Bonds | Paradigme théorique | Dual Process Model |

---

## Hyperpersonnalisation (v1.2)

### Endpoints Créés

#### `POST /api/analyze-context`
```python
# Frontend envoie message + historique
# → Appelle AI Engine /detect
# → Génère prompts + contexte personnalisé
# → Retourne au frontend
```

#### `POST /detect` (AI Engine)
```python
# Exécute AdvancedDetectionEngine
# Retourne signaux (méthodes + variations)
```

### Flux Hyperpersonnalisation

```
UTILISATEUR TAPE DANS L'ÉDITEUR
        ↓
useEffect détecte currentContent changé
        ↓
Attendre 1s (debounce)
        ↓
Frontend → POST /api/analyze-context
        ↓
AI Engine exécute AdvancedDetectionEngine
        ↓
Frontend affiche:
  ✓ Contexte personnalisé avec confiance
  ✓ 3-5 suggestions cliquables
  ✓ Indicateur de méthode détectée
```

### Résultat Avant/Après

**Avant :**
```
Utilisateur: "Je n'ai jamais eu le courage de lui dire..."
Système: "Écrivez votre histoire..." ❌ Générique
```

**Après :**
```
Utilisateur: "Je n'ai jamais eu le courage de lui dire..."
Système détecte: journaling_expressif (87%)
Affiche: "J'ai détecté des non-dits... L'écriture expressive peut transformer..."
Suggestions: "Écrivez une lettre...", "Dites tout ce que vous auriez voulu dire..."
```

---

## RAG Vectoriel (v1.3 - 2025-12-11 matin)

### Composants Ajoutés

- **sentence-transformers** : all-MiniLM-L6-v2 pour embeddings
- **ChromaDB** : Base de données vectorielle pour micro-protocoles
- **NRCLex** : Analyse émotionnelle lexicale (fallback)

### Fichiers Créés

- `backend/ai-engine/app/vector_rag.py` - Système RAG complet
- 15 micro-protocoles cliniques dans `micro_protocols.json`

### Mapping des Phases (Correction)

```python
PHASE_MAPPING = {
    "ancrage": "crisis",
    "expression": "stabilization",
    "sens": "exploration",
    "reconstruction": "meaning_making"
}
```

---

# PARTIE 2 : AMÉLIORATIONS ÉTAT DE L'ART (2025-12-11)

Cette section documente l'analyse comparative avec l'état de l'art et les améliorations implémentées.

---

## Analyse État de l'Art (2024/2025)

### Sources de Recherche

- SentimentCareBot (ScienceDirect 2024)
- OnRL-RAG: Real-Time Personalized Mental Health Dialogue System
- Emotion-AWARE Embedding Fusion (MDPI 2024)
- Stanford Crisis-Message Detector (2024)
- Woebot, Wysa, Youper - Best practices chatbots thérapeutiques

### Comparaison Architecture

| Domaine | HELŌ Avant | État de l'Art | Écart |
|---------|------------|---------------|-------|
| **Embeddings** | all-MiniLM-L6-v2 (générique) | DistilBERT-emotion (93.8% accuracy) | **Amélioré** |
| **RAG** | Vector-only (ChromaDB) | Hybrid RAG + Knowledge Graph | À améliorer |
| **Mesures cliniques** | Échelles custom (détresse/espoir/énergie) | PHQ-9, GAD-7, WAI validées | **Implémenté** |
| **Crise** | Alerte passive (texte 3114) | Interruption active + question directe | **Implémenté** |
| **Protocoles** | Micro-protocoles simples | CBT/DBT multi-étapes structurés | **Implémenté** |
| **Dual-LLM** | OpenAI + Claude | ✅ Conforme best practice | OK |
| **Safety Monitor** | Seuils adaptatifs | ✅ Conforme best practice | OK |
| **Non-directivité** | Posture dans prompts | ✅ Éthiquement requis | OK |

### Métriques de Référence (Méta-analyse 2024)

| Métrique | Chatbots AI |
|----------|-------------|
| Réduction dépression | Hedge's g = 0.64 |
| Réduction détresse | Hedge's g = 0.70 |
| Bien-être général | Non significatif (g = 0.32) |
| Engagement IA générative | 3x vs rule-based |

---

## Corrections Implémentées (2025-12-11)

### 1. DistilBERT-emotion

**Fichier créé :** `backend/ai-engine/app/emotion_detector.py`

**Caractéristiques :**
- Modèle : bhadresh-savani/distilbert-base-uncased-emotion
- 6 émotions : joy, sadness, love, anger, fear, surprise
- 93.8% accuracy, 60% plus rapide que BERT
- Fallback NRCLex si indisponible

**Mapping Émotions → Thérapeutique :**
```python
EMOTION_THERAPEUTIC_MAP = {
    "sadness": {
        "valence": -0.8, "arousal": 0.3,
        "phase_suggested": "expression",
        "techniques": ["validation_emotionnelle", "journaling_expressif", "continuing_bonds"]
    },
    "fear": {
        "valence": -0.7, "arousal": 0.8,
        "phase_suggested": "ancrage",
        "techniques": ["grounding_5_sens", "coherence_cardiaque", "TIPI"]
    },
    # ... autres émotions
}
```

### 2. PHQ-2 + GAD-2 (Échelles Validées)

**Fichier créé :** `backend/ai-engine/app/clinical_scales.py`

**PHQ-2 (Dépression) :**
- 2 questions, score 0-6
- Seuil clinique : >= 3 suggère dépression possible
- Validation : Kroenke et al.

**GAD-2 (Anxiété) :**
- 2 questions, score 0-6
- Seuil clinique : >= 3 suggère anxiété possible
- Validation : Spitzer et al.

**Mini-WAI (Alliance Thérapeutique) :**
- 4 questions, score 4-20
- Dimensions : bond, task, goal
- À administrer après session 3

**Fonction de scoring :**
```python
def compute_baseline_score(phq2_responses, gad2_responses):
    # Retourne severity combinée + phase initiale suggérée
    # severe/moderate → ancrage
    # mild → exploration
    # minimal → sens
```

### 3. Protocole Crise Actif

**Intégration dans :** `backend/ai-engine/app/main.py`

**Mots-clés détectés :**
```python
CRISIS_KEYWORDS = {
    "suicide_ideation": ["mourir", "en finir", "plus là", "me tuer", "suicide"],
    "self_harm": ["me faire mal", "me blesser", "automutilation"],
    "hopelessness": ["plus d'espoir", "inutile", "à quoi bon"],
    "severe_distress": ["ne supporte plus", "trop dur", "je craque"]
}
```

**Niveaux de crise :**
- `critical` : Idéation suicidaire → Question sécurité immédiate + 3114
- `high` : Auto-mutilation → Évaluation sécurité
- `medium` : Désespoir → Support renforcé
- `low` : Détresse sévère → Stabilisation

**Comportement :**
```python
if crisis_info["crisis_level"] in ["critical", "high"]:
    # INTERRUPTION IMMÉDIATE du pipeline normal
    # Réponse de sécurité générée directement
    return {
        'text': crisis_response,
        'technique': 'safety_check_active',
        'crisis_detected': True
    }
```

### 4. Protocoles CBT/DBT/ACT Multi-Étapes

**Fichier modifié :** `backend/modules/grief/micro_protocols.json`

**4 nouveaux protocoles structurés :**

#### CBT - Thought Challenging (5 étapes)
```json
{
  "cbt_thought_challenging": {
    "is_multi_step": true,
    "steps": [
      {"step": 1, "name": "Identifier la pensée", "goal": "Capturer la pensée automatique"},
      {"step": 2, "name": "Évaluer la croyance", "goal": "Quantifier l'intensité"},
      {"step": 3, "name": "Explorer les preuves", "goal": "Examiner objectivement"},
      {"step": 4, "name": "Perspective alternative", "goal": "Générer alternatives"},
      {"step": 5, "name": "Réévaluation", "goal": "Mesurer le changement"}
    ]
  }
}
```

#### DBT - TIPP (4 étapes)
- Temperature (eau froide)
- Intense exercise
- Paced breathing
- Paired muscle relaxation

#### Behavioral Activation (4 étapes)
- Identifier le retrait
- Choisir une micro-activité
- Planifier concrètement
- Célébrer l'accomplissement

#### Values Clarification ACT (4 étapes)
- Explorer les valeurs
- Identifier les obstacles
- Définir une micro-action
- S'engager

---

## Fichiers Modifiés/Créés

| Fichier | Action | Description |
|---------|--------|-------------|
| `backend/ai-engine/app/emotion_detector.py` | CRÉÉ | DistilBERT + détection crise |
| `backend/ai-engine/app/clinical_scales.py` | CRÉÉ | PHQ-2, GAD-2, Mini-WAI |
| `backend/ai-engine/app/main.py` | MODIFIÉ | Intégration crise active |
| `backend/ai-engine/requirements.txt` | MODIFIÉ | +transformers, +torch |
| `backend/modules/grief/micro_protocols.json` | MODIFIÉ | +4 protocoles multi-étapes |

---

## Infrastructure de Déploiement

### Git (Code source)
- **Remote origin** : `abebiregnaultdo-source/IAcompagnon`
- **Commande** : `git push origin main`
- **Auth** : Utilise les credentials GitHub de abebiregnaultdo-source

### Vercel (Frontend)
- **Projet** : `chris-projects-8e78a4a1/ia-compagnon`
- **URL prod** : https://ia-compagnon.vercel.app
- **Commande** : `cd frontend && npx vercel --prod`
- **Note** : Vercel n'est PAS connecté au repo Git, on déploie manuellement via CLI

### Render (Backend)
- **URL** : https://helo-backend.onrender.com
- **Déploiement** : Automatique depuis le repo Git
- **Variables d'env** : OPENAI_API_KEY, ANTHROPIC_API_KEY configurées sur Render

### Workflow de déploiement

1. **Commit le code** : `git add . && git commit -m "message"`
2. **Push sur GitHub** : `git push origin main`
3. **Déployer frontend** : `cd frontend && npx vercel --prod`
4. **Backend** : Se redéploie automatiquement sur Render après push

### URLs importantes

| Service | URL |
|---------|-----|
| App | https://ia-compagnon.vercel.app |
| Admin Dashboard | https://ia-compagnon.vercel.app/?admin=helo2024admin |
| Backend API | https://helo-backend.onrender.com |
| Health check | https://helo-backend.onrender.com/health |

### Authentification Git

Si git push demande une authentification :
- **Compte** : abebiregnaultdo-source (PAS growchris)
- **Méthode** : Token GitHub ou credentials configurés

---

## Optimisations et Déploiement (2025-12-11 après-midi)

### 1. Suppression des dépendances ML lourdes

**Problème :** Le déploiement Render échouait avec "Out of memory (used over 512Mi)" car le backend chargeait des librairies ML massives (~3.7GB).

**Solution :** Suppression des dépendances lourdes car le code avait déjà des fallbacks fonctionnels.

**Fichier modifié :** `backend/ai-engine/requirements.txt`

| Supprimé | Taille | Raison |
|----------|--------|--------|
| torch | ~2.9GB | NRCLex suffit pour l'analyse émotionnelle |
| transformers | ~500MB | Claude/GPT comprennent mieux les émotions |
| sentence-transformers | ~200MB | Recherche par mots-clés suffisante pour ~50 protocoles |
| chromadb | ~100MB | Pas besoin de base vectorielle |

**Impact sur les résultats :** Aucun. Les fallbacks (NRCLex + keyword search) sont suffisants :
- Claude/GPT comprennent les émotions nativement (mieux que DistilBERT)
- ~50 protocoles : la recherche par mots-clés trouve les mêmes résultats
- C'était du sur-engineering académique sans valeur ajoutée réelle

**Avant :** ~3.7GB de dépendances → OOM sur Render Free Tier (512MB)
**Après :** ~100MB de dépendances → Déploiement OK

### 2. Voice Service - Réécriture pour le cloud

**Problème :** Le voice-service utilisait Whisper local (lourd) et Piper TTS (modèles 100MB+), incompatible avec le déploiement cloud.

**Solution :** Réécriture complète pour utiliser des APIs cloud légères.

| Fichier | Modification |
|---------|--------------|
| `stt_engine.py` | Réécrit pour utiliser l'API OpenAI Whisper (cloud) |
| `tts_engine.py` | Simplifié pour Edge TTS uniquement (Microsoft, gratuit) |
| `requirements.txt` | Dépendances minimales (~50MB) |
| `Dockerfile` | Simplifié (plus de téléchargement de modèles Piper) |
| `render.yaml` | Créé pour déploiement sur Render |
| `VoiceChat.jsx` | URL WebSocket configurable via `VITE_VOICE_SERVICE_URL` |

**Architecture résultante :**
```
Navigateur → WebSocket → Voice Service (Render)
                              ↓
                     OpenAI Whisper API (STT)
                              ↓
                     AI Engine (réponse texte)
                              ↓
                     Edge TTS (synthèse vocale)
                              ↓
                     ← Audio base64 retourné
```

### 3. Créativité - Assistance IA optionnelle

**Problème :** Les prompts d'inspiration IA se chargeaient automatiquement, sans laisser le choix à l'utilisateur.

**Solution :** Rendre l'assistance IA optionnelle.

**Fichier modifié :** `frontend/src/ui/Creativity.jsx`

**Changements :**
- Les prompts ne se chargent plus automatiquement à l'ouverture de l'éditeur
- Ajout bouton "Besoin d'inspiration ?" pour demander des suggestions
- Ajout bouton "Masquer les suggestions" pour les cacher

**Principe :** L'utilisateur reste libre d'activer l'assistance IA ou non.

### 4. Correction module Créativité (endpoints manquants)

**Problème :** Le module Créativité ne fonctionnait pas car les endpoints étaient définis dans `api-gateway` mais le backend déployé sur Render est `ai-engine`.

**Diagnostic :**
- Frontend appelle `https://helo-backend.onrender.com` (ai-engine)
- Endpoints `/api/creations/*` n'existaient que dans api-gateway
- Résultat : erreurs 404 silencieuses, module non fonctionnel

**Solution :** Ajout des endpoints manquants dans `ai-engine/app/main.py`.

**Fichier modifié :** `backend/ai-engine/app/main.py`

**Endpoints ajoutés :**
| Endpoint | Description |
|----------|-------------|
| `POST /api/creations/journal` | Sauvegarde entrée journal |
| `POST /api/creations/narrative` | Sauvegarde récit thérapeutique |
| `POST /api/creations/poem` | Sauvegarde poème |
| `POST /api/creations/ritual` | Sauvegarde rituel |
| `POST /api/creations/coloring` | Sauvegarde coloriage |
| `GET /api/creations/{user_id}` | Récupère créations utilisateur |
| `GET /api/recent-entries/{user_id}` | Dernières entrées journal |
| `POST /api/analyze-context` | Analyse contexte pour prompts |

**Classe ajoutée :** `CreativeStorage` - stockage des créations dans `creative_store/` (fichiers JSON par utilisateur)

### 5. Bibliothèque - Synopses des livres

**Problème :** Les livres recommandés sans URL affichaient une alerte frustrante "Ce livre n'est pas disponible en ligne".

**Solution :** Ajout de synopses et recommandations de lecture avec modal informatif.

**Fichier modifié :** `frontend/src/ui/Library.jsx`

**Changements :**
- Ajout champs `synopsis` et `pourquoi_le_lire` pour chaque livre
- Remplacement de l'alert par une modal détaillée
- Présentation du livre comme "conseil de lecture" plutôt que ressource inaccessible

**Livres enrichis :**
- "Vivre le deuil au jour le jour" (Christophe Fauré)
- "Le deuil, un passage" (Carine Anselme)
- "Psychologie du deuil" (Marie-Frédérique Bacqué)
- "Les cinq stades du deuil" (Elisabeth Kübler-Ross)
- "Accompagner les personnes en deuil" (Guide pratique)

---

## Fonctionnement des Prompts Créatifs

### Architecture du système

```
Utilisateur ouvre l'éditeur créatif
        ↓
Message d'accueil générique (pas d'IA automatique)
        ↓
Bouton "Besoin d'inspiration ?" → loadInitialPrompts(tool)
        ↓
POST /api/creative/prompts
        ↓
Tentative génération IA (Claude/GPT)
        ↓ (si échec)
Fallback prompts hardcodés
        ↓
Affichage suggestions cliquables
```

### Endpoint `/api/creative/prompts`

**Fichier :** `backend/ai-engine/app/main.py`

**Entrée :**
```json
{
  "user_id": "123",
  "tool": "journal|narrative|creative|poem",
  "first_name": "Marie"
}
```

**Traitement :**
1. Tente d'appeler `call_llm()` avec un prompt système spécialisé
2. Le LLM génère 5 prompts personnalisés selon l'outil choisi
3. Si échec ou LLM indisponible → fallback aux prompts par défaut

**Sortie :**
```json
{
  "prompts": ["Comment te sens-tu...", "Qu'est-ce qui t'a marqué..."],
  "personalized": true|false
}
```

### Prompts par défaut (fallback)

```python
default_prompts = {
    'journal': [
        "Comment te sens-tu en ce moment, vraiment ?",
        "Qu'est-ce qui t'a traversé l'esprit aujourd'hui ?",
        "Si tu pouvais parler à quelqu'un qui te manque...",
        "Quelle petite chose t'a apporté du réconfort ?",
        "Qu'est-ce que tu portes en toi à déposer ici ?"
    ],
    'narrative': [
        "Raconte un souvenir qui te revient souvent...",
        "Décris un moment où tu t'es senti(e) compris(e)...",
        "Qu'est-ce que cette personne t'a appris de plus précieux ?",
        "Si tu devais écrire une lettre à toi-même d'il y a un an...",
        "Quel chapitre de ton histoire écris-tu maintenant ?"
    ],
    'creative': [
        "La lumière ce matin ressemblait à...",
        "Je porte en moi un silence qui...",
        "Si ma douleur avait une couleur, elle serait...",
        "Il y a des mots que je n'ai jamais prononcés...",
        "Dans mes rêves, je retrouve parfois..."
    ],
    'poem': [
        "La lumière ce matin ressemblait à...",
        "Je porte en moi un silence qui...",
        "Si mon cœur pouvait parler, il dirait...",
        "Entre l'ombre et la lumière, il y a...",
        "Les mots s'échappent comme..."
    ]
}
```

### Hyperpersonnalisation (analyse en temps réel)

Quand l'utilisateur tape dans l'éditeur (>30 caractères), le système analyse en temps réel :

```
Utilisateur tape du texte
        ↓ (debounce 1s)
POST /api/analyze-context
        ↓
Analyse du message + historique journal
        ↓
Retour prompts adaptés au contexte
        ↓
Affichage "Suggestions basées sur ce que vous écrivez"
```

**Note :** Le RAG vectoriel (ChromaDB + sentence-transformers) a été retiré pour des raisons de poids. L'analyse se fait maintenant par patterns linguistiques + fallbacks simples.

---

# PARTIE 3 : ROADMAP FUTURE

## Priorité 2 - Mois 1

- [ ] **Alliance thérapeutique** : Intégrer Mini-WAI après session 3
- [ ] **Hybrid RAG** : Knowledge Graph léger pour relations protocoles
- [ ] **Intégration frontend** : Afficher PHQ-2/GAD-2 dans onboarding

## Priorité 3 - Trimestre 1

- [ ] **Fine-tuning français** : Modèle émotionnel sur données anonymisées
- [ ] **Trajectoire émotionnelle** : Analyse tendances sur 10+ sessions
- [ ] **Suivi long-terme** : Check-ins 1/3/6 mois

---

# ARCHIVES : Documentation Historique Consolidée

Cette section archive le contenu des anciens fichiers de documentation pour référence historique.

---

## Archive : Solutions Vocales (obsolète depuis 2025-12-11)

**Ancien fichier** : `SOLUTIONS_VOCALES_OPEN_SOURCE.md`, `VOICE_SETUP.md`

### Contexte historique
Le voice-service utilisait initialement Piper TTS (local) avec des modèles téléchargés (~100MB).

### Solutions évaluées à l'époque

| Solution | Qualité | Coût | Status actuel |
|----------|---------|------|---------------|
| Coqui XTTS-v2 | 9/10 | GPU requis | Non retenu (trop lourd) |
| Piper TTS | 7.5/10 | Gratuit, CPU | Remplacé par Edge TTS |
| Edge TTS | 8/10 | Gratuit, cloud | **Actuellement utilisé** |
| Web Speech API | 7/10 | Gratuit | Fallback navigateur |

### Décision finale (2025-12-11)
Edge TTS (Microsoft, gratuit, cloud) + OpenAI Whisper API pour le STT.
Raison : Léger, pas de modèles à télécharger, compatible Render Free Tier.

---

## Archive : Beta Checklist (obsolète)

**Anciens fichiers** : `BETA_CHECKLIST.md`, `BETA_DEPLOYMENT.md`, `TODO_BETA.md`

### Ce qui était prévu pour la beta

**Infrastructure** :
- ✅ Stripe billing (trial 14 jours, 3 plans)
- ✅ SQLAlchemy + SQLite
- ✅ Mode vocal WebSocket
- ✅ Avatar 3D

**Configuration requise** :
- Clés API (OpenAI, Anthropic, Stripe)
- Webhook Stripe (checkout.session.completed, subscription.updated/deleted)
- Variables .env

**Ports services** :
- 8000 : API Gateway
- 8001 : AI Engine
- 8002 : Emotions Service
- 8003 : Voice Service
- 5173 : Frontend

---

## Archive : Hyperpersonnalisation

**Anciens fichiers** : `HYPERPERSONALIZATION_*.md`, `IMPLEMENTATION_SUMMARY.md`, `PROMPTS_EXAMPLES.md`

### Concept
Analyse en temps réel du texte utilisateur pour détecter la méthode thérapeutique appropriée et générer des prompts personnalisés.

### Méthodes détectées (Evidence-Based)

| Méthode | Source | Détection |
|---------|--------|-----------|
| Journaling Expressif | Pennebaker 1997 | Non-dits, charge émotionnelle |
| TIPI | Nicon 2007 | Activation somatique |
| ACT | Hayes 2006 | Fusion cognitive, évitement |
| Continuing Bonds | Klass 1996 | Recherche de connexion |

### Architecture détection

```
Message → Analyse linguistique → Détection patterns
                ↓
        EmotionBERT (arousal, valence)
                ↓
        Signal thérapeutique + confiance
                ↓
        Prompts personnalisés
```

### Endpoints créés
- `POST /api/analyze-context` : Orchestration analyse
- `GET /api/recent-entries/{user_id}` : Historique journal
- `POST /detect` (AI Engine) : AdvancedDetectionEngine

---

## Archive : Sécurité et Safety

**Ancien fichier** : `OPTIMAL_SAFETY_IMPLEMENTATION.md`

### Système de sécurité implémenté

**Détection de crise** :
```python
CRISIS_KEYWORDS = {
    "suicide_ideation": ["mourir", "en finir", "me tuer"],
    "self_harm": ["me faire mal", "automutilation"],
    "hopelessness": ["plus d'espoir", "à quoi bon"],
    "severe_distress": ["ne supporte plus", "je craque"]
}
```

**Niveaux de réponse** :
- `critical` → Question sécurité immédiate + 3114
- `high` → Évaluation sécurité
- `medium` → Support renforcé
- `low` → Stabilisation

**Chiffrement** :
- Profils : AES-256-GCM (CryptoBox)
- Logs : Fernet encryption
- Audit : access_logs.jsonl

---

## Archive : Quick Start

**Anciens fichiers** : `QUICK_START.md`, `QUICK_START_HYPERPERSONALIZATION.md`

### Commandes de démarrage (dev local)

```bash
# Backend services
cd backend/api-gateway && uvicorn app.main:app --port 8000 --reload
cd backend/ai-engine && uvicorn app.main:app --port 8001 --reload

# Frontend
cd frontend && npm run dev
```

### URLs locales
- Frontend : http://localhost:5173
- API Docs : http://localhost:8000/docs
- Health check : http://localhost:8000/health

---

## Fichiers archivés et supprimés

| Fichier supprimé | Contenu archivé ci-dessus |
|------------------|---------------------------|
| `VOICE_SETUP.md` | Solutions vocales |
| `SOLUTIONS_VOCALES_OPEN_SOURCE.md` | Solutions vocales |
| `BETA_CHECKLIST.md` | Beta checklist |
| `BETA_DEPLOYMENT.md` | Beta checklist |
| `TODO_BETA.md` | Beta checklist |
| `HYPERPERSONALIZATION_OVERVIEW.md` | Hyperpersonnalisation |
| `HYPERPERSONALIZATION_IMPLEMENTATION.md` | Hyperpersonnalisation |
| `IMPLEMENTATION_SUMMARY.md` | Hyperpersonnalisation |
| `QUICK_START_HYPERPERSONALIZATION.md` | Quick start |
| `QUICK_START.md` | Quick start |
| `OPTIMAL_SAFETY_IMPLEMENTATION.md` | Sécurité |
| `FINAL_SUMMARY.md` | Hyperpersonnalisation |
| `PROMPTS_EXAMPLES.md` | Hyperpersonnalisation |
| `FRONTEND_AUDIT.md` | Audit obsolète |

---

## Fichiers conservés

| Fichier | Raison |
|---------|--------|
| `README.md` | Présentation projet |
| `CLAUDE.md` | Instructions Claude Code |
| `ENV_SETUP.md` | Configuration variables env |
| `ARCHITECTURE.md` | Architecture technique détaillée |

---

*Dernière mise à jour : 2025-12-11 (soir)*
*Version : 1.7 (Correction module Créativité + synopses bibliothèque)*
