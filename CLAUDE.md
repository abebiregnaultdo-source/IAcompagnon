# Instructions Claude pour le projet HELŌ

## Documentation

- **État de l'art, design, méthodes** : `ETAT_DE_LART.md`
- **Architecture technique** : `ARCHITECTURE_COMPLETE.md`

## Déploiement

| Action | Commande | Compte/Auth |
|--------|----------|-------------|
| Git push | `git push origin main` | abebiregnaultdo-source |
| Vercel deploy | `cd frontend && npx vercel --prod --yes` | chris-projects (auto) |
| Backend | Automatique sur push GitHub (Render) | - |

### Si authentification Git demandée :
- **Utiliser** : `abebiregnaultdo-source` (PAS growchris)
- **Avertir l'utilisateur** : "Git va demander l'authentification pour le compte abebiregnaultdo-source"

## URLs Production

| Service | URL |
|---------|-----|
| Frontend | https://ia-compagnon.vercel.app |
| Admin | https://ia-compagnon.vercel.app/?admin=helo2024admin |
| Backend | https://helo-backend.onrender.com |
| Voice Service | Non déployé (fallback en place) |

## Principes Clés à Respecter

### Avatar (CRITIQUE)
- **Jamais** d'expressions faciales, réactions, ou mouvements expressifs
- Seule animation autorisée : respiration subtile (6s cycle)
- Voir section 4 de `ETAT_DE_LART.md`

### Design
- **Jamais** de blanc pur (#FFFFFF) ou noir pur (#000000)
- Transitions minimum 0.3s
- Saturation < 30%

### Anti-Hallucination
- Ne jamais supposer ce que l'utilisateur vit
- Attendre qu'il nomme sa situation
- Voir section 8.2 de `ETAT_DE_LART.md`
