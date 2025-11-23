"""
Catalogue de ressources externes validées
Ressources francophones evidence-based pour le deuil
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime


@dataclass
class ExternalResource:
    """Ressource externe validée"""
    id: str
    name: str
    type: str  # communauté, association, article, guide, annuaire
    category: str  # deuil_enfant, deuil_adulte, deuil_suicide, etc.
    url: Optional[str]
    description: str
    strengths: List[str]
    limitations: List[str]
    evidence_level: str  # professionnel, communautaire, institutionnel
    content_warnings: List[str]
    best_for: List[str]


class ResourcesCatalog:
    """Catalogue de ressources externes"""
    
    def __init__(self):
        self.resources = self._build_catalog()
    
    def _build_catalog(self) -> Dict[str, ExternalResource]:
        """Construit le catalogue de ressources"""
        
        catalog = {}
        
        # DEUIL ENFANT
        catalog["mamans_lumineuses"] = ExternalResource(
            id="mamans_lumineuses",
            name="Les Mamans Lumineuses",
            type="communauté",
            category="deuil_enfant",
            url="https://lesmamanslumineuses.com",
            description="Communauté de soutien entre parents ayant perdu un enfant",
            strengths=[
                "Communauté active et bienveillante",
                "Partage d'expériences authentiques",
                "Non-jugement",
                "Disponible 24/7"
            ],
            limitations=[
                "Pas d'accompagnement professionnel",
                "Intensité émotionnelle variable",
                "Modération par pairs"
            ],
            evidence_level="communautaire",
            content_warnings=["Témoignages intenses", "Détails de pertes"],
            best_for=["Besoin de partage", "Sentiment d'isolement", "Validation par pairs"]
        )
        
        catalog["sparadrap"] = ExternalResource(
            id="sparadrap",
            name="SPARADRAP - Deuil périnatal",
            type="association",
            category="deuil_enfant",
            url="https://www.sparadrap.org",
            description="Association professionnelle pour accompagnement deuil périnatal",
            strengths=[
                "Équipe médicale et psychologique",
                "Ressources validées scientifiquement",
                "Guides pratiques pour parents et professionnels"
            ],
            limitations=[
                "Focus spécifique deuil périnatal",
                "Moins de partage communautaire"
            ],
            evidence_level="professionnel",
            content_warnings=[],
            best_for=["Information médicale", "Guidance professionnelle", "Ressources pratiques"]
        )
        
        # DEUIL ADULTE
        catalog["vivre_son_deuil"] = ExternalResource(
            id="vivre_son_deuil",
            name="Vivre Son Deuil",
            type="association",
            category="deuil_adulte",
            url="https://www.vivresondeuil.asso.fr",
            description="Association nationale d'accompagnement du deuil (40 ans d'expertise)",
            strengths=[
                "Groupes de parole partout en France",
                "Soutien psychologique professionnel",
                "Guides pratiques evidence-based",
                "Expertise reconnue"
            ],
            limitations=[
                "Disponibilité géographique variable",
                "Délais d'attente possibles"
            ],
            evidence_level="professionnel",
            content_warnings=[],
            best_for=["Groupes de parole", "Accompagnement structuré", "Ressources validées"]
        )
        
        catalog["sfap"] = ExternalResource(
            id="sfap",
            name="SFAP - Société Française d'Accompagnement et de Soins Palliatifs",
            type="association",
            category="deuil_adulte",
            url="https://www.sfap.org",
            description="Ressource professionnelle pour accompagnement fin de vie et deuil",
            strengths=[
                "Standards professionnels",
                "Annuaire de professionnels",
                "Formation continue"
            ],
            limitations=[
                "Focus soins palliatifs",
                "Moins accessible grand public"
            ],
            evidence_level="professionnel",
            content_warnings=[],
            best_for=["Trouver un professionnel", "Information médicale", "Standards de soins"]
        )
        
        # DEUIL SUICIDE
        catalog["jonathan"] = ExternalResource(
            id="jonathan",
            name="Association Jonathan Pierres Vivantes",
            type="association",
            category="deuil_suicide",
            url="https://www.association-jonathan.com",
            description="Spécialisée dans l'accompagnement du deuil après suicide (30 ans)",
            strengths=[
                "Ligne d'écoute spécialisée",
                "Groupes de parole spécifiques",
                "Expertise unique en France"
            ],
            limitations=[
                "Thématique très spécifique",
                "Peut être intense émotionnellement"
            ],
            evidence_level="professionnel",
            content_warnings=["Thématique suicide", "Témoignages intenses"],
            best_for=["Deuil après suicide", "Culpabilité", "Questions spécifiques"]
        )
        
        # RESSOURCES NUMÉRIQUES
        catalog["psycom"] = ExternalResource(
            id="psycom",
            name="Psycom - Santé Mentale Info",
            type="ressource_numérique",
            category="information",
            url="https://www.psycom.org",
            description="Organisme public d'information sur la santé mentale",
            strengths=[
                "Information validée scientifiquement",
                "Organisme public",
                "Fiches pratiques claires",
                "Gratuit et accessible"
            ],
            limitations=[
                "Pas d'accompagnement personnalisé",
                "Information générale"
            ],
            evidence_level="institutionnel",
            content_warnings=[],
            best_for=["Comprendre le deuil", "Information fiable", "Premiers pas"]
        )
        
        return catalog
    
    def get_resource(self, resource_id: str) -> Optional[ExternalResource]:
        """Récupère une ressource par ID"""
        return self.resources.get(resource_id)
    
    def get_resources_by_category(self, category: str) -> List[ExternalResource]:
        """Récupère ressources par catégorie"""
        return [r for r in self.resources.values() if r.category == category]
    
    def get_all_resources(self) -> List[ExternalResource]:
        """Toutes les ressources"""
        return list(self.resources.values())
    
    def search_resources(self, query: str) -> List[ExternalResource]:
        """Recherche dans les ressources"""
        query_lower = query.lower()
        results = []
        
        for resource in self.resources.values():
            if (query_lower in resource.name.lower() or
                query_lower in resource.description.lower() or
                any(query_lower in s.lower() for s in resource.best_for)):
                results.append(resource)
        
        return results

