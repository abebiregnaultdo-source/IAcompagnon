# CHECKLIST DE VÉRIFICATION - NAVIGATION HELŌ

Utilisez ce document pour valider que le système de navigation fonctionne correctement après modifications.

---

## PRÉ-DÉVELOPPEMENT: Vérification Baseline

### État Initial
- [ ] Cloner le repo et installer les dépendances
- [ ] `npm run dev` - Application démarre sans erreur console
- [ ] Pas d'erreurs dans le terminal build
- [ ] Pas de warnings React (ESLint clean)

### Imports Validés
- [ ] Tous les imports dans App.jsx résolus
- [ ] Aucun "Cannot find module" dans console
- [ ] Tous les fichiers .jsx existent dans `/ui/`

---

## SCÉNARIO 1: Flux Non-Authentifié → Authentifié

### Landing Page
- [ ] Page de landing affiche correctement
- [ ] Logo + titre "La perte transforme tout"
- [ ] 2 boutons visibles: "Se connecter" + "Créer un compte"
- [ ] Footer avec liens ressources

### Boutons Landing
- [ ] "Se connecter" → Auth modal
- [ ] "Créer un compte" → Auth modal
- [ ] "Comment ça marche" footer → Resources page (local state)
- [ ] "Retour" depuis Resources → Landing

### Auth Page
- [ ] Email input visible
- [ ] Password input visible
- [ ] "Se connecter" button fonctionne
- [ ] Erreur affichée si credentials invalides
- [ ] Success → Onboarding OU Home (selon profil)

---

## SCÉNARIO 2: Onboarding (5 étapes)

### Étape 1: Intro
- [ ] Page de bienvenue affiche
- [ ] Bouton "Suivant" visible
- [ ] Barre de progression: 1/5 ou 1/4

### Étape 2: Consent
- [ ] Texte consent visible
- [ ] Checkbox (ou "Je suis d'accord") visible
- [ ] Bouton "Suivant" activé après consent
- [ ] Barre de progression: 2/5

### Étape 3: Prénom
- [ ] Input "Quel est votre prénom?" visible
- [ ] Défaut: prénom du compte si disponible
- [ ] Bouton "Suivant" désactivé si vide
- [ ] Bouton "Suivant" activé si rempli
- [ ] Barre de progression: 3/5

### Étape 4: Rythme
- [ ] 3 options: "Lent", "Neutre", "Enveloppant"
- [ ] Sélection visuelle claire (highlight)
- [ ] Bouton "Suivant" après sélection
- [ ] Barre de progression: 4/5

### Étape 5: Done
- [ ] Message de confirmation
- [ ] Animation transition (600ms)
- [ ] Redirection vers Home automatique
- [ ] ✓ Status: "Bonjour, [Prénom]"

### Validation
- [ ] Aucune étape ne saute (seq linéaire)
- [ ] Impossible de revenir (back button pas présent)
- [ ] Données sauvegardées en Supabase
- [ ] onboarding_completed = true dans profil

---

## SCÉNARIO 3: Home (HUB Central)

### Layout Principal
- [ ] Logo + "Bonjour, [Prénom]" affiché
- [ ] "Je suis là pour vous" sous le titre
- [ ] 2 boutons principaux: "Écrire un message" + "Appel visio"

### Boutons Principaux
- [ ] "Écrire un message" (text chat icon)
- [ ] "Appel visio" (phone icon)
- [ ] Section "Moi & Spiritualité" visible (si extended_profile)
  - [ ] "Profil Spirituel"
  - [ ] "Journal des Rêves"
  - [ ] "Accès rapide: Mes Mantras" (si mantras exist)
- [ ] Section "Apprentissage"
  - [ ] "Parcours"
  - [ ] "Bibliothèque"
- [ ] Section "Expression"
  - [ ] "Créativité"

