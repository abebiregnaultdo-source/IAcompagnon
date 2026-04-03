/**
 * Fonctions de calcul numérologique
 * Méthode traditionnelle pythagoricienne (la plus reconnue)
 */

/**
 * Réduit un nombre à un chiffre (sauf maîtres nombres 11, 22, 33)
 * @param {number} num - Le nombre à réduire
 * @returns {string} - Le résultat sous forme "XX/X" ou "X"
 */
export function reduceNumber(num) {
  // Maîtres nombres - on ne les réduit pas
  if (num === 11 || num === 22 || num === 33) {
    return String(num);
  }

  if (num < 10) {
    return String(num);
  }

  // Garder la trace du nombre intermédiaire pour les chemins de vie
  const intermediate = num;
  let reduced = num;

  while (reduced >= 10 && reduced !== 11 && reduced !== 22 && reduced !== 33) {
    reduced = String(reduced).split('').reduce((sum, d) => sum + parseInt(d), 0);
  }

  // Format "XX/X" pour montrer le chemin
  if (intermediate !== reduced && intermediate < 100) {
    return `${intermediate}/${reduced}`;
  }

  return String(reduced);
}

/**
 * Calcule la somme des chiffres d'un nombre
 * @param {number} num - Le nombre
 * @returns {number} - La somme des chiffres
 */
function sumDigits(num) {
  return String(num).split('').reduce((sum, d) => sum + parseInt(d), 0);
}

/**
 * Calcule le Chemin de Vie à partir de la date de naissance
 * Méthode: additionner jour + mois + année, puis réduire
 * @param {string} dateNaissance - Format "JJ/MM/AAAA" ou "AAAA-MM-JJ"
 * @returns {object} - { chemin: "XX/X", jour, mois, annee, somme }
 */
export function calculateCheminDeVie(dateNaissance) {
  let jour, mois, annee;

  if (dateNaissance.includes('/')) {
    // Format JJ/MM/AAAA
    const parts = dateNaissance.split('/');
    jour = parseInt(parts[0]);
    mois = parseInt(parts[1]);
    annee = parseInt(parts[2]);
  } else if (dateNaissance.includes('-')) {
    // Format AAAA-MM-JJ
    const parts = dateNaissance.split('-');
    annee = parseInt(parts[0]);
    mois = parseInt(parts[1]);
    jour = parseInt(parts[2]);
  } else {
    throw new Error('Format de date non reconnu. Utilisez JJ/MM/AAAA ou AAAA-MM-JJ');
  }

  // Réduire chaque composant d'abord
  const jourReduit = sumDigits(jour);
  const moisReduit = sumDigits(mois);
  const anneeReduite = sumDigits(annee);

  // Somme totale
  const somme = jourReduit + moisReduit + anneeReduite;

  // Réduction finale
  const chemin = reduceNumber(somme);

  return {
    chemin,
    details: {
      jour,
      mois,
      annee,
      jourReduit,
      moisReduit,
      anneeReduite,
      somme
    }
  };
}

/**
 * Calcule l'Année Personnelle
 * Méthode: jour de naissance + mois de naissance + année en cours
 * @param {string} dateNaissance - Format "JJ/MM/AAAA" ou "AAAA-MM-JJ"
 * @param {number} annee - L'année pour laquelle calculer (ex: 2026)
 * @returns {object} - { anneePersonnelle, details }
 */
export function calculateAnneePersonnelle(dateNaissance, annee) {
  let jour, mois;

  if (dateNaissance.includes('/')) {
    const parts = dateNaissance.split('/');
    jour = parseInt(parts[0]);
    mois = parseInt(parts[1]);
  } else if (dateNaissance.includes('-')) {
    const parts = dateNaissance.split('-');
    mois = parseInt(parts[1]);
    jour = parseInt(parts[2]);
  } else {
    throw new Error('Format de date non reconnu');
  }

  // Réduire chaque composant
  const jourReduit = sumDigits(jour);
  const moisReduit = sumDigits(mois);
  const anneeReduite = sumDigits(annee);

  // Somme
  const somme = jourReduit + moisReduit + anneeReduite;

  // Réduction finale (pas de maîtres nombres pour l'année personnelle)
  let result = somme;
  while (result >= 10) {
    result = sumDigits(result);
  }

  return {
    anneePersonnelle: result,
    details: {
      jour,
      mois,
      annee,
      jourReduit,
      moisReduit,
      anneeReduite,
      somme
    }
  };
}

