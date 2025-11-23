"""
Tests Unitaires - Système Evidence-Based

Tests pour :
1. Advanced Detection Engine
2. Clinical Screening Engine
3. Intégration TherapeuticEngine
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent / 'app'))

import pytest
from app.advanced_detection import AdvancedDetectionEngine, DetectionSignal
from app.clinical_screening import ClinicalScreeningEngine, RiskLevel, ScreeningResult


class TestAdvancedDetection:
    """Tests pour Advanced Detection Engine"""
    
    def setup_method(self):
        self.detection = AdvancedDetectionEngine()
    
    def test_tipi_detection_somatic_activation(self):
        """Test détection TIPI avec activation somatique claire"""
        user_message = "J'ai une boule dans la gorge qui ne part pas, c'est serré dans ma poitrine"
        user_state = {
            "detresse": 65,
            "dissociation": 0.2,
            "interoceptive_awareness": 0.6,
            "emotional_arousal": 0.7
        }
        
        signals = self.detection.detect_all_methods(
            user_message=user_message,
            user_state=user_state,
            conversation_history=[],
            therapeutic_context={"alliance": 0.7}
        )
        
        # Vérifier que TIPI est détecté
        tipi_signals = [s for s in signals if s.method == "tipi"]
        assert len(tipi_signals) > 0, "TIPI devrait être détecté"
        
        tipi_signal = tipi_signals[0]
        assert tipi_signal.confidence > 0.5, f"Confiance TIPI devrait être > 0.5, got {tipi_signal.confidence}"
        assert "Activation somatique" in str(tipi_signal.indicators)
    
    def test_act_detection_cognitive_fusion(self):
        """Test détection ACT avec fusion cognitive"""
        user_message = "Je suis nul, je n'y arriverai jamais, c'est impossible"
        user_state = {
            "detresse": 65,
            "mentalization_capacity": 0.6,
            "emotional_arousal": 0.6
        }
        
        signals = self.detection.detect_all_methods(
            user_message=user_message,
            user_state=user_state,
            conversation_history=[],
            therapeutic_context={"alliance": 0.7}
        )
        
        # Vérifier que ACT est détecté
        act_signals = [s for s in signals if s.method == "act"]
        assert len(act_signals) > 0, "ACT devrait être détecté"
        
        act_signal = act_signals[0]
        assert act_signal.confidence > 0.5, f"Confiance ACT devrait être > 0.5, got {act_signal.confidence}"
    
    def test_journaling_detection_unsaid(self):
        """Test détection Journaling avec non-dits"""
        user_message = "Je regrette tellement de ne pas lui avoir dit que je l'aimais"
        user_state = {
            "detresse": 60,
            "emotional_arousal": 0.6,
            "cognitive_processing": 0.5,
            "rumination": 0.4
        }
        
        signals = self.detection.detect_all_methods(
            user_message=user_message,
            user_state=user_state,
            conversation_history=[],
            therapeutic_context={"alliance": 0.7}
        )
        
        # Vérifier que Journaling est détecté
        journal_signals = [s for s in signals if s.method == "journaling_expressif"]
        assert len(journal_signals) > 0, "Journaling devrait être détecté"
        
        journal_signal = journal_signals[0]
        assert journal_signal.confidence > 0.4
        assert journal_signal.recommended_variation == "lettre_non_envoyee"
    
    def test_linguistic_patterns_fusion(self):
        """Test patterns linguistiques pour fusion cognitive"""
        message = "je suis nul et je ne peux jamais rien faire"
        analysis = self.detection._analyze_linguistic_patterns(message, [])
        
        assert analysis["cognitive_fusion"] > 0, "Fusion cognitive devrait être détectée"
        assert analysis["metacognition_deficit"] > 0, "Déficit métacognitif devrait être détecté"
    
    def test_rigidity_calculation(self):
        """Test calcul rigidité discursive"""
        history = [
            {"role": "user", "content": "je suis triste"},
            {"role": "assistant", "content": "..."},
            {"role": "user", "content": "je suis vraiment triste"},
            {"role": "assistant", "content": "..."},
            {"role": "user", "content": "je suis tellement triste"}
        ]
        
        rigidity = self.detection._calculate_rigidity(history)
        assert rigidity > 0.5, "Rigidité devrait être élevée avec répétition"


class TestClinicalScreening:
    """Tests pour Clinical Screening Engine"""
    
    def setup_method(self):
        self.screening = ClinicalScreeningEngine()
    
    def test_act_approved_normal_state(self):
        """Test ACT approuvé avec état normal"""
        user_state = {
            "detresse": 65,
            "mentalization_capacity": 0.6,
            "dissociation": 0.1
        }
        emotion_analysis = {
            "arousal": 0.6,
            "cognitive_fusion": 0.7
        }
        therapeutic_context = {"alliance": 0.7}
        
        result = self.screening.screen_method(
            "act", user_state, emotion_analysis, therapeutic_context
        )
        
        assert result.approved, "ACT devrait être approuvé"
        assert result.risk_level in [RiskLevel.SAFE, RiskLevel.CAUTION]
    
    def test_act_contraindicated_high_distress(self):
        """Test ACT contre-indiqué avec détresse élevée"""
        user_state = {
            "detresse": 90,
            "mentalization_capacity": 0.2
        }
        emotion_analysis = {"arousal": 0.9}
        therapeutic_context = {"alliance": 0.5}
        
        result = self.screening.screen_method(
            "act", user_state, emotion_analysis, therapeutic_context
        )
        
        assert not result.approved, "ACT devrait être refusé"
        assert len(result.alternative_methods) > 0, "Alternatives devraient être suggérées"
    
    def test_tipi_contraindicated_dissociation(self):
        """Test TIPI contre-indiqué avec dissociation"""
        user_state = {
            "detresse": 65,
            "dissociation": 0.8,
            "interoceptive_awareness": 0.6
        }
        emotion_analysis = {"arousal": 0.7}
        therapeutic_context = {"alliance": 0.7}
        
        result = self.screening.screen_method(
            "tipi", user_state, emotion_analysis, therapeutic_context
        )
        
        assert not result.approved, "TIPI devrait être refusé avec dissociation élevée"
        assert "dissociation" in str(result.risk_factors).lower()
    
    def test_journaling_optimal_arousal(self):
        """Test Journaling approuvé avec arousal optimal"""
        user_state = {"detresse": 60, "rumination": 0.4}
        emotion_analysis = {
            "arousal": 0.6,  # Zone optimale 0.4-0.8
            "cognitive_processing": 0.5
        }
        therapeutic_context = {"alliance": 0.7}
        
        result = self.screening.screen_method(
            "journaling_expressif", user_state, emotion_analysis, therapeutic_context
        )
        
        assert result.approved, "Journaling devrait être approuvé avec arousal optimal"


# ============================================================================
# TESTS SYSTÈME OPTIMAL (NOUVEAUX)
# ============================================================================

class TestAdaptiveSafetyThresholds:
    """Tests seuils adaptatifs"""

    def setup_method(self):
        from app.safety_monitor import AdaptiveSafetyThresholds
        self.thresholds = AdaptiveSafetyThresholds()

    def test_default_threshold_insufficient_data(self):
        """Test seuil par défaut si pas assez de données"""
        threshold = self.thresholds.calculate_personal_threshold("user1", "distress_increase_rate")
        assert threshold == 0.20

    def test_personal_threshold_with_history(self):
        """Test seuil personnalisé avec historique"""
        for i in range(10):
            self.thresholds.update_history("user1", {"distress_increase_rate": 0.15 + (i * 0.01)})

        threshold = self.thresholds.calculate_personal_threshold("user1", "distress_increase_rate")
        assert threshold > 0.20


class TestSimpleTrendAnalyzer:
    """Tests analyse de tendances"""

    def setup_method(self):
        from app.safety_monitor import SimpleTrendAnalyzer
        self.analyzer = SimpleTrendAnalyzer()

    def test_insufficient_data(self):
        """Test avec données insuffisantes"""
        trend = self.analyzer.analyze_4h_trend("user1")
        assert trend.trend_direction == "unknown"

    def test_upward_trend(self):
        """Test détection tendance croissante"""
        for i in range(5):
            self.analyzer.add_data_point("user1", {"detresse": 50 + (i * 10)})

        trend = self.analyzer.analyze_4h_trend("user1")
        assert trend.trend_direction == "up"


class TestPredictiveSafetyWithoutML:
    """Tests prédiction de risque"""

    def setup_method(self):
        from app.safety_monitor import PredictiveSafetyWithoutML
        self.predictor = PredictiveSafetyWithoutML()

    def test_high_risk_prediction(self):
        """Test prédiction risque élevé"""
        for i in range(5):
            self.predictor.trend_analyzer.add_data_point("user1", {"detresse": 50 + (i * 15)})

        current_state = {"fatigue": 0.9, "dissociation": 0.6}
        prediction = self.predictor.predict_risk_simple("user1", "TIPI", current_state)

        assert prediction["risk_score"] > 0.5


class TestOptimalInterventionSystem:
    """Tests système d'intervention"""

    def setup_method(self):
        from app.safety_monitor import OptimalInterventionSystem
        self.intervention = OptimalInterventionSystem()

    def test_safety_first_strategy(self):
        """Test stratégie safety_first"""
        plan = self.intervention.get_optimal_intervention(
            safety_level="unsafe",
            risk_prediction={"risk_score": 0.9, "risk_factors": ["detresse_croissante"]},
            user_context={}
        )

        assert plan.strategy == "safety_first"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

