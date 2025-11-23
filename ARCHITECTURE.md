# Architecture et Flux de Données

## Vue d'ensemble du Système

```
┌─────────────┐
│   FRONTEND  │
│ (React/Vite)│
└──────┬──────┘
       │
       │ HTTP requests
       │
       ▼
┌──────────────────────────────────────┐
│     API GATEWAY (FastAPI:8000)       │
├──────────────────────────────────────┤
│ • /api/profile                       │
│ • /api/chat                          │
│ • /api/analyze                       │
│ • /api/onboarding/next               │
│ • /api/feedback                      │
│ • /api/modules/reload                │
└─────┬──────────────────────────────┬─┘
      │                              │
      │ (policies + profile)         │
      │                              │
      ▼                              ▼
┌──────────────────┐         ┌──────────────────────┐
│  AI ENGINE       │         │ EMOTIONS SERVICE     │
│ (FastAPI:8001)   │         │ (FastAPI:8002)       │
├──────────────────┤         ├──────────────────────┤
│ • /generate      │         │ • /score             │
│ • /feedback/*    │         └──────────────────────┘
│ • /scores        │
│ • /api/prefs     │
│ • /api/state     │
│ • /api/learning  │
└────────┬─────────┘
         │
         │ TherapeuticEngine.run_pipeline()
         │
    ┌────┴──────────────────────┬─────────────────────┐
    │                           │                     │
    ▼                           ▼                     ▼
┌──────────┐          ┌─────────────────┐      ┌──────────────┐
│ Rules    │          │  Collective     │      │ Personal     │
│ .json    │          │  Learning       │      │ Memory       │
│          │          │ (patterns.json) │      │ (profiles)   │
└──────────┘          └────────┬────────┘      └──────────────┘
                               │
                    ┌──────────▼──────────┐
                    │ Intentions          │
                    │ Interventions       │
                    │ Micro-Protocols     │
                    │ (module files)      │
                    └─────────────────────┘
```

## Flux Détaillé : POST /api/chat

```
1. USER MESSAGE
   │
   ▼
2. API GATEWAY /api/chat
   ├─ Valider profile
   ├─ Récupérer historique utilisateur (state_store)
   └─ Analyser dernier message
      │
      ├──────────────────────────────────────────────┐
      │                                              │
      ▼                                              ▼
3. EMOTIONS SERVICE /score                   4. POLICY COMPUTATION
   │                                             │
   ├─ detresse (0-100)                         ├─ tone (lent/neutre/enveloppant)
   ├─ espoir (0-100)                           ├─ phase (ancrage/exploration/sens/reconstruction)
   └─ energie (0-100)                          ├─ scores (from emotion service)
                                               └─ no_grief_cause policy
                                                  │
      ┌────────────────────────────────────────────┘
      │
      ▼
5. AI ENGINE /generate
   │
   ├─ TherapeuticEngine.run_pipeline()
   │  │
   │  ├─ assess_needs() → consulter rules.json
   │  │
   │  ├─ choose_technique()
   │  │  ├─ collective_policy.suggest_from_collective() (patterns.json)
   │  │  └─ personalization.suggest_action() (user prefs)
   │  │
   │  ├─ craft_intervention()
   │  │  ├─ Chercher micro-protocol en CKB
   │  │  ├─ Si absent : appeler LLM pour synthétiser
   │  │  └─ Sauvegarder en CKB
   │  │
   │  ├─ deliver_empathically()
   │  │  ├─ Appeler empathy_model via LLM router
   │  │  └─ Adapter tone et rythme
   │  │
   │  ├─ Post-filter (no_grief_cause)
   │  │
   │  └─ memory.log_interaction() → memory_store.jsonl
   │
   └─ Retourner {text, intention_id, technique, emotion_context}
      │
      ▼
6. API GATEWAY
   │
   ├─ Mettre à jour state_store (history)
   ├─ Enregistrer logs (session_logs, feedback_logs)
   ├─ Alerter si detresse >= 80 (alert_logs)
   │
   └─ Retourner Response au frontend

7. FRONTEND
   │
   └─ Afficher response.text
      Afficher radar avec scores
      Permettre feedback (thumbs up/down)
```

## Flux Détaillé : Apprentissage Collectif

