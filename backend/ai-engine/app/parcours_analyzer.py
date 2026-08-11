"""
Analyseur de parcours — synthèse d'ÉVOLUTION à partir des conversations.

Rôle : lire l'ensemble des conversations d'une personne et produire une synthèse
de son cheminement (thèmes récurrents, ce qui émerge, ce qui s'apaise), pour que
« Mon parcours » reflète une évolution — pas un simple historique.

Pourquoi une IA plutôt que des mots-clés : le vocabulaire du deuil est infiniment
varié (deuil périnatal, perte d'un conjoint, grossesse après perte, peur
anticipatoire…). Des mots-clés figés ratent la plupart des formulations réelles.
Haiku lit le SENS, comme un thérapeute qui relit ses notes.

Principe de sécurité (public vulnérable) : on REFLÈTE les mots de la personne, on
ne DIAGNOSTIQUE jamais. Anti-hallucination : rien qui ne soit dans les échanges.
"""

from __future__ import annotations
from typing import Dict, Any, List, Optional
import json
import logging

logger = logging.getLogger(__name__)

ANALYZER_MODEL = "claude-haiku-4-5-20251001"

ANALYZER_SYSTEM = """Tu es un module d'analyse de parcours pour un compagnon d'accompagnement du deuil.

On te donne plusieurs conversations d'UNE personne, dans l'ordre chronologique. Tu produis une synthèse DOUCE de son cheminement, destinée à lui être montrée dans un écran « Mon parcours ».

## RÈGLES ABSOLUES
1. TU REFLÈTES, TU NE DIAGNOSTIQUES PAS. Jamais de terme clinique (« dépression », « deuil pathologique », « trouble »). Tu décris ce que la personne a exprimé, avec ses thèmes.
2. ANTI-HALLUCINATION : tu ne t'appuies QUE sur ce qui est réellement dit dans les conversations. Tu n'inventes aucun fait, aucune émotion non exprimée.
3. TON chaleureux, sobre, respectueux. Tu t'adresses à la personne (« vous » ou neutre). Pas de fausse positivité (« ça va s'arranger »).
4. Les THÈMES doivent être des formulations humaines et justes (ex : « la peur de revivre la perte », « le lien avec votre bébé », « la place dans la famille »), PAS des étiquettes techniques.

## SORTIE — JSON STRICT, rien d'autre :
{
  "themes_recurrents": ["3 à 5 thèmes courts qui reviennent le plus, formulés avec justesse et douceur"],
  "ce_qui_emerge": "une phrase sur un thème/fil qui apparaît plus récemment (ou null si rien de net)",
  "ce_qui_sapaise": "une phrase sur un thème qui semble revenir moins qu'avant (ou null si rien de net)",
  "reflet": "2-3 phrases de synthèse douce du cheminement, à la 2e personne, qui reflètent sans juger ni prédire"
}

Si les conversations sont trop pauvres (tests, messages vides), renvoie des listes vides et reflet="".
"""


def analyze_parcours(llm_client, conversations: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """
    Analyse les conversations et renvoie une synthèse d'évolution, ou None si
    l'analyse est impossible (pas de client, contenu trop pauvre).

    conversations : liste de dicts {created_at, messages:[{role, content}]}
    """
    client = getattr(llm_client, "anthropic_client", None)
    if client is None:
        logger.warning("parcours_analyzer: pas de client Anthropic")
        return None

    # Construire un condensé chronologique des messages de la personne.
    blocks = []
    for c in sorted(conversations, key=lambda x: str(x.get("created_at", ""))):
        user_msgs = [
            m.get("content", "")
            for m in (c.get("messages") or [])
            if m.get("role") == "user" and m.get("content")
        ]
        # Ignorer les conversations vides / de test.
        joined = " ".join(user_msgs).strip()
        if len(joined) < 20:
            continue
        date = str(c.get("created_at", ""))[:10]
        blocks.append(f"[{date}]\n" + "\n".join(f"- {m}" for m in user_msgs))

    if not blocks:
        return {"themes_recurrents": [], "ce_qui_emerge": None,
                "ce_qui_sapaise": None, "reflet": ""}

    transcript = "\n\n".join(blocks)[:14000]  # borne de sécurité

    try:
        resp = client.messages.create(
            model=ANALYZER_MODEL,
            max_tokens=600,
            temperature=0.2,
            system=ANALYZER_SYSTEM,
            messages=[{"role": "user", "content": (
                f"Voici les conversations de la personne, dans l'ordre chronologique :\n\n{transcript}"
            )}],
        )
        raw = resp.content[0].text.strip() if resp.content else "{}"
        start, end = raw.find("{"), raw.rfind("}")
        if start != -1 and end != -1:
            raw = raw[start:end + 1]
        parsed = json.loads(raw)
        # Normalisation défensive.
        return {
            "themes_recurrents": [str(t).strip() for t in (parsed.get("themes_recurrents") or []) if str(t).strip()][:5],
            "ce_qui_emerge": (parsed.get("ce_qui_emerge") or None),
            "ce_qui_sapaise": (parsed.get("ce_qui_sapaise") or None),
            "reflet": str(parsed.get("reflet") or "").strip(),
        }
    except Exception as e:
        logger.warning("parcours_analyzer: analyse échouée: %s", e)
        return None
