# Mandalas (assets)

Ce dossier contient des mandalas SVG utilisés par l'outil de coloriage thérapeutique.

Objectifs:
- Fournir des motifs apaisants, répétitifs et non figuratifs adaptés à la thérapie par coloriage.
- Permettre d'ajouter rapidement des collections de mandalas open-source (Wikimedia, Openclipart, générateurs libres).

Recommandations de sources open-source pour mandalas:

- Wikimedia Commons (rechercher "mandala svg") — souvent licences PD/CC
- Openclipart (https://openclipart.org) — beaucoup d'illustrations en domaine public
- GitHub: "mandala-generator" projets (génèrent SVG procéduralement)

Licence et précautions:
- Préférez les images sous licence CC0 / domaine public ou CC-BY avec attribution.
- Évitez les œuvres protégées par droit d'auteur sans permission.

Comment ajouter un mandala:

1. Placez le fichier SVG dans ce dossier `frontend/public/mandalas/`.
2. Ajoutez une entrée au fichier `manifest.json` avec le champ `name`, `src` (chemin relatif `/mandalas/xxx.svg`) et `tags`.
3. Si vous souhaitez que le mandala soit directement disponible dans l'éditeur de coloriage, ajoutez également une entrée correspondante dans `frontend/src/ui/creativity/Mandalas.js` (champ `id`, `name`, `protocol`, `svg`).

Exemple `manifest.json` entry:

```json
{
  "name": "Nom du mandala",
  "src": "/mandalas/nom-du-mandala.svg",
  "tags": ["calm", "floral"]
}
```

Script rapide pour générer `manifest.json` à partir des SVG (PowerShell):

```powershell
Get-ChildItem -Path . -Filter *.svg | ForEach-Object {
  @{ name = $_.BaseName; src = "/mandalas/" + $_.Name; tags = @() }
} | ConvertTo-Json -Depth 3 > manifest.json
```

Test manuel:
1. Démarrer le frontend: `cd frontend && npm run dev`
2. Ouvrir la page Créativité → Coloring
3. Le sélecteur affichera les mandalas présents dans `Mandalas.js` et `manifest.json`.

Si tu veux, je peux:
- Télécharger automatiquement des mandalas open-source et les ajouter (nécessite accès internet),
- Ou générer un plus grand jeu de motifs procéduraux directement dans `Mandalas.js`.