```
1. INTERACTIONS ENREGISTRÉES
   │
   └─ memory_store.jsonl (une ligne par interaction)
      │
      │ Exemple:
      │ {
      │   "phase": "ancrage",
      │   "technique": "TIPI",
      │   "intention_id": "tipi_regulation",
      │   "scores": {"detresse": 45, "espoir": 55, "energie": 50}
      │ }
      │
      ▼
2. POST /api/learning/aggregate
   │
   ├─ aggregate_memory.aggregate()
   │  │
   │  ├─ Lire memory_store.jsonl
   │  ├─ Regrouper par (phase, technique)
   │  ├─ Calculer effectiveness = (100 - detresse_moyen)
   │  │
   │  └─ Résultat: technique_phase_effectiveness
   │     {
   │       "ancrage": {
   │         "TIPI": 65.2,
   │         "TCC": 58.3,
   │         "logotherapie": 42.1
   │       },
   │       "exploration": {...}
   │     }
   │
   └─ Sauvegarder dans aggregates/clinical_patterns.json
      │
      ▼
3. UTILISATION EN PIPELINE
   │
   ├─ collective_policy.suggest_from_collective()
   │  │
   │  └─ Charger patterns.json
   │     Retourner technique avec meilleure effectiveness pour phase
   │     (override personnalisation si confiance > 0.6)
   │
   └─ Enrichir suggestions aux utilisateurs

4. APPRENTISSAGE CONTINU
   │
   └─ Chaque nouveau feedback enrichit memory_store.jsonl
      → Patterns deviennent plus précis
      → Suggestions s'améliorent pour tout le monde
```

## Flux Détaillé : Onboarding

```
1. FRONTEND
   └─ Affiche écran onboarding
      │
      ▼
2. USER CLICKS "NEXT"
   │
   └─ POST /api/onboarding/next
      {
        "user_id": "uuid",
        "step": "intro" | "consent" | "first_name" | "rhythm" | "radar_init" | "done",
        "payload": { "accepted": true, "first_name": "Jean", "rhythm": 2 }
      }
      │
      ▼
3. API GATEWAY /api/onboarding/next
   │
   ├─ Charger module actif (e.g., grief)
   ├─ registry.import_onboarding('backend/modules/grief/onboarding.py')
   │
   └─ Appeler module.next_step(step, payload)
      │
      ▼
4. MODULE ONBOARDING (grief/anxiety)
   │
   ├─ if step == 'intro'
   │  └─ Retourner next='consent', message
   │
   ├─ if step == 'consent'
   │  └─ Valider accepted
   │     Retourner next='first_name'
   │
   ├─ if step == 'first_name'
   │  └─ Valider name
   │     Retourner next='rhythm'
   │
   ├─ if step == 'rhythm'
   │  └─ Valider rhythm (1,2,3)
   │     Retourner next='radar_init', initial_scores
   │
   ├─ if step == 'radar_init'
   │  └─ Retourner next='done'
   │
   └─ if step == 'done'
      └─ Création profile avec UserProfile model
         │
         └─ Sauvegardé en profiles.put()
      │
      ▼
5. RETOUR AU FRONTEND
   │
   └─ {next: "done", message: "...", initial_scores: {...}}
      Frontend peut maintenant afficher Chat
```

## Fichiers de Configuration Clés

### modules.json
```json
{
  "grief": {
    "name": "Deuil",
    "onboarding": "path/to/onboarding.py",
    "rules": "path/to/rules.json",
    "intentions": "path/to/intentions.json",
    "interventions": "path/to/interventions.json",
    "micro_protocols": "path/to/micro_protocols.json",
    "active": true
  }
}
```

### rules.json (exemple anxiety)
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

### intentions.json (exemple)
```json
{
  "grounding_exposure": {
    "id": "grounding_exposure",
    "intent": "permettre tolérance anxiété par ancrage sensoriel",
    "entry_condition": "phase == 'ancrage' and detresse > 50",
    "safety": "ne pas forcer exposition",
    "exit_signal": "légère baisse anxiété"
  }
}
```

### interventions.json (exemple)
```json
{
  "5_4_3_2_1_grounding": {
    "id": "5_4_3_2_1_grounding",
    "type": "somatic",
    "label": "Technique 5-4-3-2-1",
    "template": [
      "{{ user_name }}, nomme 5 choses que tu vois...",
      "{{ tone_prompt }}"
    ],
    "conditions": { "phase": "ancrage" }
  }
}
```

### micro_protocols.json (exemple)
```json
{
  "grounding_5_4_3_2_1": {
    "summary": "Technique 5-4-3-2-1 : Nomme 5 choses que tu vois, 4 que tu touches...",
    "metadata": {
      "technique": "5_4_3_2_1_grounding",
      "phase": "ancrage",
      "duration_seconds": 180
    }
  }
}
```

## Décisions Architecturales

1. **Microservices FastAPI** : Séparation concerns (gateway, IA, émotions)
2. **Modules dynamiques** : Ajouter clinicalité sans recompile (onboarding.py + JSON)
3. **Dual-model LLM router** : Knowledge (gpt-4o) + Empathy (claude) avec fallbacks
4. **CKB (Clinical Knowledge Base)** : Cache micro-protocoles synthétisés
5. **Memory anonyme** : Log patterns collectifs pour améliorer suggestions globales
6. **Feedback implicit + explicit** : Apprentissage bidirectionnel
7. **Jinja2 templates** : Interventions dynamiques adaptées à l'utilisateur
8. **No-code rules** : JSON pour adaptation clinique sans code

---

**Mis à jour** : 2025-11-10
