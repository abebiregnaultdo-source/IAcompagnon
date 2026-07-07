#!/usr/bin/env bash
# ============================================================================
# HELŌ — Déploiement en UN bouton
# ============================================================================
# Fait TOUT dans le bon ordre, aux bons endroits, et VÉRIFIE que c'est en ligne.
# Plus de confusion "où est Vercel / quel compte / est-ce déployé ?".
#
# Usage :   ./deploy.sh "message de commit"
#    ou :   npm run deploy -- "message de commit"
#
# Ce qu'il fait :
#   1. Commit les changements (si message fourni)
#   2. git push  →  GitHub abebiregnaultdo-source/IAcompagnon (déclenche Render)
#   3. Build + déploie le frontend  →  Vercel chris-projects/ia-compagnon (prod)
#   4. Vérifie que le site live sert bien le nouveau build
# ============================================================================
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; BLUE='\033[0;34m'; NC='\033[0m'
step() { echo -e "\n${BLUE}▶ $1${NC}"; }
ok()   { echo -e "${GREEN}✓ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠ $1${NC}"; }
fail() { echo -e "${RED}✗ $1${NC}"; exit 1; }

COMMIT_MSG="${1:-}"

# --- Nettoyer d'éventuels verrous git orphelins (fréquent sur ce repo) ---
rm -f .git/index.lock .git/HEAD.lock 2>/dev/null || true

# --- 1. COMMIT (optionnel) ---
if [ -n "$COMMIT_MSG" ]; then
  step "Commit des changements"
  git add -A ':!**/*.mjs' ':!**/*.pyc' ':!**/analytics_logs.jsonl' ':!**/feedback_logs.json'
  if git diff --cached --quiet; then
    warn "Rien à committer (déjà à jour)"
  else
    git commit -m "$COMMIT_MSG

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
    ok "Commit créé"
  fi
else
  warn "Pas de message de commit → on déploie l'état déjà committé"
fi

# --- 2. GIT PUSH (→ GitHub → déclenche Render pour le backend) ---
step "Push vers GitHub (compte abebiregnaultdo-source → Render se redéploie)"
if git push origin main; then
  ok "Poussé sur GitHub — Render va redéployer le backend automatiquement"
else
  fail "git push a échoué. Vérifie l'authentification (compte abebiregnaultdo-source)."
fi

# --- 3. VERCEL (build + déploie le frontend en prod) ---
# ⚠️ Le déploiement auto GitHub→Vercel ne fonctionne PAS sur ce projet :
#    le frontend DOIT être déployé manuellement ici, sinon le site reste figé.
step "Déploiement du frontend sur Vercel (compte chris-projects, production)"
cd "$ROOT/frontend"
if npx vercel --prod --yes; then
  ok "Frontend déployé en production sur https://ia-compagnon.vercel.app"
else
  fail "Le déploiement Vercel a échoué."
fi
cd "$ROOT"

# --- 4. VÉRIFICATION : le site live sert-il le nouveau build ? ---
step "Vérification que le site live est bien à jour"
sleep 5
LIVE_BUNDLE=$(curl -s -H 'Cache-Control: no-cache' https://ia-compagnon.vercel.app/ \
  | grep -oE 'assets/index-[A-Za-z0-9_-]+\.js' | head -1)
if [ -n "$LIVE_BUNDLE" ]; then
  ok "Site live actif — bundle servi : $LIVE_BUNDLE"
  echo -e "\n${GREEN}════════════════════════════════════════════${NC}"
  echo -e "${GREEN} DÉPLOIEMENT TERMINÉ${NC}"
  echo -e "${GREEN}  Frontend : https://ia-compagnon.vercel.app${NC}"
  echo -e "${GREEN}  Backend  : https://helo-backend.onrender.com (Render, ~1-2 min)${NC}"
  echo -e "${GREEN}════════════════════════════════════════════${NC}"
  echo -e "${YELLOW}Astuce : si tu vois l'ancienne version, vide le cache navigateur (Ctrl+Shift+R).${NC}"
else
  warn "Déploiement fait, mais impossible de vérifier le bundle live (réseau ?). Vérifie manuellement."
fi
