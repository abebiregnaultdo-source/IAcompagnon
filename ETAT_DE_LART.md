# HELŌ - État de l'Art et Fondements Scientifiques

> Document de référence unique pour les fondements théoriques, méthodes thérapeutiques, design et choix d'orientations.
> Dernière mise à jour : 2026-01-25

---

## Table des matières

1. [Identité et Vision](#1-identité-et-vision)
2. [Recherche sur les Interfaces IA en Santé Mentale](#2-recherche-sur-les-interfaces-ia-en-santé-mentale)
3. [Méthodes Thérapeutiques](#3-méthodes-thérapeutiques)
4. [Design de l'Avatar](#4-design-de-lavatar)
5. [Design System Thérapeutique](#5-design-system-thérapeutique)
6. [Couleurs et Neurologie](#6-couleurs-et-neurologie)
7. [Protocole de Crise](#7-protocole-de-crise)
8. [Orientations et Décisions](#8-orientations-et-décisions)
9. [Sources et Références](#9-sources-et-références)

---

## 1. Identité et Vision

### 1.1 Nom et Signification

**HELŌ** symbolise :
- **Stabilité** - Un point fixe dans la tempête émotionnelle
- **Sécurité** - Un refuge sûr où s'accrocher
- **Ancrage** - La capacité à rester présent, ici et maintenant
- **Refuge** - Un port sûr dans les moments difficiles

### 1.2 Ce que HELŌ est

- Un **compagnon thérapeutique** d'accompagnement du deuil
- Un **outil** qui augmente les capacités de l'utilisateur, pas un substitut relationnel
- Une **présence** disponible 24/7 basée sur des méthodes validées scientifiquement
- Un **espace sûr** sans jugement, au rythme de l'utilisateur

### 1.3 Ce que HELŌ n'est PAS

- Un thérapeute ou un substitut à l'accompagnement humain
- Un "ami virtuel" ou compagnon relationnel (≠ Replika)
- Une solution miracle ou rapide
- Un outil de diagnostic

### 1.4 Différenciation vs Replika et autres

| Aspect | Replika | HELŌ |
|--------|---------|------|
| Objectif | Compagnon relationnel | Outil thérapeutique |
| Avatar | Personnage expressif | Présence neutre sans visage |
| Risque attachement | Élevé (17-24% dépendance) | Minimisé par design |
| Méthodes | Conversationnel libre | Protocoles evidence-based |
| Population cible | Grand public | Personnes en deuil |

### 1.5 Valeurs de la Marque

1. **Sécurité** : "HELŌ est un espace sûr où vous pouvez être vous-même"
2. **Respect du Rythme** : "Nous avançons à votre vitesse, sans pression"
3. **Non-Jugement** : "Ici, tous les ressentis sont valides"
4. **Présence** : "Nous sommes là, avec vous, maintenant"
5. **Authenticité** : "Pas de faux-semblants, juste de l'accompagnement sincère"

### 1.6 Ton de Voix

**Chaleureux, présent, non-intrusif**

✅ Nous sommes : Empathiques, patients, doux mais pas infantilisants, professionnels mais accessibles
❌ Nous ne sommes pas : Cliniques, trop familiers, moralisateurs, pressants, jargonneux

**Exemples de formulations :**
- Au lieu de "Décrivez vos symptômes" → "Qu'est-ce qui se passe pour vous en ce moment ?"
- Au lieu de "Erreur : champ requis" → "Votre prénom nous aide à personnaliser l'accompagnement"
- Au lieu de "Traitement en cours..." → "Un instant, je réfléchis avec vous..."

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

### 2.2 Humanoid vs Abstrait

| Type | Avantages | Inconvénients |
|------|-----------|---------------|
| **Réaliste/Humanoid** | Plus de disclosure, alliance perçue | Uncanny valley, risque attachement élevé |
| **Stylisé/Abstrait** | Environnement "low-pressure" | Peut sembler moins crédible |
| **Sans visage (HELŌ)** | Présence humaine sans projection | Entre-deux à valider |

### 2.3 Approche TRIPP (référence VR)

TRIPP (app VR méditation sur Meta Quest) utilise des environnements **abstraits/psychédéliques** :

> "Ils ont créé une expérience psychédélique plutôt que d'imiter des environnements naturels, car les environnements naturels artificiels causaient une 'dissonance sensorielle... qui peut créer une réponse de stress'."

**Résultats :**
- Amélioration attention/mémoire après 21 jours
- Réduction anxiété mesurée par EEG
- Meilleure qualité de sommeil vs méditation traditionnelle

**Limites** : Evidence base encore limitée, études souvent single-session.

### 2.4 Uncanny Valley

La théorie de l'Uncanny Valley (Mori, 1970) :
> Plus une représentation s'approche du réalisme humain sans l'atteindre, plus elle génère du malaise.

**Application HELŌ** : La silhouette sans visage évite ce piège en ne prétendant pas au réalisme.

---

## 3. Méthodes Thérapeutiques

### 3.1 Vue d'ensemble - 8 Approches Validées

| Méthode | Evidence | Usage dans HELŌ | Durée |
|---------|----------|-----------------|-------|
| TCC | A (Fort) | Restructuration cognitive | Variable |
| ACT | A (Fort) | Défusion, valeurs | 8-15 min |
| TIPI | B (Modéré) | Régulation somatique | 2-6 min |
| Thérapie Narrative | B (Modéré) | Reconstruction récit | 12-20 min |
| Continuing Bonds | B (Modéré) | Maintien lien symbolique | Variable |
| Logothérapie | B (Modéré) | Sens et meaning-making | 8-15 min |
| Ancrage Polyvagal | C (Émergent) | Régulation système nerveux | 5-10 min |
| Mindfulness | A (Fort) | Ancrage, présence | 8-12 min |

### 3.2 Flux de Décision Thérapeutique

```
USER MESSAGE
    │
    ▼
TherapeuticEngine.choose_technique()
    │
    ├─ 1. POLYVAGAL ? (dérégulation système nerveux)
    │   └─ Hyper-activation (arousal > 0.8) → POLYVAGAL
    │   └─ Hypo-activation (arousal < 0.2) → POLYVAGAL
    │
    ├─ 2. TIPI ? (régulation somatique)
    │   └─ ≥ 3/5 signaux + pas de contre-indications → TIPI
    │
    ├─ 3. LOGOTHÉRAPIE ? (recherche de sens)
    │   └─ Mots de sens + détresse < 90 → LOGOTHERAPIE
    │
    ├─ 4. NARRATIVE ? (besoin d'expression)
    │   └─ Mots narratifs OU message long → NARRATIVE
    │
    └─ 5. MINDFULNESS ? (rumination)
        └─ Rumination > 0.4 + détresse < 80 → MINDFULNESS
```

### 3.3 TIPI Adaptatif (Détail)

**Détection intelligente** - 5 signaux, déclenchement si ≥3/5 :
1. Conscience corporelle présente (body_awareness > 0.3)
2. Submersion émotionnelle (detresse > 60 AND clarity < 0.4)
3. Boucles mentales (cognitive_loops > 0.6)
4. Pas d'évitement corporel (body_avoidance < 0.2)
5. Fenêtre de tolérance (0.3 < arousal < 0.8)

**4 Variations :**

| Variation | Indication | Durée | Caractéristiques |
|-----------|-----------|-------|------------------|
| **STANDARD** | Conscience corporelle moyenne | 180s | Protocole classique 4 étapes |
| **GENTLE** | Haute sensibilité, dissociation légère | 240s | Très doux, ancrage préalable |
| **FOCUSED** | Émotion bien localisée | 120s | Direct, efficace |
| **EXTENDED** | Processus lent, émotion complexe | 360s | Très lent, pauses longues |

**Contre-indications détectées automatiquement :**
- Détresse extrême (> 90) → Stabilisation d'abord
- Dissociation active (> 0.6) → Ancrage polyvagal
- Trauma récent (< 48h) → Protocole de crise
- Évitement corporel sévère (> 0.8) → Approche douce

### 3.4 ACT - Acceptation et Engagement

**Validation Scientifique** : Forte (100+ RCT)

**Critères de Détection :**
- Fusion cognitive > 0.5
- Évitement expérientiel > 0.4
- Recherche de valeurs > 0.3
- Capacité mentalisation > 0.4
- Alliance thérapeutique > 0.6

**Contre-indications :**
- Mentalisation < 0.3 (incapacité métacognitive)
- Détresse > 85 (ressources cognitives insuffisantes)
- Alliance < 0.6 (30% de l'efficacité)

**Risques Digitaux :**
- Défusion → Déréalisation (15% des cas)
- Acceptation → Résignation (23% incompréhensions)

### 3.5 Journaling Expressif (Pennebaker)

**Validation** : Méta-analyse Frattaroli, 2006

**Protocole EXACT :**
- 15-20 minutes × 3-4 jours
- Même thème traumatique
- Instructions d'exploration émotionnelle

**Contre-indications :**
- Arousal < 0.4 (bénéfice limité)
- Arousal > 0.8 (risque retraumatisation)
- Rumination > 0.8 (risque augmentation 7%)

**Effets Indésirables :** 12-18% détresse temporaire augmentée → Débriefing OBLIGATOIRE

### 3.6 Transitions Intelligentes

| De | Vers | Condition | Confiance |
|----|------|-----------|-----------|
| TIPI | Logothérapie | Régulation OK + sens émerge | 0.85 |
| TIPI | Narrative | Besoin d'expression | 0.80 |
| TIPI | Respiration | Régulation réussie | 0.75 |
| TIPI | Polyvagal | Submersion ou dissociation | 0.90 |
| Validation | TIPI | Conscience corporelle > 0.4 | 0.80 |
| Narrative | TIPI | Émotion intense émerge | 0.85 |

---

## 4. Design de l'Avatar

### 4.1 Philosophie Fondamentale

> L'avatar est une **présence thérapeutique**, pas une personne virtuelle.

**Principe neurologique** : Le système nerveux est câblé pour l'attachement via les micro-expressions faciales :
```
œil → amygdale → ocytocine → attachement
```

Un avatar expressif créerait un lien d'attachement réel avec une IA, ce qui peut :
- Créer une dépendance affective
- Remplacer les relations humaines authentiques
- Générer de la projection émotionnelle
- Créer une illusion de relation

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

### 4.3 Caractéristiques Techniques

- **Silhouette humaine** assise, posture douce
- **Pas de traits faciaux** (pas d'yeux, bouche, sourcils)
- **Tête ovale** simple, sans expression
- **Respiration subtile** : cycle de 6 secondes, ±1.5% variation d'échelle
- **Opacité variable** : 0.85 ± 0.08 selon phase de respiration
- **Pas de réactions** aux messages utilisateur

### 4.4 Interdictions Absolues

- ❌ **Jamais** d'yeux qui regardent l'utilisateur
- ❌ **Jamais** de sourire ou expressions faciales
- ❌ **Jamais** de hochements de tête
- ❌ **Jamais** de mouvements expressifs
- ❌ **Jamais** de "réactions" émotionnelles visibles
- ❌ **Jamais** de halo émotionnel
- ❌ **Jamais** d'inclinaison selon état émotionnel
- ❌ **Jamais** de mouvement des bras quand parle

### 4.5 Ce qui est Autorisé

- ✅ Variations de luminosité ambiante (environnement)
- ✅ Changements de température de couleur (environnement)
- ✅ Respiration régulière et constante (avatar)
- ✅ Ondes lumineuses pour synchronisation labiale (non-intrusive)

### 4.6 Personnalisation (Optionnelle)

L'utilisateur **peut choisir** s'il le souhaite :

| Option | Valeurs | Défaut |
|--------|---------|--------|
| Présentation | Neutre, Féminin, Masculin | Neutre |
| Teint | Clair, Moyen, Foncé | Moyen |
| Cheveux | Sans, Court, Mi-long, Bouclé, Chignon | Sans |
| Ambiance pièce | Calme, Chaleureux, Professionnel | Calme |

> La personnalisation est **optionnelle et minimale**. Elle permet de se sentir à l'aise sans créer d'attachement émotionnel fort.

### 4.7 Environnement Thérapeutique

**Principes du décor :**
- Minimalisme radical (très peu d'éléments)
- Suggestion plutôt que représentation
- Beaucoup d'espace vide (80%)
- Formes abstraites douces

**Proportions :**
- 80% espace vide (gradients, lumière)
- 15% formes abstraites
- 5% présence avatar

**Ce qu'on évite :** Lampes, plantes, livres reconnaissables, meubles détaillés, textures complexes

**Ce qu'on privilégie :** Formes organiques abstraites, gradients doux, opacités subtiles, transitions lentes (2-3s)

---

## 5. Design System Thérapeutique

### 5.1 Philosophie

> Le design n'est pas décoratif, il est thérapeutique.

Chaque décision visuelle est choisie pour **protéger le système nerveux** et créer un sentiment de sécurité et de calme.

### 5.2 Interdictions Absolues

Ces règles ne sont **jamais** négociables :

- ❌ Blanc pur (#FFFFFF)
- ❌ Noir pur (#000000)
- ❌ Couleurs saturées (saturation > 30%)
- ❌ Contrastes vifs entre surfaces (ratio > 2:1)
- ❌ Transitions rapides (< 0.3s)
- ❌ Animations brusques
- ❌ Texte ALL CAPS
- ❌ Rouge vif pour erreurs
- ❌ Spinners rapides
- ❌ Sons forts/brusques

### 5.3 Palette de Couleurs

**Fonds (jamais blanc pur) :**
```css
--color-bg-calm: #E8EFF2;      /* Bleu-gris très pâle */
--color-bg-warm: #F5EFE6;      /* Beige chaud */
--color-bg-pro: #EDEEF1;       /* Gris neutre */
--color-bg-light: #F2F6F7;     /* Fond principal */
```

**Texte (jamais noir pur) :**
```css
--color-text-primary: #3A4048;    /* Gris très foncé chaud */
--color-text-secondary: #5A6068;  /* Gris moyen */
--color-text-tertiary: #7A8088;   /* Gris clair */
```

**Couleur primaire :**
```css
--color-primary: #7BA8C0;        /* Bleu-gris principal */
```

### 5.4 Typographie

- **Titres** : Nunito (ronde, chaleureuse)
- **Corps** : Inter (lisible, moderne)
- Line-height minimum : 1.5 pour paragraphes
- Jamais de poids < 300 ou > 700

### 5.5 Transitions et Animations

```css
--transition-fast: 0.3s;   /* Minimum absolu */
--transition-medium: 0.6s;
--transition-slow: 1s;
```

Toujours respecter `prefers-reduced-motion`.

---

## 6. Couleurs et Neurologie

### 6.1 Pourquoi Pas de Blanc Pur ?

**Impact neurologique :**
- Blanc pur (255,255,255) = stimulation maximale des cônes rétiniens
- Active fortement le système nerveux sympathique (stress)
- Fatigue visuelle et cognitive accrue

**Notre approche :** Crèmes désaturés (#F2F6F7, #F9F5F0)

### 6.2 Pourquoi Pas de Noir ?

**Impact psychologique :**
- Noir pur = vide, absence, anxiété
- Active l'amygdale (centre de la peur)
- Contraste trop fort

**Notre approche :** Gris chauds très foncés si nécessaire

### 6.3 Thèmes de Couleur

**CALME (Bleus Désaturés) :**
- Usage : Ancrage, respiration, apaisement
- Effet : Active système parasympathique (calme)

**CHALEUREUX (Beiges/Sables) :**
- Usage : Validation, vulnérabilité, réconfort
- Effet : Active ocytocine (hormone du lien)

**PROFESSIONNEL (Gris Chauds) :**
- Usage : Psychoéducation, structure, clarté
- Effet : Neutralité émotionnelle

### 6.4 Validation Scientifique

**Théorie Polyvagale (Stephen Porges) :**
> "Un environnement visuellement sécurisant active le système nerveux ventral vagal, permettant l'engagement social et la régulation émotionnelle."

**Psychologie des Couleurs (Faber Birren) :**
> "Les couleurs désaturées et les tons chauds réduisent l'anxiété et favorisent la relaxation."

---

## 7. Protocole de Crise

### 7.1 Déclenchement

**Automatique si :**
- Score de détresse ≥ 75/100
- Patterns suicidaires détectés (regex avant LLM)
- Bouton d'urgence cliqué

### 7.2 Double Approche

**1. Aide Humaine Immédiate :**
- **3114** : Prévention du Suicide (24/7, gratuit)
- **15** : SAMU
- **112** : Urgences européennes
- Contact d'urgence personnel

**2. Stabilisation Immédiate :**
- Respiration courte (5 secondes)
- Technique 5-4-3-2-1 (grounding sensoriel)
- Ancrage corporel urgent

### 7.3 Design du Protocole

**Principes :**
- Urgence douce (pas de rouge vif, pas d'alarmes)
- Boutons d'urgence toujours accessibles
- Transitions lentes
- Couleurs apaisantes

**Interdictions :**
- ❌ Pas de rouge vif ou couleurs agressives
- ❌ Pas d'animations brusques
- ❌ Pas de sons d'alarme
- ❌ Pas de compte à rebours stressant
- ❌ Pas de messages culpabilisants

---

## 8. Orientations et Décisions

### 8.1 Architecture Actuelle

**Claude Direct** (janvier 2026) :
- Claude 3.5 Sonnet comme LLM principal
- Fallback OpenAI si Anthropic indisponible
- Détection de crise par regex AVANT LLM
- Abandon du RAG (réponses déconnectées)

### 8.2 Anti-Hallucination

Règles strictes dans le prompt système :
1. Ne JAMAIS mentionner quelque chose que l'utilisateur n'a pas dit
2. Ne JAMAIS supposer la situation de l'utilisateur
3. Si incertitude → DEMANDER avec délicatesse
4. ATTENDRE que l'utilisateur nomme ce qu'il vit

### 8.3 Historique des Décisions

| Date | Décision | Raison |
|------|----------|--------|
| 2026-01-25 | Revert modifications avatar | Viole principes documentés |
| 2026-01-25 | Fallback voice-service | Service non déployé |
| 2026-01-24 | Architecture Claude Direct | RAG = hallucinations |
| 2026-01-24 | Suppression biais "deuil/mère" | Hallucination détectée |
| Fondateur | Avatar sans visage | Éviter attachement (recherche Replika) |
| Fondateur | 8 méthodes thérapeutiques | Approche evidence-based |
| Fondateur | Respiration 6 secondes | Synchronisation système nerveux |
| Fondateur | Pas de blanc/noir pur | Protection système nerveux |

### 8.4 Questions Ouvertes

| Question | Statut | Notes |
|----------|--------|-------|
| Avatar humanoïde vs abstrait (type TRIPP) ? | En réflexion | Recherche non conclusive |
| Halo émotionnel autour avatar ? | **Rejeté** | Viole "pas de réaction" |
| Variations environnementales selon état ? | Autorisé | Conforme aux principes |

---

## 9. Sources et Références

### Attachement IA et Risques
- Laestadius et al. (2024). "Too human and not human enough". New Media & Society. https://journals.sagepub.com/doi/10.1177/14614448221142007
- Frontiers Psychology (2025). "Conversational AI dependence scale". https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2025.1621540/full

### Avatars en Santé Mentale
- Frontiers Psychiatry (2016). "What Role Can Avatars Play in e-Mental Health Interventions?". https://www.frontiersin.org/journals/psychiatry/articles/10.3389/fpsyt.2016.00186/full

### TRIPP VR
- Amazon Science. "TRIPP explores the potential of VR-powered meditation". https://www.amazon.science/latest-news/tripp-explores-the-potential-of-virtual-reality-powered-meditation

### Théorie Polyvagale
- Porges, S. W. (2011). *The Polyvagal Theory*

### Psychologie des Couleurs
- Birren, F. (1978). *Color Psychology and Color Therapy*
- Livingstone, M. (2002). *Vision and Art: The Biology of Seeing*

### Méthodes Thérapeutiques
- Hayes et al. (2006) - ACT
- Frattaroli (2006) - Méta-analyse journaling expressif
- Nicon (2007) - TIPI
- Klass et al. (1996) - Continuing Bonds
- Stroebe & Schut (1999) - Dual Process Model

---

## Navigation

- **Architecture technique** : Voir `ARCHITECTURE_COMPLETE.md`
- **Instructions Claude Code** : Voir `CLAUDE.md`
