import { useState } from "react";
import Logo from "./components/Logo";
import Button from "./components/Button";
import { useDeviceDetection } from "../hooks/useDeviceDetection";

/**
 * Bibliothèque de ressources externes
 * Livres, podcasts, articles et vidéos recommandés
 */
export default function Library({ onBackToHome }) {
  const device = useDeviceDetection();
  const [selectedCategory, setSelectedCategory] = useState("all");

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
  ];

  const categories = [
    { id: "all", label: "Tout" },
    { id: "inspiration", label: "Inspiration" },
    { id: "aide", label: "Aide" },
    { id: "outil", label: "Outils" },
    { id: "livre", label: "Livres" },
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
                background: "var(--color-surface-1)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-lg)",
                transition: "var(--transition-fast)",
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
                    color: "var(--color-primary)",
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
                  fontSize: "var(--font-size-md)",
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--color-text-primary)",
                  marginBottom: "var(--space-xs)",
                  lineHeight: "var(--line-height-tight)",
                }}
              >
                {resource.title}
              </h3>

              <p
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-text-secondary)",
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
                  if (resource.url) {
                    window.open(resource.url, "_blank", "noopener,noreferrer");
                  } else {
                    alert(
                      `"${resource.title}" de ${resource.author}\n\nCe livre est disponible en librairie et bibliothèque.`
                    );
                  }
                }}
                style={{
                  width: "100%",
                  fontSize: "var(--font-size-sm)",
                  padding: "var(--space-sm)",
                }}
              >
                {resource.url ? "Consulter" : "En savoir plus"}
              </Button>
            </div>
          ))}
        </div>

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
