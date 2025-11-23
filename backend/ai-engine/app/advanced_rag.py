"""
RAG Avancé avec Graphe de Connaissances Cliniques

Architecture :
- KnowledgeGraphRAG : Retrieval multi-critères avec graphe sémantique
- SuperSystemPromptEngine : Génération de super-prompts cliniquement validés
- EnhancedTherapeuticEngine : Moteur hybride combinant existant + avancé
"""

from typing import Dict, List, Optional, Tuple
import json
import numpy as np
from dataclasses import dataclass
from enum import Enum
import logging
import os
from pathlib import Path

logger = logging.getLogger(__name__)

# Import du moteur EmotionBERT
try:
    import sys
    sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'emotions-service' / 'app'))
    from advanced_emotion import EmotionalState, ClinicalEmotionEngine
    EMOTION_ENGINE_AVAILABLE = True
except ImportError:
    logger.warning("EmotionBERT not available for RAG")
    EMOTION_ENGINE_AVAILABLE = False

    # Fallback EmotionalState
    @dataclass
    class EmotionalState:
        valence: float = 0.0
        arousal: float = 0.0
        dominance: float = 0.0
        grief_intensity: float = 0.5
        phase_confidence: Dict[str, float] = None


class TherapeuticPhase(Enum):
    """Phases thérapeutiques du deuil"""
    CRISIS = "crisis"
    STABILIZATION = "stabilization"
    EXPLORATION = "exploration"
    MEANING_MAKING = "meaning_making"
    RECONSTRUCTION = "reconstruction"


@dataclass
class ClinicalContext:
    """Contexte clinique complet pour le RAG"""
    emotional_state: EmotionalState
    user_history: List[Dict]
    current_phase: TherapeuticPhase
    therapeutic_alliance: float  # Qualité relation thérapeutique [0,1]
    intervention_history: List[str]
    safety_level: float  # Niveau de sécurité [0,1]