### UserMenu (Coin haut-droit)
- [ ] Avatar avec initiale du prénom
- [ ] Click menu = dropdown apparaît
- [ ] Menu items visibles:
  - [ ] "Profil Spirituel"
  - [ ] "Journal des Rêves"
  - [ ] "Parcours"
  - [ ] "Bibliothèque"
  - [ ] "Créativité"
  - [ ] "Paramètres" (separator)
  - [ ] "Se déconnecter"

### Click Actions Home
Chaque bouton doit naviguer correctement:
- [ ] "Écrire un message" → showChat=true, showHome=false
- [ ] "Appel visio" → showChat=true, conversationMode="voice"
- [ ] "Profil Spirituel" → showSpiritualProfile=true
- [ ] "Journal des Rêves" → showDreams=true
- [ ] "Parcours" → showDashboard=true
- [ ] "Bibliothèque" → showLibrary=true
- [ ] "Créativité" → showCreativity=true
- [ ] "Paramètres" → showSettings=true

### UserMenu Click Actions
- [ ] Menu se ferme après click
- [ ] Chaque action navigue correctement (même que boutons)
- [ ] "Se déconnecter" → Logout flow

---

## SCÉNARIO 4: Modules & Boutons Retour

### Chat Module
- [ ] Chat affiche correctement
- [ ] Bouton "← Retour à l'accueil" visible (top)
- [ ] Bouton retour → Home (showChat=false, showHome=true)
- [ ] conversationMode reset à "chat"
- [ ] Messages historique visible
- [ ] Avatar affiche (AvatarRoom)
- [ ] Input pour message visible
- [ ] Envoyer message → API /api/chat
- [ ] Réponse reçue → Affichée dans chat

### Settings Module
- [ ] Settings page affiche
- [ ] Bouton "← Retour à l'accueil" visible
- [ ] Bouton retour → Home
- [ ] Préférences thérapeutiques visibles (ton, rythme)
- [ ] Changement mot de passe option visible
- [ ] Sauvegarde settings → localStorage
- [ ] Lien vers CGV/Mentions/Confidentialité visibles

### Dashboard Module (Parcours)
- [ ] Dashboard affiche historique sessions
- [ ] Bouton "← Retour à l'accueil" visible
- [ ] Chargement sessions depuis /api/history
- [ ] Sessions affichées avec date
- [ ] Clic session → (à implémenter)

### Library Module
- [ ] Bibliothèque affiche ressources
- [ ] Bouton "← Retour" visible
- [ ] Catégories: Livres, Podcasts, Articles, Vidéos
- [ ] Filtrage par catégorie fonctionne
- [ ] Chaque ressource affiche titre + description

### Creativity Module
- [ ] Page créativité affiche
- [ ] Bouton "← Retour à l'accueil" visible
- [ ] Tabs: Journal, Narratif, Poème, Rituel, Portfolio
- [ ] Créer nouvelle création fonctionne
- [ ] Portfolio affiche créations sauvegardées
- [ ] Suppression création demande confirmation

### Dream Journal Module
- [ ] Journal affiche rêves sauvegardés
- [ ] Bouton "← Retour" visible
- [ ] Formulaire ajouter rêve visible
- [ ] Champs: titre, contenu, date, intensité, thèmes
- [ ] Sauvegarder rêve → Supabase
- [ ] Édition rêve existant fonctionne
- [ ] Suppression demande confirmation

### Spiritual Profile Module
- [ ] Profil affiche si extended_profile existe
- [ ] Tabs: Vue d'ensemble, Numérologie, Astrologie, Fâ, Lignées, Mantras, Méditations, Notes
- [ ] Chaque tab affiche contenu correct
- [ ] Bouton "← Retour" visible et fonctionne

### Resources Module (Guide)
- [ ] Resources page affiche
- [ ] Navigation: Comment ça marche, Approches, FAQ, Confidentialité
- [ ] Chaque page affiche contenu correct
- [ ] "Retour" button ramène à Home (si appelé depuis Home)

---

## SCÉNARIO 5: Mobile Responsiveness

### Portrait Mobile (375px)
- [ ] Logo adapté au petit écran
- [ ] Boutons stack verticalement
- [ ] Texte lisible (font size appropriée)
- [ ] UserMenu accessible (pas trop petit)
- [ ] Chat input adapté
- [ ] Aucun horizontal scroll

