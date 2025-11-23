# 🧩 Guide des Composants - HELŌ

## Vue d'ensemble

Ce document décrit tous les composants réutilisables de l'application HELŌ, leur utilisation et leurs principes de design thérapeutique.

---

## 📦 Composants de Base

### Button

**Emplacement :** `src/ui/components/Button.jsx`

**Description :** Bouton thérapeutique avec états doux et transitions apaisantes.

**Props :**
- `variant` : `'primary' | 'secondary' | 'ghost'` (défaut: `'primary'`)
- `size` : `'sm' | 'md' | 'lg'` (défaut: `'md'`)
- `disabled` : `boolean` (défaut: `false`)
- `onClick` : `function`
- `type` : `'button' | 'submit' | 'reset'` (défaut: `'button'`)
- `className` : `string` (classes additionnelles)

**Exemple :**
```jsx
<Button variant="primary" size="md" onClick={handleClick}>
  Continuer
</Button>

<Button variant="secondary" disabled={isLoading}>
  {isLoading ? 'Chargement...' : 'Annuler'}
</Button>
```

**Principes thérapeutiques :**
- ✅ Transitions douces (0.3s)
- ✅ Pas de couleurs vives
- ✅ État disabled empathique (opacité 0.5)
- ✅ Hover subtil (translateY -1px)

---

### Input

**Emplacement :** `src/ui/components/Input.jsx`

**Description :** Champ de saisie avec validation douce et messages d'aide.

