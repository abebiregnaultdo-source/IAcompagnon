# 🚨 Protocole de Crise - Documentation

## Vue d'ensemble

Le **Protocole de Crise** est une interface d'urgence qui s'active automatiquement pour fournir une aide immédiate aux utilisateurs en détresse sévère.

---

## 🎯 Déclenchement Automatique

Le protocole s'active quand :

1. **Score de détresse ≥ 75/100** (détecté par l'analyse émotionnelle)
2. **Bouton d'urgence** cliqué par l'utilisateur

---

## 🏗️ Architecture

### Double Approche Thérapeutique

Le protocole combine deux stratégies complémentaires :

#### 1. 🆘 Aide Humaine Immédiate
**Boutons d'appel directs EN BAS DE PAGE** (fixes sur mobile) :

- **3114** - Prévention du Suicide
  - Gratuit, 24h/24, 7j/7
  - Clic direct pour appeler
  
- **15** - SAMU
  - Urgence médicale
  - Clic direct pour appeler
  
- **Contact d'urgence personnel**
  - Contact de confiance de l'utilisateur
  - À configurer dans le profil

#### 2. 🧘 Stabilisation Immédiate
**Techniques de grounding** pour s'ancrer dans le moment présent :

- **Respiration courte (5 secondes)**
  - Animation visuelle apaisante
  - Compte à rebours guidé
  - Alternance inspire/expire
  
- **Technique 5-4-3-2-1**
  - 5 choses que tu vois
  - 4 choses que tu peux toucher
  - 3 sons que tu entends
  - 2 odeurs que tu sens
  - 1 goût dans ta bouche
  
- **Ancrage corporel urgent**
  - Pieds sur le sol
  - Dos contre le siège
  - Mains posées
  - Respiration naturelle

---

## 🎨 Design Thérapeutique

### Principes Appliqués

✅ **Urgence douce** - Pas de rouge vif, pas d'alarmes visuelles  
✅ **Toujours accessible** - Boutons d'urgence permanents  
✅ **Transitions lentes** - Pas de mouvements brusques  
✅ **Couleurs apaisantes** - Bleu-gris thérapeutique  
✅ **Typographie claire** - Lisibilité maximale  
✅ **Espacements généreux** - Respiration visuelle  

### Couleurs Utilisées

- **Fond** : `--color-bg-light` (#F2F6F7)
- **Primaire** : `--color-primary` (#7BA8C0)
- **Alerte douce** : `--color-accent-info` (#D4E8F0)
- **Texte** : `--color-text-primary` (#3A4048)

---

## 📱 Interface

### Structure

```
┌─────────────────────────────────────┐
│ 🚨 Protocole de soutien immédiat  ✕ │
├─────────────────────────────────────┤
│ Message de soutien                  │
│ "Tu n'es pas seul·e"                │
├─────────────────────────────────────┤
│ 🧘 Stabilisation immédiate          │
│ [Respiration] [5-4-3-2-1] [Ancrage] │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │   Exercice actif affiché ici    │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ 🆘 Besoin d'aide humaine ?          │
│ Clique pour appeler :               │
│ ┌──────────┐ ┌──────────┐          │
│ │ 📞 3114  │ │ 📞  15   │          │
│ └──────────┘ └──────────┘          │
│ ┌──────────┐                        │
│ │ Contact  │                        │
│ │ perso    │                        │
│ └──────────┘                        │
└─────────────────────────────────────┘
     ↑ FIXE EN BAS SUR MOBILE
```

### Comportements

- **Overlay modal** - Plein écran, focus total
- **Scroll interne** - Tout le contenu accessible
- **Sticky header** - Titre et bouton fermer toujours visibles
- **Boutons d'urgence fixes** - En bas sur mobile, toujours accessibles
- **Appels directs** - Liens `tel:` pour appeler en un clic
- **Confirmation de sortie** - "Es-tu sûr·e ?"

---

## 🔧 Composants

### `CrisisProtocol.jsx`
Composant principal du protocole de crise.

**Props** :
```jsx
<CrisisProtocol 
  userName="Sophie"           // Prénom de l'utilisateur
  onClose={() => {}}          // Callback fermeture
  onEmergencyCall={(type, number) => {}} // Callback appel
/>
```

### `EmergencyButton.jsx`
Bouton d'appel d'urgence.

**Props** :
```jsx
<EmergencyButton
  type="3114"                 // Type: 3114, samu, urgence, psy
  label="Nom du service"
  number="3114"
  description="Disponibilité"
  onClick={() => {}}
/>
```

### `GroundingExercise.jsx`
Exercice de stabilisation.

**Props** :
```jsx
<GroundingExercise
  type="respiration"          // respiration, grounding_5_4_3_2_1, ancrage_corporel
  userName="Sophie"
/>
```

---

## 🧪 Démonstration

### Accès à la démo

Pour voir le protocole de crise en action :

```bash
# Lancer le frontend
cd frontend
npm run dev

# Ouvrir dans le navigateur
http://localhost:5173/?demo=crisis
```

### Fonctionnalités de la démo

- ✅ Visualisation complète de l'interface
- ✅ Tous les boutons fonctionnels
- ✅ Exercices de grounding interactifs
- ✅ Journal des appels simulés
- ✅ Responsive (mobile + desktop)

---

## 🔒 Sécurité & Éthique

### Principes Fondamentaux

1. **Jamais seul** - Toujours proposer l'aide humaine
2. **Pas de substitution** - L'IA ne remplace pas un professionnel
3. **Transparence** - L'utilisateur sait qu'il parle à une IA
4. **Sortie facile** - Confirmation avant fermeture
5. **Logs RGPD** - Tous les déclenchements sont loggés

### Données Collectées

Lors d'un déclenchement :
- Timestamp
- User ID (anonymisé)
- Score de détresse
- Actions prises (appels, exercices)
- Durée du protocole

Stockage : `data/alert_logs.jsonl`

---

## 📊 Intégration Backend

### Endpoint de déclenchement

```python
# backend/api-gateway/app/main.py

@app.post("/api/crisis/trigger")
async def trigger_crisis_protocol(
    user_id: str,
    detresse_score: int,
    trigger_type: str  # "auto" ou "manual"
):
    # Log l'événement
    log_crisis_event(user_id, detresse_score, trigger_type)
    
    # Retourne le protocole approprié
    return {
        "protocol": "crisis_protocol",
        "emergency_contacts": get_emergency_contacts(user_id),
        "stabilization_techniques": [
            "respiration_courte_5_secondes",
            "grounding_5_4_3_2_1",
            "ancrage_corporel_urgent"
        ]
    }
```

### Intégration Chat

Dans `Chat.jsx`, vérifier le score après chaque analyse :

```jsx
const sc = await ar.json()
setScores({ detresse: sc.detresse, ... })

// Déclencher le protocole si détresse >= 75
if (sc.detresse >= 75) {
  setShowCrisisProtocol(true)
}
```

---

## ♿ Accessibilité

### Standards Respectés

- ✅ WCAG 2.1 Level AA
- ✅ ARIA labels complets
- ✅ Navigation clavier
- ✅ Lecteurs d'écran
- ✅ `prefers-reduced-motion`

### Attributs ARIA

```jsx
<div 
  className="crisis-overlay" 
  role="dialog" 
  aria-labelledby="crisis-title" 
  aria-modal="true"
>
  <h1 id="crisis-title">Protocole de soutien immédiat</h1>
  ...
</div>
```

---

## 📱 Responsive

### Breakpoints

- **Mobile** : < 768px
  - Boutons en colonne unique
  - Tabs verticaux
  - Plein écran

- **Desktop** : ≥ 768px
  - Grid 2 colonnes pour boutons
  - Tabs horizontaux
  - Modal centré

---

## 🧪 Tests

### Checklist de test

- [ ] Déclenchement automatique (détresse ≥ 75)
- [ ] Déclenchement manuel (bouton urgence)
- [ ] Tous les boutons d'appel fonctionnels
- [ ] Exercices de respiration animés
- [ ] Technique 5-4-3-2-1 lisible
- [ ] Ancrage corporel clair
- [ ] Confirmation de sortie
- [ ] Navigation clavier
- [ ] Lecteur d'écran
- [ ] Mobile responsive
- [ ] Logs RGPD

---

## 📚 Références

### Numéros d'urgence France

- **3114** - Numéro National de Prévention du Suicide
- **15** - SAMU (urgences médicales)
- **112** - Numéro d'urgence européen
- **01 45 39 40 00** - SOS Amitié

### Techniques de grounding

- **5-4-3-2-1** - Technique sensorielle d'ancrage
- **Respiration** - Régulation du système nerveux
- **Ancrage corporel** - Connexion au moment présent

---

## 🤝 Contribution

### Avant de modifier

1. Lire cette documentation
2. Comprendre les principes thérapeutiques
3. Tester sur mobile ET desktop
4. Vérifier l'accessibilité
5. Respecter le design thérapeutique

### Interdictions absolues

- ❌ Pas de rouge vif ou couleurs agressives
- ❌ Pas d'animations brusques
- ❌ Pas de sons d'alarme
- ❌ Pas de compte à rebours stressant
- ❌ Pas de messages culpabilisants

---

## 📞 Support

Pour toute question sur le protocole de crise :
- Consulter cette documentation
- Voir `backend/modules/grief/intentions.json`
- Tester la démo : `?demo=crisis`

---

**Le protocole de crise sauve des vies. Chaque détail compte.** 🚨