### Landscape Mobile (667px)
- [ ] Layout adapté (colonnes possibles)
- [ ] Boutons toujours accessibles
- [ ] Avatar still visible (ou caché si nécessaire)
- [ ] Aucun content overflow

### Tablet (1024px)
- [ ] Layout optimisé pour grand écran
- [ ] Whitespace approprié
- [ ] 2-column layout possible si pertinent

### Desktop (1920px+)
- [ ] Max-width respectée
- [ ] Centered content
- [ ] Hover states sur boutons

---

## SCÉNARIO 6: Transitions & Animation

### Transition Onboarding → Home
- [ ] Timing: 600ms (vérifié visuellement)
- [ ] "Préparation de votre espace..." affiche
- [ ] Transition smooth (fade in/out)
- [ ] Pas de flash blanc
- [ ] Pas de "jank" (stuttering)

### Transition Home → Module
- [ ] Instantané (pas de loading)
- [ ] Previous module disparaît
- [ ] New module apparaît

### Transition Module → Home
- [ ] Bouton retour instantané
- [ ] No loading state
- [ ] Scroll top (page remonte)

---

## SCÉNARIO 7: Logout & Session Management

### Logout depuis Home
- [ ] Menu UserMenu → "Se déconnecter"
- [ ] Confirmation demandée? (optionnel)
- [ ] Loading spinner si async
- [ ] localStorage nettoyé
- [ ] Tous flags reset
- [ ] Redirect vers Landing
- [ ] Page refreshée → Landing, pas auth

### Logout depuis Settings
- [ ] Bouton "Se déconnecter" visible
- [ ] Same flow que Home logout
- [ ] Landing affichée après

### Logout depuis Dashboard
- [ ] Bouton logout présent
- [ ] Same flow

### Refresh Page Authentifié
- [ ] Session restaurée (user != null)
- [ ] Redirection vers Home (pas Onboarding)
- [ ] Profile correctement chargé
- [ ] Pas de clignotement (landing briefly)

### Refresh Page Onboarding Incomplète
- [ ] Session restaurée (user exist)
- [ ] Onboarding réapparaît au step précédent
- [ ] Progression sauvegardée

### Refresh Page Non-Authentifié
- [ ] Landing page affichée
- [ ] Aucune redirection suspecte

---

## SCÉNARIO 8: Edge Cases & Erreurs

### Backend Down (/api/history unreachable)
- [ ] Dashboard affiche "Impossible de charger l'historique"
- [ ] Mode démo si erreur
- [ ] Pas de crash

### Network Error During Chat
- [ ] Message d'erreur affiché
- [ ] Input toujours présent
- [ ] Possibilité de renvoyer

### Empty Spiritual Profile
- [ ] Message "Profil non encore créé"
- [ ] "Discute avec Helō..." suggestion
- [ ] Pas de crash

### No Mantras
- [ ] "Accès rapide: Mes Mantras" hidden
- [ ] Section s'affiche quand mantras ajoutés

### isTransitioning Stuck
- [ ] Si bloqué > 5s (à implémenter)
- [ ] Fallback: click "Continuer"
- [ ] Ou auto-fallback après timeout

---

## SCÉNARIO 9: Incohérences & Bugs

### Double Vues Simultanées?
- [ ] Impossible d'avoir showHome=true && showChat=true
- [ ] Structure if-if-if empêche collision
- [ ] Test: Ouvrir DevTools, vérifier state

### Props Manquantes?
- [ ] Console: Aucun "Cannot read property of undefined"
- [ ] Chat reçoit api, user, onEmotionalStateChange
- [ ] Dashboard reçoit user, onClose, onLogout
- [ ] DreamJournal reçoit user, onBack
- [ ] SpiritualProfile reçoit user, onBack
- [ ] Creativity reçoit user, api, onBackToHome
- [ ] Library reçoit onBackToHome
- [ ] Resources reçoit onBack, initialPage

