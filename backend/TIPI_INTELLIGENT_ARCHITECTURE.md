# Architecture TIPI Intelligente - Helō

## 🎯 Vision

**Problème résolu :** Le simple `return 'TIPI'` ne capture pas la complexité d'une intervention thérapeutique réelle.

**Solution :** Un système adaptatif qui :
- Détecte le **moment propice** pour TIPI (timing)
- Adapte le protocole en **temps réel** (variation)
- Combine TIPI avec d'autres méthodes (intégration)
- Sait quand **arrêter ou changer** (transition)

---

## 🏗️ Architecture Complète

### 1. Détection Intelligente (`TIPIDetector`)

**Fichier :** `backend/ai-engine/app/adaptive_tipi.py`

**Fonction :** `should_activate_tipi(user_state, conversation_context)`

**Signaux analysés (5 critères) :**
```python
{
    "somatic_activation": body_awareness > 0.3,      # Conscience corporelle présente
    "emotional_flooding": detresse > 60 AND clarity < 0.4,  # Submersion émotionnelle
    "mental_rumination": cognitive_loops > 0.6,      # Boucles mentales
    "sensory_avoidance": body_avoidance < 0.2,       # Pas d'évitement corporel
    "window_of_tolerance": 0.3 < arousal < 0.8       # Fenêtre de tolérance
}
```

**Décision :** Au moins **3 signaux sur 5** = TIPI recommandé

**Contre-indications vérifiées :**
- Détresse extrême (> 90) → Stabilisation d'abord
- Dissociation active (> 0.6) → Ancrage polyvagal
- Trauma récent (< 48h) → Protocole de crise
- Évitement corporel sévère (> 0.8) → Approche douce

---

### 2. Variations Adaptatives (`AdaptiveTIPI`)

**Fichier :** `backend/ai-engine/app/adaptive_tipi.py`

**4 variations TIPI :**

| Variation | Indication | Durée | Caractéristiques |
|-----------|-----------|-------|------------------|
| **STANDARD** | Conscience corporelle moyenne | 180s | Protocole classique 4 étapes |
| **GENTLE** | Haute sensibilité, dissociation légère | 240s | Très doux, ancrage préalable, TIPI du vide |
| **FOCUSED** | Émotion bien localisée | 120s | Direct, efficace, description précise |
| **EXTENDED** | Processus lent, émotion complexe | 360s | Très lent, pauses longues, micro-changements |

**Sélection automatique :**
```python
if user_profile["high_sensitivity"]:
    return GENTLE
elif current_state["somatic_clarity"] > 0.7:
    return FOCUSED
elif current_state["process_speed"] < 0.3:
    return EXTENDED
else:
    return STANDARD
```

---

### 3. Protocole TIPI Complet

**Fichier :** `backend/ai-engine/tipi_protocol.json`

**Structure :**
```json
{
  "tipi_protocol": {
    "metadata": { "author": "Luc Nicon", "adaptation": "Contexte de deuil" },
    "core_principles": ["Accueil sans jugement", "Attention sensorielle", ...],
    "contraindications": { "absolues": [...], "relatives": [...] },
    "variations": {
      "standard": { "steps": [4 étapes détaillées] },
      "gentle": { "steps": [4 étapes douces] },
      "focused": { "steps": [4 étapes focalisées] },
      "extended": { "steps": [4 étapes étendues] }
    },
    "adaptive_responses": {
      "tipi_of_emptiness": "Parfois le vide est une sensation...",
      "grounding_first": "C'est très intense. Prenons d'abord...",
      ...
    }
  }
}
```

**Chaque étape contient :**
- `instruction` : Consigne pour l'utilisateur
- `guidance` : Guidance thérapeutique
- `duration_seconds` : Durée recommandée
- `success_indicators` : Signaux de progression
- `adjustment_if_blocked` : Ajustement si blocage

---

### 4. Boucle de Régulation (`TIPIExecutionEngine`)

**Fichier :** `backend/ai-engine/app/tipi_execution_engine.py`

**Processus d'exécution :**

```
1. START SESSION
   ↓
2. SELECT VARIATION (standard/gentle/focused/extended)
   ↓
3. STEP 1 → User Response
   ↓
4. CHECK PROGRESSION
   ├─ Progressing? → STEP 2
   └─ Blocked? → ADJUST
       ├─ Tipi of emptiness
       ├─ Grounding first
       ├─ Redirect to sensation
       └─ Transition to other method
   ↓
5. STEP 2, 3, 4... (repeat)
   ↓
6. COMPLETION
   ↓
7. TRANSITION DECISION
   ├─ TIPI → Logothérapie (sens émerge)
   ├─ TIPI → Narrative (besoin d'expression)
   ├─ TIPI → Respiration (consolider)
   └─ TIPI → Polyvagal (submersion)
```

**Monitoring en temps réel :**
- `progression_score` : 0-1, qualité de la progression
- `user_engagement` : 0-1, engagement de l'utilisateur
- `somatic_clarity` : 0-1, clarté de la sensation
- `adjustments_made` : Liste des ajustements effectués

---

### 5. Transitions Thérapeutiques (`TherapeuticTransitionEngine`)

**Fichier :** `backend/ai-engine/app/therapeutic_transitions.py`

