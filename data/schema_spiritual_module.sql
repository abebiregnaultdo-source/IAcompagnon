-- Schema pour le Module Spiritualité
-- À exécuter dans Supabase SQL Editor

-- Mise à jour de la structure extended_profile pour inclure les données spirituelles
-- La colonne extended_profile est de type JSONB et contient :
-- {
--   "numerology": {...},
--   "astrologie": {...},
--   "fa": {...},
--   "lignees": {...},
--   "mantras": [...],
--   "spiritual": {
--     "identite": {
--       "prenoms_naissance": "string",
--       "nom_naissance": "string",
--       "evolution": [
--         { "type": "naissance|adjonction|mariage|naturalisation|autre", "nom": "string", "date": "string" }
--       ]
--     },
--     "naissance": {
--       "date": "YYYY-MM-DD",
--       "heure": "HH:MM",
--       "lieu": "string",
--       "pays": "string"
--     },
--     "lignees": {
--       "paternelle": { "origines": "string", "traditions": "string", "patterns": "string" },
--       "maternelle": { "origines": "string", "traditions": "string", "patterns": "string" }
--     },
--     "pratiques": {
--       "liste": ["meditation", "yoga", "tarot", ...],
--       "autres": "string"
--     },
--     "themes_vie": {
--       "liste": ["identite", "relations", "travail", ...],
--       "patterns_familiaux": "string"
--     },
--     "completed_at": "ISO datetime"
--   }
-- }

-- Exemple de mise à jour pour Christelle
UPDATE profiles
SET extended_profile = jsonb_set(
  COALESCE(extended_profile, '{}'::jsonb),
  '{spiritual}',
  '{
    "identite": {
      "prenoms_naissance": "Faoziath Christelle Inès",
      "nom_naissance": "do Rego",
      "evolution": [
        { "type": "naissance", "nom": "do Rego Faoziath Christelle Inès", "date": "1989" },
        { "type": "adjonction", "nom": "AZIZET + do Rego Faoziath Christelle", "date": "" },
        { "type": "naturalisation", "nom": "AZIZET do Rego Christelle Faoziath", "date": "" }
      ]
    },
    "naissance": {
      "date": "1989-08-21",
      "heure": "04:25",
      "lieu": "Libreville",
      "pays": "Gabon"
    },
    "lignees": {
      "paternelle": {
        "nom": "do Rego",
        "origines": "Agudas - Béninois revenus du Brésil",
        "traditions": "",
        "patterns": ""
      },
      "maternelle": {
        "nom": "Sindikou-Chitou, Adjilèyè",
        "origines": "Omô Oba Oyô - sang royal Yoruba",
        "traditions": "",
        "patterns": ""
      }
    },
    "pratiques": {
      "liste": ["meditation", "numerologie", "astrologie", "fa"],
      "autres": ""
    },
    "themes_vie": {
      "liste": ["identite", "relations", "travail", "transgenerationnel"],
      "patterns_familiaux": "Pattern sauveuse, porter seule, histoires cachées"
    },
    "completed_at": "2026-01-31T12:00:00Z"
  }'::jsonb
)
WHERE id = 'fac92d81-7df0-48d9-bc3e-694e8a140f5f';

-- Mise à jour de la numérologie avec les calculs complets
UPDATE profiles
SET extended_profile = jsonb_set(
  COALESCE(extended_profile, '{}'::jsonb),
  '{numerology}',
  '{
    "date_naissance": "21/08/1989",
    "heure_naissance": "4h25",
    "lieu_naissance": "Libreville, Gabon",
    "chemin_de_vie": "20/2",
    "annee_personnelle_2026": 3,
    "identite": {
      "naissance": "do Rego Faoziath Christelle Inès",
      "adjonction": "AZIZET + do Rego Faoziath Christelle (Inès disparaît)",
      "naturalisation": "AZIZET do Rego Christelle Faoziath"
    },
    "interpretation": {
      "titre": "Le Diplomate",
      "keywords": ["coopération", "sensibilité", "équilibre", "partenariat"],
      "mission": "Apprendre la collaboration, la patience et l équilibre dans les relations",
      "defis": ["Hypersensibilité", "Dépendance affective", "Difficulté à s affirmer"],
      "forces": ["Médiateur", "Intuitif", "Attentionné", "Coopératif"]
    },
    "karma_a_boucler": [
      "Pattern sauveuse - apprendre à recevoir aussi",
      "Identité morcelée - réunifier les différentes versions de soi",
      "Histoires cachées - vivre authentiquement",
      "Tout porter seule - accepter l aide des autres"
    ]
  }'::jsonb
)
WHERE id = 'fac92d81-7df0-48d9-bc3e-694e8a140f5f';

-- Vérification
SELECT
  id,
  first_name,
  extended_profile->'spiritual' as spiritual,
  extended_profile->'numerology' as numerology
FROM profiles
WHERE id = 'fac92d81-7df0-48d9-bc3e-694e8a140f5f';
