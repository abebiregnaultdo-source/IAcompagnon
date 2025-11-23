# Design des Listes Négatives - Symbole ⊘

## 🎯 Problème Identifié

**Avant :**
```html
<ul>
  <li>❌ Le modèle des "5 étapes"</li>
  <li>❌ L'injonction au "travail de deuil"</li>
</ul>
```

**Problèmes :**
- ❌ Symbole trop agressif (rouge vif, connotation négative forte)
- ❌ Bullet points `<li>` + symbole ❌ = double marqueur visuel (moche)
- ❌ Manque d'élégance et de respiration

---

## ✅ Solution Implémentée

### Symbole Choisi : **⊘** (Cercle Barré)

**Unicode :** U+2298  
**Nom :** Circled Division Slash  
**Avantages :**
- ✅ Clair visuellement (signifie "interdit" ou "évité")
- ✅ Non-agressif (pas de couleur rouge, forme géométrique douce)
- ✅ Conforme à la charte thérapeutique (neutre, élégant)

---

## 🎨 Design Final

### Structure HTML

```jsx
<div className="negative-list">
  <div className="negative-item">
    <div className="negative-item-icon">⊘</div>
    <div className="negative-item-content">
      <div className="negative-item-title">Le modèle des "5 étapes"</div>
      <div className="negative-item-description">(dépassé, culpabilisant, non-linéaire dans la réalité)</div>
    </div>
  </div>
  
  <div className="negative-item">
    <div className="negative-item-icon">⊘</div>
    <div className="negative-item-content">
      <div className="negative-item-title">L'injonction au "travail de deuil"</div>
      <div className="negative-item-description">(pas une tâche à "accomplir")</div>
    </div>
  </div>
</div>
```

### CSS

```css
.negative-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  margin: var(--space-lg) 0;
  padding: 0;
  list-style: none;
}

.negative-item {
  display: flex;
  gap: var(--space-md);
  align-items: flex-start;
}

.negative-item-icon {
  font-size: var(--font-size-xl);
  color: var(--color-text-tertiary);
  opacity: 0.7;
  flex-shrink: 0;
  line-height: 1.2;
  margin-top: 2px;
}

.negative-item-content {
  flex: 1;
}

.negative-item-title {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
  line-height: var(--line-height-normal);
  font-size: var(--font-size-base);
}

.negative-item-description {
  font-style: italic;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
}
```

---

## 📍 Emplacements Modifiés

### 1. Page "Approches thérapeutiques"
**Section :** "Ce que nous évitons"  
**Fichier :** `frontend/src/ui/Resources.jsx` (lignes 328-361)

**Items :**
- ⊘ Le modèle des "5 étapes"
- ⊘ L'injonction au "travail de deuil"
- ⊘ L'optimisme toxique
- ⊘ La médicalisation excessive

### 2. Page "Comment ça marche"
**Section :** "Ce que Helō n'est pas"  
**Fichier :** `frontend/src/ui/Resources.jsx` (lignes 171-204)

**Items :**
- ⊘ Un remplacement à un thérapeute humain
- ⊘ Une solution miracle qui "guérit" le deuil
- ⊘ Un réseau social où partager publiquement
- ⊘ Un outil de productivité avec objectifs et streaks

### 3. Page "Confidentialité et sécurité"
**Section :** "Ce que nous ne faisons JAMAIS"  
**Fichier :** `frontend/src/ui/Resources.jsx` (lignes 824-853)

**Items :**
- ⊘ Vendre vos données à des tiers
- ⊘ Partager vos écrits sans votre accord explicite
- ⊘ Utiliser vos données pour de la publicité ciblée
- ⊘ Transmettre à des assurances, employeurs, etc.

---

## 🎯 Autres Symboles Utilisés

| Symbole | Usage | Contexte |
|---------|-------|----------|
| **⊘** | Listes négatives | "Ce que nous évitons", "Ce que nous ne faisons JAMAIS" |
| **○** | Erreurs de formulaire | Messages d'erreur dans Auth.jsx (doux, neutre) |
| **×** | Boutons de fermeture | CrisisProtocol.jsx (standard UI) |
| **⚠️** | Alertes d'urgence | EmergencyBanner, protocoles de crise |
| **✅** | Listes positives | "Vos droits (RGPD)", "Ce que vous pouvez faire" |

---

## ✅ Conformité Charte

- [x] Pas de symbole agressif (❌ remplacé)
- [x] Design épuré sans bullet points
- [x] Espacement généreux (gap: var(--space-lg))
- [x] Couleurs désaturées (opacity: 0.7 sur l'icône)
- [x] Hiérarchie claire (titre + description)
- [x] Responsive (flexbox)

