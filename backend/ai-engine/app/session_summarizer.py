"""
Session Summarizer - Génère des résumés de session thérapeutique
Pour dépasser Replika : mémoire structurée long terme
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Any
import anthropic

# Configuration
SUMMARY_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'session_summaries')
os.makedirs(SUMMARY_DIR, exist_ok=True)

class SessionSummarizer:
    """
    Génère des résumés structurés de sessions thérapeutiques
    """
    
    def __init__(self, anthropic_api_key: str):
        self.client = anthropic.Anthropic(api_key=anthropic_api_key)
    
    async def should_create_summary(self, messages: List[Dict], user_id: str) -> bool:
        """
        Détermine si une session mérite un résumé
        
        Critères:
        - Au moins 10 messages échangés
        - Dernière activité > 30 minutes (fin de session)
        - Pas déjà résumé aujourd'hui
        """
        if len(messages) < 10:
            return False
        
        # Vérifier si déjà résumé aujourd'hui
        today = datetime.now().strftime('%Y-%m-%d')
        summary_file = os.path.join(SUMMARY_DIR, f"{user_id}_{today}.json")
        
        if os.path.exists(summary_file):
            return False
        
        return True
    
    async def generate_summary(
        self, 
        user_id: str, 
        messages: List[Dict], 
        scores: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Génère un résumé structuré de la session
        
        Returns:
            {
                "date": "2025-11-24",
                "session_id": "unique_id",
                "summary": {
                    "theme": "Deuil maternel",
                    "emotions": ["tristesse", "nostalgie"],
                    "progress": "Verbalisation de l'acceptation",
                    "insights": ["Comprend que le deuil est un processus"],
                    "concerns": ["Isolement social"],
                    "phase": "exploration"
                },
                "key_moments": [...],
                "next_session_focus": "..."
            }
        """
        
        # Extraire les 20 derniers messages pour le contexte
        recent_messages = messages[-20:] if len(messages) > 20 else messages
        
        # Construire le prompt pour Claude
        prompt = f"""Tu es un clinicien expert. Analyse cette session thérapeutique et génère un résumé structuré.

MESSAGES DE LA SESSION:
{self._format_messages(recent_messages)}

SCORES ÉMOTIONNELS:
Détresse: {scores.get('detresse', 'N/A')}/100
Espoir: {scores.get('espoir', 'N/A')}/100
Énergie: {scores.get('energie', 'N/A')}/100
Phase thérapeutique: {scores.get('phase', 'N/A')}

INSTRUCTIONS:
Génère un résumé JSON avec la structure suivante:

{{
  "theme": "Thème principal en 3-5 mots",
  "emotions": ["liste", "des", "émotions", "dominantes"],
  "progress": "Description du progrès observé (1-2 phrases)",
  "insights": ["liste", "des", "prises de conscience importantes"],
  "concerns": ["liste", "des", "points de vigilance"],
  "phase": "ancrage|exploration|integration|consolidation",
  "key_moments": [
    {{
      "moment": "Description courte",
      "significance": "Pourquoi c'est important"
    }}
  ],
  "next_session_focus": "Suggestion pour la prochaine session"
}}

CRITÈRES CLINIQUES:
- Sois précis et factuel
- Identifie les patterns émotionnels
- Note les mécanismes de défense observés
- Relève les ressources mobilisées
- Signale les facteurs de risque

Réponds UNIQUEMENT avec le JSON, sans texte additionnel."""

        # Appeler Claude pour générer le résumé
        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1500,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            # Extraire le JSON de la réponse
            response_text = message.content[0].text
            
            # Nettoyer le texte (enlever les backticks markdown si présents)
            response_text = response_text.strip()
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()
            
            summary_data = json.loads(response_text)
            
            # Enrichir avec métadonnées
            full_summary = {
                "date": datetime.now().strftime('%Y-%m-%d'),
                "timestamp": datetime.now().isoformat(),
                "session_id": f"{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "user_id": user_id,
                "message_count": len(messages),
                "scores": scores,
                "summary": summary_data
            }
            
            # Sauvegarder
            self._save_summary(user_id, full_summary)
            
            return full_summary
            
        except Exception as e:
            print(f"Erreur génération résumé: {e}")
            # Fallback: résumé basique
            return self._generate_basic_summary(user_id, messages, scores)
    
    def _format_messages(self, messages: List[Dict]) -> str:
        """Formate les messages pour le prompt"""
        formatted = []
        for msg in messages:
            role = "Utilisateur" if msg["role"] == "user" else "Helō"
            formatted.append(f"{role}: {msg['content']}")
        return "\n".join(formatted)
    
    def _generate_basic_summary(
        self, 
        user_id: str, 
        messages: List[Dict], 
        scores: Dict
    ) -> Dict:
        """Génère un résumé basique si l'API échoue"""
        return {
            "date": datetime.now().strftime('%Y-%m-%d'),
            "timestamp": datetime.now().isoformat(),
            "session_id": f"{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "user_id": user_id,
            "message_count": len(messages),
            "scores": scores,
            "summary": {
                "theme": "Session enregistrée",
                "emotions": [],
                "progress": "Session sauvegardée pour analyse ultérieure",
                "insights": [],
                "concerns": [],
                "phase": scores.get('phase', 'ancrage'),
                "key_moments": [],
                "next_session_focus": "Continuer l'exploration"
            }
        }
    
    def _save_summary(self, user_id: str, summary: Dict):
        """Sauvegarde le résumé sur disque"""
        date_str = summary['date']
        filename = f"{user_id}_{date_str}.json"
        filepath = os.path.join(SUMMARY_DIR, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(summary, f, ensure_ascii=False, indent=2)
    
    def get_user_summaries(
        self, 
        user_id: str, 
        limit: int = 10
    ) -> List[Dict]:
        """
        Récupère les N derniers résumés d'un utilisateur
        """
        summaries = []
        
        # Lister tous les fichiers de l'utilisateur
        files = []
        for filename in os.listdir(SUMMARY_DIR):
            if filename.startswith(user_id) and filename.endswith('.json'):
                filepath = os.path.join(SUMMARY_DIR, filename)
                files.append(filepath)
        
        # Trier par date (plus récent en premier)
        files.sort(reverse=True)
        
        # Charger les N plus récents
        for filepath in files[:limit]:
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    summaries.append(json.load(f))
            except Exception as e:
                print(f"Erreur chargement résumé {filepath}: {e}")
        
        return summaries
    
    def get_user_context(self, user_id: str) -> Dict[str, Any]:
        """
        Génère un contexte utilisateur enrichi pour l'IA
        
        Retourne:
        {
            "recent_themes": ["deuil", "travail", ...],
            "emotional_trajectory": {...},
            "key_insights": [...],
            "concerns_to_monitor": [...],
            "last_session_summary": {...}
        }
        """
        summaries = self.get_user_summaries(user_id, limit=5)
        
        if not summaries:
            return {
                "is_new_user": True,
                "recent_themes": [],
                "emotional_trajectory": {},
                "key_insights": [],
                "concerns_to_monitor": [],
                "last_session_summary": None
            }
        
        # Extraire les données des 5 dernières sessions
        recent_themes = []
        all_insights = []
        all_concerns = []
        
        for summary in summaries:
            s = summary.get('summary', {})
            if s.get('theme'):
                recent_themes.append(s['theme'])
            if s.get('insights'):
                all_insights.extend(s['insights'])
            if s.get('concerns'):
                all_concerns.extend(s['concerns'])
        
        # Trajectoire émotionnelle (détresse sur les 5 dernières sessions)
        detresse_values = [
            s.get('scores', {}).get('detresse', 50) 
            for s in summaries
        ]
        
        emotional_trajectory = {
            "current_detresse": detresse_values[0] if detresse_values else 50,
            "trend": self._calculate_trend(detresse_values),
            "history": detresse_values
        }
        
        return {
            "is_new_user": False,
            "recent_themes": list(set(recent_themes))[:3],  # 3 thèmes uniques
            "emotional_trajectory": emotional_trajectory,
            "key_insights": list(set(all_insights))[:5],  # 5 insights uniques
            "concerns_to_monitor": list(set(all_concerns)),
            "last_session_summary": summaries[0]['summary'] if summaries else None,
            "last_session_date": summaries[0]['date'] if summaries else None
        }
    
    def _calculate_trend(self, values: List[float]) -> str:
        """Calcule la tendance (amélioration/stable/détérioration)"""
        if len(values) < 2:
            return "stable"
        
        # Comparer premiers et derniers
        recent_avg = sum(values[:2]) / 2
        older_avg = sum(values[-2:]) / 2
        
        diff = recent_avg - older_avg
        
        if diff < -10:
            return "amélioration"  # Détresse diminue
        elif diff > 10:
            return "détérioration"  # Détresse augmente
        else:
            return "stable"


# Exemple d'utilisation
if __name__ == "__main__":
    import asyncio
    
    async def test():
        # Test avec messages exemple
        summarizer = SessionSummarizer(
            anthropic_api_key=os.getenv("ANTHROPIC_API_KEY")
        )
        
        test_messages = [
            {"role": "assistant", "content": "Bonjour Marie. Comment allez-vous ?"},
            {"role": "user", "content": "Pas très bien, je pense beaucoup à ma mère..."},
            {"role": "assistant", "content": "Je comprends. Parlez-moi d'elle."},
            {"role": "user", "content": "Elle est décédée il y a 6 mois. C'est toujours aussi dur."},
            # ... etc
        ]
        
        test_scores = {
            "detresse": 65,
            "espoir": 45,
            "energie": 40,
            "phase": "exploration"
        }
        
        summary = await summarizer.generate_summary(
            user_id="marie_test",
            messages=test_messages,
            scores=test_scores
        )
        
        print(json.dumps(summary, indent=2, ensure_ascii=False))
        
        # Test récupération contexte
        context = summarizer.get_user_context("marie_test")
        print("\nContexte utilisateur:")
        print(json.dumps(context, indent=2, ensure_ascii=False))
    
    asyncio.run(test())
