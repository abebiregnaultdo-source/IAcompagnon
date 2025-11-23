# 👁️ Visualisation du Protocole de Crise

## 🎯 Aperçu Statique (Sans serveur)

Pour visualiser immédiatement le protocole de crise sans lancer le serveur :

### Option 1 : Ouvrir directement dans le navigateur

1. Ouvrez le fichier dans votre navigateur :
   ```
   frontend/crisis-preview.html
   ```

2. Double-cliquez sur le fichier ou faites clic droit → "Ouvrir avec" → votre navigateur

### Option 2 : Depuis l'explorateur Windows

1. Naviguez vers : `d:\IAcompagnon\frontend\`
2. Double-cliquez sur `crisis-preview.html`

---

## 🚀 Avec le serveur de développement

Pour voir l'intégration complète dans l'application :

```bash
cd frontend
npm install
npm run dev
```

Puis ouvrez : `http://localhost:5173/?demo=crisis`

---

## 📱 Test sur Mobile

### Simuler un mobile dans Chrome/Edge :

1. Ouvrez `crisis-preview.html` dans Chrome/Edge
2. Appuyez sur `F12` pour ouvrir DevTools
3. Cliquez sur l'icône mobile (ou `Ctrl+Shift+M`)
4. Sélectionnez un appareil (ex: iPhone 12 Pro)
5. Rechargez la page

### Points à vérifier sur mobile :

- ✅ Les boutons d'urgence sont **fixes en bas**
- ✅ On peut scroller les exercices de stabilisation
- ✅ Les boutons restent accessibles pendant le scroll
- ✅ Cliquer sur un bouton ouvre le dialer du téléphone

---

## 🎨 Aperçu de l'Interface

### Desktop (≥ 768px)
```
┌─────────────────────────────────────────┐
│ 🚨 Protocole de soutien immédiat      ✕ │
├─────────────────────────────────────────┤
│ Message : "Tu n'es pas seul·e"          │
├─────────────────────────────────────────┤
│ 🧘 STABILISATION IMMÉDIATE              │
│ [Respiration] [5-4-3-2-1] [Ancrage]     │
│ ┌─────────────────────────────────────┐ │
│ │  Animation de respiration           │ │
│ │  Inspire doucement... 5             │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ 🆘 BESOIN D'AIDE HUMAINE ?              │
│ ┌──────────────┐ ┌──────────────┐      │
│ │ 📞 3114      │ │ 📞 15        │      │
│ │ Prévention   │ │ SAMU         │      │
│ └──────────────┘ └──────────────┘      │
│ ┌──────────────┐                        │
│ │ Contact      │                        │
│ │ personnel    │                        │
│ └──────────────┘                        │
└─────────────────────────────────────────┘
```

### Mobile (< 768px)
```
┌─────────────────────┐
│ 🚨 Protocole      ✕ │
├─────────────────────┤
│ Message de soutien  │
├─────────────────────┤
│ 🧘 STABILISATION    │
│ [Respiration]       │
│ [5-4-3-2-1]        │
│ [Ancrage]          │
│                     │
│ ┌─────────────────┐ │
│ │  Exercice actif │ │
│ │                 │ │
│ └─────────────────┘ │
│                     │
│ (scroll possible)   │
│                     │
├─────────────────────┤
│ 🆘 AIDE HUMAINE ?   │ ← FIXE EN BAS
│ ┌─────────────────┐ │
│ │ 📞 3114         │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ 📞 15           │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ Contact perso   │ │
│ └─────────────────┘ │
└─────────────────────┘
```

---

## ✨ Fonctionnalités Interactives

### Dans `crisis-preview.html` :

1. **Animation de respiration**
   - Compte à rebours 5 secondes
   - Alternance inspire/expire
   - Animation visuelle de l'icône

2. **Changement d'exercices**
   - Cliquez sur les onglets
   - Transition douce entre exercices

3. **Boutons d'appel**
   - Cliquez sur 3114 ou 15
   - Sur mobile : ouvre le dialer
   - Sur desktop : affiche `tel:` dans la barre d'adresse

4. **Fermeture**
   - Cliquez sur ✕
   - Confirmation avant fermeture

---

## 🎯 Contrôles de Prévisualisation

En haut à droite de la page :

- **Afficher Protocole** : Ouvre le protocole de crise
- **Masquer** : Ferme le protocole (avec confirmation)

---

## 📊 Comparaison des Versions

| Aspect | crisis-preview.html | App complète (?demo=crisis) |
|--------|---------------------|------------------------------|
| Serveur requis | ❌ Non | ✅ Oui (npm run dev) |
| Données dynamiques | ❌ Statique | ✅ Dynamique |
| Intégration backend | ❌ Non | ✅ Oui |
| Logs RGPD | ❌ Non | ✅ Oui |
| Rapidité | ⚡ Instantané | 🐌 Nécessite build |

---

## 🔧 Personnalisation

Pour modifier le nom d'utilisateur dans l'aperçu, éditez `crisis-preview.html` :

```html
<!-- Ligne 70 environ -->
<p>Sophie, je suis là avec toi. Tu n'es pas seul·e.</p>
```

Changez "Sophie" par le prénom souhaité.

---

## 📱 Test Réel sur Mobile

Pour tester sur un vrai téléphone :

1. Assurez-vous que votre ordinateur et téléphone sont sur le même réseau WiFi
2. Lancez le serveur : `npm run dev`
3. Notez l'adresse IP de votre ordinateur (ex: 192.168.1.10)
4. Sur le téléphone, ouvrez : `http://192.168.1.10:5173/?demo=crisis`

---

## ✅ Checklist de Vérification

- [ ] Stabilisation apparaît en premier
- [ ] Boutons d'urgence en bas
- [ ] Sur mobile : boutons fixes pendant le scroll
- [ ] Animation de respiration fonctionne
- [ ] Changement d'exercices fluide
- [ ] Clic sur 3114/15 ouvre le dialer
- [ ] Confirmation avant fermeture
- [ ] Pas de bouton "Urgence psychiatrique"

---

**Bonne visualisation !** 👁️