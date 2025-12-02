# ✅ TODO BETA - IAcompagnon (Helō)

## 🎯 **État Global : 85% Prêt**

---

## ✅ **TERMINÉ (100%)**

### Infrastructure & Code
- ✅ Stripe billing system (models + endpoints + webhooks)
- ✅ Mode vocal accessible (boutons Home + Chat)
- ✅ Piper TTS (Open Source) intégré
- ✅ VoiceChat.jsx complet (WebSocket + STT/TTS)
- ✅ Avatar 3D avec overlay fullscreen
- ✅ SQLAlchemy + database init
- ✅ SubscriptionBanner UI
- ✅ Fichier .env créé
- ✅ Documentation complète (BETA_DEPLOYMENT.md, VOICE_SETUP.md, SOLUTIONS_VOCALES_OPEN_SOURCE.md)

---

## 🔴 **CRITIQUE - À faire AVANT beta**

### 1. Configuration Stripe Webhook ⚠️ URGENT
**Statut** : Variables configurées mais webhook pas encore créé

**Ce qui manque** :
- [ ] Créer webhook sur Stripe Dashboard
- [ ] Configurer URL publique (avec ngrok pour test local)
- [ ] Copier `STRIPE_WEBHOOK_SECRET` dans `.env`
- [ ] Tester webhooks (event test)

