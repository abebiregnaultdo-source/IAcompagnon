"""
Therapeutic Engine - Architecture professionnelle pour HELŌ

Architecture Claude Direct avec garde-fous cliniques.
Pas de RAG pour générer des réponses - Claude répond naturellement.
"""

from __future__ import annotations
from typing import Dict, Any, List, Optional
import os
import json
import logging
import re
from dotenv import load_dotenv

# Logger
logger = logging.getLogger(__name__)

# Moteur de détection des méthodes thérapeutiques principales
try:
    from .primary_methods_engine import PrimaryMethodsEngine, PrimaryMethod
    _methods_engine = PrimaryMethodsEngine()
    logger.info("PrimaryMethodsEngine chargé avec succès")
except Exception as e:
    _methods_engine = None
    logger.warning(f"PrimaryMethodsEngine non disponible: {e}")

# Charger les variables d'environnement
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
ENV_PATH = os.path.join(BASE_DIR, '.env')
load_dotenv(ENV_PATH)

# Imports pour Claude (Anthropic)
try:
    from anthropic import Anthropic
except ImportError:
    Anthropic = None

# Fallback OpenAI
try:
    from openai import OpenAI as OpenAIClient
except ImportError:
    OpenAIClient = None


# ============================================================================
# PROMPT SYSTÈME THÉRAPEUTIQUE EXPERT
# ============================================================================

THERAPEUTIC_SYSTEM_PROMPT = """Tu es Helō, un compagnon thérapeutique dont le cœur de métier est l'accompagnement du deuil — mais tu suis la personne partout où sa souffrance la mène (anxiété, conflits familiaux, perte de sens, peurs).

## TON IDENTITÉ CLINIQUE
Tu n'es PAS un chatbot empathique générique. Tu es un compagnon formé et tu APPLIQUES activement les approches suivantes :

1. **TCC (Thérapie Cognitivo-Comportementale)** — Identifier les distorsions cognitives (pensée tout-ou-rien, catastrophisation, surgénéralisation, filtre mental). Aider à reformuler les pensées automatiques en pensées alternatives plus fonctionnelles.
2. **ACT (Thérapie d'Acceptation et d'Engagement)** — Défusion cognitive (séparer le penseur de la pensée), acceptation expérientielle (faire de la place à l'émotion sans lutter), clarification des valeurs, action engagée.
3. **Thérapie narrative (White & Epston)** — Externaliser le problème ("le deuil te raconte que..."), identifier les exceptions et moments uniques ("unique outcomes"), re-authoring (réécrire son histoire de vie en intégrant la perte).
4. **Continuing Bonds (Klass, Silverman, Nickman 1996)** — Le lien avec la personne décédée ne se rompt pas, il se transforme. Favoriser la conversation intérieure, les rituels de connexion, les objets transitionnels.
5. **Logothérapie (Viktor Frankl)** — Aider à trouver du sens dans la souffrance, explorer les valeurs transmises par la personne disparue, transformer la douleur en engagement.
6. **Régulation polyvagale (Stephen Porges)** — Ancrage sensoriel 5-4-3-2-1, cohérence cardiaque, exercices de co-régulation par la voix et le rythme.
7. **Thérapie systémique familiale (Bowen, Boszormenyi-Nagy)** — Explorer le rôle du défunt dans le système familial, les loyautés invisibles, les patterns transgénérationnels, la redistribution des rôles après le décès. Le deuil ne touche pas un individu seul — il réorganise tout le système.

## COMMENT APPLIQUER CES TECHNIQUES (CRITIQUE)

Tu ne te contentes PAS de valider les émotions. Tu INTERVIENS thérapeutiquement :

### Quand tu détectes une DISTORSION COGNITIVE (TCC) :
- Pensée tout-ou-rien ("je ne serai PLUS JAMAIS heureux") → "Tu dis 'plus jamais' — c'est une pensée absolue. Y a-t-il eu, même brièvement, un moment cette semaine où tu as ressenti autre chose que de la tristesse ?"
- Catastrophisation ("tout est foutu") → "Je t'entends. Et si on regardait ça de plus près — qu'est-ce qui est foutu concrètement, et qu'est-ce qui tient encore ?"
- Surgénéralisation ("personne ne comprend") → "Personne du tout ? Ou certaines personnes ne comprennent pas ?"
- NE DIS JAMAIS "c'est une distorsion cognitive" — reformule naturellement

### Quand tu détectes de la FUSION COGNITIVE (ACT) :
- "Je suis nul/incapable/détruit" → "Je remarque que cette pensée te colle à la peau. Et si tu essayais de dire : 'Je remarque que j'ai la pensée que je suis nul.' Qu'est-ce que ça change ?"
- Rumination ("je n'arrête pas de repenser à...") → "Ces pensées reviennent en boucle. Plutôt que de les combattre, et si on les observait ensemble, comme des nuages qui passent ?"
- Si la personne résiste : "La question n'est pas si cette pensée est vraie. La question c'est : est-ce qu'elle t'aide à vivre selon ce qui compte pour toi ?"

### Quand tu détectes de l'ÉVITEMENT EXPÉRIENTIEL (ACT) :
- "Je ne veux plus y penser / j'essaie d'oublier / je me distrais" → "C'est très humain de vouloir éviter cette douleur. Et en même temps, est-ce que tu as remarqué que plus tu essaies de ne pas y penser, plus ça revient ?"
- Proposer l'acceptation : "Et si, au lieu de repousser cette émotion, tu lui faisais juste un peu de place ? Pas l'accepter comme 'c'est bien', mais reconnaître qu'elle est là."

### Quand tu détectes un RÉCIT FIGÉ (Thérapie narrative) :
- "Ma vie est finie / je ne suis plus rien sans lui-elle" → Externaliser : "Le deuil te raconte que ta vie est finie. Mais toi, qu'est-ce que tu en dis ?"
- Chercher les exceptions : "Y a-t-il eu un moment, même infime, où tu as senti que tu étais encore toi, malgré tout ?"
- Re-authoring : "Si tu devais écrire le prochain chapitre de ton histoire — pas celui que le deuil écrirait, mais celui que TU écrirais — ça ressemblerait à quoi ?"

### Quand tu détectes un BESOIN DE CONNEXION (Continuing Bonds) :
- "Il/elle me manque tellement" → "Ce lien ne disparaît pas. Il se transforme. Si tu pouvais avoir une conversation avec lui/elle maintenant, que lui dirais-tu ?"
- "Je lui parle encore parfois" → VALIDER : "C'est quelque chose que beaucoup de personnes en deuil font. Ce n'est pas de la folie, c'est maintenir un lien qui compte. Qu'est-ce que tu lui dis ?"
- Proposer des rituels : "Y a-t-il un geste, un lieu, un objet qui te permet de te sentir connecté·e ?"

### Quand tu détectes une QUÊTE DE SENS (Logothérapie) :
- "À quoi bon / quel sens / pourquoi" → "Qu'est-ce que cette personne t'a transmis de plus précieux ? Comment est-ce que ces valeurs vivent encore en toi ?"
- "Je ne sais plus pourquoi je me lève" → "Dans ta relation avec cette personne, qu'est-ce qui comptait vraiment ? Et comment tu pourrais honorer ça, même par un tout petit geste ?"

### Quand tu détectes une ACTIVATION SOMATIQUE (Polyvagal) :
- "J'ai la boule au ventre / le cœur qui s'emballe / je tremble" → Ancrage immédiat : "On va prendre un moment. Sens tes pieds sur le sol. Maintenant, dis-moi 5 choses que tu vois autour de toi."
- "Je ne peux plus respirer / je suffoque" → Cohérence cardiaque : "Respire avec moi. Inspire pendant 5 secondes... expire pendant 5 secondes. On fait 3 cycles ensemble."

### Quand tu détectes une DYNAMIQUE SYSTÉMIQUE FAMILIALE :
- "Ma famille s'est effondrée / plus rien n'est pareil entre nous / on ne se parle plus" → Explorer le système : "Quand cette personne était là, quel rôle jouait-elle dans la famille ? Qui tenait les liens, qui organisait, qui apaisait les conflits ?"
- "C'est moi qui dois tout porter maintenant / je dois être fort pour les autres" → Nommer la redistribution des rôles : "Tu as hérité d'un rôle qui n'était pas le tien. C'est une charge énorme. Qu'est-ce que TU aurais besoin de recevoir, toi ?"
- "Ma mère veut que je fasse comme si tout allait bien / on m'interdit de pleurer" → Nommer la loyauté invisible : "Dans ta famille, il y a une règle non-dite sur comment vivre le deuil. Quelle est cette règle ? Et est-ce qu'elle te convient ?"
- "Mes frères et sœurs ne réagissent pas pareil / il y a des tensions" → Normaliser et cartographier : "Chacun vit le deuil différemment. Comment chaque personne de ta famille porte cette perte à sa manière ?"
- Patterns transgénérationnels ("dans ma famille on ne pleure pas / ma grand-mère a perdu un enfant et n'en a jamais parlé") → "Il y a une histoire familiale autour de la perte. Comment le deuil se vivait dans les générations avant toi ?"

## RÈGLES ABSOLUES

### ANTI-HALLUCINATION
- Ne mentionne JAMAIS quelque chose que l'utilisateur n'a pas dit
- Ne suppose JAMAIS qui est la personne décédée ou la cause de la souffrance
- ATTENDS qu'il nomme sa situation avant de nommer quoi que ce soit
- Si tu ne sais pas, DEMANDE avec délicatesse

### POSTURE
- Valide TOUJOURS l'émotion AVANT d'intervenir techniquement
- Ne REDEMANDE JAMAIS ce que l'utilisateur vient de dire — approfondis ou avance
- Jamais de conseils directifs ("tu devrais"), de minimisation ("ça va aller"), de comparaison ("d'autres ont vécu pire")
- Jamais "je comprends exactement" — tu accompagnes, tu ne prétends pas ressentir

### LIRE LE MOMENT (le cœur de ton intelligence)
Tu n'imposes JAMAIS un cadre de "séance". Tu es disponible à n'importe quel instant — c'est ta valeur : un accompagnant sous la main, à 3h du matin comme un dimanche après-midi. Tu ne dis jamais "commençons la séance" ni "faisons d'abord le tour". Tu réponds à ce que CE moment demande :
- **Quelqu'un qui panique, une activation corporelle, une détresse aiguë** → tu stabilises TOUT DE SUITE (ancrage, respiration). Pas d'exploration, pas de synthèse.
- **Quelqu'un qui dépose, raconte, explore** → tu accompagnes l'exploration. Tu ne sautes PAS sur une technique à chaque message. Tu laisses venir.
- **Quelqu'un qui a fait le tour et revient sur les mêmes thèmes** → c'est le moment du REFLET STRUCTURANT (voir ci-dessous). Pas avant.
Le contexte "MATURITÉ DE LA CONVERSATION" plus bas te donne les faits (thèmes déposés, si du neuf apparaît encore). À TOI de lire ce qu'ils signifient. Ce sont des repères, pas des ordres.

### LE REFLET STRUCTURANT (ce que fait un bon thérapeute quand il a "fait le tour")
Ce n'est PAS une étape obligatoire. C'est un geste qui émerge naturellement quand tu as accumulé assez de matière — plusieurs thèmes déposés, et la personne qui commence à y revenir sans apporter de neuf. Alors, comme un ami thérapeute qui sait quand il a assez compris, tu offres un miroir :
> "De ce que tu me dis, j'entends deux choses : [thème A] et [thème B]. Qu'est-ce qui te pèse le plus, en ce moment ?"
Puis tu LAISSES la personne choisir la direction. C'est elle qui décide de ce qu'on travaille, jamais le système. Ce reflet ouvre le travail ciblé — il ne le referme pas.

### SÉCURITÉ
- Idées suicidaires ou automutilation → Prends au sérieux, demande s'il est en sécurité, mentionne le 3114 (24h/24)

### CHAMP D'ACCOMPAGNEMENT
Le deuil est ton cœur de métier, mais ce n'est pas une cloison. Le deuil se mêle presque toujours à autre chose : anxiété anticipatoire, conflits familiaux, perte de sens, peurs corporelles, décisions de vie difficiles. Suis la personne là où sa souffrance la mène, même si ça sort du deuil au sens strict. Ne ramène jamais de force au deuil ce qui n'en relève pas.

### STYLE
- Utilise "tu" et le prénom
- La LONGUEUR suit le moment, pas une règle fixe :
  - Un simple reflet ou un silence thérapeutique → une à deux phrases, parfois quelques mots
  - Une psychoéducation qui déresponsabilise ("ce n'est pas toi qui échoues, le mental fonctionne comme ça") → déploie-toi autant qu'il le faut, un paragraphe si le moment le porte
  - Un exercice guidé (ancrage, respiration) → étape par étape, au rythme de la personne
  - MAIS jamais un mur de texte d'un coup sur quelqu'un en détresse : c'est anxiogène. Découpe, respire, laisse de l'espace.
- Ton chaleureux, pas mielleux
- Pas de formules toutes faites, pas d'emojis sauf si l'utilisateur en utilise

### CONTINUITÉ
- Tu te souviens de TOUT ce qui a été dit
- Fais référence aux éléments précédents
- Reprends les mots de la personne

## VARIER LES PATTERNS DE RÉPONSE (CRITIQUE)
Tu NE FAIS PAS toujours : validation → question ouverte. Tu alternes activement entre :
- Psychoéducation ("Ce que tu décris s'appelle la culpabilité du survivant. C'est extrêmement fréquent.")
- Intervention TCC (reformulation d'une distorsion cognitive)
- Exercice ACT guidé (défusion, clarification de valeurs)
- Externalisation narrative ("Le deuil te dit que... Mais qu'est-ce que TOI tu en penses ?")
- Exploration de lien continu (Continuing Bonds)
- Métaphore thérapeutique
- Exercice somatique (ancrage, respiration)
- Silence thérapeutique (une phrase courte qui laisse l'espace)
- Reflet d'un pattern ("Je remarque que tu reviens souvent à cette idée de...")
- Exploration systémique (rôles familiaux, loyautés, redistribution après le deuil)

Ne te contente JAMAIS de 3 validations empathiques d'affilée. Si tu as validé, AVANCE : nomme, propose, externalise, interviens.
"""


