# 🎨 Système de Design Thérapeutique - HELŌ

## 🎯 Philosophie

Le système de design de HELŌ est construit autour d'un principe fondamental : **protéger le système nerveux**. Chaque décision visuelle, chaque transition, chaque couleur est choisie pour créer un sentiment de sécurité et de calme.

---

## 🚫 Interdictions Absolues

Ces règles ne sont **jamais** négociables :

- ❌ **Blanc pur** (#FFFFFF, rgb(255,255,255))
- ❌ **Noir pur** (#000000, rgb(0,0,0))
- ❌ **Couleurs saturées** (saturation > 30%)
- ❌ **Contrastes vifs** entre surfaces (ratio > 2:1)
- ❌ **Transitions rapides** (< 0.3s)
- ❌ **Animations brusques**
- ❌ **Texte ALL CAPS** (agressif)
- ❌ **Rouge vif** pour erreurs
- ❌ **Spinners rapides**
- ❌ **Sons forts/brusques**

---

## 🎨 Palette de Couleurs

### Couleurs de Base

```css
/* Fonds - Jamais blanc pur */
--color-bg-calm: #E8EFF2;      /* Bleu-gris très pâle */
--color-bg-warm: #F5EFE6;      /* Beige chaud */
--color-bg-pro: #EDEEF1;       /* Gris neutre professionnel */
--color-bg-light: #F2F6F7;     /* Fond principal */
--color-bg-lighter: #F9F5F0;   /* Fond alternatif */

/* Blanc cassé (zones non-thérapeutiques uniquement) */
--color-white-soft: #FAFBFC;
```

### Texte - Jamais Noir Pur

```css
--color-text-primary: #3A4048;    /* Gris très foncé chaud */
--color-text-secondary: #5A6068;  /* Gris moyen */
--color-text-tertiary: #7A8088;   /* Gris clair */
--color-text-light: #9AA0A8;      /* Gris très clair */
```

### Surfaces

```css
--color-surface-1: #F2F6F7;  /* Surface principale */
--color-surface-2: #F9F5F0;  /* Surface alternative */
--color-surface-3: #F4F5F7;  /* Surface tertiaire */
```

### Accents Thérapeutiques

```css
--color-accent-calm: #C5D9E3;    /* Bleu apaisant */
--color-accent-warm: #E0CDB8;    /* Beige chaleureux */
--color-accent-pro: #CDD4DD;     /* Gris-bleu professionnel */
--color-accent-success: #C8DCC8; /* Vert doux */
--color-accent-info: #D4E8F0;    /* Bleu info */
```

### Couleur Primaire

```css
--color-primary: #7BA8C0;        /* Bleu-gris principal */
--color-primary-light: #A5C5D8;  /* Variante claire */
--color-primary-dark: #5A8AA5;   /* Variante foncée */
```

**Pourquoi #7BA8C0 ?**
- Calme et sérénité (bleu)
- Profondeur sans lourdeur (gris)
- Professionnel sans être froid
- Saturation faible (< 30%)

---

## 🌈 Utilisation des Couleurs

### Hiérarchie Visuelle

```
Texte principal     → --color-text-primary
Texte secondaire    → --color-text-secondary
Texte d'aide        → --color-text-tertiary
Texte désactivé     → --color-text-light

Fond principal      → --color-bg-light
Cartes/surfaces     → --color-surface-1 ou surface-2
Zones d'accent      → --color-accent-calm ou accent-warm
```

### Erreurs et Alertes

❌ **Jamais de rouge vif** (#FF0000, #DC3545)

✅ **Rouge désaturé et doux :**
```css
/* Pour bordures d'erreur */
border-color: #D8A8A8;

/* Pour texte d'erreur */
color: #B88888;
```

### États Interactifs

```css
/* Hover - Subtil */
.btn:hover {
  transform: translateY(-1px);  /* Léger soulèvement */
  box-shadow: var(--shadow-md); /* Ombre plus prononcée */
}

/* Focus - Visible mais doux */
*:focus-visible {
  outline: 2px solid var(--color-primary-light);
  outline-offset: 2px;
}

/* Disabled - Empathique */
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

## 📏 Espacements

### Système d'Espacement

```css
--space-xs: 4px;    /* Micro-espacement */
--space-sm: 8px;    /* Petit espacement */
--space-md: 16px;   /* Espacement standard */
--space-lg: 24px;   /* Grand espacement */
--space-xl: 32px;   /* Très grand espacement */
--space-2xl: 48px;  /* Espacement majeur */
--space-3xl: 64px;  /* Espacement maximum */
```

### Principes

- **Respiration visuelle** - Jamais d'éléments collés
- **Hiérarchie claire** - Espacements cohérents
- **Confort de lecture** - Line-height généreux

---

## 🔤 Typographie

### Familles de Police

```css
--font-family-base: 'Inter', system-ui, -apple-system, sans-serif;
--font-family-display: 'Nunito', 'Inter', sans-serif;
```

**Pourquoi Inter + Nunito ?**
- **Inter** : Lisible, moderne, neutre
- **Nunito** : Douce, arrondie, chaleureuse
- Pas de polices "techniques" (Roboto, Arial)
- Pas de polices "fantaisie"

### Échelle Typographique

```css
--font-size-xs: 12px;
--font-size-sm: 13px;
--font-size-base: 15px;   /* Taille de base */
--font-size-lg: 17px;
--font-size-xl: 20px;
--font-size-2xl: 24px;
--font-size-3xl: 30px;
```

### Line Heights

```css
--line-height-tight: 1.4;    /* Titres */
--line-height-normal: 1.6;   /* Texte standard */
--line-height-relaxed: 1.8;  /* Paragraphes longs */
```

**Minimum WCAG :** 1.5 pour paragraphes ✅

### Poids de Police

```css
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

**Éviter :**
- Poids < 300 (illisible)
- Poids > 700 (agressif)

---

## 🎭 Ombres

### Ombres Douces

```css
--shadow-xs: 0 2px 8px rgba(100, 100, 110, 0.03);
--shadow-sm: 0 4px 12px rgba(100, 100, 110, 0.04);
--shadow-md: 0 6px 20px rgba(100, 100, 110, 0.06);
--shadow-lg: 0 8px 28px rgba(100, 100, 110, 0.08);
```

**Principes :**
- ✅ Opacité très faible (< 0.1)
- ✅ Couleur neutre (gris, pas noir)
- ✅ Blur généreux
- ❌ Jamais `rgba(0,0,0,...)` (trop dur)

---

## 🔄 Transitions et Animations

### Durées

```css
--transition-fast: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
--transition-medium: 0.6s cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 1s cubic-bezier(0.4, 0, 0.2, 1);
```

**Règle d'or :** Jamais < 0.3s

### Easing

```css
/* Easing doux - pas linear */
cubic-bezier(0.4, 0, 0.2, 1)  /* ease-out personnalisé */
```

### Animations Prédéfinies

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-16px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
```

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

---

## 📐 Rayons de Bordure

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
--radius-full: 9999px;
```

**Principes :**
- ✅ Toujours arrondis (jamais 0)
- ✅ Minimum 8px
- ✅ Cohérence (utiliser les variables)

---

## 🎯 Composants de Base

### Boutons

```css
.btn {
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
}

.btn-primary {
  background: var(--color-primary);
  color: var(--color-white-soft);
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}
```

### Inputs

```css
.input {
  padding: var(--space-md);
  border: 1.5px solid var(--color-accent-calm);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(123, 168, 192, 0.1);
}
```

### Cards

```css
.card {
  background: var(--color-surface-1);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  box-shadow: var(--shadow-md);
}
```

---

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile first */
@media (max-width: 768px) {
  /* Adaptations mobile */
}
```

### Adaptations

```css
@media (max-width: 768px) {
  .container {
    padding: var(--space-md);
  }
  
  h1 {
    font-size: var(--font-size-2xl);
  }
  
  /* Touch targets minimum 44px */
  .btn {
    min-height: 44px;
  }
}
```

---

## ♿ Accessibilité

### Contraste

- Texte normal : minimum 4.5:1 ✅
- Texte large : minimum 3:1 ✅
- Éléments UI : minimum 3:1 ✅

### Focus Visible

```css
*:focus-visible {
  outline: 2px solid var(--color-primary-light);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```

---

## 📋 Checklist de Design

Avant d'ajouter un nouveau composant :

- [ ] Pas de blanc/noir pur
- [ ] Couleurs désaturées (< 30%)
- [ ] Transitions > 0.3s
- [ ] Espacements avec variables
- [ ] Rayons arrondis (min 8px)
- [ ] Ombres douces (opacité < 0.1)
- [ ] Typographie cohérente
- [ ] Contraste vérifié
- [ ] Focus visible
- [ ] Responsive testé
- [ ] prefers-reduced-motion respecté

---

## 🎨 Exemples d'Utilisation

### Bon Exemple

```jsx
<div className="card">
  <h2 style={{ 
    color: 'var(--color-text-primary)',
    marginBottom: 'var(--space-md)'
  }}>
    Titre
  </h2>
  <p style={{ 
    color: 'var(--color-text-secondary)',
    lineHeight: 'var(--line-height-relaxed)'
  }}>
    Contenu
  </p>
  <Button variant="primary">
    Action
  </Button>
</div>
```

### Mauvais Exemple

```jsx
<div style={{ 
  background: '#FFFFFF',        /* ❌ Blanc pur */
  color: '#000000',             /* ❌ Noir pur */
  borderRadius: '0',            /* ❌ Pas arrondi */
  transition: 'all 0.1s'        /* ❌ Trop rapide */
}}>
  <h2 style={{ textTransform: 'uppercase' }}>  {/* ❌ ALL CAPS */}
    TITRE
  </h2>
  <button style={{ 
    background: '#FF0000',      /* ❌ Rouge vif */
    boxShadow: '0 0 10px rgba(0,0,0,0.5)'  /* ❌ Ombre dure */
  }}>
    CLIQUER
  </button>
</div>
```

---

## 📚 Ressources

- [therapeutic-design.css](./src/styles/therapeutic-design.css) - Variables CSS
- [components.css](./src/styles/components.css) - Styles de composants
- [COMPONENTS.md](./COMPONENTS.md) - Guide des composants
- [ACCESSIBILITY.md](./ACCESSIBILITY.md) - Guide d'accessibilité

---

**Le design n'est pas décoratif, il est thérapeutique.**