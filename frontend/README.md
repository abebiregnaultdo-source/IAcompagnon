# 🎯 HELŌ - Frontend

Interface thérapeutique pour l'accompagnement émotionnel.

---

## 🚀 Démarrage Rapide

```bash
# Installation
npm install

# Développement
npm run dev

# Build production
npm run build

# Preview production
npm run preview
```

L'application sera disponible sur `http://localhost:5173`

---

## 📁 Structure

```
frontend/
├── src/
│   ├── main.jsx                 # Point d'entrée
│   ├── styles/
│   │   ├── therapeutic-design.css  # Variables CSS thérapeutiques
│   │   └── components.css          # Styles de composants
│   └── ui/
│       ├── App.jsx              # Composant racine
│       ├── Chat.jsx             # Interface de conversation
│       ├── Onboarding.jsx       # Parcours d'accueil
│       ├── Radar.jsx            # Visualisation émotionnelle
│       ├── avatar/              # Système d'avatar
│       └── components/          # Composants réutilisables
│           ├── Button.jsx
│           ├── Input.jsx
│           ├── Message.jsx
│           ├── LoadingState.jsx
│           ├── Logo.jsx
│           ├── ProgressIndicator.jsx
│           └── FeedbackButtons.jsx
├── index.html
├── package.json
├── vite.config.js
├── IDENTITY.md              # Identité de l'application
├── DESIGN_SYSTEM.md         # Système de design
├── COMPONENTS.md            # Guide des composants
└── ACCESSIBILITY.md         # Guide d'accessibilité
```

---

## 🎨 Système de Design

HELŌ utilise un **système de design thérapeutique** conçu pour protéger le système nerveux.

### Principes Fondamentaux

- ✅ **Pas de blanc/noir pur** - Couleurs douces uniquement
- ✅ **Transitions lentes** - Minimum 0.3s
- ✅ **Couleurs désaturées** - Saturation < 30%
- ✅ **Espacements généreux** - Respiration visuelle
- ✅ **Typographie douce** - Inter + Nunito
- ✅ **Accessibilité complète** - WCAG 2.1 AA minimum

Voir [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) pour plus de détails.

---

## 🧩 Composants

### Composants de Base

- **Button** - Bouton thérapeutique avec états doux
- **Input** - Champ de saisie avec validation empathique
- **Message** - Bulle de chat avec indicateur de frappe
- **LoadingState** - État de chargement apaisant
- **Logo** - Logo HELŌ avec symbolisme d'ancrage
- **ProgressIndicator** - Barre de progression douce
- **FeedbackButtons** - Boutons de feedback accessibles

### Composants de Page

- **App** - Gestion navigation onboarding/chat
- **Chat** - Interface de conversation complète
- **Onboarding** - Parcours d'accueil en 6 étapes
- **Radar** - Visualisation émotionnelle

Voir [COMPONENTS.md](./COMPONENTS.md) pour la documentation complète.

---

## ♿ Accessibilité

L'accessibilité est un **principe thérapeutique fondamental**.

### Standards Respectés

- WCAG 2.1 Level AA ✅
- ARIA 1.2 ✅
- Section 508 ✅

### Fonctionnalités

- Navigation complète au clavier
- Support lecteurs d'écran (ARIA labels)
- Respect de `prefers-reduced-motion`
- Touch targets 44x44px minimum
- Contraste minimum 4.5:1
- Skip links
- Focus visible doux

Voir [ACCESSIBILITY.md](./ACCESSIBILITY.md) pour plus de détails.

---

## 🎭 Identité

**Nom :** HELŌ

**Symbolisme :**
- Stabilité dans la tempête émotionnelle
- Refuge sûr
- Ancrage au moment présent

**Couleur Primaire :** #7BA8C0 (bleu-gris apaisant)

**Ton de Voix :** Chaleureux, présent, non-intrusif

Voir [IDENTITY.md](./IDENTITY.md) pour l'identité complète.

---

## 🔧 Technologies

