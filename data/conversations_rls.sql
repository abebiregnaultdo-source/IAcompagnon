-- ============================================================================
-- RLS pour la table `conversations`
-- ============================================================================
-- Contexte : le frontend (Chat.jsx) persiste désormais chaque conversation dans
-- Supabase via upsert (auto-save à chaque échange complet). Pour que l'écriture
-- passe avec la session utilisateur (clé anon + JWT), il faut les policies RLS
-- ci-dessous — calquées sur celles de `dreams` qui fonctionnent déjà.
--
-- Idempotent : on peut le rejouer sans risque (DROP IF EXISTS avant CREATE).
-- À exécuter dans le SQL Editor du dashboard Supabase.
-- ============================================================================

-- S'assurer que la table a bien le bon schéma (no-op si déjà créée ainsi)
CREATE TABLE IF NOT EXISTS conversations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    messages jsonb DEFAULT '[]'::jsonb,
    summary text,
    emotional_state jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);

-- Activer RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Policies : un utilisateur n'accède qu'à SES conversations (comme `dreams`)
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
CREATE POLICY "Users can view own conversations" ON conversations
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own conversations" ON conversations;
CREATE POLICY "Users can insert own conversations" ON conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE nécessaire pour l'upsert (auto-save réécrit la même ligne à chaque échange)
DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;
CREATE POLICY "Users can update own conversations" ON conversations
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own conversations" ON conversations;
CREATE POLICY "Users can delete own conversations" ON conversations
    FOR DELETE USING (auth.uid() = user_id);

-- Auto-update de updated_at
CREATE OR REPLACE FUNCTION set_conversations_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_conversations_updated_at ON conversations;
CREATE TRIGGER trg_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION set_conversations_updated_at();
