from __future__ import annotations
from typing import Dict, Any, List, Optional, Tuple
import os
import json
import logging
from dotenv import load_dotenv

from .safety_monitor import SafetyMonitor, SafetyAction

# Logger pour debug
logger = logging.getLogger(__name__)

# Charger les variables d'environnement depuis .env à la racine
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
ENV_PATH = os.path.join(BASE_DIR, '.env')
load_dotenv(ENV_PATH)

# Imports pour OpenAI et Claude
try:
    from openai import OpenAI as OpenAIClient
except ImportError:
    OpenAIClient = None

try:
    from anthropic import Anthropic
except ImportError:
    Anthropic = None

# Abstractions for dual-model orchestration
class LLMRouter:
    def __init__(self, knowledge_model: str = None, empathy_model: str = None):
        self.knowledge_model = knowledge_model or os.getenv('KNOWLEDGE_MODEL', 'gpt-4o')
        self.empathy_model = empathy_model or os.getenv('EMPATHY_MODEL', 'claude-3-5-sonnet-20241022')
        
        # Initialiser les clients
        self.openai_client = None
        self.anthropic_client = None
        
        openai_key = os.getenv('OPENAI_API_KEY')
        anthropic_key = os.getenv('ANTHROPIC_API_KEY')
        
        if openai_key and OpenAIClient:
            try:
                self.openai_client = OpenAIClient(api_key=openai_key)
            except Exception as e:
                print(f"Warning: Failed to initialize OpenAI client: {e}")
        
        if anthropic_key and Anthropic:
            try:
                self.anthropic_client = Anthropic(api_key=anthropic_key)
            except Exception as e:
                print(f"Warning: Failed to initialize Anthropic client: {e}")

    def call_knowledge(self, messages: List[Dict[str, str]], temperature: float = 0.2, max_tokens: int = 600) -> str:
        """
        Appelle OpenAI pour le raisonnement clinique (knowledge model).
        Utilisé pour générer des plans, micro-protocoles, et raisonnement clinique.
        """
        if not self.openai_client:
            # Fallback si OpenAI n'est pas disponible
            content = messages[-1]['content'] if messages else ''
            return f"[PLAN] {content[:300]}"
        
        # Retry logic avec exponential backoff
        max_retries = 3
        for attempt in range(max_retries):
            try:
                # Convertir les messages au format OpenAI
                openai_messages = []
                for msg in messages:
                    role = msg.get('role', 'user')
                    content = msg.get('content', '')
                    if role == 'system':
                        openai_messages.append({'role': 'system', 'content': content})
                    elif role == 'user':
                        openai_messages.append({'role': 'user', 'content': content})
                    elif role == 'assistant':
                        openai_messages.append({'role': 'assistant', 'content': content})
                
                response = self.openai_client.chat.completions.create(
                    model=self.knowledge_model,
                    messages=openai_messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
                
                return response.choices[0].message.content.strip()
            except Exception as e:
                if attempt < max_retries - 1:
                    import time
                    wait_time = (2 ** attempt) * 0.5  # Exponential backoff: 0.5s, 1s, 2s
                    print(f"OpenAI API error (attempt {attempt + 1}/{max_retries}), retrying in {wait_time}s: {e}")
                    time.sleep(wait_time)
                else:
                    print(f"Error calling OpenAI knowledge model after {max_retries} attempts: {e}")
                    # Fallback sûr
                    content = messages[-1]['content'] if messages else ''
                    return f"[PLAN] {content[:300]}"
        
        # Ne devrait jamais arriver ici, mais fallback de sécurité
        content = messages[-1]['content'] if messages else ''
        return f"[PLAN] {content[:300]}"

    def call_empathy(self, messages: List[Dict[str, str]], temperature: float = 0.6, max_tokens: int = 300) -> str:
        """
        Appelle Claude (Anthropic) pour la relation thérapeutique (empathy model).
        Utilisé pour la délivrance empathique, le ton, la non-directivité.
        Fallback sur OpenAI si Claude n'est pas disponible.
        """
        if not self.anthropic_client:
            # Fallback sur OpenAI si Claude n'est pas disponible
            return self._empathy_fallback_openai(messages, temperature, max_tokens)
        
        # Retry logic avec exponential backoff
        max_retries = 3
        for attempt in range(max_retries):
            try:
                # Convertir les messages au format Anthropic
                # Anthropic utilise un format système + messages
                system_message = None
                anthropic_messages = []
                
                for msg in messages:
                    role = msg.get('role', 'user')
                    content = msg.get('content', '')
                    
                    if role == 'system':
                        system_message = content
                    elif role == 'user':
                        anthropic_messages.append({'role': 'user', 'content': content})
                    elif role == 'assistant':
                        anthropic_messages.append({'role': 'assistant', 'content': content})
                
                # Si pas de message système explicite, utiliser le premier message système trouvé
                if not system_message:
                    system_message = "Tu es un moteur de relation thérapeutique, non-directif et empathique."
                
                response = self.anthropic_client.messages.create(
                    model=self.empathy_model,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    system=system_message,
                    messages=anthropic_messages,
                )
                
                # Anthropic retourne une liste de content blocks
                if response.content and len(response.content) > 0:
                    return response.content[0].text.strip()
                return ""
            except Exception as e:
                if attempt < max_retries - 1:
                    import time
                    wait_time = (2 ** attempt) * 0.5  # Exponential backoff: 0.5s, 1s, 2s
                    print(f"Anthropic API error (attempt {attempt + 1}/{max_retries}), retrying in {wait_time}s: {e}")
                    time.sleep(wait_time)
                else:
                    print(f"Error calling Anthropic empathy model after {max_retries} attempts: {e}")
                    # Fallback sur OpenAI
                    return self._empathy_fallback_openai(messages, temperature, max_tokens)

        # Ne devrait jamais arriver ici, fallback sur OpenAI
        return self._empathy_fallback_openai(messages, temperature, max_tokens)

    def _empathy_fallback_openai(self, messages: List[Dict[str, str]], temperature: float = 0.6, max_tokens: int = 300) -> str:
        """
        Fallback: utilise OpenAI pour générer une réponse empathique quand Claude n'est pas disponible.
        """
        if not self.openai_client:
            # Fallback ultime: réponse générique empathique
            return "Je t'entends. Prends le temps qu'il te faut pour exprimer ce que tu ressens. Je suis là pour t'accompagner."

        try:
            # Reformuler le prompt pour OpenAI en mode empathique
            user_content = messages[-1]['content'] if messages else ''

            openai_messages = [
                {
                    'role': 'system',
                    'content': """Tu es un accompagnant thérapeutique bienveillant et empathique.
Ton rôle est de reformuler le contenu fourni en une réponse:
- Non-directive (pas de conseils, pas d'injonctions)
- Empathique et présente
- En 2-3 phrases maximum
- Sans inclure d'instructions ou de méta-commentaires
- Adressée directement à la personne avec "tu"
- Qui valide son vécu sans juger

IMPORTANT: Ne commence JAMAIS par des phrases comme "Reformule" ou des instructions. Parle directement à la personne."""
                },
                {'role': 'user', 'content': f"Transforme ce contenu en réponse empathique directe:\n\n{user_content}"}
            ]

            response = self.openai_client.chat.completions.create(
                model=self.knowledge_model,
                messages=openai_messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )

            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"OpenAI empathy fallback error: {e}")
            return "Je t'entends. Prends le temps qu'il te faut pour exprimer ce que tu ressens. Je suis là pour t'accompagner."

