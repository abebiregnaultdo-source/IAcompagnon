"""
Script de test et comparaison : Heuristique vs EmotionBERT

Usage:
    python test_emotionbert.py
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app.advanced_emotion import get_emotion_engine, ADVANCED_EMOTION_AVAILABLE
from app.main import score_heuristic, ScoreRequest
import json

# Messages de test représentatifs du deuil
TEST_MESSAGES = [
    "Je n'arrive pas à croire qu'il soit parti... C'est tellement vide sans lui.",
    "Aujourd'hui j'ai ressenti un peu d'espoir pour la première fois.",
    "Je suis en colère contre le monde entier. Pourquoi lui ?",
    "Je commence à accepter la situation, même si c'est difficile.",
    "Je me sens perdu, fatigué, je n'ai plus d'énergie pour rien.",
    "Merci pour votre soutien, ça m'aide vraiment à avancer.",
    "Je vais bien... enfin je crois. Je ne sais plus trop.",
    "C'est dur mais je trouve du sens dans ce qu'il m'a appris.",
]


def compare_analyses():
    """Compare les résultats heuristique vs EmotionBERT"""
    print("=" * 80)
    print("COMPARAISON HEURISTIQUE vs EMOTIONBERT")
    print("=" * 80)
    print(f"\nEmotionBERT disponible : {ADVANCED_EMOTION_AVAILABLE}\n")
    
    if not ADVANCED_EMOTION_AVAILABLE:
        print("⚠️  EmotionBERT non disponible. Installez les dépendances :")
        print("    pip install torch transformers")
        print("\nAffichage de l'heuristique uniquement.\n")
    
    results = []
    
    for i, message in enumerate(TEST_MESSAGES, 1):
        print(f"\n{'─' * 80}")
        print(f"MESSAGE {i}: {message}")
        print(f"{'─' * 80}")
        
        # Analyse heuristique
        req = ScoreRequest(text=message)
        heuristic_scores = score_heuristic(req)
        
        print(f"\n📊 HEURISTIQUE:")
        print(f"   Détresse: {heuristic_scores['detresse']}/100")
        print(f"   Espoir:   {heuristic_scores['espoir']}/100")
        print(f"   Énergie:  {heuristic_scores['energie']}/100")
        print(f"   Phase:    {heuristic_scores['phase']}")
        print(f"   Confiance: {heuristic_scores['confidence']}")
        
        # Analyse EmotionBERT (si disponible)
        if ADVANCED_EMOTION_AVAILABLE:
            try:
                engine = get_emotion_engine(use_gpu=False)
                emotional_state = engine.analyze(message)
                advanced_scores = emotional_state.to_legacy_scores()
                
                print(f"\n🧠 EMOTIONBERT:")
                print(f"   Détresse: {advanced_scores['detresse']}/100")
                print(f"   Espoir:   {advanced_scores['espoir']}/100")
                print(f"   Énergie:  {advanced_scores['energie']}/100")
                print(f"   Phase:    {advanced_scores['phase']}")
                print(f"   Confiance: {advanced_scores['confidence']:.2f}")
                
                print(f"\n🔬 CIRCUMPLEX (EmotionBERT):")
                print(f"   Valence:   {emotional_state.valence:+.2f} (plaisir ↔ déplaisir)")
                print(f"   Arousal:   {emotional_state.arousal:+.2f} (activation ↔ calme)")
                print(f"   Dominance: {emotional_state.dominance:+.2f} (contrôle ↔ soumission)")
                print(f"   Intensité deuil: {emotional_state.grief_intensity:.2f}")
                
                print(f"\n📈 PHASES (probabilités):")
                for phase, prob in emotional_state.phase_confidence.items():
                    bar = '█' * int(prob * 20)
                    print(f"   {phase:15s} {prob:.2f} {bar}")
                
                # Calcul des différences
                diff_detresse = advanced_scores['detresse'] - heuristic_scores['detresse']
                diff_espoir = advanced_scores['espoir'] - heuristic_scores['espoir']
                diff_energie = advanced_scores['energie'] - heuristic_scores['energie']
                
                print(f"\n📊 DIFFÉRENCES (EmotionBERT - Heuristique):")
                print(f"   Détresse: {diff_detresse:+d}")
                print(f"   Espoir:   {diff_espoir:+d}")
                print(f"   Énergie:  {diff_energie:+d}")
                
                results.append({
                    'message': message,
                    'heuristic': heuristic_scores,
                    'advanced': advanced_scores,
                    'circumplex': {
                        'valence': emotional_state.valence,
                        'arousal': emotional_state.arousal,
                        'dominance': emotional_state.dominance,
                        'grief_intensity': emotional_state.grief_intensity
                    },
                    'phase_confidence': emotional_state.phase_confidence
                })
                
            except Exception as e:
                print(f"\n❌ Erreur EmotionBERT: {e}")
                results.append({
                    'message': message,
                    'heuristic': heuristic_scores,
                    'error': str(e)
                })
        else:
            results.append({
                'message': message,
                'heuristic': heuristic_scores
            })
    
    # Sauvegarder les résultats
    output_file = 'emotionbert_comparison.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'=' * 80}")
    print(f"✅ Résultats sauvegardés dans : {output_file}")
    print(f"{'=' * 80}\n")


if __name__ == '__main__':
    compare_analyses()

