# 🚀 QUICK START - Helō

## ⚡ Démarrage Rapide (1 clic)

### Windows
```bash
start_all_services.bat
```

Cela va :
1. ✅ Installer toutes les dépendances
2. ✅ Démarrer les 4 services backend (ports 8000-8003)
3. ✅ Démarrer le frontend (port 5173)
4. ✅ Ouvrir l'application dans votre navigateur

---

## 📋 Démarrage Manuel

### Prérequis
- Python 3.9+
- Node.js 18+
- Git

### 1. Backend Services

**Terminal 1 - API Gateway (port 8000)**
```bash
cd backend/api-gateway
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - AI Engine (port 8001)**
```bash
cd backend/ai-engine
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8001
```

**Terminal 3 - Emotions Service (port 8002)**
```bash
cd backend/emotions-service
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8002
```

**Terminal 4 - Voice Service (port 8003)**
```bash
cd backend/voice-service
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8003
```

### 2. Frontend

**Terminal 5 - Frontend (port 5173)**
```bash
cd frontend
npm install
npm run dev
```

### 3. Ouvrir l'application
```
http://localhost:5173
```

---

## 👤 Créer un Compte Test

1. **Ouvrir** http://localhost:5173
2. **Cliquer** sur "Créer un compte"
3. **Remplir** :
   - Prénom : Test
   - Email : test@example.com
   - Mot de passe : test123
   - ✅ Cocher consentement
4. **Cliquer** "Créer mon compte"
5. **Onboarding** : Répondre aux questions
6. **Chat** : Commencer la conversation

---

## 🎯 Parcours Utilisateur Complet

### 1. Landing Page
- Présentation Helō
- "Commencer" → Auth

### 2. Authentification
- Créer compte ou se connecter
- Consentement RGPD

### 3. Onboarding (5 étapes)
- Relation avec la personne décédée
- Circonstances du décès
- Temps écoulé
- Soutien actuel
- Objectifs thérapeutiques

### 4. Interface Principale

**Header:**
- Logo Helō
- Bouton "📚 Ressources"
- Bouton "⚙️ Paramètres"
- Bouton urgence (🆘)

**Chat:**
- Messages SMS-style
- Détection automatique méthode thérapeutique
- Analyse émotionnelle temps réel
- Safety monitoring

**Settings (⚙️):**
- Mode conversation : Chat / Voix
- Voix IA : Choix parmi 10+ voix françaises
- Vitesse voix : 0.5x - 2x
- Tonalité voix : -10 à +10

### 5. Mode Voix (si activé)
- Interface visio-style
- Avatar 3D réactif
- Bouton appel/raccrocher
- Transcription temps réel
- STT (Whisper) + TTS (Piper/Edge)

### 6. Ressources
- Numéros d'urgence
- Associations de soutien
- Articles sur le deuil
- Exercices de grounding

---

## 🧪 Tester les Méthodes Thérapeutiques

### TIPI (Activation Somatique)
**Message utilisateur :**
> "J'ai une boule dans la gorge qui ne part pas, c'est serré dans ma poitrine"

**Résultat attendu :**
- ✅ Détection TIPI
- ✅ Variation somatique
- ✅ Questions sur sensations corporelles

### ACT (Fusion Cognitive)
**Message utilisateur :**
> "Je suis nul, je n'y arriverai jamais, c'est impossible"

**Résultat attendu :**
- ✅ Détection ACT
- ✅ Exercice de défusion
- ✅ Métaphore des pensées

### Journaling (Non-dits)
**Message utilisateur :**
> "Je regrette tellement de ne pas lui avoir dit que je l'aimais"

**Résultat attendu :**
- ✅ Détection Journaling
- ✅ Proposition lettre non envoyée
- ✅ Protocole Pennebaker

### Safety Monitor (Détresse élevée)
**Message utilisateur :**
> "Je ne peux plus, c'est trop dur, je veux que ça s'arrête"

**Résultat attendu :**
- ✅ Détection détresse > 85
- ✅ Protocole crise activé
- ✅ Numéros d'urgence affichés

---

## 📊 Vérifier que tout fonctionne

### Backend
```bash
# API Gateway
curl http://localhost:8000/api/modules

# AI Engine
curl http://localhost:8001/health

# Emotions Service
curl http://localhost:8002/health

# Voice Service
curl http://localhost:8003/health
```

### Frontend
- Ouvrir http://localhost:5173
- Console navigateur : pas d'erreurs
- Network : requêtes vers localhost:8000

---

## 🐛 Dépannage

### Port déjà utilisé
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Module Python manquant
```bash
pip install <module>
```

### Erreur CORS
- Vérifier que tous les services sont démarrés
- Vérifier les URLs dans frontend/src/ui/App.jsx

### EmotionBERT ne charge pas
- Première utilisation : téléchargement modèle (~500MB)
- Attendre 2-3 minutes

---

## ✅ Checklist Opérationnel

- [ ] 5 services démarrés (8000, 8001, 8002, 8003, 5173)
- [ ] Frontend accessible http://localhost:5173
- [ ] Compte test créé
- [ ] Onboarding complété
- [ ] Message envoyé dans chat
- [ ] Réponse IA reçue
- [ ] Settings accessible
- [ ] Mode voix testable
- [ ] Ressources accessibles
- [ ] Bouton urgence fonctionne

---

**APP 100% OPÉRATIONNELLE** 🎉

