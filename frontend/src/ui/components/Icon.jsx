/**
 * Icon — jeu d'icônes vectorielles outline, cohérent dans toute l'app.
 * Une seule source de vérité (fini les emojis Unicode disparates).
 * Trait fin uniforme, couleur paramétrable (défaut : bleu-gris de marque).
 *
 * Usage : <Icon name="book" size={22} color="#5a8299" />
 */
export default function Icon({ name, size = 22, color = "#5a8299", strokeWidth = 1.6, style }) {
  const p = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: color, strokeWidth, strokeLinecap: "round", strokeLinejoin: "round",
    style: { flexShrink: 0, ...style },
  };
  const paths = {
    // Conversation / présence
    chat: <><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 9 9 0 0 1-4-1L3 20l1-5.5a8.5 8.5 0 1 1 17-3z" /></>,
    voice: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M6 11a6 6 0 0 0 12 0M12 17v4" /></>,
    // Modules
    book: <><path d="M4 5a2 2 0 0 1 2-2h9v16H6a2 2 0 0 0-2 2V5z" /><path d="M15 3h3a1 1 0 0 1 1 1v15" /></>,
    palette: <><circle cx="12" cy="12" r="9" /><circle cx="8.5" cy="9.5" r="1" /><circle cx="15" cy="8.5" r="1" /><circle cx="16" cy="13" r="1" /><path d="M12 21a3 3 0 0 0 0-6 2 2 0 0 1 0-4" /></>,
    moon: <><path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z" /></>,
    compass: <><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" /></>,
    lock: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
    lifebuoy: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><path d="M4.9 4.9l3.5 3.5M15.6 15.6l3.5 3.5M19.1 4.9l-3.5 3.5M8.4 15.6l-3.5 3.5" /></>,
    // Outils créativité
    pen: <><path d="M4 20h16" /><path d="M14 4l6 6-9 9H5v-6l9-9z" /></>,
    brush: <><path d="M14 3l7 7-6 3-4-4 3-6z" /><path d="M11 13c-2 2-2 5-6 6 1-4 4-4 6-6z" /></>,
    scroll: <><path d="M8 3h9a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M5 6a2 2 0 0 0 4 0V4M9 8h7M9 12h7" /></>,
    // Symboliques / respiration
    wind: <><path d="M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h9a2.5 2.5 0 1 1-2.5 2.5" /></>,
    waves: <><path d="M3 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /></>,
    heart: <><path d="M20.8 6.6a5 5 0 0 0-7.1 0L12 8.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 22l8.8-8.3a5 5 0 0 0 0-7.1z" /></>,
    // Landing "pourquoi helō"
    shield: <><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" /></>,
    checklist: <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 10l2 2 3-4M8 16h6" /></>,
    hands: <><path d="M8 13V6a1.5 1.5 0 0 1 3 0v5M11 11V4.5a1.5 1.5 0 0 1 3 0V11M14 11V6.5a1.5 1.5 0 0 1 3 0V13c0 4-2.5 7-6 7s-5-2-6-4l-2-3.5a1.5 1.5 0 0 1 2.6-1.5L8 13" /></>,
  };
  return <svg {...p} aria-hidden="true">{paths[name] || null}</svg>;
}