/**
 * Table de correspondance lettres-chiffres (Pythagoricienne)
 */
const LETTER_VALUES = {
  'A': 1, 'J': 1, 'S': 1,
  'B': 2, 'K': 2, 'T': 2,
  'C': 3, 'L': 3, 'U': 3,
  'D': 4, 'M': 4, 'V': 4,
  'E': 5, 'N': 5, 'W': 5,
  'F': 6, 'O': 6, 'X': 6,
  'G': 7, 'P': 7, 'Y': 7,
  'H': 8, 'Q': 8, 'Z': 8,
  'I': 9, 'R': 9
};

/**
 * Calcule le Nombre d'Expression à partir du nom complet
 * @param {string} nomComplet - Prénom(s) et nom(s) de naissance
 * @returns {object} - { expression, details }
 */
export function calculateExpression(nomComplet) {
  const normalized = nomComplet
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
    .replace(/[^A-Z]/g, ''); // Garder seulement les lettres

  let somme = 0;
  const breakdown = [];

  for (const letter of normalized) {
    const value = LETTER_VALUES[letter] || 0;
    somme += value;
    breakdown.push({ letter, value });
  }

  const expression = reduceNumber(somme);

  return {
    expression,
    details: {
      nomOriginal: nomComplet,
      nomNormalise: normalized,
      somme,
      breakdown
    }
  };
}

/**
 * Voyelles pour le nombre intime
 */
const VOWELS = ['A', 'E', 'I', 'O', 'U', 'Y'];

/**
 * Calcule le Nombre Intime (Élan du Cœur) - somme des voyelles
 * @param {string} nomComplet - Prénom(s) et nom(s) de naissance
 * @returns {object} - { intime, details }
 */
export function calculateIntime(nomComplet) {
  const normalized = nomComplet
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  let somme = 0;
  const breakdown = [];

  for (const char of normalized) {
    if (VOWELS.includes(char)) {
      const value = LETTER_VALUES[char] || 0;
      somme += value;
      breakdown.push({ letter: char, value });
    }
  }

  const intime = reduceNumber(somme);

  return {
    intime,
    details: {
      somme,
      voyelles: breakdown
    }
  };
}

/**
 * Calcule le Nombre de Réalisation - somme des consonnes
 * @param {string} nomComplet - Prénom(s) et nom(s) de naissance
 * @returns {object} - { realisation, details }
 */
export function calculateRealisation(nomComplet) {
  const normalized = nomComplet
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  let somme = 0;
  const breakdown = [];

  for (const char of normalized) {
    if (LETTER_VALUES[char] && !VOWELS.includes(char)) {
      const value = LETTER_VALUES[char];
      somme += value;
      breakdown.push({ letter: char, value });
    }
  }

  const realisation = reduceNumber(somme);

  return {
    realisation,
    details: {
      somme,
      consonnes: breakdown
    }
  };
}

/**
 * Calcule le Jour de Naissance (nombre personnel)
 * @param {number} jour - Le jour de naissance (1-31)
 * @returns {string} - Le nombre réduit
 */
export function calculateJourNaissance(jour) {
  return reduceNumber(jour);
}

/**
 * Interprétations des Chemins de Vie
 */
