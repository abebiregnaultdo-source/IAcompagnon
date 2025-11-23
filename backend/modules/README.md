# Modules Cliniques - Structure et Connexions

## Vue d'ensemble

Chaque module clinique dans `backend/modules/<module_name>/` contient :

### Fichiers Obligatoires
- **`onboarding.py`** : Flux d'intégration utilisateur (intro → consent → first_name → rhythm → radar → done)
- **`rules.json`** : Règles d'adaptation clinique (thresholds, comportements)

### Fichiers Optionnels (mais recommandés)
- **`intentions.json`** : Intentions cliniques avec conditions d'éligibilité
- **`interventions.json`** : Interventions concrètes (techniques, templates Jinja2)
- **`micro_protocols.json`** : Micro-protocoles synthétisés pour CKB (Clinical Knowledge Base)

## Flux de Données

### 1. Onboarding → Profile
```
Frontend → API Gateway /api/onboarding/next 
    → registry.import_onboarding(module.onboarding)
    → next_step(step, payload)
    → UserProfile created
```

### 2. Chat → Pipeline
```
Frontend → API Gateway /api/chat (ChatRequest)
    → Emotions Service /score (analyser message)
    → state_store (historique)
    → AI Engine /generate (policy + profile)
        → TherapeuticEngine.run_pipeline()
            1. assess_needs() → consulter rules.json
            2. choose_technique() → consulter collective_policy
            3. craft_intervention() → intentions.json + interventions.json
            4. deliver_empathically() → LLM router
            5. run_pipeline() → memory.log_interaction()
    → Response {text, intervention_id, technique, scores}
```

### 3. Apprentissage Collectif
```
AI Engine /api/learning/aggregate
    → aggregate_memory.aggregate()
    → memory_store.jsonl (logs anonymisés)
    → backend/ai-engine/aggregates/clinical_patterns.json
    → collective_policy.suggest_from_collective() utilise ce fichier
```

## Structure Actuelle

### grief (Module Deuil)
- ✅ onboarding.py
- ✅ rules.json
- ✅ intentions.json (5 intentions)
- ✅ interventions.json (8 interventions avec templates Jinja2)
- ✅ micro_protocols.json (CKB)

### anxiety (Module Anxiété)
- ✅ onboarding.py
- ✅ rules.json
- ✅ intentions.json (5 intentions)
- ✅ interventions.json (8 interventions avec templates Jinja2)
- ✅ micro_protocols.json (CKB)

## Ajouter un Nouveau Module

1. Créer dossier `backend/modules/<new_module>/`
2. Créer au minimum :
   - `onboarding.py` avec fonction `next_step(step: str, payload: Dict) -> Dict`
   - `rules.json` avec seuils cliniques
3. Optionnel mais recommandé :
   - `intentions.json` avec conditions d'éligibilité
   - `interventions.json` avec templates
   - `micro_protocols.json` pour CKB
4. Ajouter entrée dans `backend/modules/modules.json`
5. Appeler `POST /api/modules/reload` pour recharger registry

## Conventions

### Rules.json
```json
{
  "adaptation": {
    "high_distress_threshold": 70,
    "improvement_detresse": 40
  },
  "clinical": {
    "avoid_catastrophizing": true
  }
}
```

### Intentions.json
```json
{
  "intention_id": {
    "id": "intention_id",
    "intent": "description clinique",
    "entry_condition": "Python expression (phase, scores, etc.)",
    "safety": "contraintes de sécurité",
    "exit_signal": "critères de succès",
    "type": "intention"
  }
}
```

### Interventions.json
```json
{
  "intervention_id": {
    "id": "intervention_id",
    "type": "mindfulness|somatic|cognitive|narrative|logotherapy|behavioral|future|imaginal",
    "label": "Nom lisible",
    "duration": 120,
    "template": ["texte avec {{ variable }} Jinja2"],
    "conditions": { "phase": "ancrage|exploration|sens|reconstruction" }
  }
}
```

### Micro-Protocols.json
```json
{
  "intention_id": {
    "summary": "2-3 phrases concises du micro-protocole",
    "metadata": {
      "technique": "technique_name",
      "phase": "phase",
      "duration_seconds": 120
    }
  }
}
```

## Variables de Template Disponibles (Jinja2)

Dans `interventions.json`, templates peuvent utiliser :
- `{{ user_name }}` — prénom de l'utilisateur
- `{{ tone_prompt }}` — guide de ton ("doucement, sans te forcer" etc.)
- `{{ detresse }}` — score de détresse (0-100)
- `{{ espoir }}` — score d'espoir (0-100)
- `{{ energie }}` — score d'énergie (0-100)
- `{{ phase }}` — phase actuelle (ancrage, exploration, etc.)

## Appels API Clés

### Reload Modules
```bash
curl -X POST http://localhost:8000/api/modules/reload
```

### Prochaine Étape Onboarding
```bash
curl -X POST http://localhost:8000/api/onboarding/next \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "step": "intro",
    "payload": {}
  }'
```

### Agrégation Apprentissage
```bash
curl -X POST http://localhost:8001/api/learning/aggregate
```

## Débogage

1. **Vérifier chargement module** : `GET /api/modules` → vérifier présence du module
2. **Vérifier logs** : `backend/ai-engine/memory_store.jsonl`, `alert_logs.jsonl`, `feedback_logs.jsonl`
3. **Vérifier patterns agrégés** : `backend/ai-engine/aggregates/clinical_patterns.json`
4. **Vérifier cache** : Supprimer `.venv` et relancer si cache Python pose problème
