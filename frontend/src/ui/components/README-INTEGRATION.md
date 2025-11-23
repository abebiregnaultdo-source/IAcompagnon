# 🚀 GUIDE D'INTÉGRATION - Dashboard helō

## ✅ Fichiers à intégrer

Vous avez 5 fichiers à copier dans votre projet :

1. **Dashboard-FINAL.jsx** → Remplace votre `Dashboard.jsx`
2. **dashboard-helo.css** → Remplace votre `dashboard.css`
3. **InsightCard.jsx** → NOUVEAU composant
4. **CreationCard-FINAL.jsx** → Remplace votre `CreationCard.jsx`
5. **ResourceCard-FINAL.jsx** → Remplace votre `ResourceCard.jsx`

---

## 📋 ÉTAPE 1 : Sauvegarder vos anciens fichiers

```bash
# Dans votre dossier projet
cd src/components

# Sauvegarder les anciens fichiers
mv Dashboard.jsx Dashboard.jsx.OLD
mv components/CreationCard.jsx components/CreationCard.jsx.OLD
mv components/ResourceCard.jsx components/ResourceCard.jsx.OLD

cd ../styles
mv dashboard.css dashboard.css.OLD
```

---

## 📥 ÉTAPE 2 : Copier les nouveaux fichiers

### 2.1 Dashboard

```bash
cp Dashboard-FINAL.jsx src/components/Dashboard.jsx
```

### 2.2 CSS

```bash
cp dashboard-helo.css src/styles/dashboard.css
```

### 2.3 Composants

```bash
# InsightCard (NOUVEAU)
cp InsightCard.jsx src/components/components/InsightCard.jsx

# CreationCard (REMPLACE)
cp CreationCard-FINAL.jsx src/components/components/CreationCard.jsx

# ResourceCard (REMPLACE)
cp ResourceCard-FINAL.jsx src/components/components/ResourceCard.jsx
```

---

## 🗑️ ÉTAPE 3 : Supprimer Chart.js (si inutile ailleurs)

Si vous n'utilisez pas Chart.js ailleurs dans votre projet :

```bash
npm uninstall react-chartjs-2 chart.js
```

**⚠️ Attention** : Vérifiez d'abord que Chart.js n'est pas utilisé ailleurs !

```bash
# Rechercher les imports de Chart.js
grep -r "react-chartjs-2" src/
grep -r "chart.js" src/
```

---

## 🔧 ÉTAPE 4 : Vérifier les imports dans Dashboard.jsx

Ouvrez `src/components/Dashboard.jsx` et vérifiez que les chemins correspondent à votre structure :

```jsx
// Ces imports doivent correspondre à VOTRE structure
import { useDeviceDetection } from "../hooks/useDeviceDetection"; // ✅
import { useDashboardData } from "../hooks/useDashboardData";     // ✅
import CreationCard from "./components/CreationCard";              // ✅
import ResourceCard from "./components/ResourceCard";              // ✅
import InsightCard from "./components/InsightCard";                // ✅
import Text from "./components/Text";                              // ✅
import "../styles/dashboard.css";                                  // ✅
```

**Si votre structure est différente**, ajustez les chemins.

---

## 🎨 ÉTAPE 5 : Ajouter les polices (si nécessaire)

Le dashboard utilise **Inter** et **Nunito**. Ajoutez-les à votre `index.html` ou `App.jsx` :

```html
<!-- Dans public/index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Nunito:wght@500;600;700&display=swap" rel="stylesheet">
```

Ou avec npm :

```bash
npm install @fontsource/inter @fontsource/nunito
```

```jsx
// Dans App.jsx ou index.js
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/nunito/500.css';
import '@fontsource/nunito/600.css';
import '@fontsource/nunito/700.css';
```

---

## ✅ ÉTAPE 6 : Tester

```bash
npm start
```

Testez le dashboard en vous connectant avec un utilisateur qui a :
- Des créations
- Un historique
- Des ressources

---

## 🐛 Dépannage

### Problème 1 : "Cannot find module './components/InsightCard'"

**Solution** : Vérifiez que InsightCard.jsx est bien dans le bon dossier :
```bash
ls src/components/components/InsightCard.jsx
```

---