- **React 18.3** - UI library
- **Vite 5.4** - Build tool
- **Chart.js 4.4** - Visualisations
- **CSS Variables** - Theming
- **Google Fonts** - Inter + Nunito

---

## 📱 Responsive

L'interface est entièrement responsive :

- **Mobile** : < 768px
- **Desktop** : ≥ 768px

Adaptations :
- Touch targets 44x44px
- Tailles de police ajustées
- Layout adaptatif (grid → stack)
- Avatar optimisé

---

## 🎯 Parcours Utilisateur

### 1. Onboarding (6 étapes)

1. **Intro** - Bienvenue dans l'espace
2. **Consent** - Consentement éclairé
3. **First Name** - Personnalisation
4. **Rhythm** - Choix du rythme d'accompagnement
5. **Radar Init** - Préparation
6. **Done** - Finalisation

### 2. Chat Thérapeutique

- Messages avec bulles douces
- Indicateur de frappe apaisant
- Feedback utilisateur (👍/👎)
- Visualisation radar en temps réel
- Avatar réactif

---

## 🚫 Anti-patterns

### À Éviter Absolument

```jsx
// ❌ Blanc pur
<div style={{ background: '#FFFFFF' }}>

// ❌ Noir pur
<div style={{ color: '#000000' }}>

// ❌ Transition rapide
<div style={{ transition: 'all 0.1s' }}>

// ❌ ALL CAPS
<h1 style={{ textTransform: 'uppercase' }}>TITRE</h1>

// ❌ Rouge vif pour erreur
<div style={{ color: '#FF0000' }}>Erreur</div>
```

### Bonnes Pratiques

```jsx
// ✅ Couleurs thérapeutiques
<div style={{ background: 'var(--color-surface-1)' }}>

// ✅ Texte doux
<div style={{ color: 'var(--color-text-primary)' }}>

// ✅ Transition lente
<div style={{ transition: 'all var(--transition-fast)' }}>

// ✅ Casse normale
<h1>Titre</h1>

// ✅ Erreur douce
<div className="input-error-message">Message empathique</div>
```

---

## 🧪 Tests

### Tests Manuels

```bash
# Accessibilité
- Navigation au clavier
- Lecteur d'écran (NVDA/JAWS/VoiceOver)
- Zoom 200%
- prefers-reduced-motion

# Responsive
- Mobile (< 768px)
- Tablette (768-1024px)
- Desktop (> 1024px)

# Navigateurs
- Chrome/Edge
- Firefox
- Safari
```

---

## 📚 Documentation

- [IDENTITY.md](./IDENTITY.md) - Identité complète
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Système de design
- [COMPONENTS.md](./COMPONENTS.md) - Guide des composants
- [ACCESSIBILITY.md](./ACCESSIBILITY.md) - Guide d'accessibilité
- [avatar/README.md](./src/ui/avatar/README.md) - Documentation avatar

---

## 🤝 Contribution

### Avant de Contribuer

1. Lire [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
2. Lire [ACCESSIBILITY.md](./ACCESSIBILITY.md)
3. Respecter les interdictions absolues
4. Tester l'accessibilité

### Checklist

- [ ] Pas de blanc/noir pur
- [ ] Couleurs désaturées
- [ ] Transitions > 0.3s
- [ ] Variables CSS utilisées
- [ ] Contraste vérifié
- [ ] Navigation clavier testée
- [ ] ARIA labels ajoutés
- [ ] Responsive testé
- [ ] prefers-reduced-motion respecté

---

## 📝 License

Propriétaire - Usage thérapeutique uniquement

---

## 💡 Philosophie

> "Le design n'est pas décoratif, il est thérapeutique."

Chaque pixel, chaque transition, chaque couleur est choisie pour créer un sentiment de sécurité et accompagner avec douceur.

**L'interface ne doit jamais être une source de stress supplémentaire.**

---

## 📞 Support

Pour toute question sur le design ou l'accessibilité, consulter la documentation ou ouvrir une issue.

---

**HELŌ - Votre compagnon thérapeutique** 🎯