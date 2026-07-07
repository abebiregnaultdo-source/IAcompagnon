"""
Extracteur d'insights de vie — sédimentation du contexte patient.

Rôle : à la fin d'une session, extraire les FAITS DE VIE DURABLES que la personne
a explicitement nommés (deuils, événements, relations, peurs récurrentes) et les
fusionner dans profiles.conversation_insights, pour que Helō "connaisse" la
personne d'une session sur l'autre — comme un thérapeute qui se souvient.

Principes (décidés avec le fondateur) :
- Déclencheur : FIN DE SESSION (1 appel Haiku, hors chemin critique conversationnel).
- Stockage : profiles.conversation_insights (jsonb), avec FUSION/déduplication.
- Prudence : CONSERVATEUR STRICT. On n'extrait QUE l'explicite. Dans le doute, rien.
  Public vulnérable → un fait halluciné réinjecté ensuite ferait des dégâts.

L'extraction est faite par Haiku (rapide/économique) en sortie JSON structurée.
"""

from __future__ import annotations
from typing import Dict, Any, List, Optional
import json
import logging

logger = logging.getLogger(__name__)

# Modèle dédié : Haiku suffit pour de l'extraction structurée, et coûte ~20x moins
# que Sonnet. On ne met JAMAIS l'extraction sur le chemin critique de la réponse.
EXTRACTOR_MODEL = "claude-haiku-4-5-20251001"

# Types de faits qu'on accepte de mémoriser (durables, pas l'humeur du jour).
ALLOWED_FACT_TYPES = [
    "deuil",            # perte d'un proche (qui, quand si dit)
    "evenement",        # événement de vie marquant (grossesse, maladie, séparation…)
    "relation",         # lien important (famille, conjoint, rôle)
    "peur_recurrente",  # peur/inquiétude qui revient
    "contexte_medical", # situation médicale nommée
    "contexte_spirituel", # ancrage spirituel/culturel nommé
    "objectif",         # ce que la personne cherche/travaille
]

EXTRACTION_SYSTEM = """Tu es un module d'extraction clinique pour un compagnon thérapeutique.

Ta tâche : maintenir la liste consolidée des FAITS DE VIE DURABLES qu'une personne a EXPLICITEMENT énoncés, pour qu'ils soient mémorisés d'une séance à l'autre. On te donne les faits DÉJÀ CONNUS et une nouvelle conversation ; tu renvoies la liste COMPLÈTE et FUSIONNÉE.

## RÈGLES ABSOLUES (ordre d'importance)

1. **N'extrais QUE ce qui est explicitement dit.** Cité presque mot pour mot par la personne. Si ce n'est pas dit clairement, tu N'EXTRAIS RIEN. Dans le doute → rien.
2. **JAMAIS d'inférence, JAMAIS de supposition.** Tu ne déduis pas un divorce d'une "tristesse", ni un deuil d'une "perte" vague. Pas de psychologisation. Tu rapportes des faits nommés.
3. **Faits DURABLES uniquement**, pas l'état émotionnel du jour. "Elle a perdu son père en mars" = durable → OUI. "Elle est triste aujourd'hui" = éphémère → NON.
4. **Reste factuel et bref.** Un fait = une phrase courte, à la 3e personne, neutre. Pas d'interprétation thérapeutique.
5. **FUSIONNE, ne duplique pas.** Reprends TOUS les faits déjà connus, ajoute les nouveaux. Si un nouveau fait dit la MÊME chose qu'un fait connu (même s'il est formulé autrement — "a perdu son bébé précédemment" = "a perdu un bébé lors de la grossesse précédente"), garde UNE SEULE version, la plus précise. Le résultat ne doit contenir aucun doublon sémantique.

## FORMAT DE SORTIE (JSON strict, rien d'autre)

{
  "life_facts": [
    {"type": "deuil|evenement|relation|peur_recurrente|contexte_medical|contexte_spirituel|objectif", "fait": "phrase factuelle courte"}
  ]
}

Renvoie la liste COMPLÈTE consolidée (faits connus fusionnés + nouveaux). Si rien de durable n'a jamais été dit : {"life_facts": []}.
Ne renvoie que le JSON, aucun texte autour."""


def _dedup_facts(facts: List[Dict[str, str]]) -> List[Dict[str, str]]:
    """Déduplication simple par (type, fait normalisé)."""
    seen = set()
    out = []
    for f in facts:
        if not isinstance(f, dict):
            continue
        fait = str(f.get("fait", "")).strip()
        ftype = str(f.get("type", "")).strip()
        if not fait:
            continue
        key = (ftype, fait.lower())
        if key in seen:
            continue
        seen.add(key)
        out.append({"type": ftype, "fait": fait})
    return out