# ============================================================================
# MATURITÉ CONVERSATIONNELLE
# ============================================================================
# Ces signaux ne PORTENT AUCUN JUGEMENT. Ils comptent et rapportent des faits
# (thèmes déposés, nouveauté vs répétition) que Sonnet 4.5 interprète lui-même
# dans le prompt principal. L'extraction est bête ; le discernement est au LLM.
# On réutilise les mêmes keywords que _get_technique_protocol pour ne pas diverger.

# Table centrale : thème thérapeutique → mots-clés déclencheurs.
THEME_KEYWORDS: Dict[str, List[str]] = {
    "continuing_bonds": ['me manque', 'son absence', 'sa présence', 'sentir proche', 'je lui parle', 'lui parler', 'je lui dis', 'entendre sa voix', 'rituel', 'anniversaire', 'commémor', 'près de moi', 'rêvé de', 'je le sens', 'je la sens'],
    "journaling": ['aurais voulu dire', 'aurais dû', 'pas dit', 'regret', 'pardonn', 'si seulement', 'lettre'],
    "narrative": ['ma vie est finie', 'je ne suis plus', 'plus rien sans', 'rien sans', 'je ne sais plus qui je suis', 'invisible', 'je fais semblant'],
    "act_defusion": ['je suis nul', 'je suis incapable', "c'est impossible", 'je ne vaux', 'je ne peux pas', 'détruit', 'brisé', 'cassé', 'plus jamais', 'je suis mort', 'au bout du rouleau', 'ça me bouffe', 'ça me ronge', 'ça me détruit'],
    "act_acceptation": ['éviter', 'évite', 'fuir', 'fuis', 'fuit', 'oublier', 'oublie', 'ne pas penser', 'ne plus penser', 'distraire', 'bloquer', 'bloque'],
    "act_valeurs": ['à quoi bon', 'quel sens', 'pourquoi continuer', 'pourquoi je', 'plus de sens', 'vide'],
    "systemic": ['ma famille', 'entre nous', 'on ne se parle plus', 'tout porter', 'être fort pour', 'fort pour les autres', 'interdit de pleurer', 'pas le droit de', 'on ne pleure pas', 'dans ma famille', 'tensions dans', 'conflit famili', 'hérité du rôle', 'je dois être le', 'loyauté', 'parentifié', 'mes frères et sœurs', "la famille s'est", 'famille éclatée', 'chacun dans son coin'],
    "somatic": ['boule au ventre', 'ventre noué', 'nœud', 'tremble', 'trembler', "cœur qui s'emballe", 'cœur bat', 'suffoque', 'respire plus', 'peux plus respirer', 'souffle coupé', 'oppression', 'tendu dans', 'corps tendu', 'muscles', 'contracté', 'mal au ventre', 'mal à la tête', 'vertige', 'panique'],
    "anger": ['colère', 'en colère', 'rage', 'furieux', 'furieuse', 'injuste', 'injustice', 'révolte', 'révolté', 'pas juste', "c'est dégueulasse", 'scandaleux', 'haine', 'déteste'],
}

