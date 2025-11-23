# Hyperpersonnalisation - Implémentation Complète

## Vision

Transformer le journal guidé en une **expérience véritablement hyperpersonnalisée** qui :
- Analyse le contexte émotionnel **en temps réel**
- Génère des prompts **adaptés à l'état psychologique** de l'utilisateur
- Dépasse les limitations des systèmes génériques avec détection avancée
- Respecte l'éthique et la confidentialité

## Architecture

```
Frontend (React)
    ↓ user messages + history
API Gateway (FastAPI - Port 8000)
    ├─ /api/analyze-context (NEW) → orchestrate
    ├─ /api/recent-entries (NEW) → context history
    └─ /api/creations/* → save & retrieve
    ↓
AI Engine (FastAPI - Port 8001)
    ├─ /detect (NEW) → AdvancedDetectionEngine
    └─ /generate → therapeutic response
    ↓
Detection System
    ├─ EmotionBERT analysis
    ├─ Linguistic patterns (fusion cognitive, évitement, etc.)
    ├─ Therapeutic signals (Journaling, ACT, TIPI, Continuing Bonds)
    └─ 4 méthodes evidence-based avec variations
```

## Nouveaux Endpoints

### 1. **POST /api/analyze-context** (API Gateway)

Analyse le contexte utilisateur et retourne des prompts personnalisés.

**Request:**
```json
{
  "user_id": "user_123",
  "current_message": "Je n'ai jamais eu le courage de lui dire...",
  "tool": "journal",
  "conversation_history": [
    {"content": "...", "created_at": "2025-11-15T..."}
  ]
}
```

**Response:**
```json
{
  "recommended_prompts": [
    "Écrivez une lettre à cette personne...",
    "Dites tout ce que vous auriez voulu dire...",
    "Laissez vos vraies émotions s'exprimer"
  ],
  "personalization_context": "📝 J'ai détecté des non-dits... L'écriture expressive peut vous aider...",
  "detected_method": "journaling_expressif",
  "variation": "lettre_non_envoyee",
  "confidence": 0.87,
  "indicators": ["Expression de non-dits (score: 0.85)"]
}
```

