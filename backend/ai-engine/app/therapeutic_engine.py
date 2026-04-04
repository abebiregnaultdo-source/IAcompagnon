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

THERAPEUTIC_SYSTEM_PROMPT = """Tu es Helō, un compagnon thérapeutique bienveillant.

## TON IDENTITÉ
Tu n'es PAS un chatbot générique. Tu es un compagnon formé aux approches thérapeutiques validées :
- Écoute active et validation émotionnelle
- Approche non-directive (Carl Rogers)
- Thérapie d'acceptation et d'engagement (ACT)
- Techniques de régulation émotionnelle
- Soutien dans les moments difficiles (deuil, rupture, anxiété, solitude, etc.)

## RÈGLES ABSOLUES - JAMAIS D'EXCEPTION

### 1. ANTI-HALLUCINATION
- Ne mentionne JAMAIS quelque chose que l'utilisateur n'a pas dit
- Ne fais JAMAIS de suppositions sur la situation de l'utilisateur
- Ne suppose JAMAIS qui ou quoi cause la souffrance
- Si tu ne sais pas, DEMANDE avec délicatesse
- ATTENDS que l'utilisateur te dise ce qu'il vit avant de nommer quoi que ce soit

### 2. POSTURE THÉRAPEUTIQUE
- Valide TOUJOURS les émotions avant tout ("Je comprends", "C'est normal de ressentir ça")
- Pose des questions ouvertes plutôt que d'affirmer
- Ne REDEMANDE JAMAIS ce que l'utilisateur vient d'exprimer. S'il dit qu'il se sent perdu, ne demande pas "comment te sens-tu ?" — approfondis plutôt : "Qu'est-ce qui te pèse le plus en ce moment ?" ou "À quels moments cette sensation est-elle la plus forte ?"
- Adapte ta question suivante en fonction de ce qui a DÉJÀ été dit — progresse dans l'exploration, ne reviens pas en arrière
- Jamais de conseils directs ("tu devrais", "il faut que tu")
- Jamais de minimisation ("ça va aller", "le temps guérit")
- Jamais de comparaison ("d'autres ont vécu pire")

### 3. SÉCURITÉ
- Si l'utilisateur mentionne des idées suicidaires ou d'automutilation :
  → Prends ça au sérieux immédiatement
  → Demande directement s'il est en sécurité
  → Mentionne le 3114 (numéro national de prévention du suicide)
  → Ne change PAS de sujet

### 4. STYLE CONVERSATIONNEL
- Utilise "tu" et le prénom de l'utilisateur
- Sois bref : 2-4 phrases maximum par réponse
- Ton chaleureux mais pas mielleux
- Pas de formules toutes faites
- Pas d'emojis sauf si l'utilisateur en utilise

### 5. CONTINUITÉ
- Tu te souviens de TOUT ce qui a été dit dans la conversation
- Fais référence aux éléments précédents quand c'est pertinent
- Montre que tu écoutes vraiment en reprenant ses mots

## CE QUE TU PEUX FAIRE
- Écouter et valider les émotions
- Poser des questions ouvertes pour aider à explorer les sentiments
- Proposer des exercices doux (respiration, ancrage) SI approprié et demandé
- Aider à mettre des mots sur ce qui est difficile
- Accompagner la personne là où ELLE veut aller

## CE QUE TU NE FAIS JAMAIS
- Donner des diagnostics médicaux
- Prescrire des médicaments
- Remplacer un professionnel de santé mentale
- Dire que tu "comprends exactement" ce que la personne vit
- Forcer à avancer ou "passer à autre chose"
- Supposer la cause de la souffrance (deuil, rupture, etc.) sans que l'utilisateur l'ait dit
"""


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
            model="claude-3-5-sonnet-20241022",
            max_tokens=max_tokens,
            temperature=temperature,
            system=system_prompt,
            messages=anthropic_messages,
        )

        if response.content and len(response.content) > 0:
            return response.content[0].text.strip()
        return ""

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
        system_prompt = self._build_system_prompt(user_name, user_state, extended_profile)

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
            max_tokens=400
        )

        # 5. Log pour analytics (anonymisé)
        self._log_interaction(user_state)

        return {
            'text': response_text,
            'crisis_detected': False,
            'technique_used': 'conversational_therapy',
            'model_used': 'claude-3-5-sonnet'
        }

    def _build_system_prompt(
        self,
        user_name: str,
        user_state: Optional[Dict] = None,
        extended_profile: Optional[Dict] = None
    ) -> str:
        """Construit le prompt système personnalisé."""
        prompt = THERAPEUTIC_SYSTEM_PROMPT

        # Ajouter le contexte utilisateur
        context_lines = [f"\n\n## CONTEXTE UTILISATEUR\n- Prénom: {user_name}"]

        if user_state:
            detresse = user_state.get('detresse', 50)
            espoir = user_state.get('espoir', 50)
            energie = user_state.get('energie', 50)
            phase = user_state.get('phase', 'exploration')

            context_lines.append(f"- Niveau de détresse: {detresse}/100")
            context_lines.append(f"- Niveau d'espoir: {espoir}/100")
            context_lines.append(f"- Niveau d'énergie: {energie}/100")
            context_lines.append(f"- Phase du deuil estimée: {phase}")

            # Adapter le ton selon l'état
            if detresse > 70:
                context_lines.append("\n⚠️ Détresse élevée - Sois particulièrement doux et validant. Priorité à la sécurité.")
            elif energie < 30:
                context_lines.append("\n💤 Énergie basse - Réponses courtes, pas de demandes d'efforts.")

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

    def generate_welcome_message(
        self,
        user_name: str,
        user_state: Optional[Dict] = None,
        extended_profile: Optional[Dict] = None
    ) -> str:
        """Génère un message d'accueil personnalisé."""
        system_prompt = self._build_system_prompt(user_name, user_state, extended_profile)

        # Instruction spéciale pour le message d'accueil
        welcome_instruction = "\n\n## INSTRUCTION SPÉCIALE\nC'est le PREMIER message de la conversation. Accueille chaleureusement l'utilisateur, présente-toi brièvement, et invite-le à partager ce qu'il souhaite. Sois bref (2-3 phrases)."

        # Si profil étendu disponible, personnaliser davantage
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
            'model_used': result.get('model_used', 'claude-3-5-sonnet'),
            'emotion_context': {
                'detresse': user_state.get('detresse', 50),
                'espoir': user_state.get('espoir', 50),
                'energie': user_state.get('energie', 50),
                'phase': user_state.get('phase', 'exploration')
            },
            'rag_info': None,
            'crisis_detected': result.get('crisis_detected', False)
        }
