# HELŌ - Journal d'Évolution du Développement

Ce document trace l'évolution des développements et les décisions architecturales majeures.

---

## 2025-12-11 - Analyse État de l'Art & Améliorations RAG/Thérapeutique

### Contexte
Suite à des problèmes de cohérence dans les réponses du chatbot (messages génériques type "tu sembles ressentir quelque chose très présent en toi..."), une analyse approfondie de l'architecture a été menée.

### Rapport d'Analyse État de l'Art (2024/2025)

#### Sources de Recherche
- SentimentCareBot (ScienceDirect 2024)
- OnRL-RAG: Real-Time Personalized Mental Health Dialogue System
- Emotion-AWARE Embedding Fusion (MDPI 2024)
- Stanford Crisis-Message Detector (2024)
- Woebot, Wysa, Youper - Best practices chatbots thérapeutiques

#### Architecture Actuelle vs Recommandations

| Domaine | HELŌ Actuel | État de l'Art | Écart |
|---------|-------------|---------------|-------|
| **Embeddings** | all-MiniLM-L6-v2 (générique) | DistilBERT-emotion (93.8% accuracy) | **À améliorer** |
| **RAG** | Vector-only (ChromaDB) | Hybrid RAG + Knowledge Graph | **À améliorer** |
| **Mesures cliniques** | Échelles custom (detresse/espoir/energie) | PHQ-9, GAD-7, WAI validées | **Manquant** |
| **Crise** | Alerte passive (texte 3114) | Interruption active + question directe | **À améliorer** |
| **Protocoles** | Micro-protocoles simples | CBT/DBT multi-étapes structurés | **À enrichir** |
| **Dual-LLM** | OpenAI + Claude | ✅ Conforme best practice | OK |
| **Safety Monitor** | Seuils adaptatifs evidence-based | ✅ Conforme best practice | OK |
| **Non-directivité** | Posture dans prompts | ✅ Éthiquement requis | OK |

#### Corrections Effectuées (2025-12-11)

1. **Mapping des phases corrigé** (`vector_rag.py`)
   - Les phases système (`ancrage`, `expression`, `sens`, `reconstruction`) mappent maintenant vers les phases protocoles (`crisis`, `stabilization`, `exploration`, `meaning_making`)

2. **Premier message dynamique**
   - Chat.jsx appelle maintenant `/generate` avec `is_welcome: true`
   - Backend génère un message personnalisé via RAG
   - Fallback local si backend indisponible

3. **Logs de traçabilité ajoutés**
   - `[PIPELINE]` : Phase, technique, message
   - `[RAG]` : Protocol sélectionné, score, reasoning
   - `[FALLBACK]` : Source et technique utilisée

### Plan d'Améliorations

#### Priorité 1 - Semaine 1-2 ✅ IMPLÉMENTÉ (2025-12-11)
- [x] **DistilBERT-emotion** : Module `emotion_detector.py` avec détection 6 émotions (93.8% accuracy)
- [x] **PHQ-2 + GAD-2** : Module `clinical_scales.py` avec échelles validées + Mini-WAI
- [x] **Protocole crise actif** : Détection sémantique + interruption immédiate + question de sécurité
- [x] **Protocoles CBT/DBT structurés** : 4 nouveaux protocoles multi-étapes ajoutés

#### Fichiers créés/modifiés :
- `backend/ai-engine/app/emotion_detector.py` (NOUVEAU) - DistilBERT + détection crise
- `backend/ai-engine/app/clinical_scales.py` (NOUVEAU) - PHQ-2, GAD-2, Mini-WAI
- `backend/ai-engine/app/main.py` - Intégration détection crise active
- `backend/ai-engine/requirements.txt` - Ajout transformers + torch
- `backend/modules/grief/micro_protocols.json` - 4 protocoles CBT/DBT/ACT multi-étapes

#### Priorité 2 - Mois 1
- [ ] **Alliance thérapeutique** : Intégrer Mini-WAI après session 3
- [ ] **Hybrid RAG** : Knowledge Graph léger pour relations protocoles
- [ ] **Intégration frontend** : Afficher PHQ-2/GAD-2 dans onboarding

#### Priorité 3 - Trimestre 1
- [ ] **Fine-tuning français** : Modèle émotionnel sur données anonymisées
- [ ] **Trajectoire émotionnelle** : Analyse tendances sur 10+ sessions
- [ ] **Suivi long-terme** : Check-ins 1/3/6 mois

### Métriques de Référence (État de l'Art)

| Métrique | Chatbots AI (méta-analyse 2024) |
|----------|--------------------------------|
| Réduction dépression | Hedge's g = 0.64 |
| Réduction détresse | Hedge's g = 0.70 |
| Bien-être général | Non significatif (g = 0.32) |
| Engagement IA générative | 3x vs rule-based |

---

## Historique des Versions

### v1.0 - Architecture Initiale
- Dual-model (OpenAI + Claude)
- Micro-protocoles JSON
- Safety Monitor basic

### v1.1 - RAG Vectoriel (2025-12-11)
- Ajout sentence-transformers + ChromaDB
- NRCLex pour analyse émotionnelle
- 15 micro-protocoles cliniques validés

### v1.2 - Améliorations État de l'Art (En cours)
- DistilBERT-emotion
- PHQ-2/GAD-2
- Protocole crise actif
- CBT structuré

---

*Dernière mise à jour : 2025-12-11*