**Logic:**
1. Récupère le profil utilisateur (pour l'état psychologique)
2. Appelle l'AI Engine `/detect` avec le message + historique
3. Génère les prompts basés sur la méthode détectée + variation
4. Retourne contexte personnalisé + confiance

### 2. **GET /api/recent-entries/{user_id}** (API Gateway)

Récupère les dernières entrées de journal pour contexte historique.

**Response:**
```json
{
  "entries": [
    {
      "id": "...",
      "content": "Dernière entrée de journal",
      "prompt": "...",
      "created_at": "...",
      "therapeutic_method": "journaling_expressif"
    }
  ],
  "count": 5
}
```

### 3. **POST /detect** (AI Engine)

Détecte la méthode thérapeutique appropriée via AdvancedDetectionEngine.

**Request:**
```json
{
  "user_message": "Je n'arrive pas à accepter...",
  "user_state": {
    "detresse": 75,
    "social_isolation": 0.2
  },
  "conversation_history": [...],
  "therapeutic_context": {"alliance": 0.7}
}
```

**Response:**
```json
{
  "signals": [
    {
      "method": "journaling_expressif",
      "confidence": 0.87,
      "indicators": ["Expression de non-dits"],
      "contraindications": [],
      "recommended_variation": "lettre_non_envoyee"
    },
    {
      "method": "tipi",
      "confidence": 0.64,
      ...
    }
  ]
}
```

## Frontend Integration

### État ajouté à Creativity.jsx

```javascript
const [guidedPrompts, setGuidedPrompts] = useState([])
const [personalizedContext, setPersonalizedContext] = useState('')
const [detectedMethod, setDetectedMethod] = useState(null)
const [detectionConfidence, setDetectionConfidence] = useState(0)
const [analysisLoading, setAnalysisLoading] = useState(false)
```

### Flux en temps réel

1. **useEffect** watch `currentContent` avec debounce de 1s
2. Quand suffisamment de contenu (>30 caractères):
   - Récupère les 5 dernières entrées
   - Appelle `/api/analyze-context`
   - Affiche contexte personnalisé + suggestions
3. Utilisateur peut cliquer sur suggestions pour les ajouter au texte

### Composants d'Affichage

**Contexte Personnalisé:**
```jsx
{personalizedContext && (
  <div style={{...}}>
    <div>💡 Détecté: {detectedMethod} ({confidence}%)</div>
    <div>{personalizedContext}</div>
  </div>
)}
```

**Suggestions Guidées:**
```jsx
{guidedPrompts.map(prompt => (
  <button onClick={() => append(prompt)}>
    💬 {prompt}
  </button>
))}
```

## Méthodes Détectées (Evidence-Based)

### 1. **Journaling Expressif** (Pennebaker, 1997)
- **Détection:** Non-dits, charge émotionnelle, regrets
- **Critères:** Arousal 0.4-0.8, traitement cognitif suffisant
- **Variations:**
  - `lettre_non_envoyee` - Écrite à la personne/situation
  - `journal_guide_recit` - Narration temporelle
  - `gratitude_post_traumatique` - Résilience

### 2. **TIPI** (Nicon, 2007)
- **Détection:** Activation somatique, conscience intéroceptive
- **Critères:** Arousal 0.6-0.9, pas de dissociation
- **Variations:**
  - `gentle` - Détresse élevée
  - `focused` - Régulation simple
  - `standard` - Approche moyenne

### 3. **ACT** (Hayes et al., 2006)
- **Détection:** Fusion cognitive, évitement expérientiel, recherche de valeurs
- **Critères:** Mentalisation suffisante, détresse < 85
- **Variations:**
  - `defusion_cognitive` - Distanciation des pensées
  - `valeurs_et_action` - Orientation valeurs
  - `acceptation_experiencielle` - Acceptation émotions

### 4. **Continuing Bonds** (Klass et al., 1996)
- **Détection:** Recherche de connexion, maintien du lien
- **Critères:** Pas de deuil compliqué, équilibre perte/restauration
- **Variations:**
  - `rituel_connexion` - Pratiques symboliques
  - `conversation_interieure` - Dialogue interne
  - `objet_transitionnel` - Objets significatifs

## Clés Technologiques

### 1. **Analyse Linguistique Sophistiquée**
```python
{
  "cognitive_fusion": patterns,
  "experiential_avoidance": patterns,
  "rumination": patterns,
  "somatic_activation": patterns,
  "values_seeking": patterns,
  "unsaid_expression": patterns,
  "connection_seeking": patterns
}
```

### 2. **Estimation depuis Circumplex Émotionnel**
EmotionBERT retourne (arousal, valence, dominance), on dérive:
- Fusion cognitive = arousal élevé + valence négative
- Évitement expérientiel = arousal élevé + faible dominance
- Rumination = valence négative + arousal modéré
- Mentalisation = dominance + arousal optimal

### 3. **Rigidité Discursive (Persévération)**
Compare similarité lexicale entre messages consécutifs
→ Indicateur de fusion cognitive

### 4. **Détection Métacognition**
Absence de: "je pense que", "il me semble que" + affirmations absolutes
→ Déficit métacognitif (fusion cognitive)

## Défis Éthiques Adressés

### 1. **Empathie Réelle vs Simulation**
- ✅ Transparent: détection affichée ("Détecté: journaling_expressif")
- ✅ Basée sur science: Pennebaker, Hayes, Klass (peer-reviewed)
- ⚠️ Limite admise: "Un LLM ne ressent rien" - mais peut générer du sens

### 2. **Personnalisation Profonde**
- ✅ Mémoire à long terme: historique des entrées
- ✅ Variations cliniques: 4 méthodes × 3 variations = 12 approches
- ✅ Détection continue: analyse en temps réel du contexte

### 3. **Gestion des Situations à Risque**
```python
# Dans generate() + analyze-context:
if detresse >= 80:
    alert_prefix = "Si tu te sens en danger, appelle le 3114."
    # Log l'alerte pour supervision
```

### 4. **Confidentialité**
- ✅ Chiffrement: `EncryptedKV` avec CryptoBox
- ✅ Audit: `access_logs.jsonl` enregistre chaque accès
- ✅ Transparence: voir `backend/api-gateway/app/storage.py`

## Tests

### Lancer les services
```bash
# Terminal 1: API Gateway
cd backend/api-gateway
.venv\Scripts\python -m uvicorn app.main:app --port 8000 --reload

# Terminal 2: AI Engine
cd backend/ai-engine
.venv\Scripts\python -m uvicorn app.main:app --port 8001 --reload
```

### Exécuter les tests
```bash
# Depuis la racine du projet
python test_hyperpersonalization.py
```

**Tests couverts:**
1. ✅ AI Engine `/detect` retourne signaux corrects
2. ✅ API Gateway `/api/analyze-context` génère prompts
3. ✅ API Gateway `/api/recent-entries` charge historique

## Résultats Attendus

Avant:
- "Écrivez votre histoire..." (générique)
- Pas d'adaptation émotionnelle
- Disconnexion frontend/backend

Après:
- "Écrivez une lettre à cette personne ou situation..." (spécifique au non-dit détecté)
- Confiance: 87% - ce contexte s'applique vraiment
- Flux intégré: détection → contexte → suggestions → sauvegarde

## Prochaines Étapes (Optionnel)

1. **Persistance des préférences:** Quel type de guidance préfère l'utilisateur?
2. **Feedback d'efficacité:** "Ça vous a aidé?" → améliorer la détection
3. **Intégration voix:** Transcrire puis analyser
4. **Export portfolio:** Télécharger les créations avec contexte thérapeutique
5. **Intégration professionnel:** Alertes thérapeute si détresse critique

## Fichiers Modifiés

### Backend
- `backend/api-gateway/app/main.py`
  - ✅ `/api/analyze-context` (endpoint orchestre)
  - ✅ `/api/recent-entries/{user_id}` (historique)
  - ✅ Helpers: `_generate_personalized_prompts()`, `_generate_personalization_context()`

- `backend/ai-engine/app/main.py`
  - ✅ `/detect` (appelle AdvancedDetectionEngine)

### Frontend
- `frontend/src/ui/Creativity.jsx`
  - ✅ États: `guidedPrompts`, `personalizedContext`, `detectedMethod`, `detectionConfidence`
  - ✅ Fonction: `getPersonalizedPrompt()` avec debounce
  - ✅ useEffect analyse en temps réel
  - ✅ UI: Affichage contexte + suggestions

### Test
- `test_hyperpersonalization.py` (NEW)
  - ✅ Health check services
  - ✅ Test `/detect` endpoint
  - ✅ Test `/api/analyze-context` endpoint
  - ✅ Test `/api/recent-entries` endpoint

## Architecture Schéma Complet

```
FRONTEND (React)
├─ Creativity.jsx
│  ├─ useEffect → analyzeAndGuide() [debounce 1s]
│  └─ getPersonalizedPrompt() → /api/analyze-context
│
API GATEWAY (FastAPI:8000)
├─ POST /api/analyze-context
│  ├─ Récupère profil utilisateur
│  ├─ Appelle AI Engine /detect
│  ├─ Génère prompts via _generate_personalized_prompts()
│  ├─ Génère contexte via _generate_personalization_context()
│  └─ Retourne {prompts, context, method, variation, confidence}
│
├─ GET /api/recent-entries/{user_id}
│  └─ CreativeStorage.get_all_creations(user_id, 'journal')[:10]
│
└─ POST /api/creations/journal
   └─ CreativeStorage.save_journal_entry()

AI ENGINE (FastAPI:8001)
├─ POST /detect
│  └─ AdvancedDetectionEngine.detect_all_methods()
│     ├─ _detect_journaling() → DetectionSignal
│     ├─ _detect_tipi() → DetectionSignal
│     ├─ _detect_act() → DetectionSignal
│     └─ _detect_continuing_bonds() → DetectionSignal
│
└─ POST /generate
   └─ TherapeuticEngine.run_pipeline()
      └─ call_llm() [GPT-4 ou fallback]

DETECTION ENGINE (AdvancedDetectionEngine)
├─ EmotionBERT analysis
│  └─ Circumplex: (arousal, valence, dominance)
├─ Linguistic patterns
│  ├─ Regex patterns for each construct
│  ├─ Rigidity score (persévération)
│  └─ Metacognition deficit
└─ Therapeutic signals
   ├─ Indicators (points positifs)
   ├─ Contraindications (points contre)
   └─ Confidence score
```

---

**Status:** ✅ Implémenté et prêt à tester
**Prochaine action:** Lancer `test_hyperpersonalization.py` pour valider
