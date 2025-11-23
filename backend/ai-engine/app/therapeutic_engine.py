from __future__ import annotations
from typing import Dict, Any, List, Optional, Tuple
import os
import json
from dotenv import load_dotenv

from .safety_monitor import SafetyMonitor, SafetyAction

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
        """
        if not self.anthropic_client:
            # Fallback si Claude n'est pas disponible
            content = messages[-1]['content'] if messages else ''
            return f"{content[:320]}"
        
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
                    # Fallback sûr
                    content = messages[-1]['content'] if messages else ''
                    return f"{content[:320]}"
        
        # Ne devrait jamais arriver ici, mais fallback de sécurité
        content = messages[-1]['content'] if messages else ''
        return f"{content[:320]}"

# Clinical Knowledge Base (CKB)
class ClinicalKnowledgeBase:
    def __init__(self, base_dir: Optional[str] = None):
        self.base_dir = base_dir or os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
        self.ckb_path = os.path.join(self.base_dir, 'backend', 'modules', 'grief', 'micro_protocols.json')
        self._cache: Dict[str, Any] = {}
        self._ensure_file()
        self._load()

    def _ensure_file(self):
        if not os.path.exists(self.ckb_path):
            os.makedirs(os.path.dirname(self.ckb_path), exist_ok=True)
            with open(self.ckb_path, 'w', encoding='utf-8') as f:
                json.dump({}, f, ensure_ascii=False, indent=2)

    def _load(self):
        try:
            with open(self.ckb_path, 'r', encoding='utf-8') as f:
                self._cache = json.load(f)
        except Exception:
            self._cache = {}

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
        it = self._cache.get(intention_id)
        return it.get('summary') if it else None

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

    def craft_intervention(self, intention_id: str, user_state: Dict[str, Any], technique: str) -> Tuple[str, Dict[str, Any]]:
        # 1) Prefer micro-protocol from CKB
        proto = self.ckb.get_micro_protocol(intention_id)
        if proto:
            return proto, {'source': 'ckb', 'technique': technique}
        # 2) Ask knowledge model to produce a 2–3 sentence micro-protocol
        prompt = (
            "Rédige un micro-protocole concis (2–3 phrases) pour l’intention clinique suivante, "
            "dans un cadre validé, sans injonctions, compatible non-directivité.\n"
            f"Technique: {technique}.\n"
            f"Intention: {intention_id}.\n"
            f"État utilisateur: {json.dumps(user_state, ensure_ascii=False)}\n"
            "Contraintes: sécurité, neutralité, pas d’interprétation, pas de promesse."
        )
        plan = self.router.call_knowledge([
            { 'role': 'system', 'content': 'Moteur de savoir clinique.' },
            { 'role': 'user', 'content': prompt },
        ], temperature=0.2, max_tokens=220)
        # Store in CKB
        self.ckb.upsert_micro_protocol(intention_id, plan, metadata={'technique': technique})
        return plan, {'source': 'knowledge_model', 'technique': technique}

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

        # 4) Craft intervention/micro-protocol
        micro, meta = self.craft_intervention(intention_id, user_state, technique)

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
            }
        }
        self.memory.log_interaction(log_payload)
        return {
            'text': text,
            'intention_id': intention_id,
            'technique': technique,
            'source': meta.get('source'),
            'prompt_used': log_payload['prompt_used'],
            'model_used': log_payload['model_used'],
            'emotion_context': log_payload['emotion_context']
        }
