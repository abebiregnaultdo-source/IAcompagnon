// Minimal controls and mappings for avatar and room based on context and user prefs
// Focused options to avoid overwhelming the user.

export const SKIN_TONES = [
  { id: "light", label: "Clair", color: "#F5D7C6" },
  { id: "medium", label: "Moyen", color: "#C98E6B" },
  { id: "dark", label: "Foncé", color: "#6B4B3A" },
];

export const HAIR_STYLES = [
  { id: "none", label: "Sans (neutre)" },
  { id: "short", label: "Court" },
  { id: "curly", label: "Bouclé" },
  { id: "bun", label: "Chignon" },
  { id: "medium", label: "Mi-long" },
];

export const PRESENTATION_STYLES = [
  { id: "neutral", label: "Neutre" },
  { id: "feminine", label: "Féminin" },
  { id: "masculine", label: "Masculin" },
];

export const ROOM_THEMES = [
  {
    id: "calm",
    label: "Calme",
    bg: "linear-gradient(180deg, #EAF3F6 0%, #FFFFFF 100%)",
    accents: "#B8D8E7",
  },
  {
    id: "warm",
    label: "Chaleureux",
    bg: "linear-gradient(180deg, #FFF3E6 0%, #FFFFFF 100%)",
    accents: "#E6C2A5",
  },
  {
    id: "pro",
    label: "Professionnel",
    bg: "linear-gradient(180deg, #EEF0F4 0%, #FFFFFF 100%)",
    accents: "#C7D0DB",
  },
];

export function mapContextToLighting(context) {
  const detresse = context?.scores?.detresse ?? 50;
  if (detresse >= 80) return "low"; // calmer lights
  if (detresse <= 30) return "bright";
  return "medium";
}

export function getDefaultPrefs() {
  return {
    skinTone: "medium",
    hairStyle: "none", // Neutre par défaut
    presentation: "neutral", // Neutre par défaut
    roomTheme: "calm",
    showAvatar: true,
  };
}

export function loadPrefs() {
  try {
    const raw = localStorage.getItem("avatar_prefs");
    return raw
      ? { ...getDefaultPrefs(), ...JSON.parse(raw) }
      : getDefaultPrefs();
  } catch (e) {
    return getDefaultPrefs();
  }
}

export function savePrefs(prefs) {
  try {
    localStorage.setItem("avatar_prefs", JSON.stringify(prefs));
  } catch (e) {
    // no-op
  }
}