**Props :**
- `label` : `string` (label du champ)
- `value` : `string`
- `onChange` : `function`
- `onKeyDown` : `function` (optionnel)
- `placeholder` : `string`
- `error` : `string` (message d'erreur)
- `helpText` : `string` (texte d'aide)
- `type` : `'text' | 'email' | 'password'` (défaut: `'text'`)
- `disabled` : `boolean`
- `required` : `boolean`
- `aria-label` : `string` (optionnel)

**Exemple :**
```jsx
<Input
  label="Prénom"
  value={firstName}
  onChange={e => setFirstName(e.target.value)}
  placeholder="Comment souhaitez-vous être appelé ?"
  helpText="Cela reste entre nous"
  error={error}
  required
/>
```

**Principes thérapeutiques :**
- ✅ Focus ring doux (pas de bleu vif)
- ✅ Erreurs non-agressives (couleur désaturée)
- ✅ Placeholder apaisant
- ✅ Accessibilité complète (ARIA)

---

### Message

**Emplacement :** `src/ui/components/Message.jsx`

**Description :** Bulle de message pour le chat avec indicateur de frappe.

**Props :**
- `role` : `'user' | 'assistant'`
- `children` : `ReactNode` (contenu du message)
- `isTyping` : `boolean` (défaut: `false`)

**Exemple :**
```jsx
<Message role="user">
  Voici mon message
</Message>

<Message role="assistant">
  Réponse de l'assistant
</Message>

<Message role="assistant" isTyping={true} />
```

**Principes thérapeutiques :**
- ✅ Coins très arrondis (16px)
- ✅ Couleurs désaturées
- ✅ Fade-in doux (0.6s)
- ✅ Indicateur de frappe apaisant (pulse lent)

---

### LoadingState

**Emplacement :** `src/ui/components/LoadingState.jsx`

**Description :** État de chargement apaisant avec message personnalisable.

**Props :**
- `message` : `string` (défaut: `"Un instant..."`)

**Exemple :**
```jsx
<LoadingState message="Préparation de votre espace..." />
```

**Principes thérapeutiques :**
- ✅ Spinner lent (1.2s par rotation)
- ✅ Message rassurant
- ✅ Couleurs thérapeutiques
- ✅ Accessibilité (role="status", aria-live)

---

### Logo

**Emplacement :** `src/ui/components/Logo.jsx`

**Description :** Logo HELŌ avec cercles concentriques symbolisant l'ancrage.

**Props :**
- `size` : `number` (défaut: `40`)
- `showText` : `boolean` (défaut: `true`)

**Exemple :**
```jsx
<Logo size={60} showText={true} />
<Logo size={32} showText={false} />
```

**Symbolisme :**
- Cercles concentriques : ondes d'apaisement
- Point central : ancrage stable
- Ligne verticale : connexion, présence
- Base elliptique : enracinement

---

### ProgressIndicator

**Emplacement :** `src/ui/components/ProgressIndicator.jsx`

**Description :** Indicateur de progression pour l'onboarding.

**Props :**
- `current` : `number` (étape actuelle, 0-indexed)
- `total` : `number` (nombre total d'étapes)

**Exemple :**
```jsx
<ProgressIndicator current={2} total={5} />
```

**Principes thérapeutiques :**
- ✅ Barre douce (pas de couleur vive)
- ✅ Transitions fluides (0.6s)
- ✅ Hauteur subtile (3px)

---

### FeedbackButtons

**Emplacement :** `src/ui/components/FeedbackButtons.jsx`

**Description :** Boutons de feedback pour évaluer les réponses.

**Props :**
- `onFeedback` : `function(outcome: 1 | -1)`
- `disabled` : `boolean` (défaut: `false`)

**Exemple :**
```jsx
<FeedbackButtons 
  onFeedback={(outcome) => sendFeedback(outcome)} 
  disabled={isSending}
/>
```

**Principes thérapeutiques :**
- ✅ Bordures douces
- ✅ Hover subtil
- ✅ Accessibilité (ARIA labels)

---

## 🖥️ Composants de Page

### App

**Emplacement :** `src/ui/App.jsx`

**Description :** Composant racine gérant la navigation entre onboarding et chat.

**États :**
- `user` : profil utilisateur
- `step` : étape d'onboarding
- `isTransitioning` : transition en cours

**Principes thérapeutiques :**
- ✅ Transitions douces (600ms)
- ✅ Skip links pour accessibilité
- ✅ Structure sémantique (main, role="status")

---

### Chat

**Emplacement :** `src/ui/Chat.jsx`

**Description :** Interface de conversation thérapeutique.

**Fonctionnalités :**
- Envoi de messages
- Analyse émotionnelle
- Feedback utilisateur
- Visualisation radar
- Intégration avatar

**Principes thérapeutiques :**
- ✅ Scroll automatique smooth
- ✅ Gestion d'erreurs empathique
- ✅ États de chargement explicites
- ✅ Accessibilité complète

---

### Onboarding

**Emplacement :** `src/ui/Onboarding.jsx`

**Description :** Parcours d'accueil en 6 étapes.

**Étapes :**
1. `intro` - Bienvenue
2. `consent` - Consentement
3. `first_name` - Prénom
4. `rhythm` - Choix du rythme
5. `radar_init` - Préparation
6. `done` - Finalisation

**Principes thérapeutiques :**
- ✅ Textes rassurants
- ✅ Validation douce
- ✅ Progression visible
- ✅ Pas de pression

---

### Radar

**Emplacement :** `src/ui/Radar.jsx`

**Description :** Visualisation émotionnelle en radar chart.

**Métriques :**
- Détresse (0-100)
- Espoir (0-100)
- Énergie (0-100)

**Principes thérapeutiques :**
- ✅ Couleurs désaturées
- ✅ Animation douce (800ms)
- ✅ Tooltips personnalisés
- ✅ Légende explicative

---

## 🎨 Classes CSS Utilitaires

### Layout
- `.container` - Conteneur principal (max-width: 900px)
- `.card` - Carte avec ombre douce

### Animations
- `.fade-in` - Apparition douce
- `.slide-in` - Glissement doux

### Chat
- `.chat-container` - Conteneur de messages
- `.chat-message` - Message individuel
- `.chat-bubble` - Bulle de message
- `.typing-indicator` - Indicateur de frappe

### Feedback
- `.feedback-buttons` - Groupe de boutons feedback
- `.feedback-btn` - Bouton de feedback

---

## 📱 Responsive Design

### Breakpoints
- Mobile : `< 768px`
- Desktop : `≥ 768px`

### Adaptations Mobile
- Touch targets minimum 44px
- Bulles de message max-width 85%
- Padding réduit
- Tailles de police ajustées

---

## ♿ Accessibilité

### ARIA Labels
Tous les composants interactifs ont des labels ARIA appropriés.

### Focus Visible
Focus ring doux (2px solid primary-light) avec offset de 2px.

### Keyboard Navigation
- Entrée pour envoyer messages
- Tab pour navigation
- Espace/Entrée pour boutons

### Screen Readers
- `role="status"` pour chargements
- `role="log"` pour chat
- `role="alert"` pour erreurs
- `aria-live="polite"` pour mises à jour

---

## 🚫 Anti-patterns à Éviter

**Ne jamais :**
- ⊘ Utiliser blanc pur (#FFFFFF)
- ⊘ Utiliser noir pur (#000000)
- ⊘ Créer des transitions < 0.3s
- ⊘ Utiliser des couleurs saturées
- ⊘ Créer des erreurs agressives
- ⊘ Utiliser ALL CAPS
- ⊘ Ignorer l'accessibilité

✅ **Toujours :**
- Utiliser les variables CSS
- Respecter les espacements
- Ajouter ARIA labels
- Tester avec clavier
- Valider avec prefers-reduced-motion

---

## 📚 Ressources

- [IDENTITY.md](./IDENTITY.md) - Identité de l'application
- [ACCESSIBILITY.md](./ACCESSIBILITY.md) - Guide d'accessibilité
- [therapeutic-design.css](./src/styles/therapeutic-design.css) - Variables CSS
- [components.css](./src/styles/components.css) - Styles de composants