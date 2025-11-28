"""
Contextual Greeting Generator
Génère des messages d'accueil contextualisés selon l'historique utilisateur
Pour dépasser Replika : continuité émotionnelle intelligente
"""

from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import random


class ContextualGreetingGenerator:
    """
    Génère des greetings personnalisés selon le contexte utilisateur
    """
    
    def __init__(self):
        self.time_based_greetings = {
            "morning": ["Bonjour", "Belle journée à vous"],
            "afternoon": ["Bon après-midi", "Bonjour"],
            "evening": ["Bonsoir", "Belle soirée"],
            "night": ["Bonsoir", "Vous voilà"]
        }
    
    def generate_greeting(
        self, 
        user_context: Dict[str, Any],
        user_name: Optional[str] = None
    ) -> str:
        """
        Génère un greeting contextuel
        
        Args:
            user_context: Contexte retourné par SessionSummarizer.get_user_context()
            user_name: Prénom de l'utilisateur (optionnel)
        
        Returns:
            Message d'accueil personnalisé
        """
        
        # Utilisateur nouveau
        if user_context.get('is_new_user', False):
            return self._greeting_new_user(user_name)
        
        # Calculer le délai depuis dernière session
        last_session_date = user_context.get('last_session_date')
        if not last_session_date:
            return self._greeting_new_user(user_name)
        
        days_since = self._calculate_days_since(last_session_date)
        
        # Sélectionner le type de greeting selon le délai
        if days_since == 0:
            return self._greeting_same_day(user_context, user_name)
        elif days_since == 1:
            return self._greeting_next_day(user_context, user_name)
        elif days_since <= 3:
            return self._greeting_few_days(user_context, user_name, days_since)
        elif days_since <= 7:
            return self._greeting_same_week(user_context, user_name, days_since)
        elif days_since <= 30:
            return self._greeting_few_weeks(user_context, user_name, days_since)
        else:
            return self._greeting_long_absence(user_context, user_name, days_since)
    
    def _greeting_new_user(self, user_name: Optional[str]) -> str:
        """Premier contact avec l'utilisateur"""
        base = f"Bonjour{' ' + user_name if user_name else ''}."
        return f"{base} Je suis là pour vous accompagner. Prenez votre temps, nous avançons à votre rythme."
    
    def _greeting_same_day(
        self, 
        context: Dict[str, Any], 
        user_name: Optional[str]
    ) -> str:
        """Utilisateur revient le même jour"""
        
        # Vérifier la détresse
        trajectory = context.get('emotional_trajectory', {})
        detresse = trajectory.get('current_detresse', 50)
        
        name_part = user_name if user_name else ""
        
        if detresse > 70:
            # Haute détresse
            return f"Vous revoilà{' ' + name_part if name_part else ''}. Comment vous sentez-vous maintenant ?"
        else:
            # Détresse modérée/faible
            return f"Vous revoilà{' ' + name_part if name_part else ''}. Que se passe-t-il ?"
    
    def _greeting_next_day(
        self, 
        context: Dict[str, Any], 
        user_name: Optional[str]
    ) -> str:
        """Utilisateur revient le lendemain"""
        
        time_greeting = self._get_time_based_greeting()
        trajectory = context.get('emotional_trajectory', {})
        detresse = trajectory.get('current_detresse', 50)
        last_summary = context.get('last_session_summary', {})
        theme = last_summary.get('theme', '')
        
        name_part = f" {user_name}" if user_name else ""
        
        if detresse > 70:
            # Haute détresse la veille
            return f"{time_greeting}{name_part}. Comment s'est passée votre nuit ?"
        elif theme:
            # Référence au thème de la veille
            return f"{time_greeting}{name_part}. Où en êtes-vous depuis notre échange d'hier ?"
        else:
            return f"{time_greeting}{name_part}. Heureux de vous retrouver."
    
    def _greeting_few_days(
        self, 
        context: Dict[str, Any], 
        user_name: Optional[str],
        days: int
    ) -> str:
        """2-3 jours depuis dernière session"""
        
        time_greeting = self._get_time_based_greeting()
        last_summary = context.get('last_session_summary', {})
        theme = last_summary.get('theme', '')
        concerns = last_summary.get('concerns', [])
        
        name_part = f" {user_name}" if user_name else ""
        
        if concerns:
            # Il y avait des points de vigilance
            concern = concerns[0]  # Premier concern
            return f"{time_greeting}{name_part}. Comment allez-vous depuis notre échange ? Je pensais à {concern}."
        elif theme:
            # Référence au thème
            return f"{time_greeting}{name_part}. Où en êtes-vous avec {theme.lower()} ?"
        else:
            return f"{time_greeting}{name_part}. Que s'est-il passé ces derniers jours ?"
    
    def _greeting_same_week(
        self, 
        context: Dict[str, Any], 
        user_name: Optional[str],
        days: int
    ) -> str:
        """4-7 jours depuis dernière session"""
        
        time_greeting = self._get_time_based_greeting()
        recent_themes = context.get('recent_themes', [])
        trajectory = context.get('emotional_trajectory', {})
        trend = trajectory.get('trend', 'stable')
        
        name_part = f" {user_name}" if user_name else ""
        
        if recent_themes:
            theme = recent_themes[0]
            
            if trend == "amélioration":
                return f"{time_greeting}{name_part}. Je sens que vous allez mieux. Comment évoluent les choses autour de {theme.lower()} ?"
            elif trend == "détérioration":
                return f"{time_greeting}{name_part}. Comment vous sentez-vous ? Je suis là pour vous."
            else:
                return f"{time_greeting}{name_part}. Où en êtes-vous avec {theme.lower()} ?"
        else:
            return f"{time_greeting}{name_part}. Comment avez-vous été cette semaine ?"
    
    def _greeting_few_weeks(
        self, 
        context: Dict[str, Any], 
        user_name: Optional[str],
        days: int
    ) -> str:
        """1-4 semaines depuis dernière session"""
        
        time_greeting = self._get_time_based_greeting()
        recent_themes = context.get('recent_themes', [])
        
        name_part = f" {user_name}" if user_name else ""
        weeks = days // 7
        
        if recent_themes:
            themes_str = " et ".join(recent_themes[:2])  # Max 2 thèmes
            return f"{time_greeting}{name_part}. Cela fait {weeks} {'semaine' if weeks == 1 else 'semaines'}. Comment évoluent les choses concernant {themes_str.lower()} ?"
        else:
            return f"{time_greeting}{name_part}. Cela fait {weeks} {'semaine' if weeks == 1 else 'semaines'}. Que s'est-il passé ?"
    
    def _greeting_long_absence(
        self, 
        context: Dict[str, Any], 
        user_name: Optional[str],
        days: int
    ) -> str:
        """Plus d'un mois depuis dernière session"""
        
        time_greeting = self._get_time_based_greeting()
        name_part = f" {user_name}" if user_name else ""
        
        if days > 90:
            # Plus de 3 mois
            return f"{time_greeting}{name_part}. Cela fait longtemps. Comment allez-vous ?"
        else:
            # 1-3 mois
            months = days // 30
            return f"{time_greeting}{name_part}. Cela fait {months} mois. Que s'est-il passé dans votre vie ?"
    
    def _get_time_based_greeting(self) -> str:
        """Retourne un greeting selon l'heure de la journée"""
        hour = datetime.now().hour
        
        if 5 <= hour < 12:
            period = "morning"
        elif 12 <= hour < 17:
            period = "afternoon"
        elif 17 <= hour < 22:
            period = "evening"
        else:
            period = "night"
        
        return random.choice(self.time_based_greetings[period])
    
    def _calculate_days_since(self, last_date_str: str) -> int:
        """Calcule le nombre de jours depuis la dernière session"""
        try:
            last_date = datetime.strptime(last_date_str, '%Y-%m-%d')
            today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            delta = today - last_date.replace(hour=0, minute=0, second=0, microsecond=0)
            return delta.days
        except Exception:
            return 999  # Erreur = longue absence par défaut
    
    def generate_system_prompt_with_context(
        self,
        user_context: Dict[str, Any],
        base_system_prompt: str,
        user_name: Optional[str] = None
    ) -> str:
        """
        Génère un system prompt enrichi avec le contexte utilisateur
        
        À utiliser dans l'appel à l'IA pour injecter le contexte
        """
        
        greeting = self.generate_greeting(user_context, user_name)
        
        # Si utilisateur nouveau, pas de contexte additionnel
        if user_context.get('is_new_user', False):
            return f"""{base_system_prompt}

MESSAGE D'ACCUEIL SUGGÉRÉ:
{greeting}

Commence la conversation avec ce message d'accueil."""
        
        # Construire le contexte enrichi
        context_section = self._build_context_section(user_context)
        
        return f"""{base_system_prompt}

{context_section}

MESSAGE D'ACCUEIL SUGGÉRÉ:
{greeting}

INSTRUCTIONS CONTEXTUELLES:
- Tiens compte du contexte ci-dessus dans tes réponses
- Fais référence aux thèmes récents si pertinent
- Surveille les points de vigilance mentionnés
- Reconnais les progrès réalisés
- Commence la conversation avec le message d'accueil suggéré"""
    
    def _build_context_section(self, context: Dict[str, Any]) -> str:
        """Construit la section contexte pour le system prompt"""
        
        sections = ["CONTEXTE UTILISATEUR:"]
        
        # Dernière session
        last_session = context.get('last_session_summary')
        if last_session:
            sections.append(f"\nDernière session ({context.get('last_session_date')}):")
            sections.append(f"- Thème: {last_session.get('theme', 'N/A')}")
            sections.append(f"- Émotions dominantes: {', '.join(last_session.get('emotions', []))}")
            sections.append(f"- Progrès: {last_session.get('progress', 'N/A')}")
            
            if last_session.get('concerns'):
                sections.append(f"- Points de vigilance: {', '.join(last_session.get('concerns'))}")
        
        # Thèmes récents
        recent_themes = context.get('recent_themes', [])
        if recent_themes:
            sections.append(f"\nThèmes récents: {', '.join(recent_themes)}")
        
        # Trajectoire émotionnelle
        trajectory = context.get('emotional_trajectory', {})
        if trajectory:
            trend = trajectory.get('trend', 'stable')
            detresse = trajectory.get('current_detresse', 50)
            sections.append(f"\nÉtat émotionnel: Détresse {detresse}/100 (tendance: {trend})")
        
        # Insights clés
        insights = context.get('key_insights', [])
        if insights:
            sections.append(f"\nPrises de conscience importantes:")
            for insight in insights[:3]:  # Max 3
                sections.append(f"  - {insight}")
        
        # Concerns à surveiller
        concerns = context.get('concerns_to_monitor', [])
        if concerns:
            sections.append(f"\nPoints de vigilance:")
            for concern in concerns[:3]:  # Max 3
                sections.append(f"  - {concern}")
        
        return "\n".join(sections)