class KnowledgeGraphRAG:
    """RAG avec graphe de connaissances cliniques"""

    def __init__(self):
        self.protocols_db = self._load_protocols()
        self.knowledge_graph = self._build_knowledge_graph()
        logger.info(f"KnowledgeGraphRAG initialized with {len(self.protocols_db)} protocols")

    def _load_protocols(self) -> Dict:
        """Charge tous les protocoles depuis les modules existants"""
        protocols = {}

        # Charger depuis les modules existants (grief, anxiety, crisis)
        modules_path = Path(__file__).parent.parent.parent / 'modules'

        if modules_path.exists():
            for module_dir in modules_path.iterdir():
                if module_dir.is_dir():
                    # Charger micro_protocols.json
                    protocols_file = module_dir / 'micro_protocols.json'
                    if protocols_file.exists():
                        try:
                            with open(protocols_file, 'r', encoding='utf-8') as f:
                                module_protocols = json.load(f)
                                for protocol_id, protocol in module_protocols.items():
                                    protocols[protocol_id] = {
                                        **protocol,
                                        'module': module_dir.name,
                                        'source': 'micro_protocols'
                                    }
                                logger.info(f"Loaded {len(module_protocols)} protocols from {module_dir.name}")
                        except Exception as e:
                            logger.error(f"Error loading protocols from {module_dir.name}: {e}")

                    # Charger intentions.json
                    intentions_file = module_dir / 'intentions.json'
                    if intentions_file.exists():
                        try:
                            with open(intentions_file, 'r', encoding='utf-8') as f:
                                intentions = json.load(f)
                                for intention_id, intention in intentions.items():
                                    if intention_id not in protocols:
                                        protocols[intention_id] = {
                                            **intention,
                                            'module': module_dir.name,
                                            'source': 'intentions'
                                        }
                                logger.info(f"Loaded {len(intentions)} intentions from {module_dir.name}")
                        except Exception as e:
                            logger.error(f"Error loading intentions from {module_dir.name}: {e}")

        # Fallback : protocoles par défaut si aucun fichier trouvé
        if not protocols:
            logger.warning("No protocols found, using default fallback protocols")
            protocols = self._get_fallback_protocols()

        return protocols

    def _get_fallback_protocols(self) -> Dict:
        """Protocoles par défaut si aucun fichier n'est trouvé"""
        return {
            'grounding_5_sens': {
                'id': 'grounding_5_sens',
                'summary': 'Ancrage sensoriel 5 sens pour stabilisation immédiate',
                'metadata': {'phase': 'crisis', 'technique': 'grounding'},
                'module': 'fallback'
            },
            'respiration_guidee': {
                'id': 'respiration_guidee',
                'summary': 'Respiration guidée pour régulation émotionnelle',
                'metadata': {'phase': 'stabilization', 'technique': 'breathing'},
                'module': 'fallback'
            },
            'ecoute_reflet': {
                'id': 'ecoute_reflet',
                'summary': 'Écoute active avec reflets pour exploration douce',
                'metadata': {'phase': 'exploration', 'technique': 'listening'},
                'module': 'fallback'
            }
        }




    def _build_knowledge_graph(self) -> Dict:
        """Construit un graphe sémantique des protocoles"""
        graph = {
            'nodes': {},
            'edges': []
        }

        for protocol_id, protocol in self.protocols_db.items():
            metadata = protocol.get('metadata', {})

            graph['nodes'][protocol_id] = {
                'type': 'protocol',
                'phase': metadata.get('phase', 'unknown'),
                'technique': metadata.get('technique', 'unknown'),
                'summary': protocol.get('summary', protocol.get('intent', '')),
                'module': protocol.get('module', 'unknown'),
                'priority': protocol.get('priority', 50),
                # Embedding simple basé sur le texte
                'embedding': self._simple_text_embedding(protocol.get('summary', ''))
            }

        # Construire les arêtes (relations entre protocoles)
        for id1, node1 in graph['nodes'].items():
            for id2, node2 in graph['nodes'].items():
                if id1 != id2 and node1['phase'] == node2['phase']:
                    graph['edges'].append({
                        'from': id1,
                        'to': id2,
                        'type': 'same_phase',
                        'weight': 0.5
                    })

        return graph

    def _simple_text_embedding(self, text: str) -> np.ndarray:
        """Embedding simple basé sur hash (à remplacer par sentence-transformers)"""
        np.random.seed(hash(text) % (2**32))
        return np.random.randn(128)

    def retrieve_protocols(
        self,
        context: ClinicalContext,
        intention: str,
        top_k: int = 3
    ) -> List[Dict]:
        """Retrieval avancé avec scoring multi-critères"""

        # 1. Recherche vectorielle
        vector_candidates = self._vector_search(intention, context, top_k * 3)

        # 2. Filtrage contextuel
        contextual_candidates = self._contextual_filter(vector_candidates, context)

        # 3. Raisonnement clinique
        reasoned_protocols = self._clinical_reasoning(contextual_candidates, context)

        # 4. Ranking final
        ranked_protocols = self._multimodal_ranking(reasoned_protocols, context)

        return ranked_protocols[:top_k]

    def _vector_search(
        self,
        intention: str,
        context: ClinicalContext,
        n_candidates: int
    ) -> List[Tuple[str, float]]:
        """Recherche sémantique dans l'espace vectoriel"""
        query_embedding = self._simple_text_embedding(intention)

        scores = []
        for protocol_id, node in self.knowledge_graph['nodes'].items():
            similarity = self._cosine_similarity(query_embedding, node['embedding'])
            phase_match = 1.0 if node.get('phase') == context.current_phase.value else 0.5
            scores.append((protocol_id, similarity * phase_match))

        return sorted(scores, key=lambda x: x[1], reverse=True)[:n_candidates]

    def _cosine_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """Calcule la similarité cosinus entre deux vecteurs"""
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        return float(dot_product / (norm1 * norm2)) if norm1 > 0 and norm2 > 0 else 0.0

    def _contextual_filter(
        self,
        candidates: List[Tuple[str, float]],
        context: ClinicalContext
    ) -> List[Tuple[str, float]]:
        """Filtrage basé sur le contexte clinique"""
        filtered = []

        for protocol_id, score in candidates:
            protocol = self.protocols_db[protocol_id]

            if self._is_contraindicated(protocol, context):
                continue

            if not self._within_tolerance_window(protocol, context):
                continue

            filtered.append((protocol_id, score))

        return filtered

    def _is_contraindicated(self, protocol: Dict, context: ClinicalContext) -> bool:
        """Vérifie si le protocole est contre-indiqué"""
        # Pas d'exploration profonde en crise
        if context.current_phase == TherapeuticPhase.CRISIS:
            metadata = protocol.get('metadata', {})
            if metadata.get('technique') in ['deep_exploration', 'memory_work']:
                return True

        # Pas de techniques complexes si alliance faible
        if context.therapeutic_alliance < 0.3:
            if protocol.get('priority', 50) > 70:
                return True

        return False

    def _within_tolerance_window(self, protocol: Dict, context: ClinicalContext) -> bool:
        """Vérifie si l'utilisateur est dans sa fenêtre de tolérance"""
        arousal = context.emotional_state.arousal

        # Si arousal trop élevé, éviter les techniques activantes
        if arousal > 0.8:
            metadata = protocol.get('metadata', {})
            if metadata.get('activation_level', 'medium') == 'high':
                return False

        return True


    def _clinical_reasoning(
        self,
        candidates: List[Tuple[str, float]],
        context: ClinicalContext
    ) -> List[Dict]:
        """Raisonnement clinique avec chain-of-thought"""
        reasoned = []

        for protocol_id, score in candidates:
            protocol = self.protocols_db[protocol_id]

            # Reasoning steps
            reasoning_steps = [
                f"Protocol: {protocol_id}",
                f"Emotional state: valence={context.emotional_state.valence:.2f}, arousal={context.emotional_state.arousal:.2f}",
                f"Phase: {context.current_phase.value}",
                f"Therapeutic alliance: {context.therapeutic_alliance:.2f}",
                f"Expected efficacy: {self._predict_efficacy(protocol, context):.2f}"
            ]

            reasoned.append({
                'protocol': protocol,
                'protocol_id': protocol_id,
                'score': score,
                'reasoning': reasoning_steps,
                'efficacy_prediction': self._predict_efficacy(protocol, context)
            })

        return reasoned

    def _predict_efficacy(self, protocol: Dict, context: ClinicalContext) -> float:
        """Prédit l'efficacité du protocole pour ce contexte"""
        efficacy = 0.5  # Base

        # Bonus si phase correspond
        metadata = protocol.get('metadata', {})
        if metadata.get('phase') == context.current_phase.value:
            efficacy += 0.2

        # Bonus si alliance forte et protocole complexe
        if context.therapeutic_alliance > 0.7 and protocol.get('priority', 50) > 60:
            efficacy += 0.15

        # Malus si grief_intensity élevée et protocole non adapté
        if context.emotional_state.grief_intensity > 0.8:
            if metadata.get('phase') not in ['crisis', 'stabilization']:
                efficacy -= 0.2

        return max(0.0, min(1.0, efficacy))

    def _multimodal_ranking(
        self,
        protocols: List[Dict],
        context: ClinicalContext
    ) -> List[Dict]:
        """Ranking final multi-modal"""
        ranked = []

        for item in protocols:
            final_score = (
                item['score'] * 0.4 +  # Similarité sémantique
                item['efficacy_prediction'] * 0.3 +  # Efficacité prédite
                self._novelty_score(item['protocol'], context) * 0.2 +  # Nouveauté
                self._safety_score(item['protocol'], context) * 0.1  # Sécurité
            )

            ranked.append({
                **item,
                'final_score': final_score
            })

        return sorted(ranked, key=lambda x: x['final_score'], reverse=True)

    def _novelty_score(self, protocol: Dict, context: ClinicalContext) -> float:
        """Score de nouveauté (éviter la répétition)"""
        protocol_id = protocol.get('id', '')

        # Si déjà utilisé récemment, pénaliser
        if protocol_id in context.intervention_history[-3:]:
            return 0.2
        elif protocol_id in context.intervention_history:
            return 0.5
        else:
            return 1.0

    def _safety_score(self, protocol: Dict, context: ClinicalContext) -> float:
        """Score de sécurité"""
        # Toujours élevé si safety_level du contexte est bon
        if context.safety_level > 0.7:
            return 1.0

        # Si safety_level faible, privilégier protocoles simples
        metadata = protocol.get('metadata', {})
        if metadata.get('phase') in ['crisis', 'stabilization']:
            return 1.0
        else:
            return 0.5


