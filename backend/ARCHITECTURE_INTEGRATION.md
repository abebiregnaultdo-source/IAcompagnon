# Architecture d'Intégration Helō - Système Hybride

## 🎯 Principe Clé : AUGMENTER, PAS REMPLACER

L'architecture hybride **préserve 100% du système existant** et ajoute des améliorations progressives par-dessus.

```
┌─────────────────────────────────────────────────────────────┐
│                    SYSTÈME EXISTANT                          │
│  ✅ TherapeuticEngine (fonctionne)                           │
│  ✅ EmotionService (fonctionne)                              │
│  ✅ intentions.json (fonctionne)                             │
│  ✅ interventions.json (fonctionne)                          │
│  ✅ micro_protocols.json (fonctionne)                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ ON GARDE TOUT ÇA
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              COUCHE D'AMÉLIORATION (NOUVEAU)                 │
│  ✅ ContextEnhancer → Enrichit le contexte                   │
│  ✅ ProgressiveEnhancer → Améliore la réponse                │
│  ✅ EmotionBERT → Analyse plus fine (optionnel)              │
│  ✅ SuperSystemPrompt → Prompts cliniques (optionnel)        │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ RÉSULTAT
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              RÉPONSE FINALE AMÉLIORÉE                        │
│  Si amélioration bénéfique → Utilise enhanced_response       │
│  Si problème → Fallback vers existing_response               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Structure des Fichiers

### **Système Existant** (PRÉSERVÉ)
```
backend/
├── ai-engine/
│   ├── app/
│   │   ├── therapeutic_engine.py      # ✅ EXISTANT - Gardé tel quel
│   │   ├── emotion_service.py         # ✅ EXISTANT - Gardé tel quel
│   │   └── ...
│   └── modules/
│       ├── grief/
│       │   ├── intentions.json        # ✅ EXISTANT - Gardé tel quel
│       │   ├── interventions.json     # ✅ EXISTANT - Gardé tel quel
│       │   └── micro_protocols.json   # ✅ EXISTANT - Gardé tel quel
│       ├── anxiety/
│       └── crisis/
```

### **Améliorations** (NOUVEAU)
```
backend/
├── emotions-service/
│   └── app/
│       └── advanced_emotion.py        # 🆕 EmotionBERT (optionnel)
│
└── ai-engine/
    └── app/
        ├── advanced_rag.py            # 🆕 RAG avec graphe de connaissances
        ├── enhanced_therapeutic_engine.py  # 🆕 Moteur hybride
        └── advanced_contexts.json     # 🆕 Super-prompts cliniques
```

---

## 🔄 Flux de Traitement

### **1. Message Utilisateur**
```
"Je n'arrive plus à respirer, tout est trop lourd..."
```

### **2. Analyse Émotionnelle (Existant)**
```python
# emotions-service/app/main.py (EXISTANT)
emotion_scores = {
    'detresse': 85,
    'espoir': 15,
    'energie': 25,
    'phase': 'ancrage'
}
```

### **3. Enrichissement du Contexte (NOUVEAU)**
```python
# enhanced_therapeutic_engine.py
enhanced_context = ContextEnhancer().enhance_context(emotion_scores, message)

# Résultat:
EnhancedContext(
    base_emotion={'detresse': 85, 'espoir': 15, 'energie': 25},
    advanced_emotion=EmotionalState(
        valence=-0.85,      # Déplaisir
        arousal=+0.62,      # Activation
        dominance=-0.41,    # Soumission
        grief_intensity=0.91
    ),
    therapeutic_phase='crisis',
    safety_level='crisis'
)
```

### **4. Génération de Réponse (Existant)**
```python
# therapeutic_engine.py (EXISTANT)
existing_response = TherapeuticEngine().generate_response(
    message, emotion_scores, user_id
)
# → "Je comprends que c'est difficile. Essayons ensemble..."
```

### **5. Amélioration Progressive (NOUVEAU)**
```python
# enhanced_therapeutic_engine.py
final_response = ProgressiveEnhancer().enhance_response(
    existing_response, enhanced_context
)