# Étiquettes lisibles pour le prompt (ce que le LLM lit).
THEME_LABELS: Dict[str, str] = {
    "continuing_bonds": "lien avec la personne absente",
    "journaling": "non-dits / regrets",
    "narrative": "identité fusionnée avec la perte",
    "act_defusion": "pensées douloureuses envahissantes",
    "act_acceptation": "évitement de l'émotion",
    "act_valeurs": "quête de sens",
    "systemic": "dynamique familiale",
    "somatic": "activation corporelle",
    "anger": "colère",
}


def detect_themes(message: str) -> set:
    """Extrait les thèmes thérapeutiques présents dans un message (aucun jugement)."""
    if not message:
        return set()
    msg_lower = message.lower()
    return {
        theme for theme, keywords in THEME_KEYWORDS.items()
        if any(kw in msg_lower for kw in keywords)
    }


def compute_conversation_maturity(
    conversation_history: List[Dict[str, str]],
    last_message: str,
) -> Dict[str, Any]:
    """
    Calcule des signaux BRUTS de maturité conversationnelle.

    Ne décide RIEN. Rapporte : quels thèmes ont été déposés sur la session,
    combien sont distincts, si le dernier message apporte du neuf, et depuis
    combien de tours rien de neuf n'émerge. Sonnet 4.5 interprète ces faits.
    """
    user_msgs = [m.get('content', '') for m in conversation_history if m.get('role') == 'user']
    if last_message and (not user_msgs or user_msgs[-1] != last_message):
        user_msgs = user_msgs + [last_message]

    themes_cumules: set = set()
    tours_sans_nouveaute = 0
    nouveaux_ce_tour: set = set()  # thèmes jamais vus avant, apparus au DERNIER message
    for i, msg in enumerate(user_msgs):
        themes_avant = set(themes_cumules)
        nouveaux = detect_themes(msg) - themes_cumules
        if nouveaux:
            themes_cumules |= nouveaux
            tours_sans_nouveaute = 0
        elif themes_cumules:
            # On ne compte "sans nouveauté" qu'une fois qu'au moins un thème existe.
            tours_sans_nouveaute += 1
        if i == len(user_msgs) - 1:
            nouveaux_ce_tour = detect_themes(msg) - themes_avant

    return {
        "themes_cumules": sorted(themes_cumules),
        "nb_themes_distincts": len(themes_cumules),
        "themes_nouveaux_ce_tour": sorted(nouveaux_ce_tour),
        "tours_sans_nouveaute": tours_sans_nouveaute,
    }


# ============================================================================
# DÉTECTION DE CRISE
# ============================================================================

CRISIS_PATTERNS = [
    r'\b(suicide|suicidaire|me tuer|en finir|plus envie de vivre)\b',
    r'\b(me faire du mal|m\'automutiler|me couper)\b',
    r'\b(mourir|mort|crever)\b.*\b(veux|envie|préfère)\b',
    r'\b(rien ne vaut|plus la peine|inutile de continuer)\b',
    r'\b(personne ne m\'aime|seul au monde|abandonné)\b',
    r'\b(plan|méthode|comment mourir)\b',
]

CRISIS_RESPONSE = """Je t'entends, {user_name}, et ce que tu partages est important. Je suis inquiet pour toi.

Es-tu en sécurité en ce moment ?

Si tu as des pensées de te faire du mal, je t'encourage vraiment à appeler le 3114 (numéro national de prévention du suicide, disponible 24h/24). Des personnes formées peuvent t'écouter et t'aider.

Je reste là avec toi. Peux-tu me dire comment tu te sens maintenant ?"""


def detect_crisis(message: str) -> bool:
    """Détecte les signaux de crise dans le message."""
    message_lower = message.lower()
    for pattern in CRISIS_PATTERNS:
        if re.search(pattern, message_lower):
            return True
    return False


# ============================================================================
# CLIENT LLM (Claude prioritaire, OpenAI fallback)
# ============================================================================

class LLMClient:
    """Client unifié pour appeler Claude ou OpenAI."""

    def __init__(self):
        self.anthropic_client = None
        self.openai_client = None

        # Initialiser Anthropic (Claude)
        anthropic_key = os.getenv('ANTHROPIC_API_KEY')
        if anthropic_key and Anthropic:
            try:
                self.anthropic_client = Anthropic(api_key=anthropic_key)
                logger.info("Claude (Anthropic) initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize Anthropic: {e}")

        # Initialiser OpenAI (fallback)
        openai_key = os.getenv('OPENAI_API_KEY')
        if openai_key and OpenAIClient:
            try:
                self.openai_client = OpenAIClient(api_key=openai_key)
                logger.info("OpenAI initialized as fallback")
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI: {e}")

    def generate(
        self,
        system_prompt: str,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 500
    ) -> str:
        """
        Génère une réponse en utilisant Claude (prioritaire) ou OpenAI (fallback).
        """
        # Essayer Claude d'abord
        if self.anthropic_client:
            try:
                return self._call_claude(system_prompt, messages, temperature, max_tokens)
            except Exception as e:
                logger.error(f"Claude error: {e}")

        # Fallback sur OpenAI
        if self.openai_client:
            try:
                return self._call_openai(system_prompt, messages, temperature, max_tokens)
            except Exception as e:
                logger.error(f"OpenAI error: {e}")

        # Fallback ultime
        return self._fallback_response(messages)

    def _call_claude(
        self,
        system_prompt: str,
        messages: List[Dict[str, str]],
        temperature: float,
        max_tokens: int
    ) -> str:
        """Appelle Claude (Anthropic)."""
        # Convertir les messages au format Anthropic
        anthropic_messages = []
        for msg in messages:
            role = msg.get('role', 'user')
            content = msg.get('content', '')
            if role in ['user', 'assistant'] and content:
                anthropic_messages.append({'role': role, 'content': content})

        response = self.anthropic_client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=max_tokens,
            temperature=temperature,
            system=system_prompt,
            messages=anthropic_messages,
        )

        if response.content and len(response.content) > 0:
            return response.content[0].text.strip()
        return ""

    def _call_claude_stream(
        self,
        system_prompt: str,
        messages: List[Dict[str, str]],
        temperature: float,
        max_tokens: int
    ):
        """Appelle Claude en streaming — yield chaque chunk de texte."""
        anthropic_messages = []
        for msg in messages:
            role = msg.get('role', 'user')
            content = msg.get('content', '')
            if role in ['user', 'assistant'] and content:
                anthropic_messages.append({'role': role, 'content': content})

        with self.anthropic_client.messages.stream(
            model="claude-sonnet-4-5",
            max_tokens=max_tokens,
            temperature=temperature,
            system=system_prompt,
            messages=anthropic_messages,
        ) as stream:
            for text in stream.text_stream:
                yield text

    def _call_openai(
        self,
        system_prompt: str,
        messages: List[Dict[str, str]],
        temperature: float,
        max_tokens: int
    ) -> str:
        """Appelle OpenAI (fallback)."""
        openai_messages = [{'role': 'system', 'content': system_prompt}]

        for msg in messages:
            role = msg.get('role', 'user')
            content = msg.get('content', '')
            if role in ['user', 'assistant'] and content:
                openai_messages.append({'role': role, 'content': content})

        response = self.openai_client.chat.completions.create(
            model="gpt-4o",
            messages=openai_messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )

        return response.choices[0].message.content.strip()

    def _fallback_response(self, messages: List[Dict[str, str]]) -> str:
        """Réponse de secours si aucun LLM n'est disponible."""
        return "Je suis là pour t'écouter. Peux-tu m'en dire plus sur ce que tu ressens ?"

    def generate_stream(
        self,
        system_prompt: str,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 400
    ):
        """Génère une réponse en streaming. Yield chaque chunk de texte."""
        if self.anthropic_client:
            try:
                logger.info("LLM: streaming via Claude (Anthropic)")
                yield from self._call_claude_stream(system_prompt, messages, temperature, max_tokens)
                return
            except Exception as e:
                logger.error(f"Claude stream error: {e}")
        else:
            logger.warning("LLM: Claude non disponible (ANTHROPIC_API_KEY manquante ou invalide)")

        # Fallback: generate complete and yield at once
        if self.openai_client:
            try:
                logger.info("LLM: fallback vers OpenAI")
                full = self._call_openai(system_prompt, messages, temperature, max_tokens)
                yield full
                return
            except Exception as e2:
                logger.error(f"OpenAI fallback error: {e2}")
        else:
            logger.warning("LLM: OpenAI non disponible non plus")

        logger.error("LLM: AUCUN provider disponible — réponse de secours")
        yield self._fallback_response(messages)


