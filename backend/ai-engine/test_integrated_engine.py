"""
Test du Moteur Thérapeutique Intégré

Compare les réponses avec différents niveaux d'amélioration :
- basic : Garde l'existant
- moderate : Améliorations légères
- advanced : Améliorations complètes avec EmotionBERT
"""

import sys
from pathlib import Path

# Ajouter le chemin du module
sys.path.insert(0, str(Path(__file__).parent / 'app'))

from enhanced_therapeutic_engine import (
    get_integrated_engine,
    ContextEnhancer,
    EnhancedContext
)

# Messages de test
TEST_SCENARIOS = [
    {
        "message": "Je n'arrive plus à respirer, tout est trop lourd...",
        "emotion": {"detresse": 85, "espoir": 15, "energie": 25},
        "description": "CRISE - Détresse aiguë"
    },
    {
        "message": "Je me sens un peu mieux aujourd'hui, mais c'est encore difficile",
        "emotion": {"detresse": 55, "espoir": 45, "energie": 40},
        "description": "STABILISATION - Amélioration progressive"
    },
    {
        "message": "Je commence à voir du sens dans ce qui m'arrive",
        "emotion": {"detresse": 35, "espoir": 65, "energie": 55},
        "description": "RECONSTRUCTION - Recherche de sens"
    },
    {
        "message": "Pourquoi ça m'arrive à moi ? C'est tellement injuste !",
        "emotion": {"detresse": 70, "espoir": 25, "energie": 60},
        "description": "COLÈRE - Phase de révolte"
    }
]


def test_context_enhancement():
    """Test de l'enrichissement du contexte"""
    print("=" * 80)
    print("TEST 1: ENRICHISSEMENT DU CONTEXTE")
    print("=" * 80)
    
    enhancer = ContextEnhancer()
    
    for scenario in TEST_SCENARIOS:
        print(f"\n📝 {scenario['description']}")
        print(f"Message: \"{scenario['message']}\"")
        print(f"\n📊 Émotions existantes:")
        print(f"   Détresse: {scenario['emotion']['detresse']}/100")
        print(f"   Espoir:   {scenario['emotion']['espoir']}/100")
        print(f"   Énergie:  {scenario['emotion']['energie']}/100")
        
        # Enrichir le contexte
        enhanced = enhancer.enhance_context(scenario['emotion'], scenario['message'])
        
        print(f"\n🧠 Contexte enrichi:")
        print(f"   Phase thérapeutique: {enhanced.therapeutic_phase}")
        print(f"   Niveau de sécurité:  {enhanced.safety_level}")
        print(f"\n🔬 Circumplex (EmotionBERT):")
        print(f"   Valence:   {enhanced.advanced_emotion.valence:+.2f} ({'déplaisir' if enhanced.advanced_emotion.valence < 0 else 'plaisir'})")
        print(f"   Arousal:   {enhanced.advanced_emotion.arousal:+.2f} ({'activation' if enhanced.advanced_emotion.arousal > 0 else 'calme'})")
        print(f"   Dominance: {enhanced.advanced_emotion.dominance:+.2f} ({'contrôle' if enhanced.advanced_emotion.dominance > 0 else 'soumission'})")
        print(f"   Intensité deuil: {enhanced.advanced_emotion.grief_intensity:.2f}")
        
        print(f"\n📈 Phases Kübler-Ross (probabilités):")
        for phase, prob in enhanced.advanced_emotion.phase_confidence.items():
            bar = '█' * int(prob * 20)
            print(f"   {phase:15s} {prob:.2f} {bar}")
        
        print("\n" + "-" * 80)


def test_integrated_engine():
    """Test du moteur intégré avec différents niveaux"""
    print("\n" + "=" * 80)
    print("TEST 2: MOTEUR INTÉGRÉ - COMPARAISON DES NIVEAUX")
    print("=" * 80)
    
    # Test avec un scénario de crise
    scenario = TEST_SCENARIOS[0]  # Crise
    
    print(f"\n📝 Scénario: {scenario['description']}")
    print(f"Message: \"{scenario['message']}\"")
    print(f"Détresse: {scenario['emotion']['detresse']}/100")
    
    # Test des 3 niveaux
    levels = ["basic", "moderate", "advanced"]
    
    for level in levels:
        print(f"\n{'='*80}")
        print(f"🎚️  NIVEAU: {level.upper()}")
        print(f"{'='*80}")
        
        try:
            engine = get_integrated_engine(enhancement_level=level)
            response = engine.process_message(
                scenario['message'],
                scenario['emotion'],
                user_id="test_user"
            )
            
            print(f"\n💬 Réponse générée:")
            print(f"   {response}")
            
        except Exception as e:
            print(f"\n❌ Erreur: {e}")
            print(f"   (Normal si TherapeuticEngine n'existe pas encore)")


def test_safety_assessment():
    """Test de l'évaluation de sécurité"""
    print("\n" + "=" * 80)
    print("TEST 3: ÉVALUATION DE SÉCURITÉ")
    print("=" * 80)
    
    from enhanced_therapeutic_engine import SafetyAssessor
    
    assessor = SafetyAssessor()
    
    safety_scenarios = [
        {
            "message": "Je vais bien aujourd'hui",
            "emotion": {"detresse": 30, "espoir": 70, "energie": 60},
            "expected": "normal"
        },
        {
            "message": "C'est difficile mais je tiens le coup",
            "emotion": {"detresse": 65, "espoir": 40, "energie": 35},
            "expected": "elevated"
        },
        {
            "message": "Je ne peux plus continuer, je veux que ça s'arrête",
            "emotion": {"detresse": 90, "espoir": 10, "energie": 15},
            "expected": "crisis"
        }
    ]
    
    for scenario in safety_scenarios:
        level = assessor.assess_safety(scenario['emotion'], scenario['message'])
        status = "✅" if level == scenario['expected'] else "❌"
        
        print(f"\n{status} Message: \"{scenario['message']}\"")
        print(f"   Détresse: {scenario['emotion']['detresse']}/100")
        print(f"   Niveau détecté: {level} (attendu: {scenario['expected']})")


if __name__ == "__main__":
    print("\n🧪 TESTS DU MOTEUR THÉRAPEUTIQUE INTÉGRÉ\n")
    
    # Test 1: Enrichissement du contexte
    test_context_enhancement()
    
    # Test 2: Moteur intégré
    test_integrated_engine()
    
    # Test 3: Évaluation de sécurité
    test_safety_assessment()
    
    print("\n" + "=" * 80)
    print("✅ TESTS TERMINÉS")
    print("=" * 80)