### Naming Confusion?
- [ ] onOpenResources ouvre Library (not Resources) ✓ Known issue
- [ ] onOpenGuide ouvre Resources (not Guide) ✓ Known issue
- [ ] After fix: names should be logical

### Dead Code?
- [ ] Aucun onClick={} ou onClick={undefined}
- [ ] Aucun prop unused warnings
- [ ] LandingPage.showResources: used or removed?

---

## SCÉNARIO 10: Performance & Debug

### Network Requests
- [ ] DevTools Network tab: Vérifier /api calls
- [ ] /api/history successful (200)
- [ ] /api/chat successful
- [ ] /api/profile/ successful
- [ ] Aucune request en boucle (infinite loop?)

### Console Warnings
- [ ] ESLint clean (npm run lint)
- [ ] Aucun missing dependency
- [ ] Aucun missing exhaustive deps
- [ ] Aucun unescaped HTML

### Performance
- [ ] Home load: < 1s
- [ ] Chat load: < 2s
- [ ] Smooth scrolling (60fps)
- [ ] Aucun layout shift (CLS)

### Local Storage
- [ ] localStorage inspect:
  - `helo_current_user` → user data
  - `helo_chat_history_[id]` → messages
  - `helo_settings_[id]` → preferences
- [ ] After logout: localStorage cleaned

---

## SCÉNARIO 11: Accessibility (A11y)

### Keyboard Navigation
- [ ] Tab key navigate buttons
- [ ] Enter key activate buttons
- [ ] Escape key close menus/modals
- [ ] Focus visible (outline)

### ARIA Labels
- [ ] UserMenu button: aria-haspopup="true"
- [ ] UserMenu expanded state: aria-expanded
- [ ] Loading states: role="status"
- [ ] Skip link présent: a.skip-link

### Screen Reader
- [ ] Page title announces context
- [ ] Buttons have text/aria-label
- [ ] Images have alt (if any)
- [ ] Form inputs have labels

---

## POST-FIXES VALIDATION (Après implémentation)

### Fix 1: onOpenGuide → onOpenResources Renaming
- [ ] App.jsx:387 renamed
- [ ] Home.jsx:19 updated
- [ ] Home.jsx:306 still works
- [ ] UserMenu.jsx compiled
- [ ] No lingering references to old name

### Fix 2: onResumeSession Added
- [ ] App.jsx:573 passes onResumeSession
- [ ] Dashboard-FINAL.jsx:9 receives it
- [ ] No TypeScript errors
- [ ] Feature ready for future use

### Fix 3: Onboarding Consolidated
- [ ] OnboardingPage component created
- [ ] App.jsx uses single render
- [ ] No duplication
- [ ] user=null handling correct

### Fix 4: Transition Timeout Added
- [ ] 5s max timeout implemented
- [ ] Fallback button visible if stuck
- [ ] clearTimeout on cleanup
- [ ] No memory leaks

---

## DEPLOYMENT CHECKLIST

Before pushing to Vercel:

- [ ] `npm run build` succeeds
- [ ] No build warnings/errors
- [ ] All imports resolved
- [ ] All tests passing (if any)
- [ ] VITE_BACKEND_URL correct in env
- [ ] VITE_ADMIN_KEY set correctly
- [ ] No console.error() on startup
- [ ] No hardcoded URLs (use api.base)

After deployment:

- [ ] App loads on https://ia-compagnon.vercel.app
- [ ] Auth works with Supabase
- [ ] All endpoints reachable
- [ ] Admin dashboard accessible with ?admin=helo2024admin
- [ ] No 404 errors in network tab
- [ ] Performance acceptable (<2s page load)

---

## Sign-Off

Checklist completed by: ________________
Date: ________________
All tests passed: [ ] YES [ ] NO

Known issues remaining:
- [ ] None
- [ ] onOpenGuide/onOpenResources naming (planned fix)
- [ ] onResumeSession not passed (planned fix)
- [ ] [Other]:

---

## Notes

```
Use this space for additional testing notes:




```

