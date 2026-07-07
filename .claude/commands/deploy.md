# Commande de déploiement

Déploiement en UN bouton. Le script `deploy.sh` fait tout dans le bon ordre,
aux bons endroits, avec les bons comptes, et vérifie que c'est en ligne.

## Comment déployer

Exécute le script (depuis la racine du projet) :

```bash
./deploy.sh "message de commit"
```
ou, si l'utilisateur a des changements déjà committés :
```bash
./deploy.sh
```

Le script enchaîne automatiquement :
1. **Commit** (si un message est fourni) — exclut les artefacts (.mjs, .pyc, logs)
2. **git push** → GitHub `abebiregnaultdo-source/IAcompagnon` (déclenche Render pour le backend)
3. **Vercel** → build + déploie le frontend en production (`chris-projects/ia-compagnon`)
4. **Vérification** que le site live sert bien le nouveau build

## Points CRITIQUES à savoir

- ⚠️ **Le déploiement auto GitHub→Vercel NE FONCTIONNE PAS** sur ce projet.
  Le frontend DOIT être déployé manuellement via Vercel (ce que fait le script).
  Un simple `git push` ne suffit PAS à mettre le site à jour — d'où le script.
- **Render (backend)** se redéploie bien automatiquement sur push GitHub.
- Si git demande l'auth : compte **abebiregnaultdo-source**.
- Vercel : compte **chris-projects-8e78a4a1**, projet **ia-compagnon**.
- Verrous git orphelins fréquents : le script supprime `.git/*.lock` au démarrage.

## Si l'utilisateur dit juste "déploie" ou "/deploy"

Lance `./deploy.sh` (avec un message de commit si des changements ne sont pas
encore committés). Ne refais pas les étapes à la main — le script les couvre.
