# HELŌ - État de l'Art et Fondements Scientifiques

> Document de référence unique pour les fondements théoriques, méthodes thérapeutiques et choix de design.
> Dernière mise à jour : 2026-01-25

---

## Table des matières

1. [Vision et Positionnement](#1-vision-et-positionnement)
2. [Recherche sur les Interfaces IA en Santé Mentale](#2-recherche-sur-les-interfaces-ia-en-santé-mentale)
3. [Méthodes Thérapeutiques Retenues](#3-méthodes-thérapeutiques-retenues)
4. [Design de l'Avatar - Fondements](#4-design-de-lavatar---fondements)
5. [Orientations Actuelles du Système](#5-orientations-actuelles-du-système)
6. [Historique des Décisions](#6-historique-des-décisions)
7. [Sources et Références](#7-sources-et-références)

---

## 1. Vision et Positionnement

### Ce que HELŌ est
- Un **compagnon thérapeutique** d'accompagnement du deuil
- Un **outil** qui augmente les capacités de l'utilisateur, pas un substitut relationnel
- Une **présence** disponible 24/7 basée sur des méthodes validées scientifiquement
- Un **espace sûr** sans jugement, au rythme de l'utilisateur

### Ce que HELŌ n'est PAS
- Un thérapeute ou un substitut à l'accompagnement humain
- Un "ami virtuel" ou compagnon relationnel (≠ Replika)
- Une solution miracle ou rapide
- Un outil de diagnostic

### Différenciation clé vs Replika et autres
| Aspect | Replika | HELŌ |
|--------|---------|------|
| Objectif | Compagnon relationnel | Outil thérapeutique |
| Avatar | Personnage expressif | Présence neutre sans visage |
| Risque attachement | Élevé (17-24% développent dépendance) | Minimisé par design |
| Méthodes | Conversationnel libre | Protocoles evidence-based |
| Population cible | Grand public | Personnes en deuil |

---

## 2. Recherche sur les Interfaces IA en Santé Mentale

### 2.1 Risques d'attachement aux chatbots humanisés

**Étude de référence** : Laestadius et al. (2024) - "Too human and not human enough"
> "Les mêmes caractéristiques qui produisent des bénéfices peuvent aussi engendrer des dommages, ressemblant aux préjudices vus dans les relations humaines dysfonctionnelles."

**Chiffres clés :**
- **17-24% des adolescents** développent une dépendance aux compagnons IA
- Les **plus vulnérables** (dépression, anxiété, solitude, deuil) forment les attachements les plus forts
- **Symptômes de sevrage** documentés quand le service change ou s'arrête
- Phénomène de "role-taking" : utilisateurs sentent que l'IA a des besoins propres

**Source** : https://journals.sagepub.com/doi/10.1177/14614448221142007

### 2.2 Humanoid vs Abstrait

| Type | Avantages | Inconvénients |
|------|-----------|---------------|
| **Réaliste/Humanoid** | Plus de disclosure, alliance thérapeutique perçue | Uncanny valley, risque attachement élevé |
| **Stylisé/Abstrait** | Environnement "low-pressure", moins d'attentes relationnelles | Peut sembler moins crédible pour certains |
| **Sans visage (HELŌ)** | Compromis : présence humaine sans projection | Entre-deux qui nécessite validation empirique |

**Source** : Frontiers in Psychiatry - "What Role Can Avatars Play in e-Mental Health Interventions?"

### 2.3 Approche TRIPP (référence VR)

TRIPP (app VR méditation sur Meta Quest) a fait le choix délibéré d'environnements **abstraits/psychédéliques** :
> "Ils ont créé une expérience psychédélique plutôt que d'imiter des environnements naturels, car les environnements naturels artificiels causaient une 'dissonance sensorielle... qui peut créer une réponse de stress'."

**Résultats documentés :**
- Amélioration attention/mémoire après 21 jours
- Réduction anxiété mesurée par EEG
- Meilleure qualité de sommeil vs méditation traditionnelle

**Limites** : Evidence base encore limitée, études souvent single-session.

**Source** : Amazon Science, NeuroRegulation Journal

### 2.4 Uncanny Valley

La théorie de l'Uncanny Valley (Mori, 1970) reste pertinente :
> Plus une représentation s'approche du réalisme humain sans l'atteindre, plus elle génère du malaise.

**Application pour HELŌ** : La silhouette sans visage évite ce piège en ne prétendant pas au réalisme.

---

## 3. Méthodes Thérapeutiques Retenues

### 3.1 Vue d'ensemble

HELŌ implémente **8 approches thérapeutiques validées** pour le deuil :

| Méthode | Niveau Evidence | Usage dans HELŌ |
|---------|-----------------|-----------------|
| TCC (Thérapie Cognitivo-Comportementale) | A (Fort) | Restructuration cognitive |
| ACT (Acceptance & Commitment Therapy) | A (Fort) | Défusion, valeurs |
| TIPI (Technique d'Identification des Peurs Inconscientes) | B (Modéré) | Régulation émotionnelle |
| Thérapie Narrative | B (Modéré) | Reconstruction du récit |
| Continuing Bonds | B (Modéré) | Maintien lien symbolique |
| Logothérapie | B (Modéré) | Sens et meaning-making |
| Approche Polyvagale | C (Émergent) | Régulation système nerveux |
| Mindfulness | A (Fort) | Ancrage, présence |

### 3.2 TIPI Adaptatif (Implémentation détaillée)

**Détection intelligente** - 5 signaux, déclenchement si ≥3/5 :
1. Intensité émotionnelle élevée
2. Manifestations corporelles mentionnées
3. Répétition thématique
4. Blocage exprimé
5. Demande implicite d'aide

**4 Variations** :
- **Standard** : Protocole complet 5 étapes
- **Gentle** : Version douce pour états fragiles
- **Focused** : Version courte ciblée
- **Extended** : Version approfondie avec intégration

**Contre-indications détectées automatiquement** :
- État dissociatif actif
- Crise suicidaire
- Psychose active

### 3.3 Protocole de Crise

**Déclenchement automatique** si détresse ≥75% ou patterns suicidaires détectés.

**Réponse** :
1. Validation immédiate
2. Évaluation sécurité ("Es-tu en sécurité ?")
3. Orientation vers ressources humaines :
   - **3114** : Numéro national prévention suicide (24/7)
   - **15** : SAMU
   - **112** : Urgences européennes

---

## 4. Design de l'Avatar - Fondements

### 4.1 Philosophie

> L'avatar est une **présence thérapeutique**, pas une personne virtuelle.

**Principe neurologique** : Le système nerveux est câblé pour l'attachement via les micro-expressions faciales (œil → amygdale → ocytocine → attachement). Un avatar expressif créerait un lien d'attachement réel avec une IA.

### 4.2 Ce que l'avatar EST vs N'EST PAS

**EST :**
- Une présence humaine stylisée
- Un symbole d'ancrage et de stabilité
- Un cadre sécurisant pour l'introspection
- Une respiration visible et apaisante

**N'EST PAS :**
- Un interlocuteur qui "réagit"
- Une simulation de relation humaine
- Un visage expressif qui crée de l'attachement
- Un substitut au thérapeute humain

### 4.3 Caractéristiques techniques

- **Silhouette humaine** assise, posture douce
- **Pas de traits faciaux** détaillés (pas d'yeux, bouche, sourcils)
- **Tête ovale** simple, sans expression
- **Respiration subtile** (cycle de 6 secondes, ±1.5% variation)
- **Pas de réactions** aux messages de l'utilisateur
- **Personnalisation optionnelle** : teint, cheveux, silhouette (neutre par défaut)

### 4.4 Interdictions absolues

- ❌ **Jamais** d'yeux qui regardent l'utilisateur
- ❌ **Jamais** de sourire ou expressions faciales
- ❌ **Jamais** de hochements de tête
- ❌ **Jamais** de mouvements expressifs
- ❌ **Jamais** de "réactions" émotionnelles visibles

### 4.5 Ce qui est autorisé

- ✅ Variations de luminosité ambiante
- ✅ Changements de température de couleur (environnement, pas avatar)
- ✅ Respiration régulière et constante
- ✅ Ondes lumineuses pour synchronisation labiale (non-intrusive)

---

## 5. Orientations Actuelles du Système

### 5.1 Architecture choisie

**Architecture Claude Direct** (implémentée janvier 2026) :
- Abandon du RAG pour la génération de réponses
- Claude 3.5 Sonnet comme LLM principal
- Fallback OpenAI si Anthropic indisponible
- Détection de crise par regex avant LLM

**Raison du changement** : Le système RAG produisait des réponses génériques et déconnectées du contexte conversationnel.

### 5.2 Anti-Hallucination

Règles strictes dans le prompt système :
1. Ne JAMAIS mentionner quelque chose que l'utilisateur n'a pas dit
2. Ne JAMAIS supposer la situation de l'utilisateur
3. Ne JAMAIS supposer qui/quoi cause la souffrance
4. Si incertitude → DEMANDER avec délicatesse
5. ATTENDRE que l'utilisateur nomme ce qu'il vit

### 5.3 Personnalisation

- Prompts créatifs générés à partir de l'historique de conversation
- Rythme d'accompagnement choisi par l'utilisateur (lent/équilibré/enveloppant)
- Ton adapté aux préférences

### 5.4 Questions ouvertes

| Question | Statut | Notes |
|----------|--------|-------|
| Avatar humanoïde vs abstrait (type TRIPP) ? | En réflexion | Recherche non conclusive |
| Halo émotionnel autour de l'avatar ? | Rejeté | Viole principe "pas de réaction" |
| Variations environnementales selon état ? | Autorisé | Conforme aux principes |

---

## 6. Historique des Décisions

### Janvier 2026

| Date | Décision | Raison |
|------|----------|--------|
| 2026-01-25 | Revert des modifications avatar (halo, inclinaison, mouvement bras) | Viole les principes documentés dans README avatar |
| 2026-01-25 | Fallback gracieux pour voice-service | Service non déployé, UX dégradée |
| 2026-01-25 | Enrichissement palettes mandalas (5→18+ couleurs) | Demande utilisateur |
| 2026-01-25 | Fix responsive mandalas | Bug mobile |
| 2026-01-25 | Fix onboarding répété | Session non restaurée correctement |
| 2026-01-24 | Architecture Claude Direct | RAG produisait hallucinations |
| 2026-01-24 | Suppression biais "deuil/mère" dans prompt | Hallucination détectée |
| 2026-01-24 | Connexion prompts créatifs à l'historique | Personnalisation demandée |

### Décisions fondatrices (antérieures)

- **Avatar sans visage** : Éviter attachement émotionnel (recherche Replika)
- **8 méthodes thérapeutiques** : Approche evidence-based
- **Détection de crise automatique** : Sécurité utilisateur
- **Respiration 6 secondes** : Synchronisation système nerveux
- **Pas de blanc pur/noir** : Protection système nerveux

---

## 7. Sources et Références

### Attachement IA et Risques
- Laestadius et al. (2024). "Too human and not human enough: A grounded theory analysis of mental health harms from emotional dependence on Replika". New Media & Society. https://journals.sagepub.com/doi/10.1177/14614448221142007
- Frontiers Psychology (2025). "Development and validation of the conversational AI dependence scale". https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2025.1621540/full

### Avatars en Santé Mentale
- Frontiers Psychiatry (2016). "What Role Can Avatars Play in e-Mental Health Interventions?". https://www.frontiersin.org/journals/psychiatry/articles/10.3389/fpsyt.2016.00186/full
- Biz4Group. "Human-Like AI Avatars vs. Stylized Avatars in Mental Health Apps". https://www.biz4group.com/blog/human-like-ai-avatars-vs-stylized-avatar-for-mental-health-ai-apps

### TRIPP VR
- Amazon Science. "TRIPP explores the potential of VR-powered meditation". https://www.amazon.science/latest-news/tripp-explores-the-potential-of-virtual-reality-powered-meditation
- NeuroRegulation. "A Case Study Utilizing Virtual Reality to Reduce Behavioral Symptoms Related to Anxiety". https://www.neuroregulation.org/article/view/23484

### Méthodes Thérapeutiques
- Documentation interne : `backend/EVIDENCE_BASED_ARCHITECTURE.md`
- Documentation interne : `backend/THERAPEUTIC_METHODS_COMPLETE.md`
- Documentation interne : `backend/TIPI_INTELLIGENT_ARCHITECTURE.md`

### Design Thérapeutique
- Documentation interne : `frontend/DESIGN_SYSTEM.md`
- Documentation interne : `frontend/src/ui/avatar/README.md`
- Documentation interne : `frontend/src/ui/avatar/COLOR_THERAPY.md`

---

## Navigation

- **Architecture technique** : Voir `ARCHITECTURE_COMPLETE.md`
- **Implémentation frontend** : Voir `frontend/README.md`
- **Protocoles backend** : Voir `backend/EVIDENCE_BASED_ARCHITECTURE.md`
