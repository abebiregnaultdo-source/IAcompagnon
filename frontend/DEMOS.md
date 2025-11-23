# 🎭 Démonstrations HELŌ

Guide d'accès aux différentes démonstrations de l'application.

---

## 🚀 Démarrage

```bash
cd frontend
npm install
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

---

## 📋 Démonstrations Disponibles

### 🚨 Protocole de Crise

**URL** : `http://localhost:5173/?demo=crisis`

**Description** : Visualisation complète du protocole d'urgence qui s'active automatiquement quand un utilisateur est en détresse sévère (score ≥ 75/100).

**Fonctionnalités** :
- ✅ Boutons d'appel d'urgence (3114, SAMU, contacts personnels)
- ✅ Techniques de stabilisation (respiration, 5-4-3-2-1, ancrage)
- ✅ Interface thérapeutique douce
- ✅ Responsive mobile/desktop
- ✅ Journal des appels simulés

**Documentation** : Voir [CRISIS_PROTOCOL.md](./CRISIS_PROTOCOL.md)

---

### 🏠 Application Complète

**URL** : `http://localhost:5173/`

**Description** : Parcours complet de l'application HELŌ.

**Parcours** :
1. Landing page
2. Authentification
3. Onboarding (6 étapes)
4. Chat thérapeutique avec avatar

---

## 🎯 Accès Rapide

| Démo | URL | Description |
|------|-----|-------------|
| **Crise** | `?demo=crisis` | Protocole d'urgence |
| **App** | `/` | Application complète |

---

## 📱 Tests Recommandés

### Protocole de Crise

1. **Desktop** (≥ 768px)
   - [ ] Grid 2 colonnes pour boutons d'urgence
   - [ ] Tabs horizontaux pour exercices
   - [ ] Modal centré avec scroll interne

2. **Mobile** (< 768px)
   - [ ] Boutons en colonne unique
   - [ ] Tabs verticaux
   - [ ] Plein écran

3. **Accessibilité**
   - [ ] Navigation au clavier (Tab, Enter, Esc)
   - [ ] Lecteur d'écran (NVDA/JAWS)
   - [ ] `prefers-reduced-motion` respecté

4. **Interactions**
   - [ ] Clic sur bouton 3114 → ouvre dialer
   - [ ] Clic sur bouton SAMU → ouvre dialer
   - [ ] Changement d'exercice → animation douce
   - [ ] Respiration → animation cyclique
   - [ ] Fermeture → confirmation

---

## 🔧 Développement

### Ajouter une nouvelle démo

1. Créer le composant dans `src/ui/`
2. Ajouter la route dans `App.jsx` :

```jsx
const demoMode = urlParams.get('demo')

if (demoMode === 'nouvelle-demo') {
  return <NouvelleDemoComponent />
}
```

3. Documenter dans ce fichier

---

## 📚 Documentation Complète

- [README.md](./README.md) - Vue d'ensemble frontend
- [CRISIS_PROTOCOL.md](./CRISIS_PROTOCOL.md) - Protocole de crise
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Système de design
- [COMPONENTS.md](./COMPONENTS.md) - Guide des composants
- [ACCESSIBILITY.md](./ACCESSIBILITY.md) - Accessibilité

---

**HELŌ - Votre compagnon thérapeutique** 🎯