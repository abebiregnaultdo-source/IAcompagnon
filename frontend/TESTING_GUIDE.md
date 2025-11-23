# 🧪 Guide de Test - HELŌ

## 🎯 Objectif

Ce guide vous permet de tester complètement l'application HELŌ pour vous assurer que tout fonctionne parfaitement et que l'expérience est thérapeutique.

---

## 🚀 Démarrage

### 1. Installation et Lancement

```bash
# Dans le dossier frontend
cd frontend

# Installer les dépendances (si pas déjà fait)
npm install

# Lancer en mode développement
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

---

## ✅ Checklist de Test Complète

### 📱 Test 1 : Onboarding (Parcours d'Accueil)

**Objectif :** Vérifier que le parcours d'accueil est rassurant et fluide.

#### Étape 1 : Intro
- [ ] La page se charge avec une animation douce (fade-in)
 - [ ] Le logo HELŌ est visible et bien centré
- [ ] Le texte de bienvenue est lisible et chaleureux
- [ ] Le bouton "Continuer" est bien visible
- [ ] La barre de progression montre l'étape 1/5

**À vérifier :**
- Pas de blanc pur en arrière-plan ✓
- Typographie douce (Inter/Nunito) ✓
- Espacements généreux ✓

#### Étape 2 : Consentement
- [ ] Le texte explique clairement ce qui est fait avec les données
- [ ] Les listes (ce qu'on fait / ce qu'on ne fait pas) sont lisibles
- [ ] Le bouton "J'accepte et je continue" est clair
- [ ] La barre de progression montre l'étape 2/5

**À vérifier :**
- Ton empathique, pas juridique ✓
- Pas de texte en ALL CAPS ✓

#### Étape 3 : Prénom
- [ ] Le champ de saisie a un placeholder doux
- [ ] Le texte d'aide "Cela reste entre nous" est visible
- [ ] Si on clique "Continuer" sans prénom, message doux (pas agressif)
- [ ] La barre de progression montre l'étape 3/5

**À vérifier :**
- Focus visible mais doux sur l'input ✓
- Message d'erreur empathique ✓

#### Étape 4 : Rythme
- [ ] Les 3 options de rythme sont bien visibles
- [ ] Chaque option a une description claire
- [ ] L'option sélectionnée a une bordure primaire
- [ ] Hover sur les options est subtil
- [ ] La barre de progression montre l'étape 4/5

**À vérifier :**
- Transitions douces entre sélections ✓
- Pas de couleurs vives ✓

#### Étape 5 : Préparation
- [ ] Message "Presque prêt" rassurant
- [ ] Bouton "Je suis prêt" visible
- [ ] La barre de progression montre l'étape 5/5

#### Transition vers Chat
- [ ] Écran de transition avec logo et message
- [ ] Animation douce (600ms)
- [ ] Pas de saut brusque

**Temps total attendu :** 2-3 minutes

---

### 💬 Test 2 : Interface de Chat

**Objectif :** Vérifier que la conversation est fluide et apaisante.

#### Layout Général
- [ ] Avatar visible à gauche (desktop) ou en haut (mobile)
- [ ] Zone de chat au centre avec hauteur confortable (500px / 60vh)
- [ ] Input et bouton d'envoi bien visibles
- [ ] Boutons de feedback (👍/👎) présents
- [ ] Radar émotionnel en bas

**À vérifier :**
- Pas de blanc pur ✓
- Espacements respirants ✓
- Scrollbar personnalisée douce ✓

#### Message Initial
 - [ ] Message de bienvenue de HELŌ avec prénom
- [ ] Bulle de message avec coins arrondis
 - [ ] Label "HELŌ" visible
- [ ] Animation d'apparition douce (fade-in-left)

#### Envoi de Message
1. **Taper un message**
   - [ ] Placeholder "Écrivez ce qui vous vient..." visible
   - [ ] Texte d'aide "Appuyez sur Entrée pour envoyer" visible
   - [ ] Focus sur l'input est doux (pas de bleu vif)

2. **Envoyer (Entrée ou bouton)**
   - [ ] Message utilisateur apparaît à droite
   - [ ] Bulle avec couleur primaire claire
   - [ ] Animation fade-in-right
   - [ ] Input se vide automatiquement
   - [ ] Bouton "Envoyer" devient "Envoi..." et est désactivé

3. **Réponse de l'assistant**
   - [ ] Indicateur de frappe apparaît (3 points qui pulsent)
   - [ ] Animation douce de l'indicateur
   - [ ] Réponse apparaît après quelques secondes
   - [ ] Bulle à gauche avec couleur surface-2
   - [ ] Animation fade-in-left

4. **Scroll automatique**
   - [ ] La conversation scroll automatiquement vers le bas
   - [ ] Scroll est smooth (pas de saut)

#### Feedback
- [ ] Boutons 👍/👎 visibles
- [ ] Hover sur boutons est subtil
- [ ] Click envoie le feedback (vérifier dans console réseau)

#### Radar Émotionnel
- [ ] Graphique radar visible
- [ ] 3 axes : Détresse, Espoir, Énergie
- [ ] Couleurs désaturées (bleu-gris)
- [ ] Animation douce à l'apparition
- [ ] Phase actuelle affichée ("ancrage", etc.)
- [ ] Tooltip au hover

**À vérifier :**
- Hauteur de chat confortable (500px) ✓
- Max 60vh pour ne pas déborder ✓
- Bulles max 75% de largeur ✓
- Ombres douces sur bulles ✓

---

### ⌨️ Test 3 : Navigation Clavier

**Objectif :** Vérifier l'accessibilité complète au clavier.

#### Onboarding
1. **Charger la page**
   - [ ] Appuyer sur Tab → Skip link apparaît
   - [ ] Appuyer sur Entrée → Va au contenu principal

2. **Navigation**
   - [ ] Tab parcourt tous les boutons
   - [ ] Focus visible (outline doux)
   - [ ] Entrée active les boutons
   - [ ] Shift+Tab revient en arrière

#### Chat
1. **Input**
   - [ ] Tab arrive sur l'input
   - [ ] Focus visible doux
   - [ ] Taper du texte fonctionne
   - [ ] Entrée envoie le message
   - [ ] Shift+Entrée fait un retour à la ligne

2. **Boutons**
   - [ ] Tab parcourt : Input → Envoyer → 👍 → 👎
   - [ ] Espace active les boutons
   - [ ] Focus toujours visible

**À vérifier :**
- Outline jamais agressif ✓
- Tous les éléments accessibles ✓
- Ordre logique ✓

---

### 🔊 Test 4 : Lecteur d'Écran

**Objectif :** Vérifier que tout est annoncé correctement.

**Outils :** NVDA (Windows), JAWS (Windows), VoiceOver (Mac)

#### Onboarding
 - [ ] Logo annoncé comme "Logo HELŌ"
- [ ] Titres annoncés (h2)
- [ ] Boutons annoncés avec leur texte
- [ ] Champs de formulaire annoncés avec labels
- [ ] Messages d'aide annoncés
- [ ] Barre de progression annoncée

#### Chat
 - [ ] Messages annoncés avec "Message de Vous" / "Message de HELŌ"
 - [ ] Indicateur de frappe annoncé "HELŌ est en train d'écrire"
- [ ] Input annoncé "Message à envoyer"
- [ ] Boutons feedback annoncés "Cette réponse m'aide" / "Cette réponse ne m'aide pas vraiment"
- [ ] Historique annoncé comme "Historique de conversation"

**À vérifier :**
- Tous les ARIA labels présents ✓
- role="status" pour chargements ✓
- role="alert" pour erreurs ✓
- aria-live="polite" pour mises à jour ✓

---

### 🎨 Test 5 : Design Thérapeutique

**Objectif :** Vérifier que tous les principes thérapeutiques sont respectés.

#### Couleurs
- [ ] **Pas de blanc pur** - Inspecter avec DevTools
  - Background devrait être #F2F6F7 ou similaire
  - Jamais #FFFFFF
- [ ] **Pas de noir pur** - Inspecter texte
  - Texte devrait être #3A4048 ou similaire
  - Jamais #000000
- [ ] **Couleurs désaturées**
  - Primaire : #7BA8C0 (saturation < 30%)
  - Pas de rouge vif, vert vif, bleu vif

#### Transitions
- [ ] Toutes les transitions > 0.3s
  - Hover sur boutons : 0.3s ✓
  - Animations : 0.6s - 1s ✓
- [ ] Easing doux (cubic-bezier)
- [ ] Pas de saut brusque

#### Espacements
- [ ] Espacements généreux partout
- [ ] Line-height ≥ 1.6 pour paragraphes
- [ ] Padding confortable dans cards

#### Typographie
- [ ] Police Inter ou Nunito visible
- [ ] Pas de ALL CAPS
- [ ] Tailles lisibles (≥ 15px pour texte principal)

**Outil :** Inspecteur de navigateur (F12)

---

### 📱 Test 6 : Responsive Mobile

**Objectif :** Vérifier que tout fonctionne sur mobile.

**Méthode :** DevTools → Mode responsive (Ctrl+Shift+M)

#### Tailles à tester
- [ ] iPhone SE (375px)
- [ ] iPhone 12 Pro (390px)
- [ ] iPad (768px)
- [ ] Desktop (1024px+)

#### Layout
- [ ] Avatar passe au-dessus du chat (< 900px)
- [ ] Chat prend toute la largeur
- [ ] Bulles max 85% de largeur
- [ ] Boutons restent cliquables

#### Touch Targets
- [ ] Tous les boutons ≥ 44x44px
- [ ] Input ≥ 44px de hauteur
- [ ] Boutons feedback ≥ 44px

#### Clavier Virtuel
- [ ] Input reste visible quand clavier apparaît
- [ ] Pas de zoom automatique indésirable

**À vérifier :**
- Pas de scroll horizontal ✓
- Tout reste lisible ✓
- Pas de débordement ✓

---

### ♿ Test 7 : Accessibilité Avancée

#### Contraste
**Outil :** [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

- [ ] Texte principal / fond : ≥ 4.5:1
  - #3A4048 sur #F2F6F7 → Vérifier
- [ ] Texte secondaire / fond : ≥ 4.5:1
  - #5A6068 sur #F2F6F7 → Vérifier
- [ ] Boutons / fond : ≥ 3:1
  - #7BA8C0 sur #F2F6F7 → Vérifier

#### Zoom
- [ ] Zoom à 200% (Ctrl + molette)
- [ ] Texte reste lisible
- [ ] Pas de débordement
- [ ] Layout s'adapte

#### prefers-reduced-motion
**Méthode :** DevTools → Rendering → Emulate CSS media feature

- [ ] Activer "prefers-reduced-motion: reduce"
- [ ] Toutes les animations disparaissent
- [ ] Transitions deviennent instantanées
- [ ] Contenu reste accessible

---

### 🎭 Test 8 : Expérience Émotionnelle

**Objectif :** Vérifier que l'interface est apaisante.

#### Première Impression (5 secondes)
- [ ] Sentiment de calme
- [ ] Pas de surcharge visuelle
- [ ] Couleurs douces
- [ ] Pas de distraction

#### Utilisation (5 minutes)
- [ ] Confortable pour les yeux
- [ ] Pas de fatigue visuelle
- [ ] Transitions apaisantes
- [ ] Pas de stress

#### Feedback Émotionnel
- [ ] Fond change subtilement selon état émotionnel
  - Détresse > 70 → Fond plus chaud
  - Espoir > 60 → Fond plus vert
  - Sinon → Fond neutre
- [ ] Transition très lente (1s)
- [ ] Changement à peine perceptible

**Questions à se poser :**
- Est-ce que je me sens en sécurité ? ✓
- Est-ce que je veux rester sur cette page ? ✓
- Est-ce que c'est reposant pour les yeux ? ✓

---

### 🐛 Test 9 : Gestion d'Erreurs

#### Erreur Réseau
1. **Couper le backend**
   - [ ] Essayer d'envoyer un message
   - [ ] Message d'erreur empathique apparaît
   - [ ] "Je rencontre une difficulté technique..."
   - [ ] Pas de message technique agressif

2. **Timeout**
   - [ ] Attendre longtemps
   - [ ] Message d'erreur doux
   - [ ] Possibilité de réessayer

#### Validation Formulaire
- [ ] Onboarding : prénom vide
  - Message : "Votre prénom nous aide à personnaliser l'accompagnement"
  - Pas de "Champ requis" agressif

**À vérifier :**
- Jamais de rouge vif ✓
- Messages empathiques ✓
- Pas de jargon technique ✓

---

### ⚡ Test 10 : Performance

#### Temps de Chargement
- [ ] Page se charge en < 2s
- [ ] Animations fluides (60fps)
- [ ] Pas de lag au scroll

#### Mémoire
- [ ] Ouvrir DevTools → Performance
- [ ] Enregistrer 30s d'utilisation
- [ ] Vérifier pas de fuite mémoire

#### Réseau
- [ ] DevTools → Network
- [ ] Vérifier taille des requêtes
- [ ] Pas de requêtes inutiles

---

## 📊 Checklist Finale

### Design Thérapeutique
- [ ] Pas de blanc pur (#FFFFFF)
- [ ] Pas de noir pur (#000000)
- [ ] Couleurs désaturées (< 30%)
- [ ] Transitions > 0.3s
- [ ] Espacements généreux
- [ ] Typographie douce
- [ ] Ombres douces (opacité < 0.1)

### Accessibilité
- [ ] Navigation clavier complète
- [ ] ARIA labels partout
- [ ] Contraste ≥ 4.5:1
- [ ] Touch targets ≥ 44px
- [ ] prefers-reduced-motion respecté
- [ ] Lecteur d'écran fonctionnel

### Expérience Utilisateur
- [ ] Onboarding rassurant (2-3 min)
- [ ] Chat fluide et apaisant
- [ ] Feedback émotionnel subtil
- [ ] Erreurs empathiques
- [ ] Responsive parfait

### Performance
- [ ] Chargement < 2s
- [ ] Animations 60fps
- [ ] Pas de fuite mémoire

---

## 🎯 Scénarios de Test Complets

### Scénario 1 : Nouvel Utilisateur en Détresse
**Persona :** Marie, 32 ans, anxieuse, première utilisation

1. Arrive sur la page
2. Lit le message de bienvenue
3. Accepte le consentement
4. Entre son prénom
5. Choisit "Lent et progressif"
6. Commence à discuter
7. Exprime de la détresse
8. Reçoit réponse empathique
9. Donne feedback positif

**Vérifier :**
- Aucun moment stressant
- Tout est rassurant
- Pas de pression

### Scénario 2 : Utilisateur Malvoyant
**Persona :** Jean, 45 ans, utilise lecteur d'écran

1. Active NVDA
2. Navigue au clavier uniquement
3. Complète l'onboarding
4. Envoie des messages
5. Reçoit des réponses

**Vérifier :**
- Tout est annoncé
- Navigation logique
- Pas de blocage

### Scénario 3 : Utilisateur Mobile
**Persona :** Sophie, 28 ans, sur iPhone

1. Ouvre sur mobile
2. Complète onboarding
3. Discute en déplacement
4. Clavier virtuel apparaît
5. Continue la conversation

**Vérifier :**
- Layout adapté
- Touch targets OK
- Clavier ne cache rien

---

## 🚨 Bugs Critiques à Signaler

Si vous trouvez :
- Blanc pur (#FFFFFF)
- Noir pur (#000000)
- Transition < 0.3s
- Élément inaccessible au clavier
- Contraste < 4.5:1
- Message d'erreur agressif
- Animation qui ne respecte pas prefers-reduced-motion

→ **C'est un bug critique !**

---

## ✅ Validation Finale

L'application est prête si :
- [ ] Tous les tests passent
- [ ] Aucun bug critique
- [ ] Expérience apaisante confirmée
- [ ] Accessibilité complète
- [ ] Performance acceptable

---

## 📝 Rapport de Test

Après les tests, noter :
- ✅ Ce qui fonctionne bien
- ⚠️ Ce qui pourrait être amélioré
- 🐛 Les bugs trouvés
- 💡 Les suggestions

---

**Bon test ! 🎯**