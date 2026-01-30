-- Script pour insérer un rêve pour Christelle
-- À exécuter dans Supabase SQL Editor

INSERT INTO dreams (
  user_id,
  dream_date,
  title,
  content,
  emotional_state,
  themes,
  tags,
  emotional_intensity,
  lucidity_level,
  is_recurring
) VALUES (
  'fac92d81-7df0-48d9-bc3e-694e8a140f5f',
  '2026-01-29',
  'Rêve à compléter',
  'Décris ton rêve ici...',
  '{"before_sleep": "calme", "after_wake": "curieuse"}',
  ARRAY['à définir'],
  ARRAY['nouveau'],
  5,
  0,
  false
);

-- Vérifier l'insertion
SELECT * FROM dreams WHERE user_id = 'fac92d81-7df0-48d9-bc3e-694e8a140f5f';