# Clinical Knowledge Base (CKB) avec RAG Vectoriel
class ClinicalKnowledgeBase:
    """
    Base de connaissances cliniques avec RAG vectoriel intégré.

    Utilise:
    - Sentence-transformers pour embeddings sémantiques
    - ChromaDB pour recherche vectorielle
    - Micro-protocoles validés cliniquement
    """

    def __init__(self, base_dir: Optional[str] = None):
        self.base_dir = base_dir or os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
        self.ckb_path = os.path.join(self.base_dir, 'backend', 'modules', 'grief', 'micro_protocols.json')
        self._cache: Dict[str, Any] = {}
        self._vector_rag = None
        self._ensure_file()
        self._load()
        self._init_vector_rag()

    def _ensure_file(self):
        if not os.path.exists(self.ckb_path):
            os.makedirs(os.path.dirname(self.ckb_path), exist_ok=True)
            with open(self.ckb_path, 'w', encoding='utf-8') as f:
                json.dump({}, f, ensure_ascii=False, indent=2)

    def _load(self):
        try:
            with open(self.ckb_path, 'r', encoding='utf-8') as f:
                self._cache = json.load(f)
            logger.info(f"CKB loaded {len(self._cache)} protocols")
        except Exception as e:
            logger.error(f"Error loading CKB: {e}")
            self._cache = {}

    def _init_vector_rag(self):
        """Initialise le RAG vectoriel"""
        try:
            from .vector_rag import get_vector_rag
            self._vector_rag = get_vector_rag()
            logger.info("VectorRAG initialized in CKB")
        except ImportError as e:
            logger.warning(f"VectorRAG not available: {e}")
            self._vector_rag = None
        except Exception as e:
            logger.error(f"Error initializing VectorRAG: {e}")
            self._vector_rag = None

    def save(self):
        with open(self.ckb_path, 'w', encoding='utf-8') as f:
            json.dump(self._cache, f, ensure_ascii=False, indent=2)

    def upsert_micro_protocol(self, intention_id: str, summary_2_3_sentences: str, metadata: Optional[Dict[str, Any]] = None):
        self._cache[intention_id] = {
            'summary': summary_2_3_sentences.strip(),
            'metadata': metadata or {}
        }
        self.save()

    def get_micro_protocol(self, intention_id: str) -> Optional[str]:
        """Récupère un micro-protocole par ID"""
        it = self._cache.get(intention_id)
        if it:
            # Nouveau format avec template
            if 'template' in it:
                return it.get('template')
            # Ancien format avec summary
            return it.get('summary')
        return None

    def get_full_protocol(self, protocol_id: str) -> Optional[Dict]:
        """Récupère le protocole complet avec métadonnées"""
        return self._cache.get(protocol_id)

    def retrieve_relevant_protocols(
        self,
        user_message: str,
        current_phase: str = "exploration",
        emotional_state: Optional[Dict] = None,
        conversation_history: Optional[List[str]] = None,
        top_k: int = 3
    ) -> List[Dict]:
        """
        Retrieval sémantique via RAG vectoriel.

        Retourne les protocoles les plus pertinents pour le contexte.
        """
        if self._vector_rag:
            try:
                results = self._vector_rag.retrieve(
                    user_message=user_message,
                    current_phase=current_phase,
                    emotional_state=emotional_state,
                    conversation_history=conversation_history,
                    top_k=top_k
                )

                # Convertir en format dictionnaire
                return [
                    {
                        'protocol_id': r.protocol_id,
                        'name': r.name,
                        'summary': r.summary,
                        'template': r.template,
                        'follow_up': r.follow_up,
                        'method': r.method,
                        'phase': r.phase,
                        'score': r.final_score,
                        'reasoning': r.reasoning
                    }
                    for r in results
                ]
            except Exception as e:
                logger.error(f"VectorRAG retrieval error: {e}")

        # Fallback: recherche simple par phase
        return self._fallback_retrieval(current_phase, top_k)

    def _fallback_retrieval(self, phase: str, top_k: int) -> List[Dict]:
        """Retrieval de fallback par correspondance de phase"""
        results = []
        for protocol_id, protocol in self._cache.items():
            if protocol.get('phase') == phase:
                results.append({
                    'protocol_id': protocol_id,
                    'name': protocol.get('name', protocol_id),
                    'summary': protocol.get('summary', ''),
                    'template': protocol.get('template', protocol.get('summary', '')),
                    'follow_up': protocol.get('follow_up', []),
                    'method': protocol.get('method', ''),
                    'phase': protocol.get('phase', ''),
                    'score': protocol.get('priority', 50) / 100,
                    'reasoning': ['Fallback: phase match']
                })

        # Trier par priorité
        results.sort(key=lambda x: x.get('score', 0), reverse=True)
        return results[:top_k]

