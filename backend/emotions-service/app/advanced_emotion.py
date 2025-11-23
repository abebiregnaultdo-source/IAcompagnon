"""
EmotionBERT Avancé - Architecture Neuroscience-Inspirée
Analyse émotionnelle multi-modale pour contexte de deuil

Architecture :
- MultiScaleEmotionEncoder : Encodage textuel multi-échelle
- ParalinguisticAnalyzer : Analyse paraverbale (timing, style)
- ClinicalEmotionEngine : Fusion multi-modale + mapping clinique
"""

import torch
import torch.nn as nn
from typing import Dict, Optional
import numpy as np
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

# Flag pour désactiver si PyTorch/Transformers non disponibles
ADVANCED_EMOTION_AVAILABLE = False

try:
    from transformers import AutoModel, AutoTokenizer, AutoConfig
    ADVANCED_EMOTION_AVAILABLE = True
except ImportError:
    logger.warning("Transformers not available. Advanced emotion analysis disabled.")


@dataclass
class EmotionalState:
    """Représentation vectorielle de l'état émotionnel basée sur le circumplex model"""
    valence: float  # Plaisir-Déplaisir [-1, 1]
    arousal: float  # Activation-Calme [-1, 1]
    dominance: float  # Contrôle-Soumission [-1, 1]
    grief_intensity: float  # Intensité du deuil [0, 1]
    phase_confidence: Dict[str, float]  # Confiance par phase

    def to_legacy_scores(self) -> Dict[str, float]:
        """Conversion vers format legacy (detresse, espoir, energie)"""
        # Mapping du circumplex vers scores legacy
        detresse = max(0, min(100, 50 - (self.valence * 50) + (self.arousal * 30)))
        espoir = max(0, min(100, 50 + (self.valence * 40) - (self.grief_intensity * 20)))
        energie = max(0, min(100, 50 + (self.arousal * 40) + (self.dominance * 10)))

        # Phase dominante
        phase = max(self.phase_confidence, key=self.phase_confidence.get)
        confidence = self.phase_confidence[phase]

        return {
            'detresse': int(detresse),
            'espoir': int(espoir),
            'energie': int(energie),
            'phase': self._map_phase_to_legacy(phase),
            'confidence': float(confidence)
        }

    def _map_phase_to_legacy(self, phase: str) -> str:
        """Mapping phases Kübler-Ross vers phases Helō"""
        mapping = {
            'choc_deni': 'ancrage',
            'colere': 'expression',
            'marchandage': 'expression',
            'depression': 'sens',
            'acceptation': 'reconstruction'
        }
        return mapping.get(phase, 'ancrage')


class MultiScaleEmotionEncoder(nn.Module):
    """Architecture multi-échelle inspirée des réseaux de neurones corticaux"""

    def __init__(self, model_name="j-hartmann/emotion-english-distilroberta-base"):
        super().__init__()

        if not ADVANCED_EMOTION_AVAILABLE:
            raise RuntimeError("Transformers library not available")

        self.config = AutoConfig.from_pretrained(model_name)
        self.backbone = AutoModel.from_pretrained(model_name)
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)

        # Fine-tuning sur données de deuil
        self.grief_adapter = nn.Sequential(
            nn.Linear(self.config.hidden_size, 512),
            nn.GELU(),
            nn.Dropout(0.1),
            nn.Linear(512, 256)
        )

        # Têtes multi-échelles
        self.lexical_head = nn.Linear(256, 128)  # Mots individuels
        self.syntactic_head = nn.Linear(256, 128)  # Structure phrase
        self.semantic_head = nn.Linear(256, 128)  # Signification globale

        # Fusion attentionnelle
        self.fusion_attention = nn.MultiheadAttention(384, num_heads=8)

        # Régression vers espace émotionnel
        self.emotion_projection = nn.Sequential(
            nn.Linear(384, 192),
            nn.LayerNorm(192),
            nn.GELU(),
            nn.Linear(192, 64),
            nn.LayerNorm(64),
            nn.GELU(),
            nn.Linear(64, 9)  # valence, arousal, dominance, grief, 5 phases
        )

    def forward(self, input_ids, attention_mask):
        # Encodage de base
        outputs = self.backbone(input_ids=input_ids, attention_mask=attention_mask)
        hidden_states = outputs.last_hidden_state

        # Adaptation au contexte de deuil
        grief_features = self.grief_adapter(hidden_states[:, 0, :])  # [CLS] token

        # Extraction multi-échelle
        lexical_features = self.lexical_head(grief_features)
        syntactic_features = self.syntactic_head(grief_features)
        semantic_features = self.semantic_head(grief_features)

        # Fusion avec attention
        multi_scale_features = torch.cat([
            lexical_features.unsqueeze(1),
            syntactic_features.unsqueeze(1),
            semantic_features.unsqueeze(1)
        ], dim=1)

        fused_features, _ = self.fusion_attention(
            multi_scale_features, multi_scale_features, multi_scale_features
        )
        fused_features = fused_features.mean(dim=1)

        # Projection finale
        emotion_scores = self.emotion_projection(fused_features)

        return emotion_scores





