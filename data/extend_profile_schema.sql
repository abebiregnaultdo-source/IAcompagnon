-- Script pour étendre la table profiles avec les données spirituelles/transgénérationnelles
-- À exécuter dans Supabase SQL Editor

-- Ajouter une colonne JSONB pour les données étendues
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS extended_profile JSONB DEFAULT '{}';

-- Ajouter une colonne pour l'historique des conversations importantes
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS conversation_insights JSONB DEFAULT '[]';

-- Mettre à jour le profil de Christelle avec toutes les données
UPDATE profiles
SET extended_profile = '{
  "identite": {
    "prenom_usuel": "Christelle",
    "prenoms_complets": {
      "naissance": ["Faoziath", "Christelle", "Inès"],
      "actuel": ["Christelle", "Faoziath"],
      "traditionnel": "Adjokè"
    },
    "nom_famille": {
      "paternel": "do Rego",
      "maternel": "Sindikou",
      "ajoute": "AZIZET"
    },
    "nom_complet_actuel": "AZIZET do Rego Christelle Faoziath",
    "naissance": {
      "date": "1989-08-21",
      "heure": "04:25",
      "lieu": "Libreville, Gabon"
    }
  },
  "lignees": {
    "paternelle": {
      "nom": "do Rego",
      "origine": "Aguda",
      "histoire": "Descendants de Portugais/Brésiliens ou esclaves revenus du Brésil, installés au Bénin au 18ème-19ème siècle"
    },
    "maternelle": {
      "nom_officiel": "Sindikou",
      "nom_souche": "Chitou",
      "nom_traditionnel": "Adjilèyè",
      "origine": "Nigeria (Oyo)",
      "histoire": "Omô Oba Oyô - Descendants des rois de Empire Oyo, lignée royale Yoruba descendant Oduduwa",
      "ancetre_divin": "Oduduwa",
      "statut": "Lignée royale Yoruba"
    }
  },
  "famille_proche": {
    "grand_mere_maternelle": {
      "nom": "Mariama Tidjani",
      "surnom": "Mamie",
      "lieu_naissance": "Akogbeto Houévo, Akanni",
      "role_spirituel": "Ange gardien"
    }
  },
  "numerologie": {
    "chemin_de_vie": 2,
    "chemin_signification": "Recevoir, coopérer, équilibre, patience",
    "expression_naissance": 11,
    "expression_actuelle": 6,
    "jour_naissance": 3,
    "annee_personnelle_2026": 3,
    "chiffres_porte_bonheur": [2, 3, 6, 9, 11, 33]
  },
  "astrologie": {
    "soleil": "Lion 28° (Maison 2)",
    "lune": "Bélier 22° (Maison 9)",
    "ascendant": "Cancer 28°",
    "noeud_nord": "Verseau (Maison 8) - Apprendre à recevoir des autres"
  },
  "fa_divination": {
    "signe": "Abla Ho-Ka",
    "numero": 118,
    "signification": "Celle qui tape un seul coup et reçoit - Quand alignée, ça vient un coup"
  },
  "pierres": ["Péridot", "Cornaline", "Pierre de Lune"],
  "themes_therapeutiques": {
    "lecon_centrale": "Apprendre à recevoir au lieu de forcer",
    "patterns": ["Forcer au lieu de recevoir", "Tout porter seule", "Difficulté à accepter aide"],
    "croyances_limitantes": ["Ça ne marche pas pour moi", "Je dois me battre pour tout"],
    "ressources": ["Créativité puissante", "Lignée royale", "Signe Fâ favorable", "Ange gardien Mamie"]
  },
  "mantras": [
    "Je crée. Je reçois. Facilement.",
    "Je lâche. Je laisse venir.",
    "Ce que je crée se concrétise.",
    "Je suis Omô Oba Oyô. Je suis Adjokè. Je reçois ce qui me revient de droit.",
    "Je suis Abla Ho-Ka. Quand je suis alignée, ça vient un coup."
  ],
  "message_central": "Tu es une créatrice puissante qui a appris à forcer, et ta vie enseigne à recevoir."
}'::jsonb,
updated_at = NOW()
WHERE id = 'fac92d81-7df0-48d9-bc3e-694e8a140f5f';

-- Vérifier le résultat
SELECT id, first_name, extended_profile FROM profiles WHERE id = 'fac92d81-7df0-48d9-bc3e-694e8a140f5f';
