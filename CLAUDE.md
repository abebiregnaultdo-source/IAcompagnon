# Instructions Claude pour le projet HELŌ

## IMPORTANT - Avant chaque commit/push

Lis `EVOLUTION_LOG.md` pour les détails de déploiement et l'historique des modifications.

### Résumé rapide :

| Action | Commande | Compte/Auth |
|--------|----------|-------------|
| Git push | `git push origin main` | abebiregnaultdo-source |
| Vercel deploy | `cd frontend && npx vercel --prod` | chris-projects (auto) |
| Backend | Automatique sur Render | - |

### Si authentification Git demandée :
- **Utiliser** : `abebiregnaultdo-source` (PAS growchris)
- **Avertir l'utilisateur** : "Git va demander l'authentification pour le compte abebiregnaultdo-source"

### URLs
- Frontend : https://ia-compagnon.vercel.app
- Admin : https://ia-compagnon.vercel.app/?admin=helo2024admin
- Backend : https://helo-backend.onrender.com
