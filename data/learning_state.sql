-- ============================================================================
-- Table learning_state — état d'apprentissage/personnalisation (scalabilité)
-- ============================================================================
-- Remplace les fichiers locaux du backend (profiles.json, ietg_state.json) qui :
--   - sont perdus à chaque redéploiement Render (disque éphémère)
--   - se corrompent / s'écrasent en multi-instance (écriture concurrente)
-- En passant par Supabase, le backend devient STATELESS → multi-instance OK,
-- données persistantes. Structure clé-valeur JSONB : souple, une seule table.
--
-- Clés utilisées :
--   'ietg'                        → état global d'apprentissage (un seul enregistrement)
--   'perso:<user_id_hash>'        → profil d'apprentissage d'un utilisateur (history/prefs)
--
-- Idempotent. À exécuter dans le SQL Editor Supabase.
-- ============================================================================

CREATE TABLE IF NOT EXISTS learning_state (
    key text PRIMARY KEY,
    value jsonb NOT NULL DEFAULT '{}'::jsonb,
    updated_at timestamptz DEFAULT now()
);

-- Accès réservé au backend (service_role). Le client (anon) n'y touche jamais :
-- RLS activé SANS policy permissive → seul le service_role (qui bypasse RLS) écrit/lit.
ALTER TABLE learning_state ENABLE ROW LEVEL SECURITY;

-- Auto-update de updated_at
CREATE OR REPLACE FUNCTION set_learning_state_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_learning_state_updated_at ON learning_state;
CREATE TRIGGER trg_learning_state_updated_at
    BEFORE UPDATE ON learning_state
    FOR EACH ROW EXECUTE FUNCTION set_learning_state_updated_at();
