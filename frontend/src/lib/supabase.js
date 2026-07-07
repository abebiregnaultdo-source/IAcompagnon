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
// RGPD — EXPORT & SUPPRESSION DES DONNÉES
// =============================================
// Tables rattachées directement à l'utilisateur (données personnelles).
// feedback_logs / analytics_events sont rattachés par user_id_hash (pseudonymisé,
// anonyme) : ils servent à l'amélioration produit agrégée et NE sont PAS des
// données personnelles directes → hors export, conservés à la suppression.
const USER_DATA_TABLES = [
  "conversations",
  "dreams",
  "creations",
  "journal_entries",
  "emotional_logs",
  "progress",
];

/**
 * RGPD Art. 15 & 20 — Droit d'accès et portabilité.
 * Rassemble TOUTES les données personnelles de l'utilisateur dans un objet
 * exportable (JSON). Ne lève pas sur une table vide/absente : best-effort complet.
 */
export async function exportUserData(userId) {
  const bundle = {
    exported_at: new Date().toISOString(),
    user_id: userId,
    profile: null,
    data: {},
  };

  // Profil (rattaché par 'id')
  try {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    bundle.profile = data || null;
  } catch (e) {
    bundle.profile = { error: "non récupérable" };
  }

  // Toutes les tables rattachées par user_id
  for (const table of USER_DATA_TABLES) {
    try {
      const { data, error } = await supabase.from(table).select("*").eq("user_id", userId);
      bundle.data[table] = error ? [] : data || [];
    } catch (e) {
      bundle.data[table] = [];
    }
  }

  return bundle;
}

/**
 * Déclenche le téléchargement de l'export au format JSON dans le navigateur.
 */
export async function downloadUserData(userId, firstName = "mes-donnees") {
  const bundle = await exportUserData(userId);
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const date = new Date().toISOString().slice(0, 10);
  a.download = `helo-donnees-${firstName || "export"}-${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return bundle;
}

/**
 * RGPD Art. 17 — Droit à l'effacement.
 * Supprime TOUTES les données personnelles de l'utilisateur (profil + 6 tables).
 * Les données anonymisées (feedback_logs/analytics_events, par user_id_hash) sont
 * conservées : elles ne sont plus rattachables et l'anonymisation est une
 * alternative reconnue à l'effacement (RGPD considérant 26).
 *
 * NOTE : la suppression du compte AUTH lui-même (supabase.auth) nécessite la clé
 * service_role, indisponible côté client. Elle est déléguée au backend
 * (/api/account/delete). Cette fonction efface toutes les DONNÉES ; le compte auth
 * est ensuite supprimé par le backend, ou l'utilisateur est déconnecté.
 */
export async function deleteUserData(userId) {
  const results = { deleted: [], failed: [] };

  // 1. Effacer les 6 tables rattachées par user_id
  for (const table of USER_DATA_TABLES) {
    try {
      const { error } = await supabase.from(table).delete().eq("user_id", userId);
      if (error) results.failed.push({ table, error: error.message });
      else results.deleted.push(table);
    } catch (e) {
      results.failed.push({ table, error: String(e?.message || e) });
    }
  }

  // 2. Effacer le profil en dernier (rattaché par 'id')
  try {
    const { error } = await supabase.from("profiles").delete().eq("id", userId);
    if (error) results.failed.push({ table: "profiles", error: error.message });
    else results.deleted.push("profiles");
  } catch (e) {
    results.failed.push({ table: "profiles", error: String(e?.message || e) });
  }

  return results;
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

  // Un échec de lecture de l'historique ne doit JAMAIS casser l'app : on dégrade
  // en douceur (l'appelant a un fallback localStorage). On journalise sans throw.
  if (error) {
    console.warn('[HELO] getConversations:', error.message);
    return [];
  }
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

// =============================================
// EXTENDED PROFILE HELPERS (Édition profil spirituel)
// =============================================

/**
 * Met à jour le profil étendu (numérologie, mantras, etc.)
 */
export async function updateExtendedProfile(userId, extendedProfile) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      extended_profile: extendedProfile,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Ajoute un mantra au profil
 */
export async function addMantra(userId, mantra) {
  // Récupérer le profil actuel
  const profile = await getProfile(userId);
  const extendedProfile = profile?.extended_profile || {};
  const mantras = extendedProfile.mantras || [];

  // Ajouter le nouveau mantra
  mantras.push(mantra);

  // Mettre à jour
  return updateExtendedProfile(userId, {
    ...extendedProfile,
    mantras
  });
}

/**
 * Supprime un mantra du profil
 */
export async function removeMantra(userId, mantraIndex) {
  const profile = await getProfile(userId);
  const extendedProfile = profile?.extended_profile || {};
  const mantras = extendedProfile.mantras || [];

  mantras.splice(mantraIndex, 1);

  return updateExtendedProfile(userId, {
    ...extendedProfile,
    mantras
  });
}

// =============================================
// PERSONAL NOTES HELPERS
// =============================================

/**
 * Récupère les notes personnelles
 */
export async function getPersonalNotes(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('personal_notes')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data?.personal_notes || [];
}

/**
 * Ajoute une note personnelle
 */
export async function addPersonalNote(userId, note) {
  const notes = await getPersonalNotes(userId);

  const newNote = {
    id: `note-${Date.now()}`,
    title: note.title,
    content: note.content,
    tags: note.tags || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  notes.unshift(newNote);

  const { data, error } = await supabase
    .from('profiles')
    .update({
      personal_notes: notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return newNote;
}

/**
 * Met à jour une note personnelle
 */
export async function updatePersonalNote(userId, noteId, updates) {
  const notes = await getPersonalNotes(userId);
  const noteIndex = notes.findIndex(n => n.id === noteId);

  if (noteIndex === -1) throw new Error('Note not found');

  notes[noteIndex] = {
    ...notes[noteIndex],
    ...updates,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('profiles')
    .update({
      personal_notes: notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return notes[noteIndex];
}

/**
 * Supprime une note personnelle
 */
export async function deletePersonalNote(userId, noteId) {
  const notes = await getPersonalNotes(userId);
  const filtered = notes.filter(n => n.id !== noteId);

  const { error } = await supabase
    .from('profiles')
    .update({
      personal_notes: filtered,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) throw error;
}
