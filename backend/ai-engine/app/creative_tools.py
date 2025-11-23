"""
Définitions et présentations des outils créatifs
Source de vérité pour l'écosystème, l'onboarding, les mécaniques et les suggestions contextuelles.
"""
from typing import Dict, Any


class CreativeToolsDefinition:
    """Outils créatifs que nous avions architecturés"""

    def get_creative_ecosystem(self) -> Dict[str, Any]:
        return {
            "journal_guide": {
                "description": "Journal thérapeutique avec prompts intelligents",
                "fonctionnement": "Adapte les questions à votre progression",
                "integration": "Connecté à l'Emotion Engine et State Engine",
                "valeur_therapeutique": "Intégration narrative et reconstruction de sens"
            },
            "ecriture_poetique": {
                "description": "Poésie-thérapie assistée par IA",
                "fonctionnement": "Suggestions discrètes pour débloquer l'expression",
                "assistance_ia": "Aide pour métaphores et structure, sans prendre le contrôle",
                "valeur_therapeutique": "Distanciation et symbolisation des émotions"
            },
            "coloriage_therapeutique": {
                "description": "Coloriage digital avec intention thérapeutique",
                "fonctionnement": "Mandalas adaptés aux besoins (régulation, expression, intégration)",
                "optimisation_mobile": "Zones larges, interactions simples",
                "valeur_therapeutique": "Méditation active et régulation émotionnelle"
            },
            "rituels_ecriture": {
                "description": "Rituels d'écriture symboliques",
                "exemples": [
                    "Lettres de libération",
                    "Rituels de passage",
                    "Journal cyclique"
                ],
                "valeur_therapeutique": "Transformation symbolique et continuité du lien"
            }
        }


class CreativeToolsPresentation:
    """Comment présenter les outils créatifs aux utilisateurs"""

    def get_onboarding_flow(self) -> Dict[str, Any]:
        return {
            "premiere_decouverte": {
                "moment": "Après 2-3 conversations réussies",
                "message": "Parfois les mots ne suffisent pas. Découvrez d'autres façons d'exprimer ce qui est là.",
                "ton": "Invitation douce"
            },
            "presentation_globale": {
                "titre": "Votre espace d'expression",
                "sous_titre": "Différentes portes pour explorer vos émotions",
                "outils": [
                    {
                        "icone": "📖",
                        "nom": "Journal guidé",
                        "description": "Des questions qui s'adaptent à votre cheminement",
                        "utilisation_typique": "Quand vous avez besoin de mettre des mots sur votre expérience"
                    },
                    {
                        "icone": "✍️",
                        "nom": "Écriture poétique",
                        "description": "Laissez les métaphores exprimer ce que les mots directs ne peuvent pas",
                        "utilisation_typique": "Quand l'émotion est trop complexe pour un récit linéaire"
                    },
                    {
                        "icone": "🎨",
                        "nom": "Coloriage thérapeutique",
                        "description": "Une méditation active pour apaiser l'esprit et réguler les émotions",
                        "utilisation_typique": "Quand vous êtes submergé·e ou avez besoin de calme"
                    },
                    {
                        "icone": "🕯️",
                        "nom": "Rituels d'écriture",
                        "description": "Des pratiques symboliques pour honorer votre parcours",
                        "utilisation_typique": "Aux moments charnières ou pour marquer une transition"
                    }
                ]
            }
        }


class ToolsFunctioningDetails:
    """Comment chaque outil fonctionne concrètement"""

    def get_tools_mechanics(self) -> Dict[str, Any]:
        return {
            "journal_guide": {
                "adaptativite": "Le système analyse votre état émotionnel et propose des prompts pertinents",
                "exemples_prompts": [
                    "Si détresse élevée → 'Qu'est-ce qui vous apporte un peu de réconfort en ce moment ?'",
                    "Si recherche de sens → 'Quelles valeurs sont importantes pour vous dans cette épreuve ?'",
                    "Si progression → 'Comment avez-vous traversé les moments difficiles récents ?'"
                ],
                "sauvegarde": "Tout est automatiquement sauvegardé dans votre portfolio"
            },
            "assistance_poesie": {
                "niveau_aide": "Suggestions uniquement sur demande explicite",
                "types_aide": [
                    "Trouver le mot juste",
                    "Structurer un poème",
                    "Développer une métaphore"
                ],
                "principe": "Vous restez l'auteur, Helo est un assistant discret"
            },
            "coloriage_mobile": {
                "interface": "Optimisé téléphone - zones larges, sélection couleur simple",
                "protocoles": [
                    "Apaisement : mandalas concentriques + couleurs froides",
                    "Expression : formes libres + palette émotionnelle complète",
                    "Integration : mandalas narratifs avec différentes sections"
                ],
                "duree_typique": "Sessions de 10-15 minutes"
            }
        }


class ContextualToolSuggestions:
    """Quand proposer quel outil créatif"""

    def get_suggestion_strategy(self) -> Dict[str, Any]:
        return {
            "apres_session_emotionnelle": {
                "situation": "Utilisateur vient d'explorer une émotion intense",
                "outil_suggere": "Coloriage thérapeutique",
                "message": "Prenez le temps d'intégrer cette émotion. Un moment de coloriage pourrait vous aider à digérer doucement."
            },
            "blocage_expression": {
                "situation": "Utilisateur a du mal à mettre des mots",
                "outil_suggere": "Écriture poétique",
                "message": "Parfois, la poésie permet de dire ce que la prose ne peut pas capturer. Voulez-vous essayer ?"
            },
            "besoin_structure": {
                "situation": "Utilisateur cherche du sens dans son parcours",
                "outil_suggere": "Journal guidé",
                "message": "Le journal peut vous aider à donner une forme à votre expérience. Des questions vous guideront."
            },
            "moment_transition": {
                "situation": "Date anniversaire ou étape importante",
                "outil_suggere": "Rituels d'écriture",
                "message": "Ce moment mérite d'être honoré. Un rituel d'écriture pourrait marquer cette transition."
            }
        }