export const CHEMIN_INTERPRETATIONS = {
  '1': {
    titre: 'Le Leader',
    keywords: ['indépendance', 'création', 'initiative', 'originalité'],
    mission: 'Apprendre à prendre des initiatives et à affirmer son individualité',
    defis: ['Ego excessif', 'Impatience', 'Autoritarisme'],
    forces: ['Pionnier', 'Créatif', 'Courageux', 'Déterminé']
  },
  '2': {
    titre: 'Le Diplomate',
    keywords: ['coopération', 'sensibilité', 'équilibre', 'partenariat'],
    mission: 'Apprendre la collaboration, la patience et l\'équilibre dans les relations',
    defis: ['Hypersensibilité', 'Dépendance affective', 'Difficulté à s\'affirmer'],
    forces: ['Médiateur', 'Intuitif', 'Attentionné', 'Coopératif']
  },
  '3': {
    titre: 'Le Communicateur',
    keywords: ['expression', 'créativité', 'joie', 'sociabilité'],
    mission: 'S\'exprimer de manière créative et apporter de la joie',
    defis: ['Dispersion', 'Superficialité', 'Dramatisation'],
    forces: ['Expressif', 'Optimiste', 'Artistique', 'Charismatique']
  },
  '4': {
    titre: 'Le Bâtisseur',
    keywords: ['stabilité', 'travail', 'ordre', 'construction'],
    mission: 'Construire des bases solides et durables',
    defis: ['Rigidité', 'Obstination', 'Limitation'],
    forces: ['Organisé', 'Fiable', 'Travailleur', 'Pratique']
  },
  '5': {
    titre: 'L\'Aventurier',
    keywords: ['liberté', 'changement', 'aventure', 'adaptabilité'],
    mission: 'Embrasser le changement et vivre des expériences variées',
    defis: ['Instabilité', 'Excès', 'Fuite des responsabilités'],
    forces: ['Polyvalent', 'Curieux', 'Dynamique', 'Adaptable']
  },
  '6': {
    titre: 'Le Responsable',
    keywords: ['amour', 'famille', 'harmonie', 'responsabilité'],
    mission: 'Créer l\'harmonie et prendre soin des autres',
    defis: ['Perfectionnisme', 'Sacrifice excessif', 'Contrôle'],
    forces: ['Aimant', 'Protecteur', 'Harmonieux', 'Dévoué']
  },
  '7': {
    titre: 'Le Chercheur',
    keywords: ['spiritualité', 'analyse', 'introspection', 'sagesse'],
    mission: 'Chercher la vérité et développer la sagesse intérieure',
    defis: ['Isolement', 'Scepticisme excessif', 'Froideur'],
    forces: ['Intuitif', 'Analytique', 'Spirituel', 'Sage']
  },
  '8': {
    titre: 'Le Manifesteur',
    keywords: ['pouvoir', 'abondance', 'réussite', 'karma'],
    mission: 'Maîtriser le monde matériel avec intégrité',
    defis: ['Matérialisme', 'Abus de pouvoir', 'Workaholisme'],
    forces: ['Ambitieux', 'Efficace', 'Stratégique', 'Résilient']
  },
  '9': {
    titre: 'L\'Humaniste',
    keywords: ['humanité', 'compassion', 'sagesse', 'achèvement'],
    mission: 'Servir l\'humanité et terminer des cycles karmiques',
    defis: ['Détachement excessif', 'Idéalisme', 'Difficulté à lâcher prise'],
    forces: ['Compatissant', 'Généreux', 'Sage', 'Inspirant']
  },
  '11': {
    titre: 'Le Maître Intuitif',
    keywords: ['intuition', 'inspiration', 'illumination', 'vision'],
    mission: 'Inspirer et élever la conscience collective',
    defis: ['Tension nerveuse', 'Hypersensibilité', 'Difficulté à concrétiser'],
    forces: ['Visionnaire', 'Inspirant', 'Intuitif', 'Charismatique'],
    note: 'Nombre maître - vibration élevée du 2'
  },
  '22': {
    titre: 'Le Maître Bâtisseur',
    keywords: ['grands projets', 'vision', 'réalisation', 'transformation'],
    mission: 'Construire quelque chose de grand pour l\'humanité',
    defis: ['Pression intense', 'Perfectionnisme paralysant', 'Épuisement'],
    forces: ['Visionnaire pratique', 'Leader', 'Transformateur', 'Puissant'],
    note: 'Nombre maître - vibration élevée du 4'
  },
  '33': {
    titre: 'Le Maître Enseignant',
    keywords: ['guérison', 'compassion', 'service', 'amour inconditionnel'],
    mission: 'Guider et guérir à travers l\'amour inconditionnel',
    defis: ['Sacrifice excessif', 'Porter les fardeaux des autres', 'Épuisement émotionnel'],
    forces: ['Guérisseur', 'Enseignant', 'Aimant', 'Dévoué'],
    note: 'Nombre maître - vibration élevée du 6'
  }
};

