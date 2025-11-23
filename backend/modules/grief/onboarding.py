from __future__ import annotations
from typing import Dict, Any

# Simple state-less onboarding steps machine
# steps: intro -> consent -> first_name -> rhythm -> radar_init -> done

def next_step(step: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    if step == 'intro':
        return {
            'next': 'consent',
            'message': "Bienvenue. Ici, on avance à ton rythme. Je te présenterai simplement comment cela fonctionne.",
        }
    if step == 'consent':
        accepted = bool(payload.get('accepted'))
        if not accepted:
            return {'next': 'consent', 'error': 'Le consentement est requis pour continuer.'}
        return {
            'next': 'first_name',
            'message': "Merci. Comment souhaites-tu que je t’appelle ?",
        }
    if step == 'first_name':
        name = (payload.get('first_name') or '').strip()
        if not name:
            return {'next': 'first_name', 'error': 'Merci d’indiquer un prénom.'}
        return {
            'next': 'rhythm',
            'message': f"Enchanté {name}. Quel rythme te convient aujourd’hui ? 1 = lent, 2 = neutre, 3 = enveloppant.",
        }
    if step == 'rhythm':
        rhythm = int(payload.get('rhythm', 2))
        if rhythm not in (1,2,3):
            return {'next': 'rhythm', 'error': 'Choix invalide (1,2,3).'}
        return {
            'next': 'radar_init',
            'message': "Merci. Pour démarrer, regarde ce radar émotionnel initial. Il évoluera avec toi.",
            'initial_scores': {'detresse': 50, 'espoir': 50, 'energie': 50}
        }
    if step == 'radar_init':
        return {
            'next': 'done',
            'message': "C’est prêt. Quand tu veux, on peut commencer à échanger en texte.",
        }
    return {'next': 'intro'}
