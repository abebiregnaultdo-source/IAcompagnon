-- Mise à jour du profil de Christelle avec nouvelles données
-- À exécuter dans Supabase SQL Editor
-- Date: 2026-01-31

UPDATE profiles
SET extended_profile = jsonb_set(
  jsonb_set(
    jsonb_set(
      COALESCE(extended_profile, '{}'::jsonb),
      '{mantras}',
      COALESCE(extended_profile->'mantras', '[]'::jsonb) || '["Je reçois ce qui vient à moi. Je n''ai pas à le mériter."]'::jsonb
    ),
    '{numerologie,annee_personnelle_2026}',
    '3'::jsonb
  ),
  '{numerologie,annee_personnelle_2026_signification}',
  '"Création, expression, communication, fertilité. Ce que tu as planté commence à germer et à s''exprimer. Suite logique de l''année 2 (coopération, patience, réceptivité)."'::jsonb
),
updated_at = NOW()
WHERE id = 'fac92d81-7df0-48d9-bc3e-694e8a140f5f';

-- Ajouter une colonne notes personnelles si elle n'existe pas
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS personal_notes JSONB DEFAULT '[]';

-- Ajouter les exercices en tant que notes personnelles
UPDATE profiles
SET personal_notes = '[
  {
    "id": "ex-recevoir-2026",
    "title": "Exercices pour apprendre à recevoir",
    "created_at": "2026-01-31",
    "content": "1. Quand quelqu''un te propose quelque chose (aide, cadeau, compliment) → dis OUI avant de réfléchir. Même si c''est inconfortable.\n\n2. Mantra quotidien : \"Je reçois ce qui vient à moi. Je n''ai pas à le mériter.\"\n\n3. Observation : Chaque soir, note une chose que tu as reçue dans la journée (même petite). Ça entraîne ton cerveau à voir ce qui vient à toi.\n\n4. Stop au réflexe sauveuse : Quand tu veux aider quelqu''un, demande-toi d''abord : \"Est-ce qu''on m''a demandé ?\" Si non, attends.\n\n5. Demande : Une fois par jour, demande quelque chose à quelqu''un. Pas besoin que ce soit gros. Juste pratiquer l''acte de demander.",
    "tags": ["recevoir", "exercices", "année 3", "2026"]
  }
]'::jsonb,
updated_at = NOW()
WHERE id = 'fac92d81-7df0-48d9-bc3e-694e8a140f5f';

-- Vérifier le résultat
SELECT
  id,
  first_name,
  extended_profile->'mantras' as mantras,
  extended_profile->'numerologie'->'annee_personnelle_2026' as annee,
  extended_profile->'numerologie'->'annee_personnelle_2026_signification' as signification,
  personal_notes
FROM profiles
WHERE id = 'fac92d81-7df0-48d9-bc3e-694e8a140f5f';
