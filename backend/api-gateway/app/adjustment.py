from __future__ import annotations
from typing import List
from .models import StateRecord, Tone

WINDOW = 5

def moving_avg(values: List[int], n: int) -> float:
    if not values:
        return 0.0
    arr = values[-n:]
    return sum(arr) / len(arr)

# Phase detector based on detresse/espoir/energie averages
# if detresse > 70: ancrage
# elif detresse <= 70 and espoir < 40: expression
# elif espoir >= 40 and energie >= 50: sens
# else: reconstruction

def detect_phase(history: List[StateRecord], current: StateRecord) -> str:
    det = current.detresse
    esp = current.espoir
    ene = current.energie
    if det > 70:
        return 'ancrage'
    elif det <= 70 and esp < 40:
        return 'expression'
    elif esp >= 40 and ene >= 50:
        return 'sens'
    else:
        return 'reconstruction'

def adjust_tone(history: List[StateRecord], current: StateRecord) -> Tone:
    if not history:
        return current.tone
    det_vals = [h.detresse for h in history]
    avg_det = moving_avg(det_vals, WINDOW)
    # Rechute
    if len(history) >= 1:
        delta = current.detresse - history[-1].detresse
        if delta > 15:
            return 'enveloppant'
    if avg_det > 70:
        return 'enveloppant'
    if avg_det < 40 and current.espoir > 60:
        return 'neutre'
    return current.tone
