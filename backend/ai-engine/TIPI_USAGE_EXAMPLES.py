"""
Exemples d'Utilisation du Système TIPI Intelligent

Ce fichier montre comment utiliser le système TIPI adaptatif dans différents scénarios.
"""

from app.tipi_execution_engine import TIPIExecutionEngine
from app.therapeutic_transitions import TherapeuticTransitionEngine, TherapeuticMethod


# ============================================================================
# EXEMPLE 1 : Détection et Démarrage d'une Session TIPI
# ============================================================================

def example_1_start_tipi_session():
    """Exemple : Utilisateur en détresse avec conscience corporelle"""
    
    # État de l'utilisateur
    user_state = {
        "detresse": 75,
        "body_awareness": 0.8,
        "somatic_activation": 0.9,
        "emotion_location": "gorge",
        "dissociation": 0.2,
        "arousal": 0.7
    }
    
    # Contexte de conversation
    conversation_context = {
        "message_count": 5,
        "somatic_mentions": 3,
        "emotion_words": ["angoisse", "boule", "serré"]
    }
    
    # Profil utilisateur
    user_profile = {
        "high_sensitivity": False,
        "previous_tipi_success": True,
        "preferred_pace": "normal"
    }
    
    # Initialisation du moteur
    tipi_engine = TIPIExecutionEngine()
    
    # 1. Vérifier si TIPI est approprié
    should_activate = tipi_engine.should_activate_tipi(user_state, conversation_context)
    print(f"TIPI recommandé : {should_activate}")
    
    if should_activate:
        # 2. Démarrer la session
        session = tipi_engine.start_tipi_session(
            user_id="user_123",
            session_id="session_456",
            user_profile=user_profile,
            current_state=user_state
        )
        
        print(f"\n=== SESSION TIPI DÉMARRÉE ===")
        print(f"Variation : {session['variation']}")
        print(f"Étape : {session['step']}/{session['total_steps']}")
        print(f"\nPrompt :\n{session['prompt']}")
        
        return session
    
    return None


# ============================================================================
# EXEMPLE 2 : Traitement d'une Réponse Utilisateur avec Progression
# ============================================================================

def example_2_process_response_progressing():
    """Exemple : L'utilisateur progresse bien dans TIPI"""
    
    tipi_engine = TIPIExecutionEngine()
    
    # Simuler une session active
    session_id = "session_456"
    
    # Réponse de l'utilisateur (bonne progression)
    user_response = "Je sens une boule dans la gorge, c'est chaud et serré, comme une pression"
    
    user_state = {
        "detresse": 70,  # Légère baisse
        "somatic_clarity": 0.8,  # Bonne clarté
        "body_awareness": 0.9,
        "process_speed": 0.6
    }
    
    conversation_context = {
        "message_count": 6,
        "somatic_descriptions": ["boule", "chaud", "serré", "pression"]
    }
    
    # Traiter la réponse
    result = tipi_engine.process_tipi_response(
        session_id=session_id,
        user_response=user_response,
        user_state=user_state,
        conversation_context=conversation_context
    )
    
    print(f"\n=== RÉPONSE TRAITÉE (PROGRESSION) ===")
    print(f"Status : {result['status']}")
    print(f"Étape suivante : {result.get('step')}/{result.get('total_steps')}")
    print(f"\nPrompt suivant :\n{result.get('prompt')}")
    
    return result


# ============================================================================
# EXEMPLE 3 : Ajustement en Cas de Blocage
# ============================================================================

def example_3_process_response_blocked():
    """Exemple : L'utilisateur est bloqué (vide, rien)"""
    
    tipi_engine = TIPIExecutionEngine()
    session_id = "session_789"
    
    # Réponse de l'utilisateur (blocage)
    user_response = "Je ne sens rien, c'est vide"
    
    user_state = {
        "detresse": 75,  # Pas de baisse
        "somatic_clarity": 0.2,  # Faible clarté
        "emotional_numbness": 0.8,
        "dissociation": 0.5
    }
    
    conversation_context = {
        "message_count": 7,
        "emptiness_mentions": 2
    }
    
    # Traiter la réponse
    result = tipi_engine.process_tipi_response(
        session_id=session_id,
        user_response=user_response,
        user_state=user_state,
        conversation_context=conversation_context
    )
    
    print(f"\n=== RÉPONSE TRAITÉE (BLOCAGE) ===")
    print(f"Status : {result['status']}")
    print(f"Ajustement : {result.get('adjustment')}")
    print(f"\nMessage d'ajustement :\n{result.get('prompt')}")
    
    return result


