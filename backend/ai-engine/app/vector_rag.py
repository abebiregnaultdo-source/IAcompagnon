"""
RAG Vectoriel avec Embeddings - État de l'art 2024/2025

Architecture basée sur la recherche:
- Sentence-transformers (all-mpnet-base-v2) pour embeddings sémantiques
- ChromaDB comme vector database
- Emotion-aware retrieval avec NRC Lexicon
- Cosine similarity pour le ranking

Références:
- SentimentCareBot (ScienceDirect 2024)
- OnRL-RAG: Real-Time Personalized Mental Health Dialogue System
- Emotion-Aware Embedding Fusion research (MDPI 2024)
"""

import json
import logging
import os
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field
import hashlib

logger = logging.getLogger(__name__)

# Lazy imports pour éviter les erreurs si les packages ne sont pas installés
_sentence_transformer = None
_chroma_client = None
_nrclex = None


def get_sentence_transformer():
    """Lazy load sentence-transformers"""
    global _sentence_transformer
    if _sentence_transformer is None:
        try:
            from sentence_transformers import SentenceTransformer
            # all-mpnet-base-v2 : meilleur modèle selon la recherche (768 dimensions)
            # Alternative légère : all-MiniLM-L6-v2 (384 dimensions)
            model_name = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
            _sentence_transformer = SentenceTransformer(model_name)
            logger.info(f"Loaded sentence-transformer model: {model_name}")
        except ImportError:
            logger.warning("sentence-transformers not installed, using fallback embeddings")
            _sentence_transformer = None
        except Exception as e:
            logger.error(f"Error loading sentence-transformer: {e}")
            _sentence_transformer = None
    return _sentence_transformer


def get_chroma_client():
    """Lazy load ChromaDB - API 0.4+"""
    global _chroma_client
    if _chroma_client is None:
        try:
            import chromadb

            # Sur Render, utiliser un chemin persistant dans /tmp ou le répertoire de travail
            persist_dir = os.getenv("CHROMA_PERSIST_DIR")

            if persist_dir:
                # Persistent client si chemin configuré
                persist_path = Path(persist_dir)
                persist_path.mkdir(parents=True, exist_ok=True)
                _chroma_client = chromadb.PersistentClient(path=str(persist_path))
                logger.info(f"ChromaDB PersistentClient initialized at {persist_path}")
            else:
                # En mémoire par défaut (suffisant pour Render car les protocoles sont rechargés au démarrage)
                _chroma_client = chromadb.Client()
                logger.info("ChromaDB in-memory client initialized")

        except ImportError:
            logger.warning("chromadb not installed, using fallback keyword search")
            _chroma_client = None
        except Exception as e:
            logger.error(f"Error initializing ChromaDB: {e}")
            _chroma_client = None
    return _chroma_client


def get_emotion_analyzer():
    """Lazy load NRCLex pour analyse émotionnelle"""
    global _nrclex
    if _nrclex is None:
        try:
            from nrclex import NRCLex
            _nrclex = NRCLex
            logger.info("NRCLex emotion analyzer loaded")
        except ImportError:
            logger.warning("nrclex not installed, emotion analysis disabled")
            _nrclex = None
    return _nrclex


@dataclass
class EmotionProfile:
    """Profil émotionnel extrait du texte"""
    fear: float = 0.0
    anger: float = 0.0
    sadness: float = 0.0
    joy: float = 0.0
    trust: float = 0.0
    disgust: float = 0.0
    surprise: float = 0.0
    anticipation: float = 0.0
    positive: float = 0.0
    negative: float = 0.0

    def to_dict(self) -> Dict:
        return {
            "fear": self.fear,
            "anger": self.anger,
            "sadness": self.sadness,
            "joy": self.joy,
            "trust": self.trust,
            "disgust": self.disgust,
            "surprise": self.surprise,
            "anticipation": self.anticipation,
            "positive": self.positive,
            "negative": self.negative
        }

    def dominant_emotion(self) -> str:
        """Retourne l'émotion dominante"""
        emotions = {
            "fear": self.fear,
            "anger": self.anger,
            "sadness": self.sadness,
            "joy": self.joy,
            "trust": self.trust
        }
        return max(emotions, key=emotions.get) if any(emotions.values()) else "neutral"