/**
 * Interprétations des Années Personnelles
 */
export const ANNEE_INTERPRETATIONS = {
  1: {
    theme: 'Nouveaux départs',
    description: 'Année de commencements, d\'initiatives et de nouveaux projets. C\'est le moment de planter des graines.',
    conseils: ['Oser initier', 'Prendre des décisions', 'S\'affirmer']
  },
  2: {
    theme: 'Patience et partenariats',
    description: 'Année de collaboration, de patience et de développement des relations. Les graines germent.',
    conseils: ['Cultiver la patience', 'Développer les partenariats', 'Écouter son intuition']
  },
  3: {
    theme: 'Expression et créativité',
    description: 'Année d\'expression créative, de communication et de joie. Le moment de s\'exprimer.',
    conseils: ['S\'exprimer', 'Créer', 'Socialiser', 'Communiquer']
  },
  4: {
    theme: 'Construction et travail',
    description: 'Année de travail, d\'organisation et de construction. Poser des fondations solides.',
    conseils: ['Travailler avec discipline', 'Organiser', 'Construire des bases']
  },
  5: {
    theme: 'Changement et liberté',
    description: 'Année de changements, de liberté et d\'expansion. Période dynamique et mouvementée.',
    conseils: ['Accueillir le changement', 'Voyager', 'S\'adapter', 'Explorer']
  },
  6: {
    theme: 'Responsabilités et famille',
    description: 'Année centrée sur la famille, les responsabilités et l\'harmonie domestique.',
    conseils: ['Prendre soin des proches', 'Harmoniser', 'Accepter les responsabilités']
  },
  7: {
    theme: 'Introspection et spiritualité',
    description: 'Année d\'introspection, de réflexion et de développement spirituel. Période de pause.',
    conseils: ['Méditer', 'Étudier', 'Se retirer', 'Approfondir']
  },
  8: {
    theme: 'Récolte et pouvoir',
    description: 'Année de récolte, d\'abondance matérielle et de reconnaissance. Les efforts portent fruit.',
    conseils: ['Récolter', 'Gérer le pouvoir', 'Équilibrer matériel et spirituel']
  },
  9: {
    theme: 'Achèvement et libération',
    description: 'Année de conclusions, de lâcher-prise et de préparation pour un nouveau cycle.',
    conseils: ['Lâcher prise', 'Terminer', 'Pardonner', 'Se préparer au renouveau']
  }
};

/**
 * Calcule la compatibilité entre deux chemins de vie
 * @param {string} chemin1 - Premier chemin de vie
 * @param {string} chemin2 - Deuxième chemin de vie
 * @returns {object} - { score, description, forces, defis }
 */
