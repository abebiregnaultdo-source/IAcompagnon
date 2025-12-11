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

# ANNEXE : Documentation Existante Préservée

Les documents suivants contiennent des détails supplémentaires et restent valides :

| Document | Contenu | Status |
|----------|---------|--------|
| `ARCHITECTURE.md` | Flux détaillés, fichiers de config | Référence active |
| `EVIDENCE_BASED_ARCHITECTURE.md` | Protocoles cliniques détaillés | Référence active |
| `IMPLEMENTATION_SUMMARY.md` | Hyperpersonnalisation | Référence active |
| `HYPERPERSONALIZATION_OVERVIEW.md` | Vue d'ensemble système | Référence active |

---

*Dernière mise à jour : 2025-12-11*
*Version : 1.4 (État de l'art)*