@dataclass
class RetrievedProtocol:
    """Protocole récupéré avec métadonnées de retrieval"""
    protocol_id: str
    name: str
    summary: str
    template: str
    follow_up: List[str]
    method: str
    phase: str
    similarity_score: float
    emotion_match_score: float
    final_score: float
    reasoning: List[str] = field(default_factory=list)
    metadata: Dict = field(default_factory=dict)


class VectorRAG:
    """
    RAG Vectoriel pour l'accompagnement thérapeutique

    Utilise:
    - Sentence-transformers pour les embeddings sémantiques
    - ChromaDB pour le stockage vectoriel
    - NRCLex pour l'enrichissement émotionnel
    - Scoring multi-critères (similarité + émotion + phase + contexte)
    """

    COLLECTION_NAME = "therapeutic_protocols"

    # Mapping entre les phases du système (adjustment.py) et les phases des protocoles
    PHASE_MAPPING = {
        # Système → Protocole
        "ancrage": ["crisis", "stabilization"],  # Haute détresse → stabilisation
        "expression": ["exploration"],            # Expression émotionnelle
        "sens": ["meaning_making", "exploration"], # Recherche de sens
        "reconstruction": ["reconstruction"],     # Reconstruction
        # Fallbacks pour correspondance directe
        "crisis": ["crisis"],
        "stabilization": ["stabilization"],
        "exploration": ["exploration"],
        "meaning_making": ["meaning_making"],
    }

    def __init__(self):
        self.protocols_db: Dict = {}
        self.collection = None
        self.embedding_model = None
        self._initialized = False

    def initialize(self) -> bool:
        """Initialise le RAG avec les protocoles"""
        if self._initialized:
            return True

        try:
            # 1. Charger les protocoles
            self.protocols_db = self._load_all_protocols()
            logger.info(f"Loaded {len(self.protocols_db)} protocols")

            # 2. Initialiser le modèle d'embeddings
            self.embedding_model = get_sentence_transformer()

            # 3. Initialiser ChromaDB
            chroma = get_chroma_client()
            if chroma:
                # Créer ou récupérer la collection
                try:
                    self.collection = chroma.get_or_create_collection(
                        name=self.COLLECTION_NAME,
                        metadata={"description": "Therapeutic micro-protocols for grief support"}
                    )
                except Exception as e:
                    logger.error(f"Error creating collection: {e}")
                    self.collection = None

            # 4. Indexer les protocoles
            if self.protocols_db:
                self._index_protocols()

            self._initialized = True
            logger.info("VectorRAG initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Error initializing VectorRAG: {e}")
            return False

    def _load_all_protocols(self) -> Dict:
        """Charge tous les protocoles depuis les fichiers JSON"""
        protocols = {}
        modules_path = Path(__file__).parent.parent.parent / 'modules'

        if not modules_path.exists():
            logger.warning(f"Modules path not found: {modules_path}")
            return self._get_fallback_protocols()

        for module_dir in modules_path.iterdir():
            if not module_dir.is_dir():
                continue

            # Charger micro_protocols.json
            protocols_file = module_dir / 'micro_protocols.json'
            if protocols_file.exists():
                try:
                    with open(protocols_file, 'r', encoding='utf-8') as f:
                        module_protocols = json.load(f)
                        for protocol_id, protocol in module_protocols.items():
                            protocols[protocol_id] = {
                                **protocol,
                                'module': module_dir.name
                            }
                        logger.info(f"Loaded {len(module_protocols)} protocols from {module_dir.name}")
                except Exception as e:
                    logger.error(f"Error loading {protocols_file}: {e}")

        if not protocols:
            logger.warning("No protocols found, using fallback")
            return self._get_fallback_protocols()

        return protocols

    def _get_fallback_protocols(self) -> Dict:
        """Protocoles de fallback si aucun fichier trouvé"""
        return {
            "fallback_listening": {
                "id": "fallback_listening",
                "name": "Écoute active",
                "summary": "Écoute attentive et reflet de ce que la personne exprime",
                "template": "Je t'écoute. Qu'est-ce qui se passe pour toi en ce moment ?",
                "follow_up": ["Continue, je suis là.", "Qu'est-ce que ça te fait de partager ça ?"],
                "method": "active_listening",
                "phase": "exploration",
                "module": "fallback"
            }
        }

    def _index_protocols(self):
        """Indexe tous les protocoles dans ChromaDB"""
        if not self.collection:
            logger.warning("No ChromaDB collection, using in-memory search")
            return

        if not self.embedding_model:
            logger.warning("No embedding model, using keyword-based indexing")
            return

        # Préparer les documents pour l'indexation
        documents = []
        metadatas = []
        ids = []
        embeddings = []

        for protocol_id, protocol in self.protocols_db.items():
            # Créer un document riche pour l'embedding
            doc_text = self._create_searchable_text(protocol)
            documents.append(doc_text)

            # Métadonnées pour le filtrage
            metadatas.append({
                "protocol_id": protocol_id,
                "name": protocol.get("name", ""),
                "method": protocol.get("method", ""),
                "phase": protocol.get("phase", ""),
                "module": protocol.get("module", ""),
                "priority": protocol.get("priority", 50),
                "activation_level": protocol.get("activation_level", "medium")
            })

            ids.append(protocol_id)

            # Générer l'embedding
            embedding = self.embedding_model.encode(doc_text).tolist()
            embeddings.append(embedding)

        # Ajouter à ChromaDB
        try:
            # Supprimer les anciens documents s'ils existent
            existing_ids = self.collection.get()["ids"]
            if existing_ids:
                self.collection.delete(ids=existing_ids)

            # Ajouter les nouveaux
            self.collection.add(
                documents=documents,
                metadatas=metadatas,
                ids=ids,
                embeddings=embeddings
            )
            logger.info(f"Indexed {len(documents)} protocols in ChromaDB")
        except Exception as e:
            logger.error(f"Error indexing protocols: {e}")

    def _create_searchable_text(self, protocol: Dict) -> str:
        """Crée un texte riche pour la recherche sémantique"""
        parts = [
            protocol.get("name", ""),
            protocol.get("summary", ""),
            protocol.get("intent", ""),
            protocol.get("template", ""),
            f"méthode: {protocol.get('method', '')}",
            f"phase: {protocol.get('phase', '')}",
        ]

        # Ajouter les triggers émotionnels
        triggers = protocol.get("emotional_triggers", [])
        if triggers:
            parts.append(f"triggers: {', '.join(triggers)}")

        # Ajouter les follow-ups
        follow_ups = protocol.get("follow_up", [])
        if follow_ups:
            parts.append(f"suivi: {' '.join(follow_ups[:2])}")

        return " | ".join(filter(None, parts))

    def analyze_emotion(self, text: str) -> EmotionProfile:
        """Analyse le profil émotionnel d'un texte avec NRCLex"""
        NRCLex = get_emotion_analyzer()

        if not NRCLex:
            return EmotionProfile()

        try:
            emotion = NRCLex(text)
            frequencies = emotion.affect_frequencies

            return EmotionProfile(
                fear=frequencies.get("fear", 0.0),
                anger=frequencies.get("anger", 0.0),
                sadness=frequencies.get("sadness", 0.0),
                joy=frequencies.get("joy", 0.0),
                trust=frequencies.get("trust", 0.0),
                disgust=frequencies.get("disgust", 0.0),
                surprise=frequencies.get("surprise", 0.0),
                anticipation=frequencies.get("anticipation", 0.0),
                positive=frequencies.get("positive", 0.0),
                negative=frequencies.get("negative", 0.0)
            )
        except Exception as e:
            logger.error(f"Error analyzing emotion: {e}")
            return EmotionProfile()

    def retrieve(
        self,
        user_message: str,
        current_phase: str = "exploration",
        emotional_state: Optional[Dict] = None,
        conversation_history: Optional[List[str]] = None,
        top_k: int = 3
    ) -> List[RetrievedProtocol]:
        """
        Retrieval principal avec scoring multi-critères

        Args:
            user_message: Message de l'utilisateur
            current_phase: Phase thérapeutique actuelle
            emotional_state: État émotionnel (detresse, espoir, energie)
            conversation_history: Historique pour contexte
            top_k: Nombre de résultats à retourner

        Returns:
            Liste de protocoles scorés et ordonnés
        """
        if not self._initialized:
            self.initialize()

        # 1. Analyse émotionnelle du message
        user_emotion = self.analyze_emotion(user_message)

        # 2. Construire la requête enrichie
        query = self._build_enriched_query(user_message, user_emotion, conversation_history)

        # 3. Recherche vectorielle
        candidates = self._vector_search(query, top_k * 3)

        # 4. Scoring multi-critères
        scored_protocols = self._multi_criteria_scoring(
            candidates,
            user_message,
            user_emotion,
            current_phase,
            emotional_state
        )

        # 5. Filtrage des contre-indications
        filtered = self._filter_contraindicated(scored_protocols, emotional_state)

        # 6. Retourner les top_k
        return filtered[:top_k]

    def _build_enriched_query(
        self,
        user_message: str,
        emotion: EmotionProfile,
        history: Optional[List[str]]
    ) -> str:
        """Construit une requête enrichie pour la recherche"""
        parts = [user_message]

        # Ajouter l'émotion dominante
        dominant = emotion.dominant_emotion()
        if dominant != "neutral":
            parts.append(f"émotion: {dominant}")

        # Ajouter contexte de l'historique (derniers messages)
        if history and len(history) > 0:
            recent = " ".join(history[-2:])[:200]
            parts.append(f"contexte: {recent}")

        return " | ".join(parts)

    def _vector_search(self, query: str, n_results: int) -> List[Tuple[str, float]]:
        """Recherche vectorielle dans ChromaDB ou fallback"""

        # Si ChromaDB disponible
        if self.collection and self.embedding_model:
            try:
                query_embedding = self.embedding_model.encode(query).tolist()
                results = self.collection.query(
                    query_embeddings=[query_embedding],
                    n_results=min(n_results, len(self.protocols_db))
                )

                candidates = []
                for i, protocol_id in enumerate(results["ids"][0]):
                    # ChromaDB retourne des distances, convertir en similarité
                    distance = results["distances"][0][i] if results["distances"] else 0
                    similarity = 1 / (1 + distance)  # Convertir distance en similarité
                    candidates.append((protocol_id, similarity))

                return candidates

            except Exception as e:
                logger.error(f"ChromaDB search error: {e}")

        # Fallback: recherche par mots-clés
        return self._keyword_search(query, n_results)

    def _keyword_search(self, query: str, n_results: int) -> List[Tuple[str, float]]:
        """Recherche par mots-clés (fallback)"""
        query_lower = query.lower()
        query_words = set(query_lower.split())

        scores = []
        for protocol_id, protocol in self.protocols_db.items():
            searchable = self._create_searchable_text(protocol).lower()
            searchable_words = set(searchable.split())

            # Intersection des mots
            common = query_words & searchable_words
            score = len(common) / max(len(query_words), 1)

            # Bonus pour triggers émotionnels
            triggers = protocol.get("emotional_triggers", [])
            for trigger in triggers:
                if trigger.lower() in query_lower:
                    score += 0.2

            scores.append((protocol_id, min(score, 1.0)))

        return sorted(scores, key=lambda x: x[1], reverse=True)[:n_results]

    def _get_mapped_phases(self, system_phase: str) -> List[str]:
        """Retourne les phases de protocoles correspondant à la phase système"""
        return self.PHASE_MAPPING.get(system_phase, [system_phase])

    def _multi_criteria_scoring(
        self,
        candidates: List[Tuple[str, float]],
        user_message: str,
        user_emotion: EmotionProfile,
        current_phase: str,
        emotional_state: Optional[Dict]
    ) -> List[RetrievedProtocol]:
        """Scoring multi-critères des candidats"""
        scored = []

        # Obtenir les phases de protocoles correspondantes
        mapped_phases = self._get_mapped_phases(current_phase)

        for protocol_id, similarity_score in candidates:
            protocol = self.protocols_db.get(protocol_id)
            if not protocol:
                continue

            reasoning = [f"Similarité sémantique: {similarity_score:.2f}"]

            # 1. Score de correspondance de phase (0-0.3) avec mapping
            protocol_phase = protocol.get("phase", "")
            if protocol_phase in mapped_phases:
                phase_score = 0.3  # Match direct
            elif protocol_phase in ["exploration", "stabilization"]:
                phase_score = 0.2  # Phases polyvalentes
            else:
                phase_score = 0.1  # Pas de match
            reasoning.append(f"Phase match ({protocol_phase} in {mapped_phases}): {phase_score:.2f}")

            # 2. Score émotionnel (0-0.3)
            emotion_score = self._compute_emotion_match(user_emotion, protocol)
            reasoning.append(f"Emotion match: {emotion_score:.2f}")

            # 3. Score de priorité (0-0.2)
            priority = protocol.get("priority", 50)
            priority_score = priority / 500  # Normaliser sur 0.2
            reasoning.append(f"Priority ({priority}): {priority_score:.2f}")

            # 4. Score de sécurité basé sur l'état émotionnel (0-0.2)
            safety_score = self._compute_safety_score(protocol, emotional_state)
            reasoning.append(f"Safety: {safety_score:.2f}")

            # Score final pondéré
            final_score = (
                similarity_score * 0.35 +
                phase_score +
                emotion_score +
                priority_score +
                safety_score
            )

            scored.append(RetrievedProtocol(
                protocol_id=protocol_id,
                name=protocol.get("name", ""),
                summary=protocol.get("summary", ""),
                template=protocol.get("template", ""),
                follow_up=protocol.get("follow_up", []),
                method=protocol.get("method", ""),
                phase=protocol.get("phase", ""),
                similarity_score=similarity_score,
                emotion_match_score=emotion_score,
                final_score=final_score,
                reasoning=reasoning,
                metadata=protocol.get("metadata", {})
            ))

        return sorted(scored, key=lambda x: x.final_score, reverse=True)

    def _compute_emotion_match(self, user_emotion: EmotionProfile, protocol: Dict) -> float:
        """Calcule la correspondance émotionnelle"""
        triggers = protocol.get("emotional_triggers", [])
        if not triggers:
            return 0.15  # Score par défaut

        # Mapper les émotions aux triggers
        emotion_trigger_map = {
            "fear": ["anxiété", "panique", "peur", "inquiétude"],
            "sadness": ["tristesse", "manque", "deuil", "solitude"],
            "anger": ["colère", "frustration", "injustice"],
            "joy": ["espoir", "soulagement", "mieux"]
        }

        dominant = user_emotion.dominant_emotion()
        relevant_triggers = emotion_trigger_map.get(dominant, [])

        # Compter les correspondances
        matches = sum(1 for t in triggers if any(rt in t.lower() for rt in relevant_triggers))

        return min(matches * 0.1, 0.3)

    def _compute_safety_score(self, protocol: Dict, emotional_state: Optional[Dict]) -> float:
        """Calcule le score de sécurité"""
        if not emotional_state:
            return 0.15

        detresse = emotional_state.get("detresse", 50)
        activation = protocol.get("activation_level", "medium")

        # Si détresse élevée, favoriser les protocoles à faible activation
        if detresse > 70:
            if activation == "low":
                return 0.2
            elif activation == "high":
                return 0.05
            else:
                return 0.1

        return 0.15

    def _filter_contraindicated(
        self,
        protocols: List[RetrievedProtocol],
        emotional_state: Optional[Dict]
    ) -> List[RetrievedProtocol]:
        """Filtre les protocoles contre-indiqués"""
        if not emotional_state:
            return protocols

        filtered = []
        detresse = emotional_state.get("detresse", 50)

        for protocol in protocols:
            full_protocol = self.protocols_db.get(protocol.protocol_id, {})
            contraindications = full_protocol.get("contraindications", [])

            # Vérifier les contre-indications
            skip = False
            for contra in contraindications:
                if "crise" in contra.lower() and detresse > 80:
                    skip = True
                    break
                if "détresse intense" in contra.lower() and detresse > 75:
                    skip = True
                    break

            if not skip:
                filtered.append(protocol)

        return filtered

    def get_protocol_template(self, protocol_id: str, user_name: str = "") -> str:
        """Récupère et personnalise le template d'un protocole"""
        protocol = self.protocols_db.get(protocol_id)
        if not protocol:
            return ""

        template = protocol.get("template", "")

        # Personnalisation basique
        if user_name:
            template = template.replace("{user_name}", user_name)

        return template


# Instance singleton
_vector_rag_instance = None


def get_vector_rag() -> VectorRAG:
    """Retourne l'instance singleton du VectorRAG"""
    global _vector_rag_instance
    if _vector_rag_instance is None:
        _vector_rag_instance = VectorRAG()
        _vector_rag_instance.initialize()
    return _vector_rag_instance