# Memory Layer for anonymized learning
class ClinicalMemory:
    def __init__(self, base_dir: Optional[str] = None):
        self.base_dir = base_dir or os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
        self.path = os.path.join(self.base_dir, 'backend', 'ai-engine', 'memory_store.jsonl')
        os.makedirs(os.path.dirname(self.path), exist_ok=True)
        if not os.path.exists(self.path):
            with open(self.path, 'w', encoding='utf-8') as _:
                pass

    def log_interaction(self, payload: Dict[str, Any]):
        # Expected payload must be anonymized by caller.
        with open(self.path, 'a', encoding='utf-8') as f:
            f.write(json.dumps(payload, ensure_ascii=False) + "\n")

# Pipeline steps
class TherapeuticEngine:
    def __init__(self, router: Optional[LLMRouter] = None, ckb: Optional[ClinicalKnowledgeBase] = None, memory: Optional[ClinicalMemory] = None):
        self.router = router or LLMRouter()
        self.ckb = ckb or ClinicalKnowledgeBase()
        self.memory = memory or ClinicalMemory()
        self.model_name = os.getenv('PROPRIETARY_MODEL_NAME', 'Aegis-Clinical')

        # Safety Monitor
        self.safety_monitor = SafetyMonitor()
        self.session_baseline = {}  # Stocke baseline par session
        self.session_start_time = {}  # Stocke temps début session

    def generate_welcome_message(self, user_name: str, user_state: Dict[str, Any]) -> str:
        """
        Génère un message d'accueil personnalisé pour le premier contact.
        Utilise le RAG pour trouver le protocole d'accueil le plus adapté.
        """
        # Essayer d'utiliser le RAG pour trouver un protocole d'accueil
        try:
            relevant_protocols = self.ckb.retrieve_relevant_protocols(
                user_message="premier contact bienvenue accueil",
                current_phase="ancrage",  # Phase d'accueil = ancrage/stabilisation
                emotional_state={'detresse': 50, 'espoir': 50, 'energie': 50},
                top_k=1
            )

            if relevant_protocols:
                protocol = relevant_protocols[0]
                template = protocol.get('template', '')
                if template:
                    # Personnaliser avec le prénom
                    welcome = template.replace('{user_name}', user_name)
                    logger.info(f"Welcome from RAG: {protocol.get('protocol_id')}")
                    return welcome

        except Exception as e:
            logger.warning(f"RAG welcome failed: {e}")

        # Fallback: message d'accueil par défaut mais varié
        import random
        welcome_templates = [
            f"Bonjour {user_name}. Je suis là pour t'accompagner. Prends ton temps, nous avançons à ton rythme. Comment te sens-tu en ce moment ?",
            f"Bienvenue {user_name}. Je suis ici pour t'écouter, sans jugement. Qu'est-ce qui t'amène aujourd'hui ?",
            f"Bonjour {user_name}. Cet espace est le tien. Dis-moi ce qui se passe pour toi, ou simplement comment tu vas.",
            f"Salut {user_name}. Je suis là, présent·e avec toi. Comment puis-je t'accompagner aujourd'hui ?",
        ]
        return random.choice(welcome_templates)

    def assess_needs(self, user_state: Dict[str, Any]) -> Dict[str, Any]:
        # Minimal rule-based assessment; can be replaced by knowledge model prompt
        return {
            'phase': user_state.get('phase', 'ancrage'),
            'severity': int(user_state.get('detresse', 50)),
            'contraindications': user_state.get('contraindications', []),
        }

    def choose_technique(self, assessment: Dict[str, Any], user_state: Dict[str, Any], conversation_context: Dict[str, Any]) -> str:
        """
        Choix intelligent de la technique thérapeutique - Evidence-Based

        Nouvelle architecture :
        1. Advanced Detection (multi-modal)
        2. Clinical Screening (sécurité)
        3. Sélection basée sur confiance + screening
        """
        try:
            # Import des nouveaux moteurs evidence-based
            from .advanced_detection import AdvancedDetectionEngine
            from .clinical_screening import ClinicalScreeningEngine

            # Initialiser les moteurs
            detection_engine = AdvancedDetectionEngine()
            screening_engine = ClinicalScreeningEngine()

            # Préparer le contexte thérapeutique
            therapeutic_context = {
                "alliance": user_state.get("therapeutic_alliance", 0.7),
                "session_count": conversation_context.get("session_count", 0),
                "previous_methods": conversation_context.get("previous_methods", []),
                "safety_perceived": user_state.get("safety_perceived", 0.7)
            }

            # Obtenir l'historique de conversation
            conversation_history = conversation_context.get("history", [])
            user_message = conversation_context.get("last_message", "")

            # === DÉTECTION MULTI-MODALE ===
            detection_signals = detection_engine.detect_all_methods(
                user_message=user_message,
                user_state=user_state,
                conversation_history=conversation_history,
                therapeutic_context=therapeutic_context
            )

            # Si aucune méthode détectée, fallback
            if not detection_signals:
                logger.info("No methods detected, using fallback logic")
                return self._fallback_technique(assessment)

            # === SCREENING CLINIQUE ===
            # Trier par confiance et vérifier screening pour chaque méthode
            for signal in detection_signals:
                method = signal.method

                logger.info(f"Evaluating {method} (confidence: {signal.confidence:.2f})")

                # Screening de sécurité
                # Note: emotion_analysis serait idéalement obtenu depuis EmotionBERT
                # Pour l'instant, on utilise user_state comme proxy
                emotion_analysis = {
                    "arousal": user_state.get("emotional_arousal", 0.5),
                    "valence": user_state.get("emotional_valence", 0.5),
                    "cognitive_fusion": user_state.get("cognitive_fusion", 0.0),
                    "experiential_avoidance": user_state.get("experiential_avoidance", 0.0),
                    "rumination": user_state.get("rumination", 0.0),
                    "mentalization_capacity": user_state.get("mentalization_capacity", 0.5),
                    "cognitive_processing": user_state.get("cognitive_processing", 0.5)
                }

                screening_result = screening_engine.screen_method(
                    method=method,
                    user_state=user_state,
                    emotion_analysis=emotion_analysis,
                    therapeutic_context=therapeutic_context
                )

                # Si approuvé, utiliser cette méthode
                if screening_result.approved:
                    logger.info(f"Method {method} approved (risk: {screening_result.risk_level.value})")

                    # Mapper vers les noms de techniques existants
                    method_mapping = {
                        "tipi": "TIPI_ADAPTIVE",
                        "act": "ACT_ADAPTIVE",
                        "journaling_expressif": "JOURNALING_ADAPTIVE",
                        "continuing_bonds": "BONDS_ADAPTIVE"
                    }

                    return method_mapping.get(method, method.upper())

                else:
                    logger.warning(f"Method {method} not approved: {screening_result.risk_factors}")

                    # Si des alternatives sont suggérées, les essayer
                    if screening_result.alternative_methods:
                        logger.info(f"Trying alternatives: {screening_result.alternative_methods}")
                        # TODO: Implémenter logique pour alternatives

            # Si aucune méthode n'est approuvée, fallback sécurisé
            logger.warning("No methods approved after screening, using safe fallback")
            return self._safe_fallback(user_state, screening_result)

        except Exception as e:
            logger.warning(f"Evidence-based engines not available: {e}, falling back to simple logic")
            return self._fallback_technique(assessment)

    def _fallback_technique(self, assessment: Dict[str, Any]) -> str:
        """Fallback simple si moteurs avancés indisponibles"""
        if assessment['phase'] == 'ancrage':
            return 'TIPI'
        if assessment['severity'] >= 70:
            return 'validation_emotionnelle'
        return 'logotherapie'

    def _safe_fallback(self, user_state: Dict[str, Any], screening_result) -> str:
        """
        Fallback sécurisé basé sur les alternatives suggérées

        Priorité aux méthodes de stabilisation si aucune méthode complexe n'est appropriée
        """
        detresse = user_state.get("detresse", 50)

        # Si détresse très élevée → régulation physiologique
        if detresse > 80:
            return 'coherence_cardiaque'

        # Si dissociation → grounding
        if user_state.get("dissociation", 0) > 0.6:
            return 'grounding_5_sens'

        # Sinon → validation empathique
        return 'validation_emotionnelle'

        # Fallback : logique simple existante
        if assessment['phase'] == 'ancrage':
            return 'TIPI'
        if assessment['severity'] >= 70:
            return 'validation_emotionnelle'
        return 'logotherapie'

    def craft_intervention(
        self,
        intention_id: str,
        user_state: Dict[str, Any],
        technique: str,
        user_message: str = "",
        conversation_history: List[str] = None
    ) -> Tuple[str, Dict[str, Any]]:
        """
        Génère une intervention thérapeutique en utilisant le RAG vectoriel.

        Pipeline:
        1. Retrieval sémantique des protocoles pertinents via VectorRAG
        2. Sélection du meilleur protocole selon contexte
        3. Personnalisation avec le prénom utilisateur
        4. Fallback sur LLM si aucun protocole trouvé
        """
        user_name = user_state.get('user_name', 'ami')
        current_phase = user_state.get('phase', 'exploration')

        # === 1) RETRIEVAL VIA RAG VECTORIEL ===
        if user_message:
            emotional_state = {
                'detresse': user_state.get('detresse', 50),
                'espoir': user_state.get('espoir', 50),
                'energie': user_state.get('energie', 50)
            }

            # Recherche sémantique
            relevant_protocols = self.ckb.retrieve_relevant_protocols(
                user_message=user_message,
                current_phase=current_phase,
                emotional_state=emotional_state,
                conversation_history=conversation_history,
                top_k=3
            )

            if relevant_protocols:
                # Prendre le meilleur protocole
                best_protocol = relevant_protocols[0]
                logger.info(f"RAG selected protocol: {best_protocol['protocol_id']} (score: {best_protocol['score']:.2f})")

                # Utiliser le template personnalisé
                template = best_protocol.get('template', best_protocol.get('summary', ''))
                if template:
                    # Personnaliser avec le prénom
                    template = template.replace('{user_name}', user_name)
                    template = template.replace('{emotion_reflet}', self._generate_emotion_reflection(user_message, user_state))

                    return template, {
                        'source': 'vector_rag',
                        'technique': technique,
                        'protocol_id': best_protocol['protocol_id'],
                        'protocol_name': best_protocol['name'],
                        'rag_score': best_protocol['score'],
                        'reasoning': best_protocol.get('reasoning', []),
                        'follow_up': best_protocol.get('follow_up', [])
                    }

        # === 2) FALLBACK: Recherche par intention_id direct ===
        proto = self.ckb.get_micro_protocol(intention_id)
        if proto:
            proto = proto.replace('{user_name}', user_name)
            return proto, {'source': 'ckb_direct', 'technique': technique}

        # === 3) FALLBACK: Génération via LLM ===
        logger.info("No RAG match, falling back to LLM generation")
        prompt = (
            "Rédige un micro-protocole concis (2–3 phrases) pour l'intention clinique suivante, "
            "dans un cadre validé, sans injonctions, compatible non-directivité.\n"
            f"Technique: {technique}.\n"
            f"Intention: {intention_id}.\n"
            f"Prénom de l'utilisateur: {user_name}\n"
            f"Message de l'utilisateur: {user_message[:200] if user_message else 'non fourni'}\n"
            f"État émotionnel: détresse={user_state.get('detresse', 50)}, espoir={user_state.get('espoir', 50)}, énergie={user_state.get('energie', 50)}\n"
            f"Phase: {current_phase}\n"
            "Contraintes: sécurité, neutralité, pas d'interprétation, pas de promesse.\n"
            "IMPORTANT: Adresse-toi directement à la personne par son prénom. Ne donne pas de conseils directs."
        )
        plan = self.router.call_knowledge([
            {'role': 'system', 'content': 'Moteur de savoir clinique. Tu génères des micro-protocoles thérapeutiques personnalisés.'},
            {'role': 'user', 'content': prompt},
        ], temperature=0.3, max_tokens=250)

        return plan, {'source': 'knowledge_model', 'technique': technique}

    def _generate_emotion_reflection(self, user_message: str, user_state: Dict) -> str:
        """Génère un reflet émotionnel basé sur le message"""
        detresse = user_state.get('detresse', 50)

        # Reflets simples basés sur le niveau de détresse
        if detresse > 70:
            return "Ce que tu traverses semble vraiment difficile"
        elif detresse > 50:
            return "Je sens que c'est un moment important pour toi"
        else:
            return "Ce que tu partages est significatif"

    def deliver_empathically(self, micro_text: str, tone: str = 'neutre') -> str:
        guide = {
            'lent': 'ton doux, phrases courtes, rythme lent',
            'enveloppant': 'ton contenant et rassurant',
            'neutre': 'ton simple et non-directif'
        }.get(tone, 'ton simple et non-directif')
        prompt = (
            "Reformule et délivre ce micro-protocole dans une posture non-directive, \n"
            "avec présence, sans conseils, en 2–3 phrases. Respecte: " + guide + "\n\n" + micro_text
        )
        out = self.router.call_empathy([
            { 'role': 'system', 'content': 'Tu es un moteur de relation thérapeutique, non-directif.' },
            { 'role': 'user', 'content': prompt },
        ], temperature=0.7, max_tokens=300)
        return out.strip()

    def run_pipeline(self, user_state: Dict[str, Any], policy: Dict[str, Any]) -> Dict[str, Any]:
        # Safety Monitor - Stocker baseline + mise à jour historique
        user_id = policy.get('user_id', 'unknown')
        if user_id not in self.session_baseline:
            self.session_baseline[user_id] = user_state.copy()
            import time
            self.session_start_time[user_id] = time.time()

        # Mettre à jour historique pour seuils adaptatifs
        self.safety_monitor.adaptive_thresholds.update_history(user_id, {
            "detresse": user_state.get('detresse', 50),
            "arousal": user_state.get('arousal', 0.5),
            "dissociation": user_state.get('dissociation', 0)
        })

        # Optional personalization with user profile
        user_id_hash = policy.get('user_id_hash') or user_state.get('user_id_hash')
        if user_id_hash:
            try:
                from .personalization import get_profile, suggest_action
                profile = get_profile(user_id_hash)
                tech_p, tone_p, length_p = suggest_action(profile, user_state)
            except Exception:
                tech_p, tone_p, length_p = None, None, None
        else:
            tech_p, tone_p, length_p = None, None, None

        # 1) Assessment
        assessment = self.assess_needs(user_state)

        # 2) Choose technique (combine collective + personal)
        # Créer un contexte de conversation pour le choix intelligent
        conversation_context = policy.get('conversation_context', {})
        technique = tech_p or self.choose_technique(assessment, user_state, conversation_context)
        try:
            from .collective_policy import suggest_from_collective
            tech_c, score_c = suggest_from_collective(user_state)
            # simple arbitration: override if collective confidence is high and no personal pref
            if not tech_p and score_c > 0.6:
                technique = tech_c
        except Exception:
            pass

        # 3) Choose or synthesize intention id
        intention_id = policy.get('intention_id') or f"phase:{assessment['phase']}"

        # 3.1) Extraire le message utilisateur pour le RAG
        user_messages = conversation_context.get('messages', [])
        last_user_message = ""
        conversation_history = []
        for msg in user_messages:
            if msg.get('role') == 'user':
                content = msg.get('content', '')
                conversation_history.append(content)
                last_user_message = content

        # 4) Craft intervention/micro-protocol avec RAG vectoriel
        logger.info(f"[PIPELINE] Phase: {assessment['phase']}, Technique: {technique}, Message: {last_user_message[:50] if last_user_message else 'N/A'}...")
        micro, meta = self.craft_intervention(
            intention_id,
            user_state,
            technique,
            user_message=last_user_message,
            conversation_history=conversation_history
        )

        # Log RAG info if available
        if meta.get('source') == 'vector_rag':
            logger.info(f"[RAG] Protocol: {meta.get('protocol_name')} (score: {meta.get('rag_score', 0):.2f})")
            logger.info(f"[RAG] Reasoning: {meta.get('reasoning', [])[:2]}")
        else:
            logger.info(f"[FALLBACK] Source: {meta.get('source')}, Technique: {technique}")

        # 5) Deliver empathically with adapted tone
        tone = tone_p or policy.get('tone','neutre')
        text = self.deliver_empathically(micro, tone=tone)

        # 5.1) Safety Monitor - Vérifier effets indésirables
        conversation_context = policy.get('conversation_context', {})
        user_messages = conversation_context.get('messages', [])
        user_responses = [msg.get('content', '') for msg in user_messages if msg.get('role') == 'user']

        import time
        session_duration = (time.time() - self.session_start_time.get(user_id, time.time())) / 60

        safety_alert = self.safety_monitor.monitor_session(
            method=technique,
            current_state=user_state,
            baseline_state=self.session_baseline.get(user_id, user_state),
            user_responses=user_responses[-10:],
            session_duration_minutes=session_duration,
            user_id=user_id  # NOUVEAU: Pour seuils adaptatifs
        )

        if safety_alert:
            # NOUVEAU: Plan d'intervention optimal
            intervention_plan = self.safety_monitor.intervention_system.get_optimal_intervention(
                safety_level="warning" if safety_alert.severity > 0.7 else "caution",
                risk_prediction={"risk_score": safety_alert.severity, "risk_factors": safety_alert.indicators},
                user_context={"method": technique, "session_duration": session_duration}
            )

            if safety_alert.recommended_action == SafetyAction.STOP_SESSION:
                debriefing = self.safety_monitor.get_debriefing_protocol(safety_alert)
                text = f"Je remarque que cette approche semble difficile en ce moment. {' '.join(debriefing.get('steps', [])[:2])} Prenons une pause."
            elif safety_alert.recommended_action == SafetyAction.SWITCH_METHOD:
                text = f"Essayons une approche différente qui pourrait être plus confortable pour vous maintenant."
            elif safety_alert.recommended_action == SafetyAction.STABILIZATION:
                text = "Prenons un moment pour revenir au calme. Concentrez-vous sur votre respiration : inspirez lentement par le nez, expirez par la bouche."

        # 5.2) Post-filter no_grief_cause
        if policy.get('no_grief_cause'):
            banned = ['décès', 'mort', 'disparu', 'perte', 'deuil']
            low = text.lower()
            if any(w in low for w in banned):
                text = "Merci pour ta confiance. Restons sur des repères concrets du présent (respiration, appuis), sans revenir sur les causes."

        # 6) Log anonymized + enriched
        log_payload = {
            'intention_id': intention_id,
            'phase': assessment['phase'],
            'technique': technique,
            'meta_source': meta.get('source'),
            'scores': {k: user_state.get(k) for k in ('detresse','espoir','energie')},
            'model_used': os.getenv('KNOWLEDGE_MODEL', os.getenv('MODEL_NAME', 'gpt-4o-mini')),
            'prompt_used': micro[:400],
            'emotion_context': {
                'detresse': int(user_state.get('detresse', 50)),
                'espoir': int(user_state.get('espoir', 50)),
                'energie': int(user_state.get('energie', 50)),
                'phase': assessment['phase']
            },
            # RAG info
            'rag_info': {
                'protocol_id': meta.get('protocol_id'),
                'protocol_name': meta.get('protocol_name'),
                'rag_score': meta.get('rag_score'),
                'source': meta.get('source')
            } if meta.get('source') == 'vector_rag' else None
        }
        self.memory.log_interaction(log_payload)
        return {
            'text': text,
            'intention_id': intention_id,
            'technique': technique,
            'source': meta.get('source'),
            'prompt_used': log_payload['prompt_used'],
            'model_used': log_payload['model_used'],
            'emotion_context': log_payload['emotion_context'],
            # RAG info
            'rag_info': {
                'protocol_id': meta.get('protocol_id'),
                'protocol_name': meta.get('protocol_name'),
                'rag_score': meta.get('rag_score'),
                'reasoning': meta.get('reasoning', []),
                'follow_up': meta.get('follow_up', [])
            } if meta.get('source') == 'vector_rag' else None
        }
