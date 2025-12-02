# 🚀 Guide de Déploiement Beta - IAcompagnon (Helō)

## 📋 Checklist de Vérification Pré-Beta

### ✅ Intégrations Vérifiées

#### 1. Mode Vocal (Appel Visio) - 100% Fonctionnel
- ✅ **Backend Voice Service** complet avec STT/TTS
  - WebSocket temps réel (`/ws/voice/{user_id}`)
  - Whisper (STT) pour transcription
  - Edge TTS + Piper (TTS) pour synthèse
  - Support multi-voix (4 voix françaises Edge)
- ✅ **Frontend VoiceChat.jsx** : Interface complète
  - Enregistrement audio (MediaRecorder API)
  - Visualisation audio temps réel
  - Lecture audio synthétisée
  - Avatar 3D intégré
- ✅ **Boutons d'accès ajoutés** :
  - Home : Bouton "📞 Appel visio" (bien visible)
  - Chat : Bouton "🎤" pour basculer vers le vocal
- ✅ **Toggle SMS ↔ Appel** : Fonctionnel dans App.jsx

#### 2. Stripe Billing System
- ✅ **Models SQLAlchemy** : `Subscription` et `FeatureUsage` ([models_sql.py](backend/api-gateway/app/models_sql.py))
- ✅ **Endpoints** :
  - `GET /api/subscription/status` - Statut abonnement utilisateur
  - `POST /api/subscription/checkout` - Créer session Stripe
  - `POST /api/webhooks/stripe` - Webhooks Stripe
- ✅ **Routes intégrées** : Inclus dans [main.py](backend/api-gateway/app/main.py:104)
- ✅ **UI Component** : [SubscriptionBanner.jsx](frontend/src/ui/components/SubscriptionBanner.jsx)
- ✅ **Database init** : Automatic via SQLAlchemy `Base.metadata.create_all()`

#### 2. AI Engine Enhancements
- ✅ **Session Summarizer** : [session_summarizer.py](backend/ai-engine/app/session_summarizer.py)
  - Génère résumés structurés après 10+ messages
  - Stockage JSON dans `data/session_summaries/`
  - Contexte utilisateur enrichi (thèmes, insights, trajectoire)
- ✅ **Contextual Greeting** : [contextual_greeting.py](backend/ai-engine/app/contextual_greeting.py)
  - Messages d'accueil personnalisés selon historique
  - Délais depuis dernière session (même jour → 3+ mois)
  - Références aux thèmes et concerns précédents
- ⚠️ **Intégration dans flow** : Modules créés mais **pas encore câblés dans le endpoint `/generate`**

#### 3. Configuration & Infrastructure
- ✅ **Fichier .env créé** avec toutes les variables requises
- ✅ **SQLAlchemy ajouté** aux requirements
- ✅ **Database SQLite** configurée (path: `backend/api-gateway/app/app.db`)
- ✅ **Stripe webhook** endpoint prêt

---

## 🛠️ Configuration Requise

### 1. Variables d'Environnement (`.env`)

Le fichier `.env` à la racine contient toutes les configurations. **À compléter avant déploiement** :

```bash
# APIs IA
OPENAI_API_KEY=sk-...                    # ⚠️ À remplacer
ANTHROPIC_API_KEY=sk-ant-...             # ⚠️ À remplacer

# Stripe Billing
STRIPE_SECRET_KEY=sk_test_...            # ⚠️ À remplacer
STRIPE_PUBLISHABLE_KEY=pk_test_...       # ⚠️ À remplacer
STRIPE_WEBHOOK_SECRET=whsec_...          # ⚠️ À remplacer
STRIPE_PRICE_BASIQUE=price_...           # ⚠️ À créer dans Stripe
STRIPE_PRICE_STANDARD=price_...          # ⚠️ À créer dans Stripe
STRIPE_PRICE_PREMIUM=price_...           # ⚠️ À créer dans Stripe

# Sécurité
MASTER_KEY=your_32_char_key              # ⚠️ Générer clé sécurisée
FEEDBACK_ENC_KEY=another_32_char_key     # ⚠️ Générer clé sécurisée

# Database (SQLite par défaut, PostgreSQL pour production)
DATABASE_URL=sqlite:///./backend/api-gateway/app/app.db
```

### 2. Setup Stripe