export function calculateCompatibility(chemin1, chemin2) {
  // Extraire le chiffre final si format "XX/X"
  const n1 = parseInt(chemin1.includes('/') ? chemin1.split('/')[1] : chemin1);
  const n2 = parseInt(chemin2.includes('/') ? chemin2.split('/')[1] : chemin2);

  // Matrice de compatibilité simplifiée (1-10)
  const matrix = {
    '1-1': 6, '1-2': 7, '1-3': 8, '1-4': 5, '1-5': 9, '1-6': 6, '1-7': 7, '1-8': 8, '1-9': 7,
    '2-2': 7, '2-3': 8, '2-4': 7, '2-5': 6, '2-6': 9, '2-7': 8, '2-8': 6, '2-9': 8,
    '3-3': 7, '3-4': 5, '3-5': 9, '3-6': 8, '3-7': 6, '3-8': 7, '3-9': 9,
    '4-4': 7, '4-5': 5, '4-6': 8, '4-7': 7, '4-8': 9, '4-9': 6,
    '5-5': 7, '5-6': 6, '5-7': 8, '5-8': 7, '5-9': 8,
    '6-6': 8, '6-7': 6, '6-8': 7, '6-9': 9,
    '7-7': 8, '7-8': 6, '7-9': 8,
    '8-8': 7, '8-9': 7,
    '9-9': 8
  };

  const key = n1 <= n2 ? `${n1}-${n2}` : `${n2}-${n1}`;
  const score = matrix[key] || 5;

  // Descriptions par paire
  const descriptions = {
    '2-7': {
      description: 'Le 2 apporte la sensibilité et l\'intuition, le 7 la profondeur spirituelle. Union potentiellement très spirituelle mais nécessite une communication consciente.',
      forces: ['Connexion spirituelle profonde', 'Compréhension intuitive', 'Croissance mutuelle'],
      defis: ['Le 7 peut paraître distant au 2', 'Le 2 peut sembler trop émotionnel au 7', 'Besoin de temps seul vs besoin de connexion']
    }
  };

  const specificDesc = descriptions[key] || {
    description: `Union entre chemin ${n1} et chemin ${n2}. Chaque chemin apporte ses qualités uniques à la relation.`,
    forces: ['Complémentarité potentielle', 'Apprentissage mutuel'],
    defis: ['Différences de rythme', 'Besoins différents']
  };

  return {
    score,
    scoreLabel: score >= 8 ? 'Excellente' : score >= 6 ? 'Bonne' : 'Nécessite du travail',
    ...specificDesc
  };
}

/**
 * Génère un profil numérologique complet
 * @param {object} data - { dateNaissance, nomNaissance, prenoms }
 * @returns {object} - Profil complet
 */
export function generateFullProfile(data) {
  const { dateNaissance, nomNaissance, prenoms } = data;
  const nomComplet = `${prenoms} ${nomNaissance}`;

  const cheminResult = calculateCheminDeVie(dateNaissance);
  const expressionResult = calculateExpression(nomComplet);
  const intimeResult = calculateIntime(nomComplet);
  const realisationResult = calculateRealisation(nomComplet);

  // Extraire le chiffre final du chemin
  const cheminFinal = cheminResult.chemin.includes('/')
    ? cheminResult.chemin.split('/')[1]
    : cheminResult.chemin;

  const currentYear = new Date().getFullYear();
  const anneeResult = calculateAnneePersonnelle(dateNaissance, currentYear);

  return {
    cheminDeVie: {
      nombre: cheminResult.chemin,
      interpretation: CHEMIN_INTERPRETATIONS[cheminFinal] || CHEMIN_INTERPRETATIONS[cheminResult.chemin],
      details: cheminResult.details
    },
    expression: {
      nombre: expressionResult.expression,
      details: expressionResult.details
    },
    intime: {
      nombre: intimeResult.intime,
      description: 'Ce que vous désirez profondément, vos motivations intérieures',
      details: intimeResult.details
    },
    realisation: {
      nombre: realisationResult.realisation,
      description: 'Comment vous vous présentez au monde, votre façade',
      details: realisationResult.details
    },
    anneePersonnelle: {
      annee: currentYear,
      nombre: anneeResult.anneePersonnelle,
      interpretation: ANNEE_INTERPRETATIONS[anneeResult.anneePersonnelle],
      details: anneeResult.details
    }
  };
}