class ParalinguisticAnalyzer:
    """Analyse paraverbale basée sur patterns d'écriture"""

    def __init__(self):
        self.timing_features = ['typing_speed', 'pause_frequency', 'backspace_rate']
        self.stylistic_features = ['sentence_length_variance', 'punctuation_density']

    def extract_features(self, message: str, metadata: Optional[Dict] = None) -> torch.Tensor:
        """Extrait features paraverbales du message"""
        # Analyse du timing (si metadata disponible)
        if metadata:
            timing_vector = self._extract_timing_features(metadata)
        else:
            timing_vector = torch.zeros(3)  # Pas de données temporelles

        # Analyse stylistique (toujours disponible)
        style_vector = self._extract_style_features(message)

        return torch.cat([timing_vector, style_vector])

    def _extract_timing_features(self, metadata: Dict) -> torch.Tensor:
        """Extrait features temporelles (vitesse frappe, pauses, corrections)"""
        # Implémentation réelle nécessite données temporelles utilisateur
        # Pour l'instant, retourne des valeurs par défaut
        typing_speed = metadata.get('typing_speed', 0.0)
        pause_freq = metadata.get('pause_frequency', 0.0)
        backspace_rate = metadata.get('backspace_rate', 0.0)

        return torch.tensor([typing_speed, pause_freq, backspace_rate], dtype=torch.float32)

    def _extract_style_features(self, message: str) -> torch.Tensor:
        """Extrait features stylistiques (variance longueur phrases, densité ponctuation)"""
        sentences = [s.strip() for s in message.split('.') if s.strip()]

        # Variance longueur de phrases (indicateur de cohérence)
        if len(sentences) > 1:
            length_var = float(np.var([len(s) for s in sentences]))
        else:
            length_var = 0.0

        # Densité de ponctuation émotionnelle (!, ?, ...)
        if len(message) > 0:
            punct_density = sum(1 for c in message if c in '!?,;…') / len(message)
        else:
            punct_density = 0.0

        return torch.tensor([length_var, punct_density], dtype=torch.float32)


