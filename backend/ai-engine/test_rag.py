"""
Script de test pour le RAG Avancé avec Graphe de Connaissances

Usage:
    python test_rag.py
"""

import sys
import os
from pathlib import Path

# Ajouter le chemin du module
sys.path.insert(0, str(Path(__file__).parent / 'app'))

from app.advanced_rag import (
    KnowledgeGraphRAG,
    SuperSystemPromptEngine,
    ClinicalContext,
    TherapeuticPhase,
    EmotionalState,
    get_rag_engine
)
import json


def create_test_contexts():
    """Crée des contextes de test représentatifs"""
    
    # Contexte 1 : Crise aiguë
    crisis_context = ClinicalContext(
        emotional_state=EmotionalState(
            valence=-0.9,
            arousal=0.85,
            dominance=-0.6,
            grief_intensity=0.95,
            phase_confidence={
                'choc_deni': 0.8,
                'colere': 0.1,
                'marchandage': 0.05,
                'depression': 0.03,
                'acceptation': 0.02
            }
        ),
        user_history=[],
        current_phase=TherapeuticPhase.CRISIS,
        therapeutic_alliance=0.4,
        intervention_history=[],
        safety_level=0.3
    )
    
    # Contexte 2 : Exploration douce
    exploration_context = ClinicalContext(
        emotional_state=EmotionalState(
            valence=-0.3,
            arousal=0.2,
            dominance=0.1,
            grief_intensity=0.5,
            phase_confidence={
                'choc_deni': 0.1,
                'colere': 0.2,
                'marchandage': 0.3,
                'depression': 0.3,
                'acceptation': 0.1
            }
        ),
        user_history=[],
        current_phase=TherapeuticPhase.EXPLORATION,
        therapeutic_alliance=0.7,
        intervention_history=['ecoute_reflet', 'validation_emotionnelle'],
        safety_level=0.8
    )
    
    # Contexte 3 : Recherche de sens
    meaning_context = ClinicalContext(
        emotional_state=EmotionalState(
            valence=0.1,
            arousal=-0.1,
            dominance=0.3,
            grief_intensity=0.4,
            phase_confidence={
                'choc_deni': 0.05,
                'colere': 0.1,
                'marchandage': 0.2,
                'depression': 0.25,
                'acceptation': 0.4
            }
        ),
        user_history=[],
        current_phase=TherapeuticPhase.MEANING_MAKING,
        therapeutic_alliance=0.85,
        intervention_history=['exploration_narrative', 'questions_ouvertes', 'logotherapie_sens'],
        safety_level=0.9
    )
    
    return {
        'crisis': crisis_context,
        'exploration': exploration_context,
        'meaning': meaning_context
    }


def test_rag_retrieval():
    """Test du retrieval de protocoles"""
    print("=" * 80)
    print("TEST DU RAG AVANCÉ - RETRIEVAL DE PROTOCOLES")
    print("=" * 80)
    
    # Initialiser le RAG
    rag = get_rag_engine()
    
    print(f"\n✅ RAG initialisé avec {len(rag.protocols_db)} protocoles")
    print(f"✅ Graphe de connaissances : {len(rag.knowledge_graph['nodes'])} nœuds, {len(rag.knowledge_graph['edges'])} arêtes\n")
    
    # Créer les contextes de test
    contexts = create_test_contexts()
    
    # Messages de test
    test_cases = [
        ('crisis', "Je n'arrive plus à respirer, tout est trop lourd..."),
        ('exploration', "Je me demande ce que j'aurais pu faire différemment..."),
        ('meaning', "Qu'est-ce que sa vie m'a appris ? Quel sens donner à tout ça ?")
    ]
    
    for context_name, message in test_cases:
        context = contexts[context_name]
        
        print(f"\n{'─' * 80}")
        print(f"SCÉNARIO: {context_name.upper()}")
        print(f"{'─' * 80}")
        print(f"Message: {message}")
        print(f"\nÉtat émotionnel:")
        print(f"  Valence:   {context.emotional_state.valence:+.2f}")
        print(f"  Arousal:   {context.emotional_state.arousal:+.2f}")
        print(f"  Dominance: {context.emotional_state.dominance:+.2f}")
        print(f"  Intensité deuil: {context.emotional_state.grief_intensity:.2f}")
        print(f"\nPhase thérapeutique: {context.current_phase.value}")
        print(f"Alliance thérapeutique: {context.therapeutic_alliance:.2f}")
        print(f"Niveau de sécurité: {context.safety_level:.2f}")
        
        # Retrieval
        protocols = rag.retrieve_protocols(context, message, top_k=3)
        
        print(f"\n📊 PROTOCOLES RÉCUPÉRÉS (top 3):")
        for i, protocol in enumerate(protocols, 1):
            print(f"\n  {i}. {protocol['protocol_id']}")
            print(f"     Summary: {protocol['protocol'].get('summary', 'N/A')}")
            print(f"     Score final: {protocol['final_score']:.3f}")
            print(f"     Efficacité prédite: {protocol['efficacy_prediction']:.3f}")
            print(f"     Similarité sémantique: {protocol['score']:.3f}")
            print(f"     Reasoning:")
            for step in protocol['reasoning']:
                print(f"       - {step}")


def test_super_prompt_generation():
    """Test de la génération de super-prompts"""
    print("\n\n" + "=" * 80)
    print("TEST DE GÉNÉRATION DE SUPER-PROMPTS")
    print("=" * 80)
    
    # Initialiser le RAG et le moteur de prompts
    rag = get_rag_engine()
    prompt_engine = SuperSystemPromptEngine(rag)
    
    # Créer les contextes de test
    contexts = create_test_contexts()
    
    # Test pour chaque contexte
    test_cases = [
        ('crisis', "Je n'arrive plus à respirer, tout est trop lourd..."),
        ('exploration', "Je me demande ce que j'aurais pu faire différemment..."),
    ]
    
    for context_name, message in test_cases:
        context = contexts[context_name]
        
        print(f"\n{'─' * 80}")
        print(f"GÉNÉRATION DE PROMPT: {context_name.upper()}")
        print(f"{'─' * 80}")
        
        # Générer le super-prompt
        super_prompt = prompt_engine.generate_therapeutic_prompt(context, message)
        
        print(f"\n🧠 SUPER-PROMPT GÉNÉRÉ:\n")
        print(super_prompt)
        print(f"\n{'─' * 80}")


if __name__ == '__main__':
    print("\n🚀 DÉMARRAGE DES TESTS DU RAG AVANCÉ\n")
    
    try:
        # Test 1 : Retrieval
        test_rag_retrieval()
        
        # Test 2 : Génération de prompts
        test_super_prompt_generation()
        
        print("\n\n" + "=" * 80)
        print("✅ TOUS LES TESTS TERMINÉS AVEC SUCCÈS")
        print("=" * 80 + "\n")
        
    except Exception as e:
        print(f"\n\n❌ ERREUR LORS DES TESTS: {e}")
        import traceback
        traceback.print_exc()

