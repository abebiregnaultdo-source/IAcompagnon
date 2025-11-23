# 📄 Vue d'Ensemble des Pages - HELŌ

## 🎯 Pages de l'Application

L'application HELŌ est une **Single Page Application (SPA)** avec 2 vues principales et 1 état de transition.

---

## 1️⃣ Onboarding (Parcours d'Accueil)

**Fichier :** `src/ui/Onboarding.jsx`  
**Route :** Page initiale (pas d'utilisateur)  
**Durée estimée :** 2-3 minutes

### Sous-étapes (6 au total)

#### Étape 1 : Intro
**Objectif :** Accueillir chaleureusement l'utilisateur

**Contenu :**
- Logo HELŌ centré
- Titre : "Bienvenue dans un espace pour vous"
- Texte explicatif sur HELŌ
- Message : "Nous avançons ensemble, à votre rythme"
- Bouton "Continuer"

**Design :**
- Animation fade-in douce
- Typographie grande et lisible
- Couleurs apaisantes
- Barre de progression (1/5)

---

#### Étape 2 : Consent (Consentement)
**Objectif :** Obtenir consentement éclairé

**Contenu :**
- Titre : "Votre consentement"
- Explication de l'utilisation des données
- Liste "Ce que nous faisons"
- Liste "Ce que nous ne faisons jamais"
- Bouton "J'accepte et je continue"

**Design :**
- Encadré avec fond surface-2
- Listes à puces claires
- Ton rassurant, pas juridique
- Barre de progression (2/5)

---

#### Étape 3 : First Name (Prénom)
**Objectif :** Personnaliser l'expérience

**Contenu :**
- Titre : "Comment puis-je vous appeler ?"
- Explication : possibilité de pseudonyme
- Champ de saisie avec label "Prénom ou pseudonyme"
- Placeholder : "Comment souhaitez-vous être appelé ?"
- Texte d'aide : "Cela reste entre nous"
- Bouton "Continuer"

**Design :**
- Input avec focus doux
- Validation empathique si vide
- Barre de progression (3/5)

---

#### Étape 4 : Rhythm (Choix du Rythme)
**Objectif :** Adapter l'accompagnement

**Contenu :**
- Titre : "À quel rythme souhaitez-vous avancer ?"
- 3 options sous forme de cartes :
  1. **Lent et progressif** - "Des pauses fréquentes, beaucoup de douceur"
  2. **Équilibré** - "Un rythme naturel, ni trop rapide ni trop lent"
  3. **Enveloppant et présent** - "Plus de présence, plus d'accompagnement"

**Design :**
- Cartes cliquables avec bordure
- Sélection visible (bordure primaire)
- Hover subtil
- Barre de progression (4/5)

---

#### Étape 5 : Radar Init (Préparation)
**Objectif :** Préparer l'utilisateur

**Contenu :**
- Titre : "Presque prêt"
- Message : "Votre espace personnel est préparé"
- Invitation à respirer
- Bouton "Je suis prêt"

**Design :**
- Message court et rassurant
- Barre de progression (5/5)

---

#### Étape 6 : Done (Finalisation)
**Objectif :** Transition vers le chat

**Contenu :**
- Titre : "Bienvenue, [Prénom]"
- Message : "Votre espace est prêt"
- Bouton "Ouvrir mon espace"

**Design :**
- Confirmation finale
- Bouton d'action principal

---

### Données Collectées

```javascript
{
  id: "généré",
  first_name: "Prénom saisi",
  rhythm: 1|2|3,
  tone: "lent"|"neutre"|"enveloppant",
  active_module: "grief",
  consent: {
    accepted: true,
    version: "v1.0",
    date: "2024-01-15",
    scope: ["text", "emotion_scoring"]
  },
  created_at: "ISO timestamp",
  updated_at: "ISO timestamp"
}
```

---

## 2️⃣ État de Transition

**Fichier :** `src/ui/App.jsx` (état `isTransitioning`)  
**Durée :** 600ms

### Contenu
- Logo HELŌ centré
- Message : "Préparation de votre espace..."
- Animation douce

### Design
- Fond avec gradient émotionnel
- Animation breathe sur le logo
- Transition fluide

---

## 3️⃣ Chat (Interface Principale)

**Fichier :** `src/ui/Chat.jsx`  
**Route :** Page principale (utilisateur connecté)

### Layout

```
┌─────────────────────────────────────────┐
│ Header: Logo + "Bonjour, [Prénom] 👋"  │
├─────────────┬───────────────────────────┤
│             │                           │
│   Avatar    │   Zone de Chat            │
│   (300px)   │   (500px / 60vh)          │
│             │   - Messages              │
│             │   - Indicateur frappe     │
│             │                           │
│             ├───────────────────────────┤
│             │   Input + Bouton Envoyer  │
│             ├───────────────────────────┤
│             │   Feedback (👍/👎)        │
│             ├───────────────────────────┤
│             │   Radar Émotionnel        │
└─────────────┴───────────────────────────┘
```

### Composants

#### Header
- Logo HELŌ (40px)
- Nom d'utilisateur avec emoji 👋
- Fond surface-2 avec ombre douce

#### Avatar (Gauche)
- Composant `AvatarRoom`
- Respiration synchronisée
- Réagit à la phase émotionnelle
- Visualisation vocale

#### Zone de Chat (Centre)
- **Hauteur :** 500px (max 60vh)
- **Scrollbar :** Personnalisée douce
- **Messages :**
  - Utilisateur : Droite, couleur primary-light
  - Assistant : Gauche, couleur surface-2
  - Animation fade-in (droite/gauche)
  - Max width 75% (85% mobile)
  - Coins arrondis (16px)
  - Ombre douce au hover

#### Indicateur de Frappe
- 3 points qui pulsent
- Animation douce (1.4s)
- Couleur accent-calm

#### Zone d'Input
- Fond surface-2 avec padding
- Input avec placeholder doux
- Texte d'aide : "Appuyez sur Entrée pour envoyer"
- Bouton "Envoyer" / "Envoi..."
- Focus visible doux

#### Boutons de Feedback
- 👍 "Ça m'aide"
- 👎 "Pas vraiment"
- Bordure douce
- Hover subtil avec translateY

#### Radar Émotionnel
- Graphique Chart.js
- 3 axes : Détresse, Espoir, Énergie
- Couleurs désaturées
- Animation 800ms
- Tooltip personnalisé
- Phase actuelle affichée

### Fonctionnalités

#### Envoi de Message
1. Utilisateur tape
2. Appuie sur Entrée ou clique "Envoyer"
3. Message apparaît à droite (fade-in-right)
4. Input se vide
5. Bouton devient "Envoi..." et disabled
6. Indicateur de frappe apparaît
7. Appel API `/analyze` pour scores
8. Appel API `/chat` pour réponse
9. Réponse apparaît à gauche (fade-in-left)
10. Radar se met à jour
11. Scroll automatique vers le bas

#### Feedback Utilisateur
- Click sur 👍 ou 👎
- Appel API `/feedback`
- Enregistrement pour amélioration

#### Mise à Jour Émotionnelle
- Scores analysés après chaque message
- Radar mis à jour avec animation
- Fond de page change subtilement :
  - Détresse > 70 → Gradient chaud
  - Espoir > 60 → Gradient vert
  - Sinon → Gradient neutre
- Transition très lente (1s)

---

## 🎨 Thème Émotionnel

L'application adapte subtilement son apparence selon l'état émotionnel détecté.

### États Émotionnels

#### Calm (Calme)
**Condition :** État par défaut

**Visuel :**
- Gradient : #F2F6F7 → #F9F5F0
- Overlay : Bleu-gris (#C5D9E3) à 3%
- Ambiance neutre et professionnelle

---

#### Distress (Détresse)
**Condition :** Score détresse > 70

**Visuel :**
- Gradient : #F5EFE6 → #E8EFF2 (plus chaud)
- Overlay : Beige (#E0CDB8) à 3%
- Ambiance chaleureuse et enveloppante

---

#### Hope (Espoir)
**Condition :** Score espoir > 60

**Visuel :**
- Gradient : #F2F6F7 → #E8F4E8 (touche verte)
- Overlay : Vert doux (#C8DCC8) à 3%
- Ambiance encourageante et positive

---

## 📱 Responsive

### Desktop (≥ 900px)
- Avatar à gauche (300px)
- Chat à droite (flex: 1)
- Layout grid 2 colonnes

### Tablet/Mobile (< 900px)
- Avatar au-dessus
- Chat en dessous
- Layout stack vertical
- Chat height 400px (max 50vh)
- Bulles max 85%
- Touch targets 44px minimum

---

## 🔄 Navigation

### Flow Utilisateur

```
Chargement
    ↓
Onboarding (6 étapes)
    ↓
Transition (600ms)
    ↓
Chat (interface principale)
    ↓
(Reste sur Chat)
```

### Pas de Routes Multiples
- Pas de React Router nécessaire
- Navigation par état (`user` null ou présent)
- Pas de bouton "retour" (intentionnel)

---

## 🎯 Objectifs par Page

### Onboarding
- ✅ Rassurer l'utilisateur
- ✅ Obtenir consentement éclairé
- ✅ Personnaliser l'expérience
- ✅ Créer un sentiment de sécurité
- ✅ Pas de pression, pas de jugement

### Chat
- ✅ Faciliter l'expression
- ✅ Accompagner avec empathie
- ✅ Visualiser l'état émotionnel
- ✅ Adapter l'ambiance
- ✅ Protéger le système nerveux

---

## 📊 Métriques de Succès

### Onboarding
- Taux de complétion > 80%
- Temps moyen : 2-3 minutes
- Aucun abandon sur consentement

### Chat
- Messages envoyés par session > 5
- Feedback positif > 60%
- Temps passé > 10 minutes
- Retour utilisateur > 50%

---

## 🚀 Améliorations Futures

### Pages Potentielles

#### Tableau de Bord
- Historique des conversations
- Évolution émotionnelle
- Statistiques personnelles

#### Paramètres
- Modifier prénom
- Changer rythme
- Gérer consentement
- Exporter données

#### Journal
- Notes personnelles
- Réflexions guidées
- Exercices thérapeutiques

#### Ressources
- Articles d'aide
- Exercices de respiration
- Contacts d'urgence

---

## ✅ État Actuel

**Pages Implémentées :** 2/2 (100%)
- ✅ Onboarding complet
- ✅ Chat fonctionnel

**Pages Futures :** 0/4 (0%)
- ⏳ Tableau de bord
- ⏳ Paramètres
- ⏳ Journal
- ⏳ Ressources

---

**L'application actuelle est une MVP (Minimum Viable Product) focalisée sur l'essentiel : accueillir et accompagner.**