#### Étape 1 : Créer les produits
1. Aller sur [Stripe Dashboard → Products](https://dashboard.stripe.com/products)
2. Créer 3 produits :
   - **Basique** : 9,90€/mois
   - **Standard** : 19,90€/mois
   - **Premium** : 29,90€/mois
3. Copier les **Price IDs** (format `price_xxxxx`) dans `.env`

#### Étape 2 : Configurer le webhook
1. Aller sur [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Créer endpoint : `https://votre-domaine.com/api/webhooks/stripe`
3. Écouter ces événements :
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copier le **Signing Secret** (`whsec_...`) dans `.env`

### 3. Installation des Dépendances

```bash
# Backend API Gateway
cd backend/api-gateway
pip install -r requirements.txt

# Backend AI Engine
cd backend/ai-engine
pip install -r requirements.txt

# Backend Emotions Service
cd backend/emotions-service
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

---

## 🚦 Démarrage des Services

### Méthode Automatique (Windows)
```bash
start_all_services.bat
```

### Méthode Manuel

**Terminal 1 - API Gateway (8000)**
```bash
cd backend/api-gateway
uvicorn app.main:app --port 8000 --reload
```

**Terminal 2 - AI Engine (8001)**
```bash
cd backend/ai-engine
uvicorn app.main:app --port 8001 --reload
```

**Terminal 3 - Emotions Service (8002)**
```bash
cd backend/emotions-service
uvicorn app.main:app --port 8002 --reload
```

**Terminal 4 - Voice Service (8003)** *(optionnel)*
```bash
cd backend/voice-service
uvicorn app.main:app --port 8003 --reload
```

**Terminal 5 - Frontend (5173)**
```bash
cd frontend
npm run dev
```

---

## 🧪 Tests Pré-Déploiement

### 1. Test Stripe Integration

```bash
# Test 1: Vérifier statut subscription (nouveau user = trial 14 jours)
curl "http://localhost:8000/api/subscription/status?user_id=test_user_123"

# Réponse attendue:
{
  "plan": "premium",
  "status": "trial",
  "days_remaining": 14,
  "features": {
    "chat": true,
    "vocal": true,
    "avatar": true,
    ...
  }
}
```

```bash
# Test 2: Créer session checkout
curl -X POST http://localhost:8000/api/subscription/checkout \
  -H "Content-Type: application/json" \
  -d '{"plan": "standard", "user_id": "test_user_123"}'

# Réponse attendue:
{
  "checkout_url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

### 2. Test AI Engine

```bash
# Test: Génération thérapeutique
curl -X POST http://localhost:8001/generate \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Je me sens triste aujourd'\''hui"}
    ],
    "profile": {"first_name": "Marie", "user_id_hash": "test123"},
    "policy": {"tone": "enveloppant", "phase": "exploration"}
  }'
```

### 3. Test Frontend

1. Ouvrir http://localhost:5173
2. Vérifier :
   - ✅ Banner d'essai s'affiche (14 jours restants)
   - ✅ Chat fonctionne
   - ✅ Bouton "Pricing" accessible
   - ✅ Radar émotionnel s'affiche

---

## ⚠️ Points d'Attention Beta

### 🔴 Critique (À résoudre avant beta)

1. **✅ RÉSOLU : Mode vocal accessible**
   - Boutons ajoutés dans Home et Chat
   - Toggle fonctionnel entre SMS et Appel

2. **Greeting/Summarizer non intégrés**
   - Les modules existent mais ne sont pas appelés dans `/generate`
   - **Action requise** : Intégrer dans le flow de conversation
   - Fichiers à modifier : [backend/ai-engine/app/main.py](backend/ai-engine/app/main.py)

2. **Clés API manquantes**
   - `.env` créé mais contient des placeholders
   - **Action requise** : Configurer vraies clés OpenAI, Anthropic, Stripe

3. **Stripe en mode test**
   - Actuellement configuré pour `sk_test_...`
   - **Action requise** : Basculer vers clés production pour vraie beta

### 🟡 Important (À surveiller)

4. **Database SQLite**
   - Bon pour beta locale
   - **Pour production** : migrer vers PostgreSQL
   - Migration : Changer `DATABASE_URL` dans `.env`

5. **Trial expiration email**
   - Champ `trial_ending_email_sent` existe dans `Subscription` model
   - **Pas implémenté** : Système d'envoi d'emails
   - **Action future** : Intégrer service email (SendGrid, etc.)

6. **Webhooks Stripe en local**
   - Nécessite tunnel (ngrok, localtunnel) pour tester en dev
   - **Pour production** : URL publique directe

### 🟢 Optionnel (Nice to have)

7. **Voice Service**
   - Implémenté mais optionnel pour beta
   - Frontend a déjà l'UI voice

8. **Analytics avancées**
   - Feature flag `advanced_analytics` existe
   - Pas d'UI dashboard analytics encore

---

## 📊 Features Beta Disponibles

### Pour tous les utilisateurs (Trial 14 jours)
- ✅ **Chat SMS-style** thérapeutique (8 méthodes evidence-based)
- ✅ **Mode Appel Visio** complet avec avatar 3D
  - 📞 Bouton "Appel visio" dans Home
  - 🎤 Bouton micro dans Chat pour basculer
  - Transcription temps réel (STT)
  - Voix naturelle (TTS)
  - 4 voix françaises disponibles
- ✅ Radar émotionnel temps réel
- ✅ Historique conversations (20 derniers messages)
- ✅ Outils créatifs (journal, narratifs, poèmes, rituels)
- ✅ Dashboard progression émotionnelle
- ✅ Ressources externes validées

### Après trial (selon plan choisi)

**Basique (9,90€/mois)**
- ❌ Chat et vocal désactivés
- ✅ Accès historique (lecture seule)
- ✅ Outils créatifs

**Standard (19,90€/mois)**
- ✅ Tout débloqué sauf analytics avancées

**Premium (29,90€/mois)**
- ✅ Tout débloqué + analytics + export

---

## 🔒 Sécurité Beta

### Données chiffrées
- ✅ User profiles : AES-256-GCM via `CryptoBox`
- ✅ Session logs : Chiffrement transparent
- ✅ Feedback logs : Chiffrement Fernet (si `FEEDBACK_ENC_KEY` fourni)

### RGPD Compliance
- ✅ Logs d'accès anonymisés (user_id_hash)
- ✅ Logs de consentement horodatés
- ✅ Pas de tracking tiers

### Safety Monitoring
- ✅ Alertes détresse ≥80 → log `alert_logs.jsonl`
- ✅ Suggestion 3114 si détresse critique
- ⚠️ **Pas d'envoi automatique** aux urgences (volontaire)

---

## 📱 URLs Beta

- **Frontend** : http://localhost:5173
- **API Gateway** : http://localhost:8000
- **Docs API** : http://localhost:8000/docs (Swagger auto-généré)
- **AI Engine** : http://localhost:8001
- **Emotions Service** : http://localhost:8002

---

## 🐛 Troubleshooting

### Erreur "Database not found"
```bash
# Supprimer la base et relancer pour recréer
rm backend/api-gateway/app/app.db
# Relancer API Gateway → tables créées automatiquement
```

### Erreur "Stripe key invalid"
- Vérifier que les clés dans `.env` sont bien celles du dashboard Stripe
- Mode test : clés commencent par `sk_test_` et `pk_test_`

### Erreur "OpenAI API key not configured"
- Le système fonctionne en mode fallback (dummy) sans clé
- Pour vraies réponses : configurer `OPENAI_API_KEY` et `ANTHROPIC_API_KEY`

### Frontend ne se connecte pas au backend
- Vérifier que tous les services backend sont lancés
- Check CORS : API Gateway autorise `*` (OK pour dev)

---

## 🎯 Prochaines Étapes Post-Beta

1. **Intégrer greeting/summarizer** dans le flow principal
2. **Implémenter email service** (trial ending, subscription confirmations)
3. **Migrer vers PostgreSQL** pour production
4. **Ajouter analytics dashboard** (plan Premium)
5. **Monitoring production** (Sentry, Datadog)
6. **Load testing** (locust, k6)
7. **CI/CD pipeline** (GitHub Actions)

---

## 📞 Support Beta

En cas de problème pendant la beta :
1. Vérifier les logs des services (terminals)
2. Consulter `backend/ai-engine/alert_logs.jsonl` pour alertes
3. Check `data/` pour persistence files

---

**Version** : 1.0.0-beta
**Date** : 2025-12-02
**Statut** : ✅ Prêt pour beta locale (avec complétion clés API)