**Impact** : Sans ça, pas de synchronisation abonnements
**Temps estimé** : 15 minutes
**Voir** : [Section détaillée ci-dessous](#stripe-webhook-setup)

---

### 2. Greeting/Summarizer non intégrés
**Statut** : Code créé mais pas appelé dans le flow

**Ce qui manque** :
- [ ] Intégrer `ContextualGreeting` dans `/api/chat`
- [ ] Intégrer `SessionSummarizer` après 10+ messages
- [ ] Tester greetings personnalisés

**Impact** : Pas de greetings contextuels
**Temps estimé** : 30 minutes
**Fichier à modifier** : `backend/ai-engine/app/main.py`

---

## 🟡 **IMPORTANT - À faire pour beta complète**

### 3. Tester les services
- [ ] Lancer tous les services (`start_all_services.bat`)
- [ ] Tester chat SMS
- [ ] Tester mode vocal (bouton 📞)
- [ ] Tester Piper TTS (voix)
- [ ] Tester Stripe checkout flow
- [ ] Tester sur mobile

**Temps estimé** : 1 heure

### 4. Clés API en production
**Statut** : Clés de test OK, prod à configurer plus tard

Dans `.env`, actuellement :
- ✅ `OPENAI_API_KEY` : Configuré
- ⚠️ `ANTHROPIC_API_KEY` : Placeholder (à remplacer si besoin Claude)
- ✅ `STRIPE_SECRET_KEY` : Mode test OK
- ⚠️ `STRIPE_WEBHOOK_SECRET` : À générer (voir section webhook)

**Pour prod** : Basculer clés test → prod

---

## 🟢 **OPTIONNEL - Nice to have**

### 5. Voice Service avec Docker
- [ ] Build Docker image : `docker build -t iacompagnon-voice .`
- [ ] Run container : `docker run -p 8003:8003 iacompagnon-voice`
- [ ] Tester `/health` endpoint

**Avantage** : Isolation + modèle Piper auto-téléchargé
**Alternative** : Lancer manuellement (fonctionne aussi)

### 6. Améliorer documentation
- [ ] Screenshots de l'interface
- [ ] Vidéo démo mode vocal
- [ ] Guide utilisateur final

---

# 🔥 **STRIPE WEBHOOK SETUP (Détaillé)** {#stripe-webhook-setup}

## Pourquoi c'est nécessaire ?

Les webhooks Stripe permettent de :
- ✅ Synchroniser statut abonnement (actif/annulé/expiré)
- ✅ Débloquer features après paiement
- ✅ Gérer fin de trial automatiquement
- ✅ Logger événements billing

**Sans webhook** : L'app ne sait pas quand un paiement réussit → utilisateur reste bloqué même après paiement ❌

---

## Option 1 : Test Local avec ngrok (Développement) ⚡ RECOMMANDÉ

### Étape 1 : Installer ngrok

```bash
# Windows (avec Chocolatey)
choco install ngrok

# Ou télécharger : https://ngrok.com/download
```

### Étape 2 : Lancer API Gateway

```bash
cd backend/api-gateway
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Étape 3 : Créer tunnel ngrok

**Nouveau terminal** :
```bash
ngrok http 8000
```

**Tu verras** :
```
Forwarding  https://abc123.ngrok.io -> http://localhost:8000
```

📋 **Copie l'URL HTTPS** (exemple : `https://abc123.ngrok.io`)

### Étape 4 : Configurer webhook sur Stripe

1. Va sur **Stripe Dashboard** : https://dashboard.stripe.com/test/webhooks
2. Clique **"Add endpoint"**
3. **Endpoint URL** : Colle ton URL ngrok + `/api/webhooks/stripe`
   ```
   https://abc123.ngrok.io/api/webhooks/stripe
   ```
4. **Description** : `IAcompagnon local dev`
5. **Events to send** : Sélectionne ces 3 événements :
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
6. Clique **"Add endpoint"**

### Étape 5 : Copier le Webhook Secret

1. Dans l'endpoint créé, clique sur **"Reveal"** dans "Signing secret"
2. Tu verras quelque chose comme : `whsec_abc123...`
3. **Copie cette valeur**
4. Ouvre `.env` et remplace :
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_abc123...  # ← Colle ici
   ```
5. **Redémarre API Gateway** pour prendre en compte

### Étape 6 : Tester le webhook

Dans Stripe Dashboard, clique **"Send test webhook"** :
- Choisis `checkout.session.completed`
- Clique **"Send test webhook"**

**Logs API Gateway** devraient montrer :
```
INFO: Webhook received: checkout.session.completed
INFO: Subscription activated for user_xxx
```

✅ **Si tu vois ça, webhook fonctionne !**

---

## Option 2 : Production (Déploiement) 🚀

### Si ton app est déployée sur un serveur :

1. Va sur **Stripe Dashboard** : https://dashboard.stripe.com/webhooks (mode production)
2. **Endpoint URL** : URL publique de ton serveur
   ```
   https://iacompagnon.com/api/webhooks/stripe
   ```
3. Même config que ci-dessus (3 événements)
4. Copie `STRIPE_WEBHOOK_SECRET` en production
5. Teste avec "Send test webhook"

---

## Option 3 : Stripe CLI (Alternative) 🛠️

### Si tu préfères Stripe CLI :

```bash
# Installer Stripe CLI
# Windows: https://github.com/stripe/stripe-cli/releases

# Forward webhooks vers local
stripe listen --forward-to localhost:8000/api/webhooks/stripe

# Tu verras le webhook secret dans la console :
# whsec_abc123...
```

Copie ce secret dans `.env` → `STRIPE_WEBHOOK_SECRET`

---

## ⚠️ Important : ngrok URL change à chaque redémarrage

**Problème** : L'URL ngrok gratuite change à chaque fois

**Solutions** :
1. **Ngrok payant** (~5$/mois) : URL fixe
2. **Mettre à jour webhook** à chaque session dev
3. **Utiliser Stripe CLI** (forward automatique)
4. **Déployer sur serveur** avec URL fixe (production)

---

## 🧪 Comment tester le système complet ?

### Test 1 : Trial automatique (Nouveau user)

```bash
# Créer un nouveau user dans l'app
# → Devrait voir "14 jours d'essai gratuit"

# Vérifier en DB
curl "http://localhost:8000/api/subscription/status?user_id=NEW_USER_ID"

# Devrait retourner :
{
  "plan": "premium",
  "status": "trial",
  "days_remaining": 14,
  "trial_end": "2025-12-16T..."
}
```

### Test 2 : Checkout flow

```bash
# Frontend : Cliquer "Choisir ma formule" → "Standard"
# → Redirige vers Stripe Checkout

# Dans Stripe test mode, utiliser carte test :
# 4242 4242 4242 4242
# Expiration : n'importe quelle date future
# CVC : 123

# Après paiement → Webhook déclenché → Statut = active
```

### Test 3 : Vérifier webhook reçu

```bash
# Logs API Gateway montreront :
INFO: Webhook received: checkout.session.completed
INFO: Processing checkout session: cs_test_...
INFO: Subscription created/updated for user_xxx
```

---

## 📋 Variables `.env` finales Stripe

```bash
# Stripe API Keys (mode test pour dev)
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_STRIPE_TEST

STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_PUBLIQUE_STRIPE

# Webhook Secret (à générer via Stripe Dashboard ou ngrok)
STRIPE_WEBHOOK_SECRET=whsec_XXXX  # ← À REMPLACER après config webhook

# Price IDs (à créer dans Stripe Dashboard)
STRIPE_PRICE_BASIQUE=price_VOTRE_PRICE_ID_BASIQUE
STRIPE_PRICE_STANDARD=price_VOTRE_PRICE_ID_STANDARD
STRIPE_PRICE_PREMIUM=price_VOTRE_PRICE_ID_PREMIUM

# Frontend URL (pour redirections post-checkout)
FRONTEND_URL=http://localhost:5173
```

---

## 🎯 Prochaines étapes recommandées

1. **Maintenant** : Configure webhook avec ngrok (15 min)
2. **Après** : Teste le flow complet (30 min)
3. **Optionnel** : Intègre greeting/summarizer (30 min)
4. **Déploiement** : Remplace ngrok par URL prod

---

## ✅ Checklist Beta Finale

- [x] Stripe billing system
- [x] Mode vocal (boutons + VoiceChat)
- [x] Piper TTS intégré
- [ ] Stripe webhook configuré ⚠️ URGENT
- [ ] Greeting/summarizer intégrés (optionnel)
- [ ] Tests complets (chat + vocal + billing)
- [ ] Déploiement production

**Statut** : 85% → 100% avec webhook configuré

---

**Questions ?** Dis-moi si tu veux que je t'aide avec :
- Configuration ngrok
- Tests webhooks
- Intégration greeting/summarizer
- Déploiement production
