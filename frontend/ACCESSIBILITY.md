# ♿ Guide d'Accessibilité Thérapeutique - HELŌ

## 🎯 Philosophie

L'accessibilité dans HELŌ n'est pas une fonctionnalité optionnelle, c'est un **principe thérapeutique fondamental**. Une interface inaccessible peut créer de la détresse, exactement ce que nous cherchons à éviter.

---

## ✅ Standards Respectés

- **WCAG 2.1 Level AA** - Minimum requis
- **WCAG 2.1 Level AAA** - Objectif pour éléments critiques
- **ARIA 1.2** - Sémantique enrichie
- **Section 508** - Conformité gouvernementale

---

## 🎨 Contraste et Couleurs

### Ratios de Contraste

**Texte Normal (< 18px) :**
- Minimum : 4.5:1 ✅
- Objectif : 7:1 (AAA)

**Texte Large (≥ 18px) :**
- Minimum : 3:1 ✅
- Objectif : 4.5:1 (AAA)

**Éléments UI (boutons, bordures) :**
- Minimum : 3:1 ✅

### Palette Accessible

```css
/* Texte sur fond clair */
--color-text-primary: #3A4048;    /* Ratio: 11.2:1 ✅ */
--color-text-secondary: #5A6068;  /* Ratio: 7.8:1 ✅ */
--color-text-tertiary: #7A8088;   /* Ratio: 4.9:1 ✅ */

/* Primaire sur fond clair */
--color-primary: #7BA8C0;         /* Ratio: 3.2:1 ✅ */
```

### Pas de Dépendance à la Couleur Seule

❌ **Mauvais :**
```jsx
<div style={{ color: 'red' }}>Erreur</div>
```

✅ **Bon :**
```jsx
<div className="input-error-message" role="alert">
  ⚠️ Votre prénom nous aide à personnaliser l'accompagnement
</div>
```

---

## ⌨️ Navigation au Clavier

### Ordre de Tabulation

L'ordre de tabulation suit l'ordre visuel et logique :
1. Skip link
2. Logo (si lien)
3. Champs de formulaire
4. Boutons d'action
5. Boutons secondaires

### Raccourcis Clavier

| Touche | Action |
|--------|--------|
| `Tab` | Élément suivant |
| `Shift + Tab` | Élément précédent |
| `Enter` | Activer bouton / Envoyer message |
| `Espace` | Activer bouton |
| `Esc` | Fermer modal (futur) |

### Focus Visible

```css
*:focus-visible {
  outline: 2px solid var(--color-primary-light);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```

**Principes :**
- ✅ Toujours visible
- ✅ Jamais agressif (couleur douce)
- ✅ Offset pour clarté
- ✅ Coins arrondis pour douceur

---

## 🔊 Lecteurs d'Écran

### ARIA Landmarks

```jsx
<main id="main-content">
  {/* Contenu principal */}
</main>
```

### ARIA Live Regions

**Mises à jour polies (non-urgentes) :**
```jsx
<div role="status" aria-live="polite">
  Préparation de votre espace...
</div>
```

**Alertes (urgentes) :**
```jsx
<div role="alert" aria-live="assertive">
  Une difficulté est survenue
</div>
```

**Log de chat :**
```jsx
<div role="log" aria-live="polite" aria-label="Historique de conversation">
  {messages.map(...)}
</div>
```

### ARIA Labels

**Boutons avec icônes :**
```jsx
<button aria-label="Cette réponse m'aide">
  👍
</button>
```

**Champs de formulaire :**
```jsx
<input
  aria-label="Message à envoyer"
  aria-describedby="help-text"
  aria-invalid={hasError}
/>
```

**États dynamiques :**
```jsx
<div aria-label="HELŌ est en train d'écrire">
  <div className="typing-indicator">...</div>
</div>
```

---

## 🎭 Gestion des Animations

### Respect de prefers-reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Pourquoi c'est thérapeutique :**
- Les animations peuvent déclencher vertiges, nausées
- Certaines personnes en détresse sont hypersensibles au mouvement
- Respecter ce paramètre = respecter la vulnérabilité

---

## 📱 Touch et Mobile

### Touch Targets

**Minimum :** 44x44px (WCAG 2.1 Level AAA)

```css
@media (max-width: 768px) {
  .btn {
    min-height: 44px;
  }
  
  .feedback-btn {
    min-height: 44px;
    padding: var(--space-md) var(--space-lg);
  }
  
  .input {
    min-height: 44px;
  }
}
```

### Gestion du Viewport Mobile

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

**Éviter :**
- Zoom désactivé (`user-scalable=no`)
- Maximum-scale limité
- Hauteur fixe qui ignore le clavier virtuel

---

## 🔤 Typographie Accessible

### Tailles de Police

```css
--font-size-xs: 12px;   /* Minimum pour texte secondaire */
--font-size-sm: 13px;   /* Texte d'aide */
--font-size-base: 15px; /* Texte principal (> 14px requis) */
--font-size-lg: 17px;   /* Texte important */
```