### Problème 2 : Les styles ne s'appliquent pas

**Solution** : Vérifiez que le CSS est bien importé :
```jsx
import "../styles/dashboard.css";  // Dans Dashboard.jsx
```

Et que le fichier existe :
```bash
ls src/styles/dashboard.css
```

---

### Problème 3 : "Cannot read property 'type' of undefined"

**Solution** : Vos données API ont peut-être une structure différente.

Ajoutez des console.log pour débugger :

```jsx
// Dans Dashboard.jsx, après useDashboardData
console.log("History:", history);
console.log("Creations:", creations);
console.log("Resources:", resources);
```

Puis ajustez les composants CreationCard/ResourceCard selon votre structure.

---

### Problème 4 : Les icônes ne s'affichent pas

**Solution** : Les emojis peuvent ne pas s'afficher sur certains systèmes.

Remplacez-les par des icônes SVG si nécessaire.

---

## 📊 Structure des données attendue

### Création (creation)

```javascript
{
  id: "abc123",                    // Required
  type: "text",                    // "text", "audio", "drawing", "photo"
  title: "Mon titre",              // Optional (défaut: "Sans titre")
  content: "...",                  // Pour type "text"
  excerpt: "...",                  // Alternative à content
  date: "2024-11-20",              // Date de création
  created_at: "2024-11-20",        // Alternative à date
  imageUrl: "https://...",         // Pour type "drawing" ou "photo"
  duration: "2:34",                // Pour type "audio"
  progress: 65                     // Pour type "audio" (% écouté)
}
```

### Ressource (resource)

```javascript
{
  id: "xyz789",                    // Required
  type: "meditation",              // "meditation", "article", "exercise", etc.
  title: "Méditation du souffle",  // Required
  name: "...",                     // Alternative à title
  description: "...",              // Required
  excerpt: "...",                  // Alternative à description
  duration: 5,                     // En minutes (optionnel)
  url: "https://...",              // Lien externe (optionnel)
  tags: ["respiration", "calme"]   // Optionnel
}
```

### Historique (history)

```javascript
{
  date: "2024-11-20",              // Required
  created_at: "2024-11-20",        // Alternative à date
  energie: 5,                      // 0-10
  detresse: 3,                     // 0-10 (non utilisé dans nouvelle version)
  espoir: 7                        // 0-10 (non utilisé dans nouvelle version)
}
```

---

## 🎯 Ce qui a changé

| Ancien dashboard | Nouveau dashboard helō |
|-----------------|------------------------|
| Graphique Chart.js | Insights qualitatifs ✅ |
| Onglets Tabs | Une seule page fluide ✅ |
| "3 sessions • 5 créations" | "Vous avez écrit aujourd'hui" ✅ |
| Styles inline | Classes CSS helō ✅ |
| Couleurs génériques | Bleu helō #7BA8C0 ✅ |
| 450 lignes | 200 lignes modulaires ✅ |

---

## 📞 Support

Si vous rencontrez des problèmes :

1. **Vérifiez les console.log** pour voir la structure de vos données
2. **Comparez avec les structures attendues** ci-dessus
3. **Ajustez les composants** selon votre API

Les composants sont faits pour être **flexibles** et gérer différentes structures de données avec des fallbacks (`creation.date || creation.created_at`).

---

## ✅ Checklist finale

- [ ] Anciens fichiers sauvegardés (.OLD)
- [ ] Nouveaux fichiers copiés
- [ ] Chart.js désinstallé (si inutile)
- [ ] Chemins d'import vérifiés
- [ ] Polices ajoutées (Inter, Nunito)
- [ ] `npm start` fonctionne
- [ ] Dashboard s'affiche correctement
- [ ] Créations s'affichent
- [ ] Ressources s'affichent
- [ ] Insights s'affichent
- [ ] Design respecte la charte helō (bleu #7BA8C0)

---

**Félicitations ! Votre dashboard helō est prêt** 🎉

Si tout fonctionne, vous pouvez supprimer les fichiers .OLD :

```bash
rm src/components/Dashboard.jsx.OLD
rm src/components/components/CreationCard.jsx.OLD
rm src/components/components/ResourceCard.jsx.OLD
rm src/styles/dashboard.css.OLD
```
