# Évaluation qualité thérapeutique — helō (Loop 1)

Harnais d'auto-évaluation de la qualité des réponses de helō contre les critères
définis dans le prompt (`backend/ai-engine/app/therapeutic_engine.py`).

## Principe (LLM-as-a-judge + boucle d'amélioration)

1. **Générer** — pour chaque cas de test (`cas_test.json`), obtenir la réponse de helō.
2. **Juger** — 3 juges cliniciens IA indépendants notent chaque réponse contre les 5 critères
   (score /10, comptage des questions, respect anti-hallucination).
3. **Itérer** (optionnel) — si un score cible n'est pas atteint, patcher le prompt,
   régénérer, re-juger, jusqu'à convergence ou plafond.

## Historique des évaluations

- **2026-07 (v1)** : score initial **7,8/10**. Défaut détecté : helō finit trop souvent
  par une question (règle « clôture » insuffisante).
- **Loop v1** — a prouvé qu'interdire brutalement les questions **casse l'anti-hallucination**
  (le modèle projette le vécu pour éviter de questionner). Diagnostic, pas solution.
- **Loop v2** — correctif affiné (« refléter les mots exacts + normaliser au général,
  ne jamais projeter le vécu, ne pas clôturer par une question, ne pas inventer de prénom »)
  → **8,65/10**, défaut de question éliminé. Correctif intégré au prompt le 2026-07
  (section « RÈGLE DE FIDÉLITÉ »).

## Enseignement clé

À très haute exigence, le juge IA ne distingue plus parfaitement « normaliser au général »
(souhaitable) de « projeter le vécu » (interdit) : certains « KO anti-hallucination » à 8,65
sont en réalité des normalisations légitimes. Le score réel est meilleur que le chiffre brut.
Lire les réponses, pas seulement les scores.

## Relancer

Le harnais tournait via un workflow multi-agents (Claude Code). Pour ré-évaluer après une
évolution du prompt : régénérer les réponses de helō sur les cas de `cas_test.json`, puis
faire juger par un panel de 3 juges contre les 5 critères ci-dessus. Étendre `cas_test.json`
pour couvrir plus de situations (deuil périnatal, conjoint, suicide d'un proche, deuil ancien…).

## Valeur

Au-delà de la qualité : c'est un **argument de crédibilité** pour partenaires (JALMALV) et
investisseurs — « nous évaluons systématiquement la qualité clinique de chaque réponse
contre des critères définis, en boucle ».