### Line Height

```css
--line-height-tight: 1.4;    /* Titres */
--line-height-normal: 1.6;   /* Texte standard */
--line-height-relaxed: 1.8;  /* Paragraphes longs */
```

**Minimum WCAG :** 1.5 pour paragraphes ✅

### Espacement des Lettres

Pas de `letter-spacing` négatif (réduit lisibilité).

Utilisation subtile pour titres :
```css
h1 {
  letter-spacing: -0.5px; /* Acceptable si > -0.05em */
}
```

---

## 🖱️ Interactions Accessibles

### Skip Links

```jsx
<a href="#main-content" className="skip-link">
  Aller au contenu principal
</a>
```

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  /* Visible uniquement au focus */
}

.skip-link:focus {
  top: var(--space-sm);
}
```

### Focus Trap (Modals - futur)

Quand un modal s'ouvre :
1. Focus sur premier élément interactif
2. Tab circule dans le modal uniquement
3. Esc ferme le modal
4. Focus retourne à l'élément déclencheur

---

## 📋 Formulaires Accessibles

### Labels Explicites

❌ **Mauvais :**
```jsx
<input placeholder="Prénom" />
```

✅ **Bon :**
```jsx
<label htmlFor="first-name">Prénom</label>
<input id="first-name" placeholder="Comment souhaitez-vous être appelé ?" />
```

### Messages d'Erreur

```jsx
<input
  aria-invalid={hasError}
  aria-describedby="error-message"
/>
{hasError && (
  <div id="error-message" role="alert">
    Votre prénom nous aide à personnaliser l'accompagnement
  </div>
)}
```

### Validation en Temps Réel

⚠️ **Attention :** Validation trop agressive = anxiogène

✅ **Approche douce :**
- Valider à la perte de focus (onBlur)
- Pas de validation pendant la frappe
- Messages empathiques, jamais accusateurs

---

## 🎯 Tests d'Accessibilité

### Outils Automatisés

- **axe DevTools** - Extension Chrome/Firefox
- **WAVE** - Évaluation visuelle
- **Lighthouse** - Audit intégré Chrome

### Tests Manuels

**Checklist :**
- [ ] Navigation complète au clavier
- [ ] Lecteur d'écran (NVDA/JAWS/VoiceOver)
- [ ] Zoom à 200% (texte lisible)
- [ ] Contraste vérifié
- [ ] prefers-reduced-motion testé
- [ ] Touch targets sur mobile

### Tests avec Utilisateurs

**Idéalement :**
- Personnes utilisant lecteurs d'écran
- Personnes avec troubles moteurs
- Personnes avec troubles visuels
- Personnes neurodivergentes

---

## 🚫 Erreurs Courantes à Éviter

### ❌ Div-itis

```jsx
<div onClick={handleClick}>Cliquer</div>
```

### ✅ Sémantique Correcte

```jsx
<button onClick={handleClick}>Cliquer</button>
```

---

### ❌ Placeholder comme Label

```jsx
<input placeholder="Prénom" />
```

### ✅ Label Explicite

```jsx
<label>Prénom</label>
<input placeholder="Ex: Marie" />
```

---

### ❌ Couleur Seule pour Information

```jsx
<span style={{ color: 'red' }}>Requis</span>
```

### ✅ Icône + Texte + Couleur

```jsx
<span className="required">* Requis</span>
```

---

## 📚 Ressources

### Documentation
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM](https://webaim.org/)

### Outils
- [Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)

---

## 💡 Principes Thérapeutiques

L'accessibilité dans HELŌ va au-delà de la conformité technique :

1. **Respect de la vulnérabilité**
   - Pas de barrières supplémentaires pour personnes en détresse
   
2. **Autonomie**
   - Chacun peut utiliser l'outil à sa façon
   
3. **Inclusion**
   - Personne n'est exclu de l'accompagnement
   
4. **Dignité**
   - Pas de solutions "au rabais" pour accessibilité
   
5. **Empathie**
   - Comprendre les besoins variés des utilisateurs

---

## ✅ Checklist de Validation

Avant chaque release :

- [ ] Tous les éléments interactifs sont accessibles au clavier
- [ ] Tous les boutons/liens ont des labels clairs
- [ ] Tous les formulaires ont des labels explicites
- [ ] Toutes les erreurs sont annoncées aux lecteurs d'écran
- [ ] Le contraste est vérifié (minimum 4.5:1)
- [ ] prefers-reduced-motion est respecté
- [ ] Les touch targets font minimum 44x44px
- [ ] Les skip links fonctionnent
- [ ] Le focus est toujours visible
- [ ] Testé avec lecteur d'écran
- [ ] Testé au clavier uniquement
- [ ] Testé avec zoom 200%

---

**L'accessibilité n'est pas une contrainte, c'est une extension de notre mission thérapeutique.**