# Si safety_level == 'crisis':
# → "Respirez avec moi. Je comprends que c'est difficile. Essayons ensemble..."
```

---

## 🎚️ Niveaux d'Amélioration

### **Level 1: BASIC** (Sécurité maximale)
- ✅ Garde 100% de l'existant
- ❌ Aucune modification
- 🎯 Utilisation: Production initiale, fallback

```python
engine = get_integrated_engine(enhancement_level="basic")
# → Retourne exactement la réponse existante
```

### **Level 2: MODERATE** (Recommandé)
- ✅ Garde l'existant
- ✅ Ajoute des améliorations légères
- ✅ Renforce la sécurité en crise
- ✅ Ajoute validation émotionnelle
- 🎯 Utilisation: Production standard

```python
engine = get_integrated_engine(enhancement_level="moderate")
# → Améliore la réponse existante sans changer le style
```

**Exemples d'améliorations modérées:**
- **Crise** : Ajoute "Respirez avec moi" si absent
- **Reconstruction** : Ajoute "Chaque pas a du sens" si absent
- **Validation** : Ajoute "Ce que vous ressentez est légitime" si absent

### **Level 3: ADVANCED** (Expérimental)
- ✅ Garde l'existant
- ✅ Utilise EmotionBERT pour analyse fine
- ✅ Adapte le ton selon valence/arousal
- ✅ Applique templates cliniques
- 🎯 Utilisation: A/B testing, utilisateurs beta

```python
engine = get_integrated_engine(enhancement_level="advanced")
# → Utilise EmotionBERT + Super-prompts
```

---

## 🛡️ Sécurité et Fallback

### **Fallback Automatique**
```python
try:
    # Tente d'utiliser les améliorations
    enhanced_response = enhance_response(existing_response, context)
except Exception as e:
    # Retour automatique à l'existant
    logger.error(f"Enhancement failed: {e}")
    return existing_response  # ✅ Toujours fonctionnel
```

### **Évaluation de Sécurité**
```python
class SafetyAssessor:
    def assess_safety(self, emotion_scores, message):
        # Détecte les indicateurs de crise
        crisis_indicators = ['suicide', 'mort', 'finir', ...]
        
        if detresse >= 80 or has_crisis_indicators:
            return "crisis"  # → Protocole de crise
        elif detresse >= 60:
            return "elevated"  # → Surveillance renforcée
        else:
            return "normal"  # → Fonctionnement standard
```

---

## 📊 Métriques et Monitoring

### **Logging des Améliorations**
```python
if existing_response != final_response:
    logger.info(
        f"Response enhanced | "
        f"Phase: {context.therapeutic_phase} | "
        f"Safety: {context.safety_level} | "
        f"Grief: {context.advanced_emotion.grief_intensity:.2f}"
    )
```

### **A/B Testing**
```python
# 10% des utilisateurs avec advanced
# 90% avec moderate
enhancement_level = "advanced" if random() < 0.1 else "moderate"
```

---

## 🚀 Déploiement Progressif

### **Phase 1: Validation (Semaine 1-2)**
- ✅ Déployer avec `enhancement_level="basic"`
- ✅ Vérifier que rien n'est cassé
- ✅ Collecter les logs

### **Phase 2: Amélioration Modérée (Semaine 3-4)**
- ✅ Passer à `enhancement_level="moderate"`
- ✅ Monitorer la satisfaction utilisateur
- ✅ Ajuster les améliorations si nécessaire

### **Phase 3: A/B Testing Advanced (Semaine 5-6)**
- ✅ 10% des utilisateurs avec `enhancement_level="advanced"`
- ✅ Comparer les métriques (engagement, satisfaction)
- ✅ Décider du rollout complet

### **Phase 4: Rollout Complet (Semaine 7+)**
- ✅ 100% des utilisateurs avec le niveau optimal
- ✅ Monitoring continu
- ✅ Itérations basées sur les données

---

## 🧪 Tests

### **Test 1: Enrichissement du Contexte**
```bash
cd backend/ai-engine
python test_integrated_engine.py
```

### **Test 2: EmotionBERT**
```bash
cd backend/emotions-service
python test_emotionbert.py
```

### **Test 3: RAG Avancé**
```bash
cd backend/ai-engine
python test_rag.py
```

---

## ✅ Avantages de cette Architecture

1. **Sécurité** : Fallback automatique vers l'existant
2. **Progressivité** : Déploiement par niveaux
3. **Réversibilité** : Retour à l'existant en 1 ligne
4. **Testabilité** : Chaque composant testable indépendamment
5. **Scalabilité** : Ajout facile de nouvelles améliorations
6. **Monitoring** : Logs détaillés pour analyse

---

## 📝 Prochaines Étapes

1. ✅ **Tester le moteur intégré** : `python test_integrated_engine.py`
2. ⏳ **Fine-tuner EmotionBERT** : Collecter 500-1000 messages annotés
3. ⏳ **Intégrer avec API Gateway** : Ajouter endpoint `/chat_enhanced`
4. ⏳ **Déployer en production** : Phase 1 (basic) → Phase 2 (moderate) → Phase 3 (advanced)