class SuperSystemPromptEngine:
    """Génération de super-prompts cliniquement validés"""

    def __init__(self, rag_engine: KnowledgeGraphRAG):
        self.rag = rag_engine
        self.prompt_templates = self._load_templates()

    def _load_templates(self) -> Dict[str, Dict]:
        """Charge les templates de prompts cliniques depuis advanced_contexts.json"""
        contexts_file = Path(__file__).parent.parent / 'advanced_contexts.json'

        if contexts_file.exists():
            try:
                with open(contexts_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error loading advanced_contexts.json: {e}")

        # Fallback templates
        return self._get_fallback_templates()

    def _get_fallback_templates(self) -> Dict[str, Dict]:
        """Templates par défaut si fichier non trouvé"""
        return {
            'crisis_context': {
                'role': 'Thérapeute de crise',
                'safety_rules': ['Stabilisation d'abord', 'Instructions courtes'],
                'prompt_template': 'ROLE: {role}\nCONTEXTE: {clinical_context}\nRÉPONSE:'
            },
            'standard_context': {
                'role': 'Compagnon thérapeutique',
                'safety_rules': ['Écoute active', 'Respect des émotions'],
                'prompt_template': 'ROLE: {role}\nCONTEXTE: {clinical_context}\nRÉPONSE:'
            }
        }

    def generate_therapeutic_prompt(
        self,
        context: ClinicalContext,
        user_message: str
    ) -> str:
        """Génère un super-prompt pour le LLM"""

        # 1. Retrieval des protocoles pertinents
        protocols = self.rag.retrieve_protocols(context, user_message)

        # 2. Construction du contexte clinique
        clinical_context = self._build_clinical_context(context)

        # 3. Sélection du template
        template_key, template = self._select_template(context, protocols)

        # 4. Génération du prompt final
        final_prompt = self._render_prompt(template, clinical_context, protocols, user_message)

        logger.info(f"Generated prompt using template: {template_key}")
        return final_prompt


    def _build_clinical_context(self, context: ClinicalContext) -> Dict:
        """Construit le contexte clinique structuré"""
        phase_confidence = context.emotional_state.phase_confidence or {}
        primary_phase = max(phase_confidence.items(), key=lambda x: x[1])[0] if phase_confidence else 'unknown'

        return {
            'emotional_state': {
                'valence': context.emotional_state.valence,
                'arousal': context.emotional_state.arousal,
                'dominance': context.emotional_state.dominance,
                'grief_intensity': context.emotional_state.grief_intensity,
                'primary_phase': primary_phase
            },
            'therapeutic_context': {
                'phase': context.current_phase.value,
                'alliance_strength': context.therapeutic_alliance,
                'recent_interventions': context.intervention_history[-3:] if context.intervention_history else []
            },
            'safety_considerations': {
                'safety_level': context.safety_level,
                'within_tolerance': context.emotional_state.arousal < 0.8
            }
        }

    def _select_template(self, context: ClinicalContext, protocols: List) -> Tuple[str, Dict]:
        """Sélectionne le template de prompt adapté"""
        # Sélection basée sur la phase et l'état émotionnel
        if context.current_phase == TherapeuticPhase.CRISIS:
            return 'crisis_context', self.prompt_templates.get('crisis_context', {})
        elif context.emotional_state.grief_intensity > 0.7:
            return 'stabilization_context', self.prompt_templates.get('stabilization_context', {})
        elif context.therapeutic_alliance < 0.3:
            return 'building_alliance_context', self.prompt_templates.get('building_alliance_context', {})
        elif context.current_phase == TherapeuticPhase.MEANING_MAKING:
            return 'meaning_making_context', self.prompt_templates.get('meaning_making_context', {})
        elif context.current_phase == TherapeuticPhase.RECONSTRUCTION:
            return 'reconstruction_context', self.prompt_templates.get('reconstruction_context', {})
        else:
            return 'exploration_context', self.prompt_templates.get('exploration_context', {})

    def _render_prompt(
        self,
        template: Dict,
        clinical_context: Dict,
        protocols: List,
        user_message: str
    ) -> str:
        """Rendu final du prompt"""

        # Extraire les informations du template
        role = template.get('role', 'Compagnon thérapeutique')
        safety_rules = template.get('safety_rules', [])
        prompt_template = template.get('prompt_template', 'ROLE: {role}\nRÉPONSE:')

        # Construire les instructions de protocoles
        protocol_instructions = "\n".join([
            f"- {p['protocol'].get('summary', '')} "
            f"(Efficacité: {p['efficacy_prediction']:.2f}, Score: {p['final_score']:.2f})"
            for p in protocols
        ]) if protocols else "Aucun protocole spécifique"

        # Construire les consignes de sécurité
        safety_guidelines = "\n".join([f"- {rule}" for rule in safety_rules])

        # Rendu du template
        return prompt_template.format(
            role=role,
            clinical_context=json.dumps(clinical_context, indent=2, ensure_ascii=False),
            protocol_instructions=protocol_instructions,
            safety_guidelines=safety_guidelines,
            safety_rules=safety_guidelines,
            user_message=user_message
        )


# Instance globale du RAG
_rag_instance = None

def get_rag_engine() -> KnowledgeGraphRAG:
    """Retourne l'instance singleton du RAG"""
    global _rag_instance
    if _rag_instance is None:
        _rag_instance = KnowledgeGraphRAG()
    return _rag_instance