# ============================================================================
# EXEMPLE 4 : Transition vers une Autre Méthode
# ============================================================================

def example_4_transition_to_logotherapie():
    """Exemple : Après TIPI, le sens émerge → Logothérapie"""
    
    tipi_engine = TIPIExecutionEngine()
    session_id = "session_101"
    
    # Réponse de l'utilisateur (recherche de sens)
    user_response = "La sensation a disparu... mais je me demande pourquoi je ressens ça maintenant, quel est le sens de tout ça ?"
    
    user_state = {
        "detresse": 45,  # Forte baisse (régulation réussie)
        "somatic_clarity": 0.7,
        "somatic_integration_achieved": True,
        "meaning_seeking": 0.9
    }
    
    conversation_context = {
        "message_count": 12,
        "meaning_words": ["pourquoi", "sens", "comprendre"]
    }
    
    # Traiter la réponse
    result = tipi_engine.process_tipi_response(
        session_id=session_id,
        user_response=user_response,
        user_state=user_state,
        conversation_context=conversation_context
    )
    
    print(f"\n=== TRANSITION RECOMMANDÉE ===")
    print(f"Status : {result['status']}")
    print(f"Transition vers : {result['transition']['to_method']}")
    print(f"Raison : {result['transition']['reason']}")
    print(f"\nMessage de transition :\n{result['transition']['message']}")
    
    if 'tipi_summary' in result:
        print(f"\n=== RÉSUMÉ TIPI ===")
        print(f"Variation utilisée : {result['tipi_summary']['variation_used']}")
        print(f"Étapes complétées : {result['tipi_summary']['steps_completed']}")
        print(f"Progression moyenne : {result['tipi_summary']['average_progression']}")
        print(f"Ajustements : {result['tipi_summary']['adjustments_count']}")
    
    return result


# ============================================================================
# EXEMPLE 5 : Utilisation Directe des Transitions
# ============================================================================

def example_5_direct_transition_detection():
    """Exemple : Détection directe de transition sans TIPI"""
    
    transition_engine = TherapeuticTransitionEngine()
    
    # Contexte : Utilisateur en validation émotionnelle
    current_method = TherapeuticMethod.VALIDATION
    
    user_response = "Oui, je sens que c'est dans ma poitrine, comme une lourdeur"
    
    user_state = {
        "detresse": 60,
        "body_awareness": 0.7,
        "dissociation": 0.2
    }
    
    conversation_context = {
        "message_count": 4,
        "somatic_mentions": 2
    }
    
    # Détecter si transition appropriée
    transition = transition_engine.decide_transition(
        current_method=current_method,
        user_response=user_response,
        user_state=user_state,
        conversation_context=conversation_context
    )
    
    if transition:
        print(f"\n=== TRANSITION DÉTECTÉE ===")
        print(f"De : {transition.from_method.value}")
        print(f"Vers : {transition.to_method.value}")
        print(f"Confiance : {transition.confidence}")
        print(f"Raison : {transition.reason}")
        print(f"Signaux : {transition.user_signals}")
        print(f"\nMessage :\n{transition_engine.get_transition_message(transition)}")
    else:
        print("Aucune transition recommandée, continuer la méthode actuelle")
    
    return transition


# ============================================================================
# EXÉCUTION DES EXEMPLES
# ============================================================================

if __name__ == "__main__":
    print("=" * 80)
    print("EXEMPLES D'UTILISATION DU SYSTÈME TIPI INTELLIGENT")
    print("=" * 80)
    
    # Exemple 1
    print("\n\n" + "=" * 80)
    print("EXEMPLE 1 : Démarrage Session TIPI")
    print("=" * 80)
    example_1_start_tipi_session()
    
    # Exemple 2
    print("\n\n" + "=" * 80)
    print("EXEMPLE 2 : Progression Normale")
    print("=" * 80)
    # example_2_process_response_progressing()  # Nécessite session active
    
    # Exemple 3
    print("\n\n" + "=" * 80)
    print("EXEMPLE 3 : Blocage et Ajustement")
    print("=" * 80)
    # example_3_process_response_blocked()  # Nécessite session active
    
    # Exemple 4
    print("\n\n" + "=" * 80)
    print("EXEMPLE 4 : Transition vers Logothérapie")
    print("=" * 80)
    # example_4_transition_to_logotherapie()  # Nécessite session active
    
    # Exemple 5
    print("\n\n" + "=" * 80)
    print("EXEMPLE 5 : Détection Directe de Transition")
    print("=" * 80)
    example_5_direct_transition_detection()

