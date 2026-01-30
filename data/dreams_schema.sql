-- Script pour créer la table des rêves
-- À exécuter dans Supabase SQL Editor

-- Table des rêves
CREATE TABLE IF NOT EXISTS dreams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    -- Contenu du rêve
    dream_date DATE NOT NULL DEFAULT CURRENT_DATE,
    title VARCHAR(200),
    content TEXT NOT NULL,

    -- Contexte thérapeutique
    therapeutic_context TEXT, -- Travail en cours (ex: "Travail transgénérationnel")
    emotional_state JSONB DEFAULT '{}', -- État émotionnel au réveil

    -- Interprétations
    self_interpretation TEXT, -- Interprétation de l'utilisateur
    ai_interpretation TEXT, -- Interprétation assistée par l'IA

    -- Métadonnées
    tags TEXT[] DEFAULT '{}',
    themes TEXT[] DEFAULT '{}', -- Thèmes récurrents (ex: "famille", "perte", "transformation")
    is_recurring BOOLEAN DEFAULT FALSE,
    lucidity_level INTEGER DEFAULT 0, -- 0-5 (0 = pas lucide, 5 = très lucide)
    emotional_intensity INTEGER DEFAULT 5, -- 1-10

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_dreams_user_id ON dreams(user_id);
CREATE INDEX IF NOT EXISTS idx_dreams_date ON dreams(dream_date DESC);
CREATE INDEX IF NOT EXISTS idx_dreams_themes ON dreams USING GIN(themes);

-- RLS (Row Level Security)
ALTER TABLE dreams ENABLE ROW LEVEL SECURITY;

-- Politique: les utilisateurs ne voient que leurs propres rêves
CREATE POLICY "Users can view own dreams" ON dreams
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dreams" ON dreams
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dreams" ON dreams
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own dreams" ON dreams
    FOR DELETE USING (auth.uid() = user_id);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_dreams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER dreams_updated_at
    BEFORE UPDATE ON dreams
    FOR EACH ROW
    EXECUTE FUNCTION update_dreams_updated_at();
