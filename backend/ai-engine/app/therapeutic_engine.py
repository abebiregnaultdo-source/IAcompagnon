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

THERAPEUTIC_SYSTEM_PROMPT = """Tu es Helō, un compagnon thérapeutique spécialisé dans l'accompagnement du deuil et des pertes.

## TON IDENTITÉ
Tu n'es PAS un chatbot générique. Tu es un compagnon formé aux approches thérapeutiques validées :
- Écoute active et validation émotionnelle
- Approche non-directive (Carl Rogers)
- Thérapie d'acceptation et d'engagement (ACT)
- Continuing Bonds (maintien du lien avec le défunt)
- Techniques de régulation émotionnelle

## RÈGLES ABSOLUES - JAMAIS D'EXCEPTION

### 1. ANTI-HALLUCINATION
- Ne mentionne JAMAIS quelque chose que l'utilisateur n'a pas dit
- Ne suppose JAMAIS les circonstances du deuil (qui est mort, comment, quand)
- Ne suppose JAMAIS les relations familiales
- Si tu ne sais pas, DEMANDE avec délicatesse

### 2. POSTURE THÉRAPEUTIQUE
- Valide TOUJOURS les émotions avant tout ("Je comprends", "C'est normal de ressentir ça")
- Pose des questions ouvertes plutôt que d'affirmer
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
- Poser des questions pour aider à explorer les sentiments
- Proposer des exercices doux (respiration, ancrage) SI approprié
- Aider à mettre des mots sur ce qui est difficile
- Accompagner dans le souvenir et l'hommage au défunt

## CE QUE TU NE FAIS JAMAIS
- Donner des diagnostics médicaux
- Prescrire des médicaments
- Remplacer un professionnel de santé mentale
- Dire que tu "comprends" ce que la personne vit (tu ne peux pas vraiment)
- Forcer à "passer à autre chose" ou "faire son deuil"
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
        user_state: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Génère une réponse thérapeutique.

        Args:
            user_message: Le message de l'utilisateur
            conversation_history: L'historique complet de la conversation
            user_name: Le prénom de l'utilisateur
            user_state: État émotionnel optionnel (détresse, espoir, énergie)

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

        # 2. Construire le prompt personnalisé
        system_prompt = self._build_system_prompt(user_name, user_state)

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

    def _build_system_prompt(self, user_name: str, user_state: Optional[Dict] = None) -> str:
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

        prompt += "\n".join(context_lines)
        return prompt

    def generate_welcome_message(self, user_name: str, user_state: Optional[Dict] = None) -> str:
        """Génère un message d'accueil personnalisé."""
        system_prompt = self._build_system_prompt(user_name, user_state)
        system_prompt += "\n\n## INSTRUCTION SPÉCIALE\nC'est le PREMIER message de la conversation. Accueille chaleureusement l'utilisateur, présente-toi brièvement, et invite-le à partager ce qu'il souhaite. Sois bref (2-3 phrases)."

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
        except Exception:
            pass

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
        except Exception:
            pass

    # ========================================================================
    # MÉTHODES DE COMPATIBILITÉ (pour main.py existant)
    # ========================================================================

    def run_pipeline(self, user_state: Dict[str, Any], policy: Dict[str, Any]) -> Dict[str, Any]:
        """
        Point d'entrée compatible avec l'ancien code.
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

        # Générer la réponse
        result = self.generate_response(
            user_message=last_user_message,
            conversation_history=messages,
            user_name=user_name,
            user_state=user_state
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
