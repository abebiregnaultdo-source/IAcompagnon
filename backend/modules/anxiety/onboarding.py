from __future__ import annotations
from typing import Dict, Any

def next_step(step: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    if step == 'intro':
        return {'next': 'consent', 'message': "Bienvenue. Ici, on avance à ton rythme."}
    if step == 'consent':
        if not bool(payload.get('accepted')):
            return {'next': 'consent', 'error': 'Le consentement est requis.'}
        return {'next': 'first_name', 'message': "Merci. Quel prénom souhaites-tu utiliser ?"}
    if step == 'first_name':
        name = (payload.get('first_name') or '').strip()
        if not name:
            return {'next': 'first_name', 'error': 'Merci d’indiquer un prénom.'}
        return {'next': 'rhythm', 'message': f"Ravi de te rencontrer {name}. Quel rythme te convient (1,2,3) ?"}
    if step == 'rhythm':
        rhythm = int(payload.get('rhythm', 2))
        if rhythm not in (1,2,3):
            return {'next': 'rhythm', 'error': 'Choix invalide (1,2,3).'}
        return {'next': 'radar_init', 'message': "Voici un radar émotionnel initial." , 'initial_scores': {'detresse': 50, 'espoir': 50, 'energie': 50}}
    if step == 'radar_init':
        return {'next': 'done', 'message': "C’est prêt pour commencer."}
    return {'next': 'intro'}