**Signaux de transition détectés :**
```python
{
    "meaning_emerging": ["pourquoi", "sens", "raison"],
    "need_for_expression": ["raconter", "dire", "parler"] OR len > 200,
    "somatic_integration_achieved": detresse < 50 AND somatic_clarity > 0.6,
    "emotional_overwhelm": detresse > 85 OR ["trop", "submergé"],
    "dissociation_increasing": dissociation > 0.6 OR ["vide", "rien"],
    "mental_loops": cognitive_loops > 0.7 OR repetition_count > 2,
    "need_grounding": arousal > 0.8 OR ["perdu", "flotte"],
    "narrative_reconstruction": ["avant", "maintenant", "futur", "histoire"]
}
```

**Transitions intelligentes :**

| De | Vers | Condition | Confiance |
|----|------|-----------|-----------|
| TIPI | Logothérapie | Régulation réussie + sens émerge | 0.85 |
| TIPI | Narrative | Besoin d'expression + détresse < 60 | 0.80 |
| TIPI | Respiration | Régulation réussie | 0.75 |
| TIPI | Polyvagal | Submersion ou dissociation | 0.90 |
| Validation | TIPI | Conscience corporelle > 0.4 | 0.80 |
| Logothérapie | Narrative | Reconstruction narrative | 0.85 |
| Narrative | TIPI | Émotion intense émerge | 0.85 |

**Messages de transition fluides :**
```python
TIPI → Logothérapie: "Je sens que quelque chose d'important émerge. 
                      Voulez-vous qu'on explore ensemble le sens de ce que vous vivez ?"

TIPI → Polyvagal: "C'est très intense. Prenons d'abord un moment pour vous stabiliser. 
                   D'accord ?"
```

---

## 🔄 Intégration dans TherapeuticEngine

**Fichier :** `backend/ai-engine/app/therapeutic_engine.py`

**Avant :**
```python
def choose_technique(self, assessment):
    if assessment['phase'] == 'ancrage':
        return 'TIPI'  # ❌ Trop simpliste
```

**Après :**
```python
def choose_technique(self, assessment, user_state, conversation_context):
    tipi_engine = TIPIExecutionEngine()
    
    if tipi_engine.should_activate_tipi(user_state, conversation_context):
        return 'TIPI_ADAPTIVE'  # ✅ Système intelligent
    
    # Fallback vers logique simple
    ...
```

---

## 📊 Exemple Concret

### Scénario 1 : Utilisateur en Détresse Élevée

**Input :**
```
User: "J'ai une boule dans la gorge, je n'arrive plus à respirer"
```

**Analyse :**
```python
user_state = {
    "detresse": 85,
    "somatic_activation": 0.9,
    "emotion_location": "gorge",
    "body_awareness": 0.8
}
```

**Décision :**
1. `should_activate_tipi()` → **TRUE** (4/5 signaux)
2. `select_tipi_variation()` → **FOCUSED** (émotion bien localisée)
3. Génération du prompt adapté

**Réponse :**
```
"Je sens que c'est très intense au niveau de la gorge. 
Si vous le voulez, nous pouvons simplement observer cette sensation de boule, 
sans chercher à la faire partir. 
Est-ce que vous pouvez décrire sa texture, sa température ?"
```

### Scénario 2 : Utilisateur Résistant

**Input :**
```
User: "Je ne sens rien, c'est comme un vide"
```

**Analyse :**
```python
user_state = {
    "detresse": 70,
    "somatic_avoidance": 0.8,
    "emotional_numbness": 0.7
}
```

**Décision :**
1. `should_activate_tipi()` → **TRUE** (3/5 signaux)
2. `select_tipi_variation()` → **GENTLE** (évitement corporel)
3. Ajustement : `tipi_of_emptiness`

**Réponse :**
```
"Parfois le vide est une sensation en soi. 
Si vous le souhaitez, nous pouvons simplement porter attention 
à cette absence de sensation, cet espace vide dans le corps. 
Sans attente, juste être présent à ce qui est."
```

---

## ✅ Avantages de l'Architecture

1. **Timing précis** : Détection multi-critères (pas juste "détresse > 60")
2. **Adaptation réelle** : 4 variations selon le profil utilisateur
3. **Monitoring continu** : Ajustements en temps réel si blocage
4. **Transitions fluides** : Passage intelligent vers autres méthodes
5. **Sécurité** : Contre-indications vérifiées automatiquement
6. **Apprentissage** : Métriques collectées pour amélioration continue

---

## 🚀 Prochaines Étapes

1. **Tester l'intégration** : Vérifier que TherapeuticEngine appelle bien le système TIPI
2. **Créer les autres méthodes** : Logothérapie, Narrative, Polyvagal avec même niveau d'intelligence
3. **Intégrer avec EmotionBERT** : Utiliser les scores avancés pour la détection
4. **Collecter des données** : Métriques de progression pour fine-tuning
5. **A/B testing** : Comparer TIPI simple vs TIPI adaptatif

---

## 📝 Fichiers Créés

1. `backend/ai-engine/app/adaptive_tipi.py` (290 lignes)
2. `backend/ai-engine/tipi_protocol.json` (280 lignes)
3. `backend/ai-engine/app/therapeutic_transitions.py` (362 lignes)
4. `backend/ai-engine/app/tipi_execution_engine.py` (280 lignes)
5. `backend/ai-engine/app/therapeutic_engine.py` (modifié)

**Total : ~1200 lignes de code intelligent** 🎯

