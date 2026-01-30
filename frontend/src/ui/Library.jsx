import { useState } from "react";
import Logo from "./components/Logo";
import Button from "./components/Button";
import { useDeviceDetection } from "../hooks/useDeviceDetection";
import PetiteFlamme from "./PetiteFlamme";

/**
 * Bibliothèque de ressources externes
 * Livres, podcasts, articles et vidéos recommandés
 */
export default function Library({ onBackToHome }) {
  const device = useDeviceDetection();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showPetiteFlamme, setShowPetiteFlamme] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null); // Pour afficher le détail d'un livre

  // Si on affiche la page du poème
  if (showPetiteFlamme) {
    return <PetiteFlamme onBack={() => setShowPetiteFlamme(false)} />;
  }

  const resources = [
    // ============================================================
    // LIVRES - Références validées en psychologie du deuil
    // ============================================================
    {
      id: 1,
      category: "livre",
      title: "Vivre le deuil au jour le jour",
      author: "Christophe Fauré",
      description:
        "Guide pratique par un psychiatre spécialiste du deuil. Approche validée, conseils concrets pour traverser chaque étape.",
      synopsis:
        "Ce livre accompagne pas à pas les personnes en deuil à travers les différentes phases : le choc initial, la douleur de l'absence, la reconstruction progressive. Christophe Fauré, psychiatre spécialisé depuis 25 ans, y propose des exercices pratiques, des témoignages, et répond aux questions que l'on n'ose pas toujours poser. Un compagnon précieux pour ne pas rester seul face à la perte.",
      pourquoi_le_lire:
        "Si vous cherchez un guide concret et bienveillant qui valide vos émotions tout en vous donnant des outils pratiques au quotidien.",
      type: "Livre",
      url: null,
      tags: ["deuil", "pratique", "psychiatre"],
    },
    {
      id: 2,
      category: "livre",
      title: "La mort intime",
      author: "Marie de Hennezel",
      description:
        "Témoignage d'une psychologue en soins palliatifs. Prix Femina 1995. Réflexion profonde sur l'accompagnement de fin de vie.",
      synopsis:
        "Marie de Hennezel raconte son expérience d'accompagnement des personnes en fin de vie dans une unité de soins palliatifs. À travers des récits touchants, elle montre comment ces moments ultimes peuvent être habités de sens, d'amour et même de beauté. Un livre qui transforme notre regard sur la mort et nous apprend à mieux vivre.",
      pourquoi_le_lire:
        "Pour trouver du sens dans l'accompagnement d'un proche en fin de vie, ou pour apprivoiser votre propre rapport à la mort.",
      type: "Livre",
      url: null,
      tags: ["fin de vie", "accompagnement", "témoignage"],
    },
    {
      id: 3,
      category: "livre",
      title: "Guérir le stress, l'anxiété et la dépression",
      author: "David Servan-Schreiber",
      description:
        "Méthodes naturelles validées scientifiquement : cohérence cardiaque, EMDR, oméga-3. Best-seller traduit en 35 langues.",
      synopsis:
        "David Servan-Schreiber, psychiatre et neuroscientifique, présente 7 méthodes naturelles pour retrouver l'équilibre émotionnel : la cohérence cardiaque (respiration), l'EMDR, les oméga-3, l'exercice physique, la luminothérapie, l'acupuncture et la communication non-violente. Chaque méthode est expliquée avec les preuves scientifiques et des conseils pratiques d'application.",
      pourquoi_le_lire:
        "Si vous cherchez des alternatives naturelles et scientifiquement prouvées pour réguler votre anxiété et retrouver un équilibre.",
      type: "Livre",
      url: null,
      tags: ["anxiété", "dépression", "neurosciences"],
    },
    {
      id: 4,
      category: "livre",
      title: "S'aider soi-même par l'EMDR",
      author: "Francine Shapiro",
      description:
        "Par la créatrice de l'EMDR. Techniques d'auto-traitement pour traumatismes et émotions difficiles.",
      synopsis:
        "Francine Shapiro, créatrice de l'EMDR (désensibilisation et retraitement par les mouvements oculaires), propose des techniques adaptées à l'auto-pratique pour traiter les souvenirs douloureux, l'anxiété et les émotions envahissantes. Elle explique comment notre cerveau traite les traumatismes et comment l'aider à se libérer des blocages émotionnels.",
      pourquoi_le_lire:
        "Pour comprendre comment vos émotions sont 'bloquées' et découvrir des exercices simples à pratiquer chez soi pour les libérer.",
      type: "Livre",
      url: null,
      tags: ["EMDR", "trauma", "auto-thérapie"],
    },
    {
      id: 5,
      category: "livre",
      title: "Faire son deuil, vivre un chagrin",
      author: "Marie-Frédérique Bacqué",
      description:
        "Par la présidente de la Société de Thanatologie. Approche scientifique et humaine du processus de deuil.",
      synopsis:
        "Marie-Frédérique Bacqué, professeure de psychologie et présidente de la Société de Thanatologie, explique les mécanismes psychologiques du deuil en s'appuyant sur les dernières recherches. Elle démonte les mythes (comme les 'étapes' figées du deuil) et propose une vision plus nuancée : chaque deuil est unique, mais certains repères peuvent aider à traverser cette épreuve.",
      pourquoi_le_lire:
        "Pour une compréhension approfondie et scientifique du deuil, loin des clichés, qui valide la singularité de votre expérience.",
      type: "Livre",
      url: null,
      tags: ["deuil", "psychologie", "scientifique"],
    },

    // ============================================================
    // ARTICLES & GUIDES - Ressources gratuites en ligne
    // ============================================================
    {
      id: 10,
      category: "article",
      title: "Guide du deuil - Psycom",
      author: "Psycom (organisme public)",
      description:
        "Guide complet et gratuit sur le deuil par l'organisme public d'information en santé mentale. Fiable et accessible.",
      type: "Guide",
      url: "https://www.psycom.org/comprendre/le-deuil/",
      tags: ["deuil", "gratuit", "officiel"],
    },
    {
      id: 11,
      category: "article",
      title: "Thérapie Cognitive et Comportementale - HAS",
      author: "Haute Autorité de Santé",
      description:
        "Recommandations officielles sur les TCC pour anxiété et dépression. Base scientifique des techniques HELO.",
      type: "Guide officiel",
      url: "https://www.has-sante.fr/",
      tags: ["TCC", "officiel", "dépression"],
    },
    {
      id: 12,
      category: "article",
      title: "Comprendre le deuil compliqué",
      author: "Association EMDR France",
      description:
        "Quand le deuil devient pathologique : signes, différences avec un deuil normal, quand consulter.",
      type: "Article",
      url: "https://www.emdr-france.org/",
      tags: ["deuil compliqué", "EMDR", "psychologie"],
    },
    {
      id: 13,
      category: "article",
      title: "La cohérence cardiaque expliquée",
      author: "Dr David O'Hare",
      description:
        "Technique de respiration 365 validée scientifiquement pour réguler le stress. Gratuit, efficace en 5 minutes.",
      type: "Méthode",
      url: "https://www.coherenceinfo.com/",
      tags: ["respiration", "stress", "gratuit"],
    },
    {
      id: 14,
      category: "article",
      title: "Les phases du deuil - modèle de Worden",
      author: "J. William Worden",
      description:
        "Alternative au modèle Kübler-Ross : 4 tâches actives du deuil. Approche plus moderne et validée.",
      type: "Article scientifique",
      url: null,
      tags: ["deuil", "psychologie", "modèle"],
    },

    // ============================================================
    // PODCASTS - Écoute gratuite
    // ============================================================
    {
      id: 20,
      category: "podcast",
      title: "La mort, et après ?",
      author: "France Culture - Les Chemins de la philosophie",
      description:
        "Série philosophique sur la mort, le deuil et le sens de la vie. Écoute gratuite sur le site France Culture.",
      type: "Podcast",
      url: "https://www.radiofrance.fr/franceculture/podcasts/les-chemins-de-la-philosophie",
      tags: ["philosophie", "gratuit", "France Culture"],
    },
    {
      id: 21,
      category: "podcast",
      title: "Comment vivre avec son deuil",
      author: "France Inter - Grand bien vous fasse",
      description:
        "Émission avec des spécialistes du deuil. Témoignages et conseils pratiques. Replay gratuit.",
      type: "Podcast",
      url: "https://www.radiofrance.fr/franceinter/podcasts/grand-bien-vous-fasse",
      tags: ["deuil", "pratique", "témoignages"],
    },
    {
      id: 22,
      category: "podcast",
      title: "Psychologie positive",
      author: "Change ma vie - Clotilde Dusoulier",
      description:
        "Podcast sur le développement personnel et la psychologie positive. Techniques pratiques et accessibles.",
      type: "Podcast",
      url: "https://changemavie.com/",
      tags: ["psychologie positive", "développement personnel"],
    },
    {
      id: 23,
      category: "podcast",
      title: "Métamorphose - Transformation intérieure",
      author: "Anne Ghesquière",
      description:
        "Interviews de psychologues, philosophes, auteurs sur le changement et la résilience.",
      type: "Podcast",
      url: "https://www.intothewild.fm/metamorphose",
      tags: ["transformation", "résilience", "interviews"],
    },

    // ============================================================
    // VIDÉOS - Conférences et tutoriels
    // ============================================================
    {
      id: 30,
      category: "video",
      title: "Le deuil : comment traverser cette épreuve",
      author: "Christophe Fauré (TEDx)",
      description:
        "Conférence TEDx du psychiatre spécialiste du deuil. 18 min pour comprendre le processus de deuil.",
      type: "Conférence TEDx",
      url: "https://www.youtube.com/results?search_query=christophe+faur%C3%A9+tedx+deuil",
      tags: ["TEDx", "deuil", "psychiatrie"],
    },
    {
      id: 31,
      category: "video",
      title: "Cohérence cardiaque - Exercice guidé 5 min",
      author: "Dr David O'Hare",
      description:
        "Exercice de respiration guidé pour calmer le système nerveux. À faire 3x par jour pour effets optimaux.",
      type: "Exercice guidé",
      url: "https://www.youtube.com/results?search_query=coherence+cardiaque+5+minutes",
      tags: ["respiration", "exercice", "stress"],
    },
    {
      id: 32,
      category: "video",
      title: "Méditation de pleine conscience - MBSR",
      author: "Jon Kabat-Zinn (sous-titré FR)",
      description:
        "Introduction à la pleine conscience par son créateur. Programme MBSR validé pour anxiété et dépression.",
      type: "Méditation guidée",
      url: "https://www.youtube.com/results?search_query=jon+kabat+zinn+meditation+francais",
      tags: ["méditation", "MBSR", "pleine conscience"],
    },
    {
      id: 33,
      category: "video",
      title: "Comprendre l'anxiété et la dépression",
      author: "PsykoCouac (vulgarisation)",
      description:
        "Chaîne de vulgarisation psychologique. Vidéos claires et sourcées sur la santé mentale.",
      type: "Vulgarisation",
      url: "https://www.youtube.com/@PsykoCouac",
      tags: ["vulgarisation", "anxiété", "dépression"],
    },
    {
      id: 34,
      category: "video",
      title: "Relaxation musculaire progressive",
      author: "Jacobson (technique originale)",
      description:
        "Technique validée pour réduire tension et anxiété. 15-20 min de relaxation guidée.",
      type: "Exercice guidé",
      url: "https://www.youtube.com/results?search_query=relaxation+jacobson+francais",
      tags: ["relaxation", "anxiété", "exercice"],
    },

    // ============================================================
    // OUTILS - Applications et sites interactifs gratuits
    // ============================================================
    {
      id: 40,
      category: "outil",
      title: "RespiRelax+ (App gratuite)",
      author: "Thermes d'Allevard",
      description:
        "Application gratuite de cohérence cardiaque. Guide respiratoire visuel. iOS et Android.",
      type: "Application",
      url: "https://www.thermes-allevard.com/respir-relax/",
      tags: ["app", "respiration", "gratuit"],
    },
    {
      id: 41,
      category: "outil",
      title: "Petit BamBou (Méditation)",
      author: "Petit BamBou",
      description:
        "Application de méditation francophone. Programme gratuit de base. Voix douces et apaisantes.",
      type: "Application",
      url: "https://www.petitbambou.com/",
      tags: ["méditation", "app", "francophone"],
    },
    {
      id: 42,
      category: "outil",
      title: "Mon Sherpa (Soutien psy)",
      author: "Mon Sherpa",
      description:
        "Application française d'auto-thérapie TCC. Exercices validés pour anxiété et dépression.",
      type: "Application",
      url: "https://www.monsherpa.eu/",
      tags: ["TCC", "app", "français"],
    },
    {
      id: 43,
      category: "outil",
      title: "Headspace (Anglais/FR)",
      author: "Headspace",
      description:
        "Application de méditation reconnue mondialement. Contenu gratuit disponible. Certaines séances en français.",
      type: "Application",
      url: "https://www.headspace.com/",
      tags: ["méditation", "international", "app"],
    },

    // ============================================================
    // LIGNES D'ÉCOUTE - Soutien humain gratuit
    // ============================================================
    {
      id: 50,
      category: "aide",
      title: "SOS Amitié - 09 72 39 40 50",
      author: "SOS Amitié France",
      description:
        "Écoute 24h/24, 7j/7. Bénévoles formés pour détresse psychologique. Gratuit et anonyme.",
      type: "Ligne d'écoute",
      url: "https://www.sos-amitie.com/",
      tags: ["écoute", "24h/24", "gratuit"],
    },
    {
      id: 51,
      category: "aide",
      title: "Fil Santé Jeunes - 0 800 235 236",
      author: "Santé Publique France",
      description:
        "Pour les 12-25 ans. Écoute anonyme et gratuite. Aussi par chat sur le site.",
      type: "Ligne d'écoute",
      url: "https://www.filsantejeunes.com/",
      tags: ["jeunes", "gratuit", "chat"],
    },
    {
      id: 52,
      category: "aide",
      title: "Suicide Écoute - 01 45 39 40 00",
      author: "Suicide Écoute",
      description:
        "Ligne dédiée aux personnes en détresse suicidaire. 24h/24. Professionnels et bénévoles formés.",
      type: "Ligne d'écoute",
      url: null,
      tags: ["crise", "urgence", "24h/24"],
    },
    {
      id: 53,
      category: "aide",
      title: "Association Jonathan Pierres Vivantes",
      author: "JPV",
      description:
        "Association de parents endeuillés. Groupes de parole et accompagnement pour deuil d'enfant.",
      type: "Association",
      url: "https://www.jpv.asso.fr/",
      tags: ["deuil enfant", "association", "groupe parole"],
    },
    {
      id: 54,
      category: "aide",
      title: "FAVEC - Veuvage",
      author: "FAVEC",
      description:
        "Fédération d'accompagnement au veuvage. Groupes d'entraide, aide administrative et juridique.",
      type: "Association",
      url: "https://www.favec.fr/",
      tags: ["veuvage", "association", "entraide"],
    },

    // ============================================================
    // INSPIRATION - Poésie, musique, beauté pour l'âme
    // ============================================================
    {
      id: 0,
      category: "inspiration",
      title: "Petite flamme",
      author: "Fondatrice de HELO",
      description:
        "Témoignage personnel sur la perte d'un enfant. Ce poème est dédié à tous ceux qui portent un deuil invisible — et c'est la raison pour laquelle HELO existe.",
      type: "Témoignage",
      url: "petite-flamme",
      tags: ["témoignage", "deuil périnatal", "fondatrice"],
      featured: true,
    },
    {
      id: 60,
      category: "inspiration",
      title: "If — Si tu peux...",
      author: "Rudyard Kipling",
      description:
        "Poème intemporel sur la résilience et le courage face à l'adversité. \"Si tu peux voir détruit l'ouvrage de ta vie, et sans dire un seul mot te mettre à rebâtir...\"",
      type: "Poésie",
      url: "https://www.poetica.fr/poeme-94/rudyard-kipling-si/",
      tags: ["poésie", "résilience", "courage"],
    },
    {
      id: 61,
      category: "inspiration",
      title: "Invictus",
      author: "William Ernest Henley",
      description:
        "\"Je suis le maître de mon destin, je suis le capitaine de mon âme.\" Poème écrit face à la maladie, devenu symbole de force intérieure.",
      type: "Poésie",
      url: "https://www.poetica.fr/poeme-2899/william-ernest-henley-invictus/",
      tags: ["poésie", "force", "espoir"],
    },
    {
      id: 62,
      category: "inspiration",
      title: "Demain dès l'aube",
      author: "Victor Hugo",
      description:
        "Poème bouleversant écrit pour sa fille Léopoldine. L'un des plus beaux textes sur le deuil et l'amour qui perdure.",
      type: "Poésie",
      url: "https://www.poetica.fr/poeme-400/victor-hugo-demain-des-l-aube/",
      tags: ["poésie", "deuil", "amour"],
    },
    {
      id: 63,
      category: "inspiration",
      title: "Musique classique apaisante",
      author: "Playlist Spotify",
      description:
        "Sélection de morceaux classiques pour calmer l'esprit : Debussy, Satie, Chopin. La musique comme refuge.",
      type: "Musique",
      url: "https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ",
      tags: ["musique", "calme", "classique"],
    },
    {
      id: 64,
      category: "inspiration",
      title: "Gymnopédie No.1",
      author: "Erik Satie",
      description:
        "Pièce pour piano d'une douceur infinie. Idéale pour un moment de calme et de contemplation.",
      type: "Musique",
      url: "https://www.youtube.com/watch?v=S-Xm7s9eGxU",
      tags: ["musique", "piano", "méditation"],
    },
    {
      id: 65,
      category: "inspiration",
      title: "Clair de Lune",
      author: "Claude Debussy",
      description:
        "Chef-d'œuvre impressionniste. Une mélodie qui accompagne doucement les moments de réflexion.",
      type: "Musique",
      url: "https://www.youtube.com/watch?v=CvFH_6DNRCY",
      tags: ["musique", "piano", "beauté"],
    },
    {
      id: 66,
      category: "inspiration",
      title: "The Shawshank Redemption - Hope",
      author: "Film (1994)",
      description:
        "\"L'espoir est une bonne chose, peut-être la meilleure. Et une bonne chose ne meurt jamais.\" Un film sur la résilience.",
      type: "Film",
      url: null,
      tags: ["film", "espoir", "résilience"],
    },
    {
      id: 67,
      category: "inspiration",
      title: "Le Petit Prince - L'essentiel",
      author: "Antoine de Saint-Exupéry",
      description:
        "\"On ne voit bien qu'avec le cœur. L'essentiel est invisible pour les yeux.\" Sagesse intemporelle sur l'amour et la perte.",
      type: "Littérature",
      url: null,
      tags: ["littérature", "sagesse", "amour"],
    },
    {
      id: 68,
      category: "inspiration",
      title: "Sons de la nature - Forêt",
      author: "Ambiance naturelle",
      description:
        "Bruits de forêt, oiseaux, ruisseau. Pour se reconnecter au calme de la nature depuis chez soi.",
      type: "Sons",
      url: "https://www.youtube.com/watch?v=xNN7iTA57jM",
      tags: ["nature", "relaxation", "sons"],
    },
    {
      id: 69,
      category: "inspiration",
      title: "Bruit de pluie",
      author: "Ambiance naturelle",
      description:
        "Son de pluie pour dormir, méditer ou simplement se sentir apaisé. 10 heures de pluie douce.",
      type: "Sons",
      url: "https://www.youtube.com/watch?v=mPZkdNFkNps",
      tags: ["nature", "sommeil", "pluie"],
    },

    // ============================================================
    // TRANSGÉNÉRATIONNEL & ENFANT INTÉRIEUR
    // ============================================================
    {
      id: 70,
      category: "transgen",
      title: "Aïe, mes aïeux !",
      author: "Anne Ancelin Schützenberger",
      description:
        "Le livre fondateur sur la psychogénéalogie. Comment les traumatismes se transmettent de génération en génération.",
      synopsis:
        "Anne Ancelin Schützenberger montre comment nos problèmes actuels peuvent être liés à des événements vécus par nos ancêtres : deuils non faits, secrets de famille, injustices. Elle propose des outils pour identifier ces héritages invisibles et s'en libérer.",
      pourquoi_le_lire:
        "Pour comprendre les liens entre ton histoire familiale et tes blocages actuels. Essentiel si tu sens que tu 'portes' quelque chose qui ne t'appartient pas.",
      type: "Livre",
      url: null,
      tags: ["transgénérationnel", "psychogénéalogie", "famille"],
    },
    {
      id: 71,
      category: "transgen",
      title: "Ces enfants malades de leurs parents",
      author: "Anne Ancelin Schützenberger",
      description:
        "Comment les maladies et les accidents peuvent être liés à l'histoire familiale. Approche psychosomatique transgénérationnelle.",
      type: "Livre",
      url: null,
      tags: ["transgénérationnel", "psychosomatique", "famille"],
    },
    {
      id: 72,
      category: "transgen",
      title: "Retrouver l'enfant en soi",
      author: "John Bradshaw",
      description:
        "Comment guérir les blessures de l'enfance pour vivre pleinement adulte. Exercices pratiques de reparentage.",
      synopsis:
        "John Bradshaw explique comment les blessures d'enfance (abandon, rejet, humiliation, injustice, trahison) continuent d'affecter notre vie adulte. Il propose un processus de guérison pour retrouver et consoler notre enfant intérieur blessé.",
      pourquoi_le_lire:
        "Si tu sens que des réactions émotionnelles te 'dépassent', ou si tu veux comprendre pourquoi certains schémas se répètent dans ta vie.",
      type: "Livre",
      url: null,
      tags: ["enfant intérieur", "blessures", "guérison"],
    },
    {
      id: 73,
      category: "transgen",
      title: "Le syndrome du jumeau perdu",
      author: "Alfred et Bettina Austermann",
      description:
        "Sur les jumeaux perdus in utero et leur impact psychologique sur le survivant. Un sujet méconnu mais fréquent.",
      type: "Livre",
      url: null,
      tags: ["jumeau perdu", "grossesse", "deuil périnatal"],
    },

    // ============================================================
    // LÂCHER PRISE & SPIRITUALITÉ
    // ============================================================
    {
      id: 74,
      category: "spirituel",
      title: "Le pouvoir du moment présent",
      author: "Eckhart Tolle",
      description:
        "Best-seller mondial sur la présence et le lâcher prise. Comment se libérer du mental et vivre l'instant.",
      synopsis:
        "Eckhart Tolle enseigne comment sortir de l'identification au mental, source de souffrance. Il montre que le 'moment présent' est la seule réalité, et que s'y ancrer libère de l'anxiété et de la dépression.",
      pourquoi_le_lire:
        "Si tu as du mal à lâcher prise, si ton mental tourne en boucle, ou si tu veux découvrir une approche spirituelle accessible.",
      type: "Livre",
      url: null,
      tags: ["présence", "lâcher prise", "spiritualité"],
    },
    {
      id: 75,
      category: "spirituel",
      title: "Lâcher prise",
      author: "Guy Finley",
      description:
        "Comment se libérer de ce qui nous retient : peurs, colère, ressentiments. Approche pratique et spirituelle.",
      type: "Livre",
      url: null,
      tags: ["lâcher prise", "libération", "spiritualité"],
    },

    // ============================================================
    // HYPNOSE & AUTO-HYPNOSE
    // ============================================================
    {
      id: 76,
      category: "hypnose",
      title: "Ma voix t'accompagnera",
      author: "Milton Erickson",
      description:
        "Recueil de contes thérapeutiques du père de l'hypnose moderne. Histoires à lire avant de dormir.",
      type: "Livre",
      url: null,
      tags: ["hypnose", "contes", "Erickson"],
    },
    {
      id: 77,
      category: "hypnose",
      title: "L'auto-hypnose",
      author: "Kévin Finel",
      description:
        "Guide pratique d'auto-hypnose par le fondateur d'ARCHE. Techniques accessibles pour débutants.",
      type: "Livre",
      url: null,
      tags: ["auto-hypnose", "pratique", "ARCHE"],
    },

    // ============================================================
    // FÂ & TRADITIONS AFRICAINES
    // ============================================================
    {
      id: 78,
      category: "traditions",
      title: "Le Fa, une géomancie divinatoire du Golfe du Bénin",
      author: "Bernard Maupoil",
      description:
        "Référence académique sur le Fâ béninois. Étude ethnographique complète du système de divination.",
      type: "Livre académique",
      url: null,
      tags: ["Fâ", "Bénin", "divination", "ethnographie"],
    },
    {
      id: 79,
      category: "traditions",
      title: "Ifá Divination",
      author: "William Bascom",
      description:
        "Communication between Gods and Men in West Africa. Étude de l'Ifá chez les Yoruba du Nigeria.",
      type: "Livre académique (anglais)",
      url: null,
      tags: ["Ifá", "Yoruba", "Nigeria", "divination"],
    },
    {
      id: 80,
      category: "traditions",
      title: "Les Agudas",
      author: "Milton Guran",
      description:
        "Histoire des Afro-Brésiliens du Bénin et du Togo. Descendants d'esclaves revenus d'Amérique.",
      type: "Livre historique",
      url: null,
      tags: ["Aguda", "Brésil", "Bénin", "histoire"],
    },
    {
      id: 81,
      category: "traditions",
      title: "Racines",
      author: "Alex Haley",
      description:
        "Roman historique sur les origines africaines et l'esclavage. Quête identitaire d'un Afro-Américain.",
      type: "Roman",
      url: null,
      tags: ["Afrique", "esclavage", "identité", "Gambie"],
    },
  ];

  const categories = [
    { id: "all", label: "Tout" },
    { id: "inspiration", label: "Inspiration" },
    { id: "aide", label: "Aide" },
    { id: "outil", label: "Outils" },
    { id: "livre", label: "Livres" },
    { id: "transgen", label: "Transgénérationnel" },
    { id: "spirituel", label: "Spiritualité" },
    { id: "hypnose", label: "Hypnose" },
    { id: "traditions", label: "Traditions africaines" },
    { id: "article", label: "Articles" },
    { id: "podcast", label: "Podcasts" },
    { id: "video", label: "Vidéos" },
  ];

  const filteredResources =
    selectedCategory === "all"
      ? resources
      : resources.filter((r) => r.category === selectedCategory);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-background)",
        padding: "var(--space-xl)",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Header */}
        <button
          onClick={onBackToHome}
          style={{
            marginBottom: "var(--space-xl)",
            fontSize: "var(--font-size-sm)",
            color: "var(--color-primary)",
            background: "var(--color-surface-1)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            padding: "var(--space-sm) var(--space-md)",
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-xs)",
            fontWeight: "var(--font-weight-medium)",
            transition: "var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--color-primary)";
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--color-surface-1)";
            e.currentTarget.style.color = "var(--color-primary)";
          }}
        >
          ← Retour à l'accueil
        </button>

        <div
          style={{
            background:
              "linear-gradient(135deg, var(--color-accent-calm) 0%, var(--color-surface-1) 100%)",
            borderRadius: "var(--radius-xl)",
            padding: device.isMobile ? "var(--space-xl)" : "var(--space-2xl)",
            marginBottom: "var(--space-2xl)",
            textAlign: "center",
            border: "1px solid var(--color-border)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "var(--color-primary)",
              color: "white",
              fontSize: "32px",
              marginBottom: "var(--space-md)",
            }}
          >
            📚
          </div>
          <h1
            style={{
              fontSize: device.isMobile
                ? "var(--font-size-xl)"
                : "var(--font-size-3xl)",
              color: "var(--color-text-primary)",
              fontWeight: "var(--font-weight-semibold)",
              marginBottom: "var(--space-sm)",
              fontFamily: "var(--font-family-display)",
            }}
          >
            Bibliothèque de ressources externes
          </h1>
          <p
            style={{
              fontSize: "var(--font-size-base)",
              color: "var(--color-text-secondary)",
              lineHeight: "var(--line-height-relaxed)",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Livres, podcasts, articles, vidéos, applications et lignes d'écoute
            recommandés par des professionnels pour vous accompagner
          </p>
        </div>

        {/* Filtres */}
        <div
          style={{
            display: "flex",
            gap: "var(--space-sm)",
            marginBottom: "var(--space-xl)",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: "var(--space-sm) var(--space-lg)",
                borderRadius: "var(--radius-full)",
                border:
                  selectedCategory === cat.id
                    ? "2px solid var(--color-primary)"
                    : "1px solid var(--color-border)",
                background:
                  selectedCategory === cat.id
                    ? "var(--color-accent-calm)"
                    : "var(--color-surface-1)",
                color:
                  selectedCategory === cat.id
                    ? "var(--color-primary)"
                    : "var(--color-text-secondary)",
                fontSize: "var(--font-size-sm)",
                fontWeight:
                  selectedCategory === cat.id
                    ? "var(--font-weight-medium)"
                    : "normal",
                cursor: "pointer",
                transition: "var(--transition-fast)",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Liste des ressources */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "var(--space-lg)",
          }}
        >
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              style={{
                background: resource.featured
                  ? "linear-gradient(135deg, #faf8f3 0%, #f5f0e8 100%)"
                  : "var(--color-surface-1)",
                border: resource.featured
                  ? "2px solid rgba(180, 140, 80, 0.4)"
                  : "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-lg)",
                transition: "var(--transition-fast)",
                gridColumn: resource.featured ? "1 / -1" : "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "var(--space-sm)",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--font-size-xs)",
                    color: resource.featured ? "#c9a050" : "var(--color-primary)",
                    fontWeight: "var(--font-weight-medium)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {resource.type}
                </span>
              </div>

              <h3
                style={{
                  fontSize: resource.featured ? "var(--font-size-lg)" : "var(--font-size-md)",
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--color-text-primary)",
                  marginBottom: "var(--space-xs)",
                  lineHeight: "var(--line-height-tight)",
                  fontFamily: resource.featured ? "'Cormorant Garamond', Georgia, serif" : "inherit",
                }}
              >
                {resource.title}
              </h3>

              <p
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: resource.featured ? "#7a6b5a" : "var(--color-text-secondary)",
                  marginBottom: "var(--space-sm)",
                  fontStyle: "italic",
                }}
              >
                {resource.author}
              </p>

              <p
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-text-secondary)",
                  lineHeight: "var(--line-height-relaxed)",
                  marginBottom: "var(--space-md)",
                }}
              >
                {resource.description}
              </p>

              <Button
                onClick={() => {
                  if (resource.url === "petite-flamme") {
                    setShowPetiteFlamme(true);
                  } else if (resource.url) {
                    window.open(resource.url, "_blank", "noopener,noreferrer");
                  } else if (resource.synopsis) {
                    // Ouvrir la modale avec les détails du livre
                    setSelectedBook(resource);
                  } else {
                    alert(
                      `"${resource.title}" de ${resource.author}\n\nCe livre est disponible en librairie et bibliothèque.`
                    );
                  }
                }}
                variant={resource.featured ? "primary" : undefined}
                style={{
                  width: resource.featured ? "auto" : "100%",
                  fontSize: "var(--font-size-sm)",
                  padding: "var(--space-sm)",
                }}
              >
                {resource.featured ? "Lire le poème" : resource.url ? "Consulter" : "En savoir plus"}
              </Button>
            </div>
          ))}
        </div>

        {/* Modale détail livre */}
        {selectedBook && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "var(--space-lg)",
            }}
            onClick={() => setSelectedBook(null)}
          >
            <div
              style={{
                background: "var(--color-surface-1)",
                borderRadius: "var(--radius-xl)",
                padding: "var(--space-2xl)",
                maxWidth: "600px",
                maxHeight: "80vh",
                overflow: "auto",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ marginBottom: "var(--space-lg)" }}>
                <span
                  style={{
                    fontSize: "var(--font-size-xs)",
                    color: "var(--color-primary)",
                    fontWeight: "var(--font-weight-medium)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {selectedBook.type} — Conseil de lecture
                </span>
              </div>

              <h2
                style={{
                  fontSize: "var(--font-size-xl)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: "var(--color-text-primary)",
                  marginBottom: "var(--space-xs)",
                }}
              >
                {selectedBook.title}
              </h2>

              <p
                style={{
                  fontSize: "var(--font-size-md)",
                  color: "var(--color-text-secondary)",
                  fontStyle: "italic",
                  marginBottom: "var(--space-lg)",
                }}
              >
                {selectedBook.author}
              </p>

              <div
                style={{
                  background: "var(--color-accent-calm)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-lg)",
                  marginBottom: "var(--space-lg)",
                }}
              >
                <h3
                  style={{
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--font-weight-medium)",
                    color: "var(--color-primary)",
                    marginBottom: "var(--space-sm)",
                  }}
                >
                  Synopsis
                </h3>
                <p
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-text-primary)",
                    lineHeight: "var(--line-height-relaxed)",
                  }}
                >
                  {selectedBook.synopsis}
                </p>
              </div>

              {selectedBook.pourquoi_le_lire && (
                <div style={{ marginBottom: "var(--space-lg)" }}>
                  <h3
                    style={{
                      fontSize: "var(--font-size-sm)",
                      fontWeight: "var(--font-weight-medium)",
                      color: "var(--color-text-primary)",
                      marginBottom: "var(--space-sm)",
                    }}
                  >
                    Pourquoi le lire ?
                  </h3>
                  <p
                    style={{
                      fontSize: "var(--font-size-sm)",
                      color: "var(--color-text-secondary)",
                      lineHeight: "var(--line-height-relaxed)",
                      fontStyle: "italic",
                    }}
                  >
                    {selectedBook.pourquoi_le_lire}
                  </p>
                </div>
              )}

              <div
                style={{
                  background: "var(--color-surface-2)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-md)",
                  marginBottom: "var(--space-lg)",
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-text-secondary)",
                }}
              >
                Ce livre est disponible en librairie, bibliothèque municipale, ou sur les plateformes de vente en ligne.
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button onClick={() => setSelectedBook(null)}>Fermer</Button>
              </div>
            </div>
          </div>
        )}

        {filteredResources.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "var(--space-2xl)",
              color: "var(--color-text-tertiary)",
            }}
          >
            Aucune ressource dans cette catégorie pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}