class ClinicalEmotionEngine:
    """Moteur d'émotion clinique final avec fusion multi-modale"""

    def __init__(self, use_gpu: bool = False):
        self.device = torch.device('cuda' if use_gpu and torch.cuda.is_available() else 'cpu')
        self.available = ADVANCED_EMOTION_AVAILABLE

        if not self.available:
            logger.warning("Advanced emotion engine not available. Using fallback.")
            return

        try:
            self.text_encoder = MultiScaleEmotionEncoder()
            self.text_encoder.to(self.device)
            self.text_encoder.eval()  # Mode évaluation

            self.paralinguistic_analyzer = ParalinguisticAnalyzer()

            # Réseau de fusion multi-modale
            self.fusion_network = nn.Sequential(
                nn.Linear(9 + 5, 32),  # 9 emotions + 5 para
                nn.GELU(),
                nn.LayerNorm(32),
                nn.Linear(32, 16),
                nn.GELU(),
                nn.Linear(16, 9)  # Émotions finales
            )
            self.fusion_network.to(self.device)
            self.fusion_network.eval()

            # Charger les poids fine-tunés sur données de deuil (si disponibles)
            self._load_pretrained_weights()

            logger.info(f"ClinicalEmotionEngine initialized on {self.device}")

        except Exception as e:
            logger.error(f"Failed to initialize ClinicalEmotionEngine: {e}")
            self.available = False

    def analyze(self, message: str, metadata: Optional[Dict] = None) -> EmotionalState:
        """Analyse émotionnelle complète du message"""
        if not self.available:
            # Fallback vers heuristique simple
            return self._fallback_analysis(message)

        try:
            with torch.no_grad():
                # Encodage textuel
                inputs = self.text_encoder.tokenizer(
                    message,
                    return_tensors="pt",
                    truncation=True,
                    max_length=512,
                    padding=True
                )
                inputs = {k: v.to(self.device) for k, v in inputs.items()}

                text_emotions = self.text_encoder(inputs['input_ids'], inputs['attention_mask'])

                # Analyse paraverbale
                para_features = self.paralinguistic_analyzer.extract_features(message, metadata)
                para_features = para_features.unsqueeze(0).to(self.device)

                # Fusion multi-modale
                combined_features = torch.cat([text_emotions, para_features], dim=1)
                fused_emotions = self.fusion_network(combined_features)

                # Conversion vers espace émotionnel clinique
                return self._to_emotional_state(fused_emotions.squeeze())

        except Exception as e:
            logger.error(f"Error in advanced emotion analysis: {e}")
            return self._fallback_analysis(message)

    def _to_emotional_state(self, tensor: torch.Tensor) -> EmotionalState:
        """Mapping vers le circumplex model + scores cliniques"""
        # Circumplex dimensions
        valence = torch.tanh(tensor[0]).item()
        arousal = torch.tanh(tensor[1]).item()
        dominance = torch.tanh(tensor[2]).item()
        grief_intensity = torch.sigmoid(tensor[3]).item()

        # Calcul des phases de deuil (probabilités Kübler-Ross)
        phase_logits = tensor[4:9]
        phase_probs = torch.softmax(phase_logits, dim=0)

        phase_confidence = {
            'choc_deni': phase_probs[0].item(),
            'colere': phase_probs[1].item(),
            'marchandage': phase_probs[2].item(),
            'depression': phase_probs[3].item(),
            'acceptation': phase_probs[4].item()
        }

        return EmotionalState(valence, arousal, dominance, grief_intensity, phase_confidence)


    def _load_pretrained_weights(self):
        """Charge les poids fine-tunés sur données de deuil (si disponibles)"""
        try:
            import os
            weights_path = os.path.join(os.path.dirname(__file__), 'models', 'emotionbert_grief_finetuned.pth')
            if os.path.exists(weights_path):
                state_dict = torch.load(weights_path, map_location=self.device)
                self.text_encoder.load_state_dict(state_dict)
                logger.info("Loaded fine-tuned weights for grief context")
            else:
                logger.info("Fine-tuned weights not found, using base model")
        except Exception as e:
            logger.warning(f"Could not load fine-tuned weights: {e}")

    def _fallback_analysis(self, message: str) -> EmotionalState:
        """Analyse heuristique simple si EmotionBERT non disponible"""
        import re

        # Mots-clés négatifs et positifs (heuristique legacy)
        neg_words = {'triste', 'vide', 'peur', 'angoisse', 'colère', 'fatigue', 'épuisé',
                     'manque', 'douleur', 'pleure', 'seul', 'seule', 'mort', 'perdu'}
        pos_words = {'espoir', 'calme', 'apaisé', 'soulagé', 'merci', 'reconnaissant',
                     'force', 'envie', 'motivé', 'lumière', 'mieux', 'accepte'}

        text = message.lower()
        neg_count = sum(1 for w in neg_words if re.search(r'\b' + re.escape(w) + r'\b', text))
        pos_count = sum(1 for w in pos_words if re.search(r'\b' + re.escape(w) + r'\b', text))

        # Mapping heuristique vers circumplex
        valence = max(-1.0, min(1.0, (pos_count - neg_count) / 5.0))
        arousal = max(-1.0, min(1.0, (neg_count + pos_count) / 5.0 - 0.5))
        dominance = max(-1.0, min(1.0, pos_count / 3.0 - 0.5))
        grief_intensity = min(1.0, neg_count / 3.0)

        # Phase simple basée sur valence/arousal
        if grief_intensity > 0.7:
            phase_confidence = {'choc_deni': 0.6, 'colere': 0.2, 'marchandage': 0.1, 'depression': 0.05, 'acceptation': 0.05}
        elif valence < -0.5:
            phase_confidence = {'choc_deni': 0.1, 'colere': 0.3, 'marchandage': 0.2, 'depression': 0.3, 'acceptation': 0.1}
        elif valence > 0.3:
            phase_confidence = {'choc_deni': 0.05, 'colere': 0.05, 'marchandage': 0.1, 'depression': 0.2, 'acceptation': 0.6}
        else:
            phase_confidence = {'choc_deni': 0.1, 'colere': 0.2, 'marchandage': 0.4, 'depression': 0.2, 'acceptation': 0.1}

        return EmotionalState(valence, arousal, dominance, grief_intensity, phase_confidence)


# Instance globale (singleton)
_emotion_engine_instance = None

def get_emotion_engine(use_gpu: bool = False) -> ClinicalEmotionEngine:
    """Retourne l'instance singleton du moteur d'émotion"""
    global _emotion_engine_instance
    if _emotion_engine_instance is None:
        _emotion_engine_instance = ClinicalEmotionEngine(use_gpu=use_gpu)
    return _emotion_engine_instance

