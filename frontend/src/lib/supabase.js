import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ffoykmvqzhtoikxcomfm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmb3lrbXZxemh0b2lreGNvbWZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMzQ5NjYsImV4cCI6MjA4MDgxMDk2Nn0.PL8G2l7jCYb8SbRXGjkZb7kUZVU-KpgVwnnBDafZuE8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// =============================================
// AUTH HELPERS
// =============================================

export async function signUp(email, password, firstName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPasswordForEmail(email) {
  // Utiliser l'URL de production pour éviter les redirections vers localhost
  const productionUrl = 'https://ia-compagnon.vercel.app';
  const redirectUrl = window.location.hostname === 'localhost'
    ? productionUrl
    : window.location.origin;

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${redirectUrl}/reset-password`,
  });
  if (error) throw error;
  return data;
}

export async function updatePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
  return data;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// =============================================
// PROFILE HELPERS
// =============================================

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// =============================================
// JOURNAL HELPERS
// =============================================

export async function getJournalEntries(userId, limit = 50) {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function addJournalEntry(userId, entry) {
  const { data, error } = await supabase
    .from('journal_entries')
    .insert({
      user_id: userId,
      content: entry.content,
      mood: entry.mood,
      emotions: entry.emotions || [],
      tags: entry.tags || [],
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// =============================================
// CONVERSATIONS HELPERS
// =============================================

export async function getConversations(userId, limit = 20) {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function saveConversation(userId, conversation) {
  const { data, error } = await supabase
    .from('conversations')
    .upsert({
      id: conversation.id,
      user_id: userId,
      messages: conversation.messages,
      summary: conversation.summary,
      emotional_state: conversation.emotional_state,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createConversation(userId) {
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      user_id: userId,
      messages: [],
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// =============================================
// CREATIONS HELPERS
// =============================================

export async function getCreations(userId, type = null) {
  let query = supabase
    .from('creations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function saveCreation(userId, creation) {
  const { data, error } = await supabase
    .from('creations')
    .insert({
      user_id: userId,
      type: creation.type,
      title: creation.title,
      content: creation.content,
      data: creation.data || {},
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// =============================================
// EMOTIONAL LOGS HELPERS
// =============================================

export async function getEmotionalLogs(userId, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from('emotional_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addEmotionalLog(userId, emotions, notes = '') {
  const { data, error } = await supabase
    .from('emotional_logs')
    .insert({
      user_id: userId,
      emotions,
      notes,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// =============================================
// PROGRESS HELPERS
// =============================================

export async function getProgress(userId) {
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateProgress(userId, updates) {
  const { data, error } = await supabase
    .from('progress')
    .update({
      ...updates,
      last_activity: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// =============================================
// DREAMS HELPERS (Journal des rêves)
// =============================================

export async function getDreams(userId, limit = 50) {
  const { data, error } = await supabase
    .from('dreams')
    .select('*')
    .eq('user_id', userId)
    .order('dream_date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getDream(dreamId) {
  const { data, error } = await supabase
    .from('dreams')
    .select('*')
    .eq('id', dreamId)
    .single();

  if (error) throw error;
  return data;
}

export async function addDream(userId, dream) {
  const { data, error } = await supabase
    .from('dreams')
    .insert({
      user_id: userId,
      dream_date: dream.dream_date || new Date().toISOString().slice(0, 10),
      title: dream.title,
      content: dream.content,
      therapeutic_context: dream.therapeutic_context,
      emotional_state: dream.emotional_state || {},
      self_interpretation: dream.self_interpretation,
      ai_interpretation: dream.ai_interpretation,
      tags: dream.tags || [],
      themes: dream.themes || [],
      is_recurring: dream.is_recurring || false,
      lucidity_level: dream.lucidity_level || 0,
      emotional_intensity: dream.emotional_intensity || 5,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateDream(dreamId, updates) {
  const { data, error } = await supabase
    .from('dreams')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', dreamId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDream(dreamId) {
  const { error } = await supabase
    .from('dreams')
    .delete()
    .eq('id', dreamId);

  if (error) throw error;
}

export async function getDreamsByTheme(userId, theme) {
  const { data, error } = await supabase
    .from('dreams')
    .select('*')
    .eq('user_id', userId)
    .contains('themes', [theme])
    .order('dream_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

// =============================================
// MEDITATIONS STORAGE HELPERS (Private bucket)
// =============================================

/**
 * Récupère une URL signée temporaire pour accéder à un fichier audio privé
 * L'URL expire après 1 heure pour des raisons de sécurité
 *
 * @param {string} userId - ID de l'utilisateur
 * @param {string} fileName - Nom du fichier (ex: 'liberation-transgenerationnelle.mp3')
 * @returns {Promise<string|null>} URL signée ou null si erreur
 */
export async function getMeditationSignedUrl(userId, fileName) {
  const filePath = `${userId}/${fileName}`;

  const { data, error } = await supabase
    .storage
    .from('meditations')
    .createSignedUrl(filePath, 3600); // 1 heure d'expiration

  if (error) {
    console.error('Erreur récupération URL méditation:', error);
    return null;
  }

  return data?.signedUrl || null;
}

/**
 * Liste les méditations disponibles pour un utilisateur
 *
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Array>} Liste des fichiers
 */
export async function listUserMeditations(userId) {
  const { data, error } = await supabase
    .storage
    .from('meditations')
    .list(userId, {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' }
    });

  if (error) {
    console.error('Erreur liste méditations:', error);
    return [];
  }

  return data || [];
}

/**
 * Upload une méditation pour un utilisateur (admin seulement via dashboard Supabase)
 * Cette fonction est documentée mais l'upload se fait manuellement via Supabase Dashboard
 * pour les fichiers personnalisés de chaque utilisateur.
 *
 * Structure du bucket: meditations/{user_id}/{filename}.mp3
 */
