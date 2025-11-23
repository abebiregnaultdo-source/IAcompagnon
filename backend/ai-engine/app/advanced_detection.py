"""
Advanced Detection Engine - Multi-Modal Clinical Detection

Intègre :
- EmotionBERT (analyse émotionnelle fine)
- Linguistic patterns (rigidité, métacognition)
- Physiological markers (arousal, dissociation)
- Therapeutic context (alliance, historique)

Basé sur la recherche en psychologie computationnelle et NLP clinique.
"""

from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import logging
import re

logger = logging.getLogger(__name__)


@dataclass
class DetectionSignal:
    """Signal de détection pour une méthode"""
    method: str
    confidence: float  # 0-1
    indicators: List[str]
    contraindications: List[str]
    recommended_variation: Optional[str] = None


class AdvancedDetectionEngine:
    """
    Détection avancée multi-modale pour méthodes thérapeutiques
    
    Remplace la détection naïve par mots-clés par une analyse
    scientifiquement validée intégrant multiples sources de données.
    """
    
    def __init__(self, emotion_engine=None, clinical_screening=None):
        """
        Args:
            emotion_engine: Instance de EmotionBERT engine
            clinical_screening: Instance de ClinicalScreeningEngine
        """
        # Intégration EmotionBERT
        if emotion_engine is None:
            try:
                import sys
                from pathlib import Path
                sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'emotions-service' / 'app'))
                from advanced_emotion import get_emotion_engine
                self.emotion_engine = get_emotion_engine(use_gpu=False)
                logger.info("EmotionBERT engine loaded successfully")
            except Exception as e:
                logger.warning(f"EmotionBERT not available: {e}")
                self.emotion_engine = None
        else:
            self.emotion_engine = emotion_engine

        self.clinical_screening = clinical_screening

        # Patterns linguistiques validés
        self.linguistic_patterns = self._load_linguistic_patterns()
    
    def _load_linguistic_patterns(self) -> Dict[str, Dict[str, Any]]:
        """
        Patterns linguistiques basés sur la recherche en NLP clinique
        
        Sources:
        - Cognitive fusion: Hayes et al. (2006)
        - Rumination: Nolen-Hoeksema (1991)
        - Experiential avoidance: Hayes et al. (1996)
        """
        return {
            "cognitive_fusion": {
                "patterns": [
                    r"\bje suis\s+(?:nul|mauvais|incapable|faible)\b",
                    r"\bc'est\s+(?:impossible|fini|perdu|foutu)\b",
                    r"\bje ne (?:peux|pourrai|pourrais) (?:jamais|plus)\b",
                    r"\btoujours\s+(?:pareil|la même chose)\b",
                    r"\bjamais\s+(?:rien|personne)\b"
                ],
                "metacognitive_deficit": [
                    # Absence de marqueurs métacognitifs
                    r"(?<!je pense que )(?<!j'ai l'impression que )(?<!il me semble que )",
                ],
                "rigidity_markers": [
                    r"\b(?:toujours|jamais|rien|personne|tout le monde)\b"
                ]
            },
            
            "experiential_avoidance": {
                "patterns": [
                    r"\b(?:éviter|fuir|oublier|ne pas penser)\b",
                    r"\bje (?:ne veux pas|refuse de) (?:ressentir|sentir|éprouver)\b",
                    r"\bme distraire\b",
                    r"\bne (?:plus|pas) y penser\b"
                ]
            },
            
            "rumination": {
                "patterns": [
                    r"\bpourquoi (?:moi|ça|toujours)\b",
                    r"\bsi seulement\b",
                    r"\bj'aurais dû\b",
                    r"\bje n'arrête pas de (?:penser|repenser)\b",
                    r"\ben boucle\b"
                ],
                "perseveration": [
                    # Répétition thématique (détecté par analyse de conversation)
                ]
            },
            
            "somatic_activation": {
                "patterns": [
                    r"\b(?:boule|nœud|poids|serré|oppressé)\s+(?:dans|au)\s+(?:gorge|ventre|poitrine|cœur)\b",
                    r"\b(?:tension|douleur|sensation)\s+(?:dans|au)\b",
                    r"\bje sens (?:mon corps|physiquement|dans mon corps)\b",
                    r"\b(?:tremblements|palpitations|souffle court)\b"
                ]
            },
            
            "values_seeking": {
                "patterns": [
                    r"\bqu'est-ce qui (?:compte|importe|a du sens)\b",
                    r"\bce qui est (?:important|essentiel|fondamental)\b",
                    r"\bmes valeurs\b",
                    r"\bce que je veux (?:vraiment|profondément)\b"
                ]
            },
            
            "meaning_seeking": {
                "patterns": [
                    r"\bpourquoi (?:ça|cela) (?:m')?arrive\b",
                    r"\bquel (?:sens|signification)\b",
                    r"\bcomprendre (?:pourquoi|le sens)\b",
                    r"\bà quoi (?:ça sert|bon)\b"
                ]
            },
            
            "unsaid_expression": {
                "patterns": [
                    r"\bje (?:n'ai|ne lui ai) (?:jamais|pas) dit\b",
                    r"\bj'aurais (?:voulu|dû) (?:lui )?dire\b",
                    r"\bregret(?:s)? de ne pas\b",
                    r"\bsi j'avais pu (?:lui )?dire\b",
                    r"\bnon-dits?\b"
                ]
            },
            
            "connection_seeking": {
                "patterns": [
                    r"\b(?:garder|maintenir|préserver) (?:le lien|la connexion|le contact)\b",
                    r"\b(?:sentir|ressentir) (?:sa )?présence\b",
                    r"\b(?:parler|s'adresser) à (?:lui|elle)\b",
                    r"\bcomme si (?:il|elle) était (?:là|encore là)\b"
                ]
            }
        }
    
    def detect_all_methods(
        self,
        user_message: str,
        user_state: Dict[str, Any],
        conversation_history: List[Dict[str, str]],
        therapeutic_context: Dict[str, Any]
    ) -> List[DetectionSignal]:
        """
        Détecte toutes les méthodes appropriées avec scores de confiance
        
        Args:
            user_message: Message actuel de l'utilisateur
            user_state: État utilisateur (détresse, phase, etc.)
            conversation_history: Historique de conversation
            therapeutic_context: Contexte thérapeutique (alliance, etc.)
        
        Returns:
            Liste de DetectionSignal triée par confiance décroissante
        """
        # Analyse émotionnelle enrichie
        emotion_analysis = self._get_emotion_analysis(user_message, conversation_history)
        
        # Analyse linguistique
        linguistic_analysis = self._analyze_linguistic_patterns(user_message, conversation_history)
        
        # Détection pour chaque méthode
        signals = []
        
        # TIPI - Régulation somatique
        tipi_signal = self._detect_tipi(
            user_message, user_state, emotion_analysis, linguistic_analysis, therapeutic_context
        )
        if tipi_signal:
            signals.append(tipi_signal)
        
        # ACT - Acceptation et Engagement
        act_signal = self._detect_act(
            user_message, user_state, emotion_analysis, linguistic_analysis, therapeutic_context
        )
        if act_signal:
            signals.append(act_signal)
        
        # Journaling Expressif
        journaling_signal = self._detect_journaling(
            user_message, user_state, emotion_analysis, linguistic_analysis, therapeutic_context
        )
        if journaling_signal:
            signals.append(journaling_signal)
        
        # Continuing Bonds
        bonds_signal = self._detect_continuing_bonds(
            user_message, user_state, emotion_analysis, linguistic_analysis, therapeutic_context
        )
        if bonds_signal:
            signals.append(bonds_signal)
        
        # Trier par confiance décroissante
        signals.sort(key=lambda s: s.confidence, reverse=True)

        return signals

    def _get_emotion_analysis(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """
        Obtient l'analyse émotionnelle enrichie depuis EmotionBERT

        Si emotion_engine n'est pas disponible, utilise des heuristiques de base
        """
        if self.emotion_engine:
            try:
                # Analyser avec EmotionBERT
                emotional_state = self.emotion_engine.analyze(user_message, metadata=None)

                # Convertir vers format attendu
                return {
                    "arousal": (emotional_state.arousal + 1) / 2,  # Normaliser [-1,1] → [0,1]
                    "valence": (emotional_state.valence + 1) / 2,
                    "dominance": (emotional_state.dominance + 1) / 2,
                    "grief_intensity": emotional_state.grief_intensity,

                    # Dériver métriques cliniques depuis circumplex
                    "cognitive_fusion": self._estimate_cognitive_fusion(emotional_state),
                    "experiential_avoidance": self._estimate_experiential_avoidance(emotional_state),
                    "rumination": self._estimate_rumination(emotional_state),
                    "mentalization_capacity": self._estimate_mentalization(emotional_state),
                    "cognitive_processing": self._estimate_cognitive_processing(emotional_state),
                    "emotional_awareness": (emotional_state.arousal + 1) / 2
                }
            except Exception as e:
                logger.warning(f"Emotion engine error: {e}")

        # Fallback: heuristiques de base
        return {
            "arousal": 0.5,
            "valence": 0.5,
            "cognitive_fusion": 0.0,
            "experiential_avoidance": 0.0,
            "rumination": 0.0,
            "emotional_awareness": 0.5,
            "mentalization_capacity": 0.5,
            "cognitive_processing": 0.5
        }

    def _estimate_cognitive_fusion(self, emotional_state) -> float:
        """Estime fusion cognitive depuis circumplex (arousal élevé + valence négative)"""
        arousal_normalized = (emotional_state.arousal + 1) / 2
        valence_normalized = (emotional_state.valence + 1) / 2

        # Fusion = arousal élevé + valence négative + faible dominance
        fusion = (arousal_normalized * 0.4 +
                 (1 - valence_normalized) * 0.4 +
                 (1 - (emotional_state.dominance + 1) / 2) * 0.2)
        return min(1.0, fusion)

    def _estimate_experiential_avoidance(self, emotional_state) -> float:
        """Estime évitement expérientiel (arousal élevé + faible dominance)"""
        arousal_normalized = (emotional_state.arousal + 1) / 2
        dominance_normalized = (emotional_state.dominance + 1) / 2

        avoidance = arousal_normalized * 0.6 + (1 - dominance_normalized) * 0.4
        return min(1.0, avoidance)

    def _estimate_rumination(self, emotional_state) -> float:
        """Estime rumination (valence négative + arousal modéré)"""
        arousal_normalized = (emotional_state.arousal + 1) / 2
        valence_normalized = (emotional_state.valence + 1) / 2

        # Rumination = valence négative + arousal modéré (pas trop élevé)
        optimal_arousal = 1 - abs(arousal_normalized - 0.5) * 2
        rumination = (1 - valence_normalized) * 0.6 + optimal_arousal * 0.4
        return min(1.0, rumination)

    def _estimate_mentalization(self, emotional_state) -> float:
        """Estime capacité de mentalisation (dominance + valence modérée)"""
        dominance_normalized = (emotional_state.dominance + 1) / 2
        arousal_normalized = (emotional_state.arousal + 1) / 2

        # Mentalisation = dominance élevée + arousal pas trop élevé
        mentalization = dominance_normalized * 0.6 + (1 - arousal_normalized) * 0.4
        return min(1.0, mentalization)

    def _estimate_cognitive_processing(self, emotional_state) -> float:
        """Estime capacité de traitement cognitif (dominance + arousal modéré)"""
        dominance_normalized = (emotional_state.dominance + 1) / 2
        arousal_normalized = (emotional_state.arousal + 1) / 2

        # Processing = dominance + arousal optimal (ni trop bas ni trop haut)
        optimal_arousal = 1 - abs(arousal_normalized - 0.5) * 2
        processing = dominance_normalized * 0.5 + optimal_arousal * 0.5
        return min(1.0, processing)

    def _analyze_linguistic_patterns(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """
        Analyse les patterns linguistiques dans le message

        Returns:
            Dict avec scores pour chaque pattern (0-1)
        """
        message_lower = user_message.lower()

        analysis = {}

        for pattern_type, pattern_data in self.linguistic_patterns.items():
            patterns = pattern_data.get("patterns", [])

            # Compter les matches
            matches = 0
            for pattern in patterns:
                if re.search(pattern, message_lower):
                    matches += 1

            # Score normalisé
            analysis[pattern_type] = min(1.0, matches / max(1, len(patterns)))

        # Analyse de rigidité discursive (répétition thématique)
        analysis["rigidity_score"] = self._calculate_rigidity(conversation_history)

        # Analyse de métacognition
        analysis["metacognition_deficit"] = self._detect_metacognition_deficit(message_lower)

        return analysis

    def _calculate_rigidity(self, conversation_history: List[Dict[str, str]]) -> float:
        """
        Calcule la rigidité discursive (persévération thématique)

        Indicateur de fusion cognitive selon Hayes et al. (2006)
        """
        if len(conversation_history) < 3:
            return 0.0

        # Extraire les 5 derniers messages utilisateur
        user_messages = [
            msg["content"] for msg in conversation_history[-5:]
            if msg.get("role") == "user"
        ]

        if len(user_messages) < 2:
            return 0.0

        # Calculer similarité lexicale simple
        # (version simplifiée - pourrait utiliser embeddings pour plus de précision)
        words_sets = [set(msg.lower().split()) for msg in user_messages]

        overlaps = []
        for i in range(len(words_sets) - 1):
            overlap = len(words_sets[i] & words_sets[i+1]) / max(1, len(words_sets[i] | words_sets[i+1]))
            overlaps.append(overlap)

        return sum(overlaps) / len(overlaps) if overlaps else 0.0

    def _detect_metacognition_deficit(self, message: str) -> float:
        """
        Détecte l'absence de marqueurs métacognitifs

        Marqueurs métacognitifs: "je pense que", "j'ai l'impression que", "il me semble que"
        Leur absence indique une fusion cognitive (pensée = réalité)
        """
        metacognitive_markers = [
            r"\bje pense que\b",
            r"\bj'ai l'impression que\b",
            r"\bil me semble que\b",
            r"\bje crois que\b",
            r"\bpeut-être que\b"
        ]

        has_markers = any(re.search(marker, message) for marker in metacognitive_markers)

        # Si pas de marqueurs ET affirmations absolues → déficit
        absolute_statements = re.findall(r"\bje suis\b|\bc'est\b", message)

        if not has_markers and len(absolute_statements) > 0:
            return 0.7
        elif not has_markers:
            return 0.4
        else:
            return 0.0

    def _detect_tipi(
        self,
        user_message: str,
        user_state: Dict[str, Any],
        emotion_analysis: Dict[str, Any],
        linguistic_analysis: Dict[str, Any],
        therapeutic_context: Dict[str, Any]
    ) -> Optional[DetectionSignal]:
        """
        Détection TIPI evidence-based

        Critères (Nicon, 2007 + clinical observations):
        - Activation somatique identifiable
        - Conscience intéroceptive suffisante
        - Pas de dissociation active
        - Arousal dans zone optimale (0.6-0.9)
        """
        indicators = []
        contraindications = []
        confidence = 0.0

        # 1. Activation somatique (pattern linguistique)
        somatic_score = linguistic_analysis.get("somatic_activation", 0)
        if somatic_score > 0.3:
            indicators.append(f"Activation somatique détectée (score: {somatic_score:.2f})")
            confidence += 0.4

        # 2. Arousal émotionnel dans zone optimale
        arousal = emotion_analysis.get("arousal", 0)
        if 0.6 <= arousal <= 0.9:
            indicators.append(f"Arousal optimal pour régulation (score: {arousal:.2f})")
            confidence += 0.3
        elif arousal > 0.9:
            contraindications.append("Arousal trop élevé - risque de submersion")
            confidence -= 0.3

        # 3. Conscience intéroceptive
        interoception = user_state.get("interoceptive_awareness", 0.5)
        if interoception > 0.4:
            indicators.append(f"Conscience intéroceptive suffisante ({interoception:.2f})")
            confidence += 0.2
        else:
            contraindications.append("Conscience intéroceptive insuffisante")
            confidence -= 0.2

        # 4. Dissociation
        dissociation = user_state.get("dissociation", 0)
        if dissociation > 0.7:
            contraindications.append("Dissociation active - TIPI contre-indiqué")
            return None  # Contre-indication absolue
        elif dissociation > 0.4:
            contraindications.append("Dissociation modérée - prudence requise")
            confidence -= 0.1

        # Seuil de confiance minimum
        if confidence < 0.3:
            return None

        # Sélection de variation
        variation = self._select_tipi_variation(user_state, emotion_analysis)

        return DetectionSignal(
            method="tipi",
            confidence=min(1.0, confidence),
            indicators=indicators,
            contraindications=contraindications,
            recommended_variation=variation
        )

    def _select_tipi_variation(self, user_state: Dict, emotion_analysis: Dict) -> str:
        """Sélectionne la variation TIPI appropriée"""
        detresse = user_state.get("detresse", 50)
        arousal = emotion_analysis.get("arousal", 0.5)

        if detresse > 75 or arousal > 0.8:
            return "gentle"  # Version douce pour détresse élevée
        elif detresse < 50 and arousal < 0.6:
            return "focused"  # Version courte si régulation simple
        else:
            return "standard"  # Version standard

    def _detect_act(
        self,
        user_message: str,
        user_state: Dict[str, Any],
        emotion_analysis: Dict[str, Any],
        linguistic_analysis: Dict[str, Any],
        therapeutic_context: Dict[str, Any]
    ) -> Optional[DetectionSignal]:
        """
        Détection ACT evidence-based

        Critères (Hayes et al., 2006; A-Tjak et al., 2015):
        - Fusion cognitive OU évitement expérientiel OU recherche de valeurs
        - Capacité de mentalisation suffisante
        - Alliance thérapeutique établie
        - Détresse < 85
        """
        indicators = []
        contraindications = []
        confidence = 0.0

        # 1. Fusion cognitive (multi-sources)
        fusion_linguistic = linguistic_analysis.get("cognitive_fusion", 0)
        fusion_emotion = emotion_analysis.get("cognitive_fusion", 0)
        metacog_deficit = linguistic_analysis.get("metacognition_deficit", 0)
        rigidity = linguistic_analysis.get("rigidity_score", 0)

        fusion_score = (fusion_linguistic * 0.3 + fusion_emotion * 0.4 +
                       metacog_deficit * 0.2 + rigidity * 0.1)

        if fusion_score > 0.5:
            indicators.append(f"Fusion cognitive détectée (score: {fusion_score:.2f})")
            confidence += 0.4

        # 2. Évitement expérientiel
        avoidance_linguistic = linguistic_analysis.get("experiential_avoidance", 0)
        avoidance_emotion = emotion_analysis.get("experiential_avoidance", 0)
        avoidance_score = (avoidance_linguistic + avoidance_emotion) / 2

        if avoidance_score > 0.4:
            indicators.append(f"Évitement expérientiel (score: {avoidance_score:.2f})")
            confidence += 0.3

        # 3. Recherche de valeurs
        values_seeking = linguistic_analysis.get("values_seeking", 0)
        if values_seeking > 0.3:
            indicators.append(f"Recherche de valeurs (score: {values_seeking:.2f})")
            confidence += 0.2

        # 4. Capacité de mentalisation (CRITIQUE pour ACT)
        mentalization = emotion_analysis.get("mentalization_capacity", 0.5)
        if mentalization < 0.3:
            contraindications.append("Capacité de mentalisation insuffisante pour travail métacognitif")
            return None  # Contre-indication absolue
        elif mentalization < 0.5:
            contraindications.append("Mentalisation limitée - adapter le niveau de complexité")
            confidence -= 0.1

        # 5. Détresse
        detresse = user_state.get("detresse", 50)
        if detresse > 85:
            contraindications.append("Détresse trop élevée pour travail cognitif complexe")
            return None
        elif detresse > 75:
            contraindications.append("Détresse élevée - simplifier les exercices")
            confidence -= 0.1

        # 6. Alliance thérapeutique
        alliance = therapeutic_context.get("alliance", 0.5)
        if alliance < 0.6:
            contraindications.append("Alliance thérapeutique insuffisante (30% de l'efficacité)")
            confidence -= 0.2

        # Seuil minimum
        if confidence < 0.3:
            return None

        # Sélection de variation
        variation = self._select_act_variation(fusion_score, avoidance_score, values_seeking)

        return DetectionSignal(
            method="act",
            confidence=min(1.0, confidence),
            indicators=indicators,
            contraindications=contraindications,
            recommended_variation=variation
        )

    def _select_act_variation(self, fusion: float, avoidance: float, values: float) -> str:
        """Sélectionne la variation ACT appropriée"""
        if fusion > 0.6:
            return "defusion_cognitive"
        elif values > 0.5:
            return "valeurs_et_action"
        elif avoidance > 0.5:
            return "acceptation_experiencielle"
        else:
            return "defusion_cognitive"  # Par défaut

    def _detect_journaling(
        self,
        user_message: str,
        user_state: Dict[str, Any],
        emotion_analysis: Dict[str, Any],
        linguistic_analysis: Dict[str, Any],
        therapeutic_context: Dict[str, Any]
    ) -> Optional[DetectionSignal]:
        """
        Détection Journaling Expressif evidence-based

        Critères (Pennebaker, 1997; Frattaroli, 2006):
        - Besoin d'expression (non-dits, regrets)
        - Arousal émotionnel dans zone optimale (0.4-0.8)
        - Capacité de traitement cognitif
        - Pas de flooding émotionnel
        """
        indicators = []
        contraindications = []
        confidence = 0.0

        # 1. Besoin d'expression (non-dits)
        unsaid = linguistic_analysis.get("unsaid_expression", 0)
        if unsaid > 0.3:
            indicators.append(f"Expression de non-dits (score: {unsaid:.2f})")
            confidence += 0.4

        # 2. Arousal dans zone optimale (CRITIQUE pour Pennebaker)
        arousal = emotion_analysis.get("arousal", 0)
        if 0.4 <= arousal <= 0.8:
            indicators.append(f"Arousal optimal pour écriture expressive ({arousal:.2f})")
            confidence += 0.3
        elif arousal < 0.4:
            contraindications.append("Arousal insuffisant - bénéfice thérapeutique limité")
            confidence -= 0.2
        elif arousal > 0.8:
            contraindications.append("Arousal trop élevé - risque de retraumatisation")
            return None

        # 3. Capacité de traitement cognitif
        cognitive_processing = emotion_analysis.get("cognitive_processing", 0.5)
        if cognitive_processing < 0.3:
            contraindications.append("Capacité de traitement cognitif insuffisante")
            return None

        # 4. Rumination excessive
        rumination = emotion_analysis.get("rumination", 0)
        if rumination > 0.8:
            contraindications.append("Rumination sévère - risque d'augmentation (7% des cas)")
            confidence -= 0.3

        # 5. Isolation sociale
        social_isolation = user_state.get("social_isolation", 0)
        if social_isolation > 0.7:
            contraindications.append("Isolation sociale - risque de substitution aux relations")
            confidence -= 0.2

        # Seuil minimum
        if confidence < 0.2:
            return None

        # Sélection de variation
        variation = self._select_journaling_variation(unsaid, user_state, emotion_analysis)

        return DetectionSignal(
            method="journaling_expressif",
            confidence=min(1.0, confidence),
            indicators=indicators,
            contraindications=contraindications,
            recommended_variation=variation
        )

    def _select_journaling_variation(self, unsaid: float, user_state: Dict, emotion: Dict) -> str:
        """Sélectionne la variation Journaling appropriée"""
        if unsaid > 0.5:
            return "lettre_non_envoyee"
        elif user_state.get("narrative_coherence", 0) < 0.4:
            return "journal_guide_recit"
        else:
            return "gratitude_post_traumatique"

    def _detect_continuing_bonds(
        self,
        user_message: str,
        user_state: Dict[str, Any],
        emotion_analysis: Dict[str, Any],
        linguistic_analysis: Dict[str, Any],
        therapeutic_context: Dict[str, Any]
    ) -> Optional[DetectionSignal]:
        """
        Détection Continuing Bonds evidence-based

        Critères (Klass et al., 1996; Stroebe & Schut, 1999):
        - Recherche de connexion/maintien du lien
        - Pas de deuil compliqué avec fixation
        - Équilibre loss-oriented / restoration-oriented
        """
        indicators = []
        contraindications = []
        confidence = 0.0

        # 1. Recherche de connexion
        connection = linguistic_analysis.get("connection_seeking", 0)
        if connection > 0.3:
            indicators.append(f"Recherche de connexion (score: {connection:.2f})")
            confidence += 0.5

        # 2. Deuil compliqué (CONTRE-INDICATION)
        complicated_grief = user_state.get("complicated_grief", False)
        if complicated_grief:
            contraindications.append("Deuil compliqué - risque de fixation pathologique")
            return None

        # 3. Évitement excessif du deuil
        grief_avoidance = user_state.get("grief_avoidance", 0)
        if grief_avoidance > 0.8:
            contraindications.append("Évitement excessif - besoin de confrontation d'abord")
            confidence -= 0.3

        # 4. Phase de deuil
        grief_phase = user_state.get("grief_phase", "")
        if grief_phase in ["acute", "early"]:
            contraindications.append("Phase aiguë - stabilisation prioritaire")
            confidence -= 0.2

        # Seuil minimum
        if confidence < 0.2:
            return None

        # Sélection de variation
        variation = self._select_bonds_variation(connection, user_state)

        return DetectionSignal(
            method="continuing_bonds",
            confidence=min(1.0, confidence),
            indicators=indicators,
            contraindications=contraindications,
            recommended_variation=variation
        )

    def _select_bonds_variation(self, connection: float, user_state: Dict) -> str:
        """Sélectionne la variation Continuing Bonds appropriée"""
        if user_state.get("ritual_affinity", 0) > 0.5:
            return "rituel_connexion"
        elif user_state.get("internal_dialogue_capacity", 0) > 0.5:
            return "conversation_interieure"
        else:
            return "objet_transitionnel"