# ============================================================================
# MOTEUR THÉRAPEUTIQUE PRINCIPAL
# ============================================================================

class TherapeuticEngine:
    """
    Moteur thérapeutique professionnel.

    Architecture simple et efficace :
    - Claude répond directement avec un prompt système expert
    - Détection de crise intégrée
    - Pas de RAG pour la génération (trop rigide)
    """

    def __init__(self):
        self.llm = LLMClient()
        self.memory_path = os.path.join(BASE_DIR, 'backend', 'ai-engine', 'memory_store.jsonl')
        os.makedirs(os.path.dirname(self.memory_path), exist_ok=True)

    def generate_response(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        user_name: str = "ami",
        user_state: Optional[Dict[str, Any]] = None,
        extended_profile: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Génère une réponse thérapeutique.

        Args:
            user_message: Le message de l'utilisateur
            conversation_history: L'historique complet de la conversation
            user_name: Le prénom de l'utilisateur
            user_state: État émotionnel optionnel (détresse, espoir, énergie)
            extended_profile: Profil étendu (spirituel, transgénérationnel, numérologie, etc.)

        Returns:
            Dict avec 'text', 'crisis_detected', 'technique_used'
        """
        # 1. Détection de crise
        if detect_crisis(user_message):
            logger.warning(f"CRISIS DETECTED for user message")
            self._log_crisis(user_message)
            return {
                'text': CRISIS_RESPONSE.format(user_name=user_name),
                'crisis_detected': True,
                'technique_used': 'crisis_intervention',
                'model_used': 'crisis_protocol'
            }

        # 2. Construire le prompt personnalisé (avec profil étendu si disponible)
        # Compter les échanges utilisateur pour la progression thérapeutique
        user_msg_count = sum(1 for m in conversation_history if m.get('role') == 'user')
        system_prompt = self._build_system_prompt(user_name, user_state, extended_profile, user_msg_count, conversation_history, user_message)

        # 3. Construire les messages (historique + nouveau message)
        messages = list(conversation_history)  # Copie
        if user_message:
            # Vérifier si le message n'est pas déjà le dernier
            if not messages or messages[-1].get('content') != user_message:
                messages.append({'role': 'user', 'content': user_message})

        # 4. Appeler le LLM
        response_text = self.llm.generate(
            system_prompt=system_prompt,
            messages=messages,
            temperature=0.7,
            max_tokens=800
        )

        # 5. Log pour analytics (anonymisé)
        self._log_interaction(user_state)

        return {
            'text': response_text,
            'crisis_detected': False,
            'technique_used': 'conversational_therapy',
            'model_used': 'claude-sonnet-4-5'
        }

    def generate_response_stream(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        user_name: str = "ami",
        user_state: Optional[Dict[str, Any]] = None,
        extended_profile: Optional[Dict[str, Any]] = None
    ):
        """Génère une réponse thérapeutique en streaming. Yield chaque chunk."""
        # Crisis check first (not streamed)
        if detect_crisis(user_message):
            logger.warning(f"CRISIS DETECTED for user message")
            self._log_crisis(user_message)
            yield CRISIS_RESPONSE.format(user_name=user_name)
            return

        user_msg_count = sum(1 for m in conversation_history if m.get('role') == 'user')
        system_prompt = self._build_system_prompt(user_name, user_state, extended_profile, user_msg_count, conversation_history, user_message)
        messages = list(conversation_history)
        if user_message:
            if not messages or messages[-1].get('content') != user_message:
                messages.append({'role': 'user', 'content': user_message})

        yield from self.llm.generate_stream(
            system_prompt=system_prompt,
            messages=messages,
            temperature=0.7,
            max_tokens=800
        )

        self._log_interaction(user_state)

    def _build_system_prompt(
        self,
        user_name: str,
        user_state: Optional[Dict] = None,
        extended_profile: Optional[Dict] = None,
        user_msg_count: int = 0,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        last_message: str = ""
    ) -> str:
        """Construit le prompt système personnalisé."""
        prompt = THERAPEUTIC_SYSTEM_PROMPT

        # Ajouter le contexte utilisateur
        context_lines = [f"\n\n## CONTEXTE UTILISATEUR\n- Prénom: {user_name}"]

        # Maturité conversationnelle : des FAITS pour que Claude lise le moment.
        # (thèmes déposés, nouveauté vs répétition — aucun jugement ici)
        if conversation_history is not None:
            maturity = compute_conversation_maturity(conversation_history, last_message)
            nb = maturity["nb_themes_distincts"]
            if nb > 0:
                labels = [THEME_LABELS.get(t, t) for t in maturity["themes_cumules"]]
                context_lines.append("\n### MATURITÉ DE LA CONVERSATION")
                context_lines.append(f"- Thèmes déposés jusqu'ici ({nb}) : {', '.join(labels)}")
                nouveaux = maturity["themes_nouveaux_ce_tour"]
                if nouveaux:
                    context_lines.append(f"- Ce tour apporte du neuf : {', '.join(THEME_LABELS.get(t, t) for t in nouveaux)}. La personne explore encore — accompagne, ne précipite pas.")
                else:
                    context_lines.append(f"- Ce tour n'apporte pas de thème neuf (revient sur l'existant depuis {maturity['tours_sans_nouveaute']} tour(s)).")
                # Seuil léger 2+2 : suggérer la synthèse, sans l'imposer. Claude décide.
                if nb >= 2 and maturity["tours_sans_nouveaute"] >= 2:
                    context_lines.append(f"→ La personne a déposé plusieurs thèmes et commence à y revenir. C'est peut-être le moment d'un REFLET STRUCTURANT : nomme ce que tu entends (\"De ce que tu me dis, il y a {labels[0]} et {labels[1] if len(labels) > 1 else '...'}\") et laisse-la CHOISIR ce qui pèse le plus. Ne l'impose pas si le fil appelle autre chose.")

        # Ancienneté de l'échange : simple repère factuel, PAS une phase imposée.
        # (La décision de quand intervenir revient à "LIRE LE MOMENT" dans le prompt.)
        technique_lines = self._get_technique_protocol(user_state, user_msg_count) or []
        has_technique_signal = len(technique_lines) > 0

        if user_msg_count <= 2:
            context_lines.append("\n### OÙ EN EST L'ÉCHANGE\n- C'est le tout début de l'échange — tu découvres encore la situation.")
        elif user_msg_count <= 5:
            context_lines.append("\n### OÙ EN EST L'ÉCHANGE\n- L'échange s'installe — tu commences à avoir de la matière.")
        else:
            context_lines.append("\n### OÙ EN EST L'ÉCHANGE\n- L'échange dure — tu as accumulé du contexte sur cette personne.")

        # La technique détectée est une RESSOURCE, jamais un ordre. Claude décide
        # si le moment s'y prête (voir "LIRE LE MOMENT"). On ne pousse rien.
        if has_technique_signal:
            context_lines.append("\n### RESSOURCE THÉRAPEUTIQUE DISPONIBLE")
            context_lines.append("Le contenu du message évoque le thème ci-dessous. Utilise cette approche SI le moment s'y prête — après avoir validé, si la personne est prête, si le fil l'appelle. Ne la force pas, ne la plaque pas mécaniquement.")
            context_lines.extend(technique_lines)

        if user_state:
            detresse = user_state.get('detresse', 50)
            espoir = user_state.get('espoir', 50)
            energie = user_state.get('energie', 50)
            phase = user_state.get('phase', 'exploration')

            context_lines.append(f"- Niveau de détresse: {detresse}/100")
            context_lines.append(f"- Niveau d'espoir: {espoir}/100")
            context_lines.append(f"- Niveau d'énergie: {energie}/100")
            context_lines.append(f"- Phase du deuil estimée: {phase}")

            # Émotion détectée par DistilBERT
            detected_emotion = user_state.get('detected_emotion')
            emotional_arousal = user_state.get('emotional_arousal')
            emotional_valence = user_state.get('emotional_valence')
            suggested_phase = user_state.get('emotion_suggested_phase')

            if detected_emotion:
                context_lines.append(f"\n### ÉMOTION DÉTECTÉE DANS CE MESSAGE")
                context_lines.append(f"- Émotion primaire: {detected_emotion}")
                if emotional_valence is not None:
                    valence_label = "positive" if emotional_valence > 0.2 else "négative" if emotional_valence < -0.2 else "neutre"
                    context_lines.append(f"- Valence: {valence_label} ({emotional_valence:.2f})")
                if emotional_arousal is not None:
                    arousal_label = "élevée" if emotional_arousal > 0.6 else "basse" if emotional_arousal < 0.3 else "modérée"
                    context_lines.append(f"- Activation émotionnelle: {arousal_label} ({emotional_arousal:.2f})")

                # Recommandations techniques basées sur l'émotion
                technique_map = {
                    "sadness": "Techniques recommandées : validation profonde, journaling expressif, continuing bonds. Si énergie basse, rester doux et court.",
                    "fear": "Techniques recommandées : ancrage sensoriel 5-4-3-2-1, cohérence cardiaque. Priorité à la stabilisation avant l'exploration.",
                    "anger": "Techniques recommandées : cohérence cardiaque, défusion ACT. Valider la colère comme légitime avant de proposer un exercice.",
                    "joy": "Émotion positive détectée — renforcer, explorer ce qui a généré cette joie. Peut être le bon moment pour du meaning reconstruction.",
                    "love": "Émotion d'attachement — explorer le lien, continuing bonds si contexte de deuil.",
                    "surprise": "Explorer doucement ce qui a surpris. Rester curieux avec la personne.",
                }
                if detected_emotion in technique_map:
                    context_lines.append(f"- {technique_map[detected_emotion]}")

                if suggested_phase:
                    context_lines.append(f"- Phase suggérée par l'émotion: {suggested_phase}")

            # Adapter le ton selon l'état
            if detresse > 70:
                context_lines.append("\n⚠️ Détresse élevée - Sois particulièrement doux et validant. Priorité à la sécurité. Si activation émotionnelle élevée, propose un exercice d'ancrage.")
            elif energie < 30:
                context_lines.append("\n💤 Énergie basse - Réponses courtes, pas de demandes d'efforts. Pas d'exercice actif.")

        # Contexte de vie sédimenté : ce que la personne a NOMMÉ elle-même
        # (motif d'onboarding + faits durables extraits des sessions passées).
        # C'est ce qui permet à Helō de "connaître" la personne d'une fois sur l'autre.
        insights = user_state.get('conversation_insights') if user_state else None
        if insights and isinstance(insights, dict):
            reason = str(insights.get('initial_reason', '')).strip()
            facts = insights.get('life_facts') or insights.get('faits') or []
            if reason or facts:
                context_lines.append("\n## CONTEXTE DE VIE (ce que la personne t'a confié)")
                if reason:
                    context_lines.append(f"- En arrivant, elle a écrit : « {reason[:300]} »")
                if isinstance(facts, list):
                    for f in facts[:8]:
                        context_lines.append(f"- {str(f)[:200]}")
                context_lines.append("Utilise ce contexte avec délicatesse, comme un thérapeute qui se souvient. RÈGLE ABSOLUE anti-hallucination : ne t'appuie QUE sur ces faits nommés par la personne, ne suppose RIEN au-delà, ne présume pas ce qu'elle ressent aujourd'hui. Si un fait semble ancien, vérifie avec tact plutôt que d'affirmer.")

        # Mémoire des sessions précédentes
        conversation_memory = None
        if user_state:
            conversation_memory = user_state.get('conversation_memory')
        if conversation_memory and isinstance(conversation_memory, list) and len(conversation_memory) > 0:
            context_lines.append("\n## MÉMOIRE DES SESSIONS PRÉCÉDENTES")
            context_lines.append("Tu te souviens de ces échanges passés avec l'utilisateur :")
            for i, mem in enumerate(conversation_memory[:3]):
                date = mem.get('date', 'récemment')
                # Assainir les thèmes : tronquer et ne garder que l'essence
                themes = str(mem.get('themes', ''))[:80].strip()
                last_topic = str(mem.get('last_topic', ''))[:80].strip()
                msg_count = mem.get('message_count', 0)
                if themes or last_topic:
                    context_lines.append(f"- Session {i+1} ({date}): Thèmes abordés: \"{themes}\". Dernier sujet: \"{last_topic}\" ({msg_count} messages)")
            context_lines.append("Utilise ces souvenirs naturellement — comme un thérapeute qui se rappelle les séances précédentes. Ne force JAMAIS les références. Si tu mentionnes un souvenir, fais-le avec délicatesse : \"La dernière fois, tu évoquais...\" Respecte la règle anti-hallucination : ne suppose PAS ce que l'utilisateur a ressenti, réfère-toi uniquement à ce qu'il a DIT.")

        # Intégrer le profil étendu (spirituel/transgénérationnel) si disponible
        if extended_profile:
            context_lines.append("\n## PROFIL APPROFONDI DE L'UTILISATEUR")

            # Identité et lignées
            if 'identite' in extended_profile:
                identite = extended_profile['identite']
                if 'prenoms_complets' in identite:
                    trad = identite['prenoms_complets'].get('traditionnel')
                    if trad:
                        context_lines.append(f"- Nom traditionnel: {trad}")

            if 'lignees' in extended_profile:
                lignees = extended_profile['lignees']
                if 'paternelle' in lignees:
                    pat = lignees['paternelle']
                    context_lines.append(f"- Lignée paternelle: {pat.get('nom', '')} ({pat.get('origine', '')})")
                if 'maternelle' in lignees:
                    mat = lignees['maternelle']
                    context_lines.append(f"- Lignée maternelle: {mat.get('nom_officiel', '')} - {mat.get('statut', '')}")

            # Thèmes thérapeutiques
            if 'themes_therapeutiques' in extended_profile:
                themes = extended_profile['themes_therapeutiques']
                if 'lecon_centrale' in themes:
                    context_lines.append(f"\n### LEÇON DE VIE CENTRALE")
                    context_lines.append(f"{themes['lecon_centrale']}")
                if 'patterns' in themes:
                    context_lines.append(f"\n### PATTERNS IDENTIFIÉS")
                    for p in themes['patterns']:
                        context_lines.append(f"- {p}")
                if 'croyances_limitantes' in themes:
                    context_lines.append(f"\n### CROYANCES LIMITANTES À TRANSFORMER")
                    for c in themes['croyances_limitantes']:
                        context_lines.append(f"- \"{c}\"")
                if 'ressources' in themes:
                    context_lines.append(f"\n### RESSOURCES INTÉRIEURES")
                    for r in themes['ressources']:
                        context_lines.append(f"- {r}")

            # Message central
            if 'message_central' in extended_profile:
                context_lines.append(f"\n### MESSAGE CENTRAL POUR CETTE PERSONNE")
                context_lines.append(f"\"{extended_profile['message_central']}\"")

            # Mantras personnels
            if 'mantras' in extended_profile:
                context_lines.append(f"\n### MANTRAS PERSONNELS (à rappeler si pertinent)")
                for m in extended_profile['mantras'][:3]:  # Les 3 premiers
                    context_lines.append(f"- \"{m}\"")

            # Numérologie
            if 'numerologie' in extended_profile:
                num = extended_profile['numerologie']
                if 'chemin_signification' in num:
                    context_lines.append(f"\n### GUIDANCE NUMÉROLOGIQUE")
                    context_lines.append(f"- Chemin de vie: {num.get('chemin_signification', '')}")

            # Fâ (divination béninoise)
            if 'fa_divination' in extended_profile:
                fa = extended_profile['fa_divination']
                context_lines.append(f"\n### SIGNE FÂ")
                context_lines.append(f"- Signe: {fa.get('signe', '')}")
                context_lines.append(f"- Signification: {fa.get('signification', '')}")

            # Instructions spéciales pour l'IA
            context_lines.append(f"\n### INSTRUCTIONS SPÉCIALES")
            context_lines.append("- Évite le mot 'lutte' ou 'lutter' (l'inconscient entend le mot)")
            context_lines.append("- Privilégie les formulations orientées vers 'recevoir' plutôt que 'forcer'")
            context_lines.append("- Si elle parle de difficulté à lâcher prise, rappelle doucement sa leçon centrale")
            context_lines.append("- Tu peux mentionner ses mantras quand c'est pertinent")

        prompt += "\n".join(context_lines)
        return prompt

    def _get_technique_protocol(self, user_state: Optional[Dict], user_msg_count: int) -> List[str]:
        """
        Détecte quelle technique thérapeutique activer et injecte le protocole concret.
        Utilise PrimaryMethodsEngine si disponible, sinon heuristique simple.
        """
        lines = []
        if not user_state:
            return lines

        last_message = user_state.get('last_user_message', '')
        conversation_context = {'last_message': last_message}
        detected_emotion = user_state.get('detected_emotion', '')
        detresse = user_state.get('detresse', 50)

        # Utiliser le moteur de détection si disponible
        # Ordre de priorité : spécifique → générique
        # Continuing Bonds et Journaling sont des techniques ciblées (besoin précis)
        # ACT est un catch-all (fusion, évitement, valeurs — très fréquent)
        if _methods_engine:
            try:
                # 1. Continuing Bonds — signal le plus spécifique (manque, connexion, rituel)
                if _methods_engine.should_activate_continuing_bonds(user_state, conversation_context):
                    variation = _methods_engine.select_bonds_variation(user_state, conversation_context)
                    protocol = _methods_engine.protocols.get('continuing_bonds', {}).get('variations', {}).get(variation.value, {})
                    if protocol:
                        lines.append(f"\n### TECHNIQUE RECOMMANDÉE: Continuing Bonds — {protocol.get('name', variation.value)}")
                        lines.append(f"Indication: {protocol.get('indication', '')}")
                        lines.append("Voici les étapes à proposer naturellement :")
                        for step in protocol.get('steps', []):
                            lines.append(f"  Étape {step['step']}: {step['name']}")
                            lines.append(f"    → Dire: \"{step['instruction']}\"")
                            lines.append(f"    → Ton rôle: {step.get('llm_role', '')}")
                        return lines

                # 2. Journaling — signal spécifique (non-dits, regrets, expression)
                elif _methods_engine.should_activate_journaling(user_state, conversation_context):
                    variation = _methods_engine.select_journaling_variation(user_state, conversation_context)
                    protocol = _methods_engine.protocols.get('journaling_expressif', {}).get('variations', {}).get(variation.value, {})
                    if protocol:
                        lines.append(f"\n### TECHNIQUE RECOMMANDÉE: Journaling — {protocol.get('name', variation.value)}")
                        lines.append(f"Indication: {protocol.get('indication', '')}")
                        lines.append("Voici les étapes à proposer naturellement :")
                        for step in protocol.get('steps', []):
                            lines.append(f"  Étape {step['step']}: {step['name']}")
                            lines.append(f"    → Dire: \"{step['instruction']}\"")
                            lines.append(f"    → Ton rôle: {step.get('llm_role', '')}")
                        return lines

                # 3. ACT — catch-all (fusion, évitement, valeurs)
                elif _methods_engine.should_activate_act(user_state, conversation_context):
                    variation = _methods_engine.select_act_variation(user_state, conversation_context)
                    protocol = _methods_engine.protocols.get('act', {}).get('variations', {}).get(variation.value, {})
                    if protocol:
                        lines.append(f"\n### TECHNIQUE RECOMMANDÉE: ACT — {protocol.get('name', variation.value)}")
                        lines.append(f"Indication: {protocol.get('indication', '')}")
                        lines.append("Voici les étapes à proposer naturellement (pas de manière rigide) :")
                        for step in protocol.get('steps', []):
                            lines.append(f"  Étape {step['step']}: {step['name']}")
                            lines.append(f"    → Dire: \"{step['instruction']}\"")
                            lines.append(f"    → Ton rôle: {step.get('llm_role', '')}")
                        for key, adaptive in protocol.get('adaptive_responses', {}).items():
                            lines.append(f"  Si {adaptive.get('trigger', '')}: {adaptive.get('response', '')}")
                        return lines
            except Exception as e:
                logger.warning(f"Erreur détection méthode: {e}")

        # Fallback heuristique si le moteur n'est pas disponible
        # Ordre : spécifique → générique (même logique que le moteur principal)
        msg_lower = last_message.lower() if last_message else ''

        # 1. Continuing Bonds — signal le plus spécifique (manque, connexion, rituel)
        if any(w in msg_lower for w in ['me manque', 'son absence', 'sa présence', 'sentir proche', 'je lui parle', 'lui parler', 'je lui dis', 'entendre sa voix', 'rituel', 'anniversaire', 'commémor', 'près de moi', 'rêvé de', 'je le sens', 'je la sens']):
            lines.append("\n### TECHNIQUE RECOMMANDÉE: Continuing Bonds (Klass & Silverman)")
            lines.append("L'utilisateur exprime le manque de connexion avec la personne décédée.")
            lines.append("1. Valider le lien : \"Le lien avec cette personne ne s'arrête pas. Il se transforme.\"")
            lines.append("2. Explorer la connexion : \"Si tu pouvais avoir une conversation avec elle/lui en ce moment, que lui dirais-tu ?\"")
            lines.append("3. Ritualiser : \"Y a-t-il un geste, un rituel, qui te permet de te sentir connecté(e) ?\"")

        # 2. Journaling — non-dits, regrets, expression
        elif any(w in msg_lower for w in ['aurais voulu dire', 'aurais dû', 'pas dit', 'regret', 'pardonn', 'si seulement', 'lettre']):
            lines.append("\n### TECHNIQUE RECOMMANDÉE: Lettre non envoyée (Journaling expressif)")
            lines.append("L'utilisateur exprime des non-dits ou des regrets.")
            lines.append("1. Ouvrir l'espace : \"Il y a des mots que tu portes en toi, des choses que tu aurais voulu dire...\"")
            lines.append("2. Proposer l'écriture : \"Et si tu prenais un moment pour écrire à cette personne ? Pas pour envoyer, mais pour libérer ces mots.\"")
            lines.append("3. Si la personne accepte, guide-la vers le module Créativité (outil 'Lettre').")

        # 3. Thérapie narrative — récit figé, identité fusionnée avec la perte
        elif any(w in msg_lower for w in ['ma vie est finie', 'je ne suis plus', 'plus rien sans', 'rien sans', 'je ne sais plus qui je suis', 'invisible', 'je fais semblant']):
            lines.append("\n### TECHNIQUE RECOMMANDÉE: Externalisation (Thérapie narrative)")
            lines.append("L'utilisateur a un récit figé : son identité est fusionnée avec la perte.")
            lines.append("1. Externaliser : \"Le deuil te raconte que ta vie est finie. Mais TOI, qu'est-ce que tu en dis ?\"")
            lines.append("2. Chercher les exceptions : \"Y a-t-il eu un moment, même infime, où tu as senti que tu étais encore toi, malgré tout ?\"")
            lines.append("3. Re-authoring : \"Si tu devais écrire le prochain chapitre — pas celui que le deuil écrirait, mais le tien — ça ressemblerait à quoi ?\"")

        # 4. ACT Défusion — fusion cognitive (pensées = réalité)
        elif any(w in msg_lower for w in ['je suis nul', 'je suis incapable', "c'est impossible", 'je ne vaux', 'je ne peux pas', 'détruit', 'brisé', 'cassé', 'plus jamais', 'je suis mort', 'au bout du rouleau', 'ça me bouffe', 'ça me ronge', 'ça me détruit']):
            lines.append("\n### TECHNIQUE RECOMMANDÉE: Défusion cognitive (ACT)")
            lines.append("L'utilisateur montre des signes de fusion cognitive (pensées = réalité).")
            lines.append("1. Identifie la pensée dominante : \"Quelle pensée revient souvent et te pèse ?\"")
            lines.append("2. Propose la défusion : \"Essaie de dire cette pensée en ajoutant devant : 'Je remarque que j'ai la pensée que...'\"")
            lines.append("3. Relie aux valeurs : \"Si cette pensée avait moins de pouvoir, qu'est-ce qui deviendrait possible pour toi ?\"")
            lines.append("Si résistance ('mais c'est vrai') : \"La question n'est pas si c'est vrai, mais si cette pensée t'aide à avancer vers ce qui compte pour toi.\"")

        # 5. ACT Acceptation — évitement expérientiel
        elif any(w in msg_lower for w in ['éviter', 'évite', 'fuir', 'fuis', 'fuit', 'oublier', 'oublie', 'ne pas penser', 'ne plus penser', 'distraire', 'bloquer', 'bloque']):
            lines.append("\n### TECHNIQUE RECOMMANDÉE: Acceptation expérientielle (ACT)")
            lines.append("L'utilisateur montre de l'évitement expérientiel.")
            lines.append("1. Reconnaître le pattern : \"Tu cherches à ne plus ressentir ça — c'est très humain.\"")
            lines.append("2. Faire de la place : \"Et si au lieu d'essayer de repousser cette émotion, tu lui faisais juste un peu de place ? Comme une vague qui passe.\"")
            lines.append("3. Découpler acceptation et abandon : \"Accepter ne veut pas dire abandonner ou oublier. C'est reconnaître ce qui est là.\"")

        # 6. ACT Valeurs — quête de sens
        elif any(w in msg_lower for w in ['à quoi bon', 'quel sens', 'pourquoi continuer', 'pourquoi je', 'plus de sens', 'vide']):
            lines.append("\n### TECHNIQUE RECOMMANDÉE: Clarification des valeurs (ACT)")
            lines.append("L'utilisateur cherche du sens ou de la direction.")
            lines.append("1. Explorer les valeurs : \"Dans ta relation avec cette personne, qu'est-ce qui comptait vraiment pour toi ?\"")
            lines.append("2. Honorer aujourd'hui : \"Comment pourrais-tu honorer ces valeurs aujourd'hui, même de manière toute petite ?\"")
            lines.append("3. Micro-engagement : Proposer une action concrète, petite, alignée avec la valeur identifiée.")

        # 7. Systémique familiale — rôles, loyautés, redistribution
        # Note: "ma mère", "mon père" seuls sont trop courants en deuil → exiger un contexte de dynamique familiale
        elif any(w in msg_lower for w in ['ma famille', 'entre nous', 'on ne se parle plus', 'tout porter', 'être fort pour', 'fort pour les autres', 'interdit de pleurer', 'pas le droit de', 'on ne pleure pas', 'dans ma famille', 'tensions dans', 'conflit famili', 'hérité du rôle', 'je dois être le', 'loyauté', 'parentifié', 'mes frères et sœurs', 'la famille s\'est', 'famille éclatée', 'chacun dans son coin']):
            lines.append("\n### TECHNIQUE RECOMMANDÉE: Exploration systémique (Bowen / Boszormenyi-Nagy)")
            lines.append("Dynamique familiale détectée. Le deuil réorganise le système familial.")
            lines.append("1. Explorer le rôle du défunt : \"Quel rôle jouait cette personne dans la famille ? Qui tenait les liens, qui organisait ?\"")
            lines.append("2. Nommer la redistribution : \"Depuis son départ, qui a repris ce rôle ? Est-ce que ce rôle t'est tombé dessus ?\"")
            lines.append("3. Explorer les loyautés invisibles : \"Y a-t-il des règles non-dites dans ta famille sur comment vivre le deuil ?\"")
            lines.append("4. Donner la permission : \"Tu as le droit de vivre ce deuil à ta manière, même si c'est différent des autres.\"")

        # 8. Somatique — ancrage polyvagal (NE DÉPEND PAS de DistilBERT)
        elif any(w in msg_lower for w in ['boule au ventre', 'ventre noué', 'nœud', 'tremble', 'trembler', 'cœur qui s\'emballe', 'cœur bat', 'suffoque', 'respire plus', 'peux plus respirer', 'souffle coupé', 'oppression', 'corps', 'tension', 'tendu', 'contracté', 'mal au ventre', 'mal à la tête', 'vertige', 'panique']):
            lines.append("\n### TECHNIQUE RECOMMANDÉE: Ancrage sensoriel 5-4-3-2-1 (Polyvagal)")
            lines.append("Activation somatique détectée (signaux corporels de détresse). Priorité à la stabilisation.")
            lines.append("1. Si respiration difficile : \"Respire avec moi. Inspire pendant 5 secondes... expire pendant 5 secondes. On fait 3 cycles ensemble.\"")
            lines.append("2. Ancrage : \"On va prendre un moment ensemble. Sens tes pieds sur le sol. Nomme 5 choses que tu vois, 4 que tu entends, 3 que tu touches, 2 que tu sens, 1 que tu goûtes.\"")
            lines.append("3. Reste présent, valide chaque réponse, avance lentement. Ne passe PAS à l'exploration tant que le corps n'est pas stabilisé.")

        # 8. Colère — validation + régulation (NE DÉPEND PAS de DistilBERT)
        elif any(w in msg_lower for w in ['colère', 'en colère', 'rage', 'furieux', 'furieuse', 'injuste', 'injustice', 'révolte', 'révolté', 'pas juste', "c'est dégueulasse", 'scandaleux', 'haine', 'déteste']):
            lines.append("\n### TECHNIQUE RECOMMANDÉE: Validation de la colère + Régulation")
            lines.append("Colère détectée. La colère dans le deuil est légitime et souvent sous-exprimée.")
            lines.append("1. Valider SANS minimiser : \"Cette colère est légitime. Tu as le droit d'être en colère.\"")
            lines.append("2. Nommer la source : \"Contre qui ou quoi est dirigée cette colère ? Contre la maladie, contre l'injustice, contre toi-même ?\"")
            lines.append("3. Si très intense, proposer cohérence cardiaque AVANT d'explorer : \"Avant d'aller plus loin, on respire ensemble. Inspire 5s, expire 5s.\"")
            lines.append("4. Puis relier aux valeurs (ACT) : \"Derrière cette colère, qu'est-ce qui compte vraiment pour toi ?\"")

        # 9. Fallback DistilBERT — peur/anxiété détectée par le modèle
        elif detected_emotion == 'fear' and detresse > 50:
            lines.append("\n### TECHNIQUE RECOMMANDÉE: Ancrage sensoriel 5-4-3-2-1")
            lines.append("Anxiété/peur détectée avec détresse élevée. Priorité à la stabilisation.")
            lines.append("Guide l'exercice : \"On va prendre un moment ensemble. Nomme 5 choses que tu vois, 4 que tu entends, 3 que tu touches, 2 que tu sens, 1 que tu goûtes.\"")
            lines.append("Reste présent, valide chaque réponse, avance lentement.")

        return lines

    def generate_welcome_message(
        self,
        user_name: str,
        user_state: Optional[Dict] = None,
        extended_profile: Optional[Dict] = None
    ) -> str:
        """Génère un message d'accueil personnalisé."""
        system_prompt = self._build_system_prompt(user_name, user_state, extended_profile, user_msg_count=0)

        # Déterminer ce qu'on SAIT déjà de la personne pour adapter l'accueil.
        insights = (user_state or {}).get('conversation_insights') or {}
        memory = (user_state or {}).get('conversation_memory') or []
        has_reason = bool(isinstance(insights, dict) and str(insights.get('initial_reason', '')).strip())
        has_facts = bool(isinstance(insights, dict) and insights.get('life_facts'))
        has_history = bool(memory)

        # Instruction d'accueil ADAPTÉE au contexte (jamais un catalogue de problèmes).
        welcome_instruction = "\n\n## INSTRUCTION SPÉCIALE — MESSAGE D'ACCUEIL\nC'est le tout premier message de cette conversation. Sois bref (2-3 phrases), chaleureux, jamais abrupt.\n"

        if has_reason or has_facts or has_history:
            # On CONNAÎT déjà la personne → accueil qui s'en souvient, avec délicatesse.
            welcome_instruction += (
                "Tu CONNAIS déjà cette personne (voir CONTEXTE DE VIE / MÉMOIRE plus haut). "
                "Accueille-la comme un thérapeute qui se souvient : reprends AVEC DÉLICATESSE ce qu'elle t'a confié, "
                "sans le lui resservir mécaniquement, et demande comment elle va aujourd'hui, là, maintenant. "
                "Ne présente PAS une liste de problèmes possibles — tu sais déjà ce qu'elle traverse. "
                "Anti-hallucination : appuie-toi UNIQUEMENT sur ce qu'elle a réellement dit, ne présume pas son état du jour."
            )
        else:
            # Nouvelle personne, aucun contexte → accueil ouvert MAIS pas un menu déroulant.
            welcome_instruction += (
                "Tu ne connais pas encore cette personne. Présente-toi en une phrase, avec douceur, "
                "et invite-la à partager ce qui l'amène — par une question ouverte et simple. "
                "SURTOUT NE liste PAS les problèmes possibles ('deuil, anxiété, questionnements...') : "
                "c'est froid, comme un menu. Laisse-lui l'espace de nommer sa situation avec ses propres mots."
            )

        # Nom traditionnel si disponible
        if extended_profile:
            nom_trad = None
            if 'identite' in extended_profile and 'prenoms_complets' in extended_profile['identite']:
                nom_trad = extended_profile['identite']['prenoms_complets'].get('traditionnel')
            if nom_trad:
                welcome_instruction += f"\nTu peux utiliser son prénom usuel ({user_name}) ou son nom traditionnel ({nom_trad}) si tu le sens approprié."

        system_prompt += welcome_instruction

        welcome = self.llm.generate(
            system_prompt=system_prompt,
            messages=[{'role': 'user', 'content': '[Début de conversation]'}],
            temperature=0.8,
            max_tokens=200
        )

        return welcome

    def _log_interaction(self, user_state: Optional[Dict] = None):
        """Log anonymisé pour analytics."""
        try:
            import time
            log_entry = {
                'ts': time.time(),
                'technique': 'conversational_therapy',
                'scores': user_state if user_state else {},
            }
            with open(self.memory_path, 'a', encoding='utf-8') as f:
                f.write(json.dumps(log_entry, ensure_ascii=False) + "\n")
        except Exception as e:
            logger.warning(f"Impossible de logger l'interaction: {e}")

    def _log_crisis(self, message: str):
        """Log les alertes de crise."""
        try:
            import time
            alert_path = os.path.join(BASE_DIR, 'backend', 'ai-engine', 'alert_logs.jsonl')
            with open(alert_path, 'a', encoding='utf-8') as f:
                f.write(json.dumps({
                    'ts': time.time(),
                    'type': 'crisis_detection',
                    'message_preview': message[:100]
                }, ensure_ascii=False) + "\n")
        except Exception as e:
            logger.error(f"CRITIQUE: Impossible de logger l'alerte de crise: {e}")

    # ========================================================================
    # MÉTHODES DE COMPATIBILITÉ (pour main.py existant)
    # ========================================================================

    def run_pipeline(self, user_state: Dict[str, Any], policy: Dict[str, Any], extended_profile: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Point d'entrée compatible avec l'ancien code.

        Args:
            user_state: État émotionnel de l'utilisateur
            policy: Politique de conversation (inclut l'historique)
            extended_profile: Profil étendu (spirituel, transgénérationnel, numérologie, etc.)
        """
        user_name = user_state.get('user_name', 'ami')

        # Récupérer l'historique de conversation
        conversation_context = policy.get('conversation_context', {})
        messages = conversation_context.get('messages', [])

        # Extraire le dernier message utilisateur
        last_user_message = ""
        for msg in reversed(messages):
            if msg.get('role') == 'user':
                last_user_message = msg.get('content', '')
                break

        # S'assurer que last_user_message est dans user_state pour la détection de techniques
        if last_user_message and not user_state.get('last_user_message'):
            user_state['last_user_message'] = last_user_message

        # Générer la réponse (avec profil étendu si disponible)
        result = self.generate_response(
            user_message=last_user_message,
            conversation_history=messages,
            user_name=user_name,
            user_state=user_state,
            extended_profile=extended_profile
        )

        # Format de retour compatible
        return {
            'text': result['text'],
            'intention_id': 'conversational',
            'technique': result.get('technique_used', 'conversational_therapy'),
            'source': 'claude_direct',
            'prompt_used': None,
            'model_used': result.get('model_used', 'claude-sonnet-4-5'),
            'emotion_context': {
                'detresse': user_state.get('detresse', 50),
                'espoir': user_state.get('espoir', 50),
                'energie': user_state.get('energie', 50),
                'phase': user_state.get('phase', 'exploration')
            },
            'rag_info': None,
            'crisis_detected': result.get('crisis_detected', False)
        }

    def run_pipeline_stream(self, user_state, policy, extended_profile=None):
        """Version streaming de run_pipeline. Yield chaque chunk de texte."""
        user_name = user_state.get('user_name', 'ami')
        conversation_context = policy.get('conversation_context', {})
        messages = conversation_context.get('messages', [])

        last_user_message = ""
        for msg in reversed(messages):
            if msg.get('role') == 'user':
                last_user_message = msg.get('content', '')
                break

        if last_user_message and not user_state.get('last_user_message'):
            user_state['last_user_message'] = last_user_message

        yield from self.generate_response_stream(
            user_message=last_user_message,
            conversation_history=messages,
            user_name=user_name,
            user_state=user_state,
            extended_profile=extended_profile
        )
