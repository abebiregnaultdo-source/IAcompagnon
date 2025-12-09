# Notes Projet HELŌ - IAcompagnon

## Déploiement

### Git (Code source)
- **Remote origin** : `abebiregnaultdo-source/IAcompagnon`
- **Commande** : `git push origin main`
- **Auth** : Utilise les credentials GitHub de abebiregnaultdo-source

### Vercel (Frontend)
- **Projet** : `chris-projects-8e78a4a1/ia-compagnon`
- **URL prod** : https://ia-compagnon.vercel.app
- **Commande** : `cd frontend && npx vercel --prod`
- **Note** : Vercel n'est PAS connecté au repo Git, on déploie manuellement via CLI

### Render (Backend)
- **URL** : https://helo-backend.onrender.com
- **Déploiement** : Automatique depuis le repo Git (probablement abebiregnaultdo-source)
- **Variables d'env** : OPENAI_API_KEY, ANTHROPIC_API_KEY configurées sur Render

## Workflow de déploiement

1. **Commit le code** : `git add . && git commit -m "message"`
2. **Push sur GitHub** : `git push origin main`
3. **Déployer frontend** : `cd frontend && npx vercel --prod`
4. **Backend** : Se redéploie automatiquement sur Render après push

## URLs importantes

- **App** : https://ia-compagnon.vercel.app
- **Admin Dashboard** : https://ia-compagnon.vercel.app/?admin=helo2024admin
- **Backend API** : https://helo-backend.onrender.com
- **Health check** : https://helo-backend.onrender.com/health

## Authentification requise

Si git push demande une authentification :
- **Compte** : abebiregnaultdo-source (PAS growchris)
- **Méthode** : Token GitHub ou credentials configurés