# Exemple d'utilisation
if __name__ == "__main__":
    generator = ContextualGreetingGenerator()
    
    # Test 1: Nouvel utilisateur
    print("=== NOUVEL UTILISATEUR ===")
    context_new = {"is_new_user": True}
    greeting = generator.generate_greeting(context_new, "Marie")
    print(greeting)
    print()
    
    # Test 2: Retour le lendemain après haute détresse
    print("=== LENDEMAIN (HAUTE DÉTRESSE) ===")
    context_next_day = {
        "is_new_user": False,
        "last_session_date": (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d'),
        "emotional_trajectory": {
            "current_detresse": 75,
            "trend": "stable"
        },
        "last_session_summary": {
            "theme": "Deuil maternel",
            "emotions": ["tristesse", "solitude"]
        }
    }
    greeting = generator.generate_greeting(context_next_day, "Marie")
    print(greeting)
    print()
    
    # Test 3: Retour après 1 semaine avec amélioration
    print("=== 1 SEMAINE (AMÉLIORATION) ===")
    context_week = {
        "is_new_user": False,
        "last_session_date": (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d'),
        "recent_themes": ["Deuil maternel", "Retour au travail"],
        "emotional_trajectory": {
            "current_detresse": 45,
            "trend": "amélioration"
        },
        "last_session_summary": {
            "theme": "Retour au travail",
            "concerns": []
        }
    }
    greeting = generator.generate_greeting(context_week, "Marie")
    print(greeting)
    print()
    
    # Test 4: System prompt complet
    print("=== SYSTEM PROMPT ENRICHI ===")
    base_prompt = "Tu es un thérapeute empathique spécialisé dans l'approche TIPI."
    full_prompt = generator.generate_system_prompt_with_context(
        context_week,
        base_prompt,
        "Marie"
    )
    print(full_prompt)
