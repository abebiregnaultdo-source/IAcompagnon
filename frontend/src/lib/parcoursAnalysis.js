/**
 * parcoursAnalysis — analyse le contenu réel des conversations pour donner un
 * aperçu du « parcours » (évolution), pas un simple historique.
 *
 * Choix honnête : on n'utilise PAS les champs emotional_state stockés (figés à 50
 * dans les données actuelles — non fiables). On détecte les thèmes directement
 * dans le TEXTE des messages de la personne, avec les mêmes mots-clés que le
 * backend (therapeutic_engine.THEME_KEYWORDS), pour une lecture cohérente.
 */

const THEME_KEYWORDS = {
  continuing_bonds: ['me manque', 'son absence', 'sa présence', 'sentir proche', 'je lui parle', 'lui parler', 'je lui dis', 'entendre sa voix', 'rituel', 'anniversaire', 'commémor', 'près de moi', 'rêvé de', 'je le sens', 'je la sens'],
  journaling: ['aurais voulu dire', 'aurais dû', 'pas dit', 'regret', 'pardonn', 'si seulement', 'lettre'],
  narrative: ['ma vie est finie', 'je ne suis plus', 'plus rien sans', 'rien sans', 'je ne sais plus qui je suis', 'invisible', 'je fais semblant'],
  act_defusion: ['je suis nul', 'je suis incapable', "c'est impossible", 'je ne vaux', 'je ne peux pas', 'détruit', 'brisé', 'cassé', 'plus jamais', 'je suis mort', 'au bout du rouleau', 'ça me bouffe', 'ça me ronge', 'ça me détruit'],
  act_acceptation: ['éviter', 'évite', 'fuir', 'fuis', 'fuit', 'oublier', 'oublie', 'ne pas penser', 'ne plus penser', 'distraire', 'bloquer', 'bloque'],
  act_valeurs: ['à quoi bon', 'quel sens', 'pourquoi continuer', 'pourquoi je', 'plus de sens', 'vide'],
  systemic: ['ma famille', 'entre nous', 'on ne se parle plus', 'tout porter', 'être fort pour', 'fort pour les autres', 'interdit de pleurer', 'pas le droit de', 'on ne pleure pas', 'dans ma famille', 'tensions dans', 'conflit famili', 'hérité du rôle', 'je dois être le', 'loyauté', 'parentifié', 'mes frères et sœurs', "la famille s'est", 'famille éclatée', 'chacun dans son coin'],
  somatic: ['boule au ventre', 'ventre noué', 'nœud', 'tremble', 'trembler', "cœur qui s'emballe", 'cœur bat', 'suffoque', 'respire plus', 'peux plus respirer', 'souffle coupé', 'oppression', 'tendu dans', 'corps tendu', 'muscles', 'contracté', 'mal au ventre', 'mal à la tête', 'vertige', 'panique'],
  anger: ['colère', 'en colère', 'rage', 'furieux', 'furieuse', 'injuste', 'injustice', 'révolte', 'révolté', 'pas juste', "c'est dégueulasse", 'scandaleux', 'haine', 'déteste'],
};

export const THEME_LABELS = {
  continuing_bonds: 'lien avec la personne absente',
  journaling: 'non-dits et regrets',
  narrative: 'identité bouleversée',
  act_defusion: 'pensées envahissantes',
  act_acceptation: 'évitement de l’émotion',
  act_valeurs: 'quête de sens',
  systemic: 'dynamique familiale',
  somatic: 'ressenti corporel',
  anger: 'colère',
};

/** Détecte les thèmes présents dans un texte. */
function detectThemes(text) {
  if (!text) return [];
  const t = text.toLowerCase();
  return Object.keys(THEME_KEYWORDS).filter((theme) =>
    THEME_KEYWORDS[theme].some((kw) => t.includes(kw))
  );
}

/** Concatène les messages de la personne (role user) d'une conversation. */
function userText(conv) {
  const msgs = Array.isArray(conv.messages) ? conv.messages : [];
  return msgs
    .filter((m) => m && m.role === 'user' && typeof m.content === 'string')
    .map((m) => m.content)
    .join(' \n ');
}

/**
 * Analyse l'ensemble des conversations et renvoie une synthèse de parcours.
 * @returns {{
 *   sessionCount:number, span:{first:string,last:string}|null,
 *   topThemes:Array<{key:string,label:string,count:number}>,
 *   emerging:{key:string,label:string}|null,
 *   fading:{key:string,label:string}|null,
 * }}
 */
export function analyzeParcours(conversations) {
  const convs = (conversations || [])
    .filter((c) => userText(c).replace(/message de test.*/i, '').trim().length > 20)
    .slice()
    .sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));

  if (convs.length === 0) {
    return { sessionCount: 0, span: null, topThemes: [], emerging: null, fading: null };
  }

  // Compte global des thèmes.
  const counts = {};
  const perConv = convs.map((c) => {
    const themes = detectThemes(userText(c));
    themes.forEach((th) => { counts[th] = (counts[th] || 0) + 1; });
    return { date: c.created_at, themes };
  });

  const topThemes = Object.entries(counts)
    .map(([key, count]) => ({ key, label: THEME_LABELS[key] || key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  // Émergent : thème présent dans la 2de moitié mais pas la 1re.
  // Apaisé (fading) : présent dans la 1re moitié mais pas la 2de.
  const mid = Math.floor(perConv.length / 2);
  const early = new Set(perConv.slice(0, mid || 1).flatMap((p) => p.themes));
  const late = new Set(perConv.slice(mid).flatMap((p) => p.themes));
  const emergingKey = [...late].find((t) => !early.has(t));
  const fadingKey = [...early].find((t) => !late.has(t));

  return {
    sessionCount: convs.length,
    span: { first: convs[0].created_at, last: convs[convs.length - 1].created_at },
    topThemes,
    emerging: emergingKey ? { key: emergingKey, label: THEME_LABELS[emergingKey] } : null,
    fading: fadingKey ? { key: fadingKey, label: THEME_LABELS[fadingKey] } : null,
  };
}