def extract_insights(
    llm_client,
    conversation_history: List[Dict[str, str]],
    existing_insights: Optional[Dict[str, Any]] = None,
    min_user_messages: int = 2,
) -> Optional[Dict[str, Any]]:
    """
    Extrait les faits de vie durables d'une session et les FUSIONNE avec l'existant.

    Args:
        llm_client: le LLMClient (doit exposer .anthropic_client).
        conversation_history: [{'role','content'}, ...] de la session.
        existing_insights: le conversation_insights actuel du profil (ou None).
        min_user_messages: seuil minimal pour lancer l'extraction (évite d'appeler
            Haiku sur une session trop courte / vide).

    Returns:
        Le nouveau conversation_insights (dict) si des faits existent ou existaient,
        sinon None (rien à sauvegarder). Ne lève jamais — l'extraction est best-effort.
    """
    existing = existing_insights if isinstance(existing_insights, dict) else {}

    # Ne lance rien sur une session trop maigre.
    user_msgs = [m for m in conversation_history if m.get("role") == "user"]
    if len(user_msgs) < min_user_messages:
        return existing or None

    # Client indisponible → on garde l'existant tel quel.
    client = getattr(llm_client, "anthropic_client", None)
    if client is None:
        logger.warning("insight_extractor: pas de client Anthropic, extraction ignorée")
        return existing or None

    # Construire la transcription pour Haiku (rôles lisibles).
    transcript = "\n".join(
        f"{'PERSONNE' if m.get('role') == 'user' else 'HELO'}: {m.get('content', '')}"
        for m in conversation_history
        if m.get("content")
    )[:12000]  # borne de sécurité

    # Faits déjà connus, fournis à Haiku pour qu'il FUSIONNE sémantiquement
    # (évite les quasi-doublons qu'une dédup par string ne rattraperait pas).
    known_facts = list(existing.get("life_facts", []))
    known_block = json.dumps({"faits_connus": known_facts}, ensure_ascii=False)

    consolidated: Optional[List[Dict[str, str]]] = None
    try:
        resp = client.messages.create(
            model=EXTRACTOR_MODEL,
            max_tokens=800,
            temperature=0.0,  # déterministe : on ne veut pas de créativité ici
            system=EXTRACTION_SYSTEM,
            messages=[{"role": "user", "content": (
                f"FAITS DÉJÀ CONNUS (à reprendre et fusionner) :\n{known_block}\n\n"
                f"NOUVELLE CONVERSATION à analyser :\n\n{transcript}"
            )}],
        )
        raw = resp.content[0].text.strip() if resp.content else "{}"
        # Robustesse : isoler le JSON même si le modèle ajoute du texte.
        start, end = raw.find("{"), raw.rfind("}")
        if start != -1 and end != -1:
            raw = raw[start:end + 1]
        parsed = json.loads(raw)
        candidate = parsed.get("life_facts", [])
        if isinstance(candidate, list):
            # Filtrer sur les types autorisés (défense en profondeur).
            consolidated = [
                {"type": str(f.get("type", "")).strip(), "fait": str(f.get("fait", "")).strip()}
                for f in candidate
                if isinstance(f, dict) and str(f.get("type", "")).strip() in ALLOWED_FACT_TYPES
                and str(f.get("fait", "")).strip()
            ]
    except Exception as e:
        logger.warning(f"insight_extractor: extraction échouée ({e}), on garde l'existant")
        return existing or None

    if consolidated is None:
        return existing or None

    # Haiku renvoie la liste DÉJÀ fusionnée → on la prend telle quelle (dédup exact
    # en filet, sans ré-ajouter les known_facts qui recréeraient des quasi-doublons).
    # Garde-fou : s'il renvoie vide alors qu'on avait des faits connus, c'est
    # probablement un raté d'extraction → on préserve l'existant plutôt que d'effacer.
    if not consolidated and known_facts:
        logger.warning("insight_extractor: sortie vide malgré des faits connus, existant préservé")
        return existing or None

    merged_facts = _dedup_facts(consolidated)

    if not merged_facts and not existing.get("initial_reason"):
        return None  # rien à mémoriser

    result = dict(existing)
    result["life_facts"] = merged_facts
    return result
