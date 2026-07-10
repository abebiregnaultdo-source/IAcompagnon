import Logo from "./components/Logo";
import Resources from "./Resources";
import HeloDemo from "./components/HeloDemo";
import Icon from "./components/Icon";
import LandingFooter from "./components/LandingFooter";
import "../styles/helo-demo.css";
import { useState } from "react";

export default function LandingPage({ onGetStarted }) {
  const [showResources, setShowResources] = useState(false);
  const [resourcesPage, setResourcesPage] = useState("home");

  // Exposer la fonction pour le footer
  if (typeof window !== "undefined") {
    window.showResources = (page = "home") => {
      setResourcesPage(page);
      setShowResources(true);
    };
  }

  if (showResources) {
    return (
      <Resources
        onBack={() => setShowResources(false)}
        initialPage={resourcesPage}
        onGetStarted={onGetStarted}
      />
    );
  }
  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-container">
          <div className="landing-header-content">
            <div className="landing-logo-wrapper">
              <Logo
                size={44}
                showText={true}
                tagline="Vous n'êtes pas seul·e"
              />
            </div>
            <div className="landing-header-actions">
              <button onClick={() => onGetStarted("login")} className="landing-btn-text">
                Se connecter
              </button>
              <button
                onClick={() => onGetStarted("register")}
                className="landing-btn landing-btn-primary"
              >
                Créer un compte
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-container">
          <h1>La perte transforme tout.</h1>
          <p className="landing-hero-subtitle"><span style={{ fontFamily: "'Inter', sans-serif" }}>Helō</span> est là, avec vous.</p>
          <p className="landing-hero-description">
            Un espace doux et sécurisant pour vivre votre deuil, à votre rythme.
          </p>
          <div className="landing-cta-buttons">
            <button
              onClick={() => onGetStarted("register")}
              className="landing-btn landing-btn-primary"
            >
              Commencer maintenant
            </button>
            <button
              onClick={() => window.showResources?.("how-it-works")}
              className="landing-btn landing-btn-secondary"
            >
              Comment ça marche ?
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features">
        <div className="landing-container">
          <h2 className="landing-section-title">
            Un accompagnement
            <br />
            qui respecte votre chemin
          </h2>
          <div className="landing-features-grid">
            <div className="landing-feature">
              <div className="landing-feature-icon"><Icon name="shield" size={30} /></div>
              <h3>Un espace sûr, sans jugement</h3>
              <p>
                Ici, tous vos ressentis sont valides. Tristesse, colère,
                culpabilité, soulagement... tout a sa place.
              </p>
            </div>
            <div className="landing-feature">
              <div className="landing-feature-icon"><Icon name="checklist" size={30} /></div>
              <h3>Des outils concrets pour avancer</h3>
              <p>
                Journal guidé, exercices d'apaisement, repères pour comprendre
                ce que vous vivez. Inspiré des approches thérapeutiques
                reconnues.
              </p>
            </div>
            <div className="landing-feature">
              <div className="landing-feature-icon"><Icon name="waves" size={30} /></div>
              <h3>À votre rythme, vraiment</h3>
              <p>
                Pas de pression, pas d'objectifs imposés. Vous avancez quand
                vous êtes prêt·e, comme vous en avez besoin.
              </p>
            </div>
            <div className="landing-feature">
              <div className="landing-feature-icon"><Icon name="hands" size={30} /></div>
              <h3>Une présence constante</h3>
              <p>
                Helō est disponible 24/7, quand la nuit est trop longue, quand
                personne ne peut comprendre, quand vous en avez simplement
                besoin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="landing-how-it-works" id="how">
        <div className="landing-container">
          <h2 className="landing-section-title">
            Simple, confidentiel,
            <br />à portée de main
          </h2>
          <div className="landing-steps">
            <div className="landing-step">
              <div className="landing-step-number">1</div>
              <h3>Vous arrivez comme vous êtes</h3>
              <p>
                Pas besoin d'expliquer, pas besoin de vous justifier. Commencez
                par là où vous en êtes aujourd'hui.
              </p>
            </div>
            <div className="landing-step">
              <div className="landing-step-number">2</div>
              <h3>Vous explorez à votre rythme</h3>
              <p>
                Journal libre, exercices guidés, moments de réflexion. Vous
                choisissez ce qui vous parle.
              </p>
            </div>
            <div className="landing-step">
              <div className="landing-step-number">3</div>
              <h3>Vous retrouvez peu à peu des repères</h3>
              <p>
                Helō vous aide à comprendre ce qui se passe, à identifier vos
                ressources, à avancer sans vous perdre.
              </p>
            </div>
          </div>

          {/* Démonstration animée : helō en action */}
          <div style={{ marginTop: "48px" }}>
            <HeloDemo />
          </div>
        </div>
      </section>

      {/* Why Different */}
      <section className="landing-why-different">
        <div className="landing-container">
          <h2 className="landing-section-title">
            Conçu avec et pour
            <br />
            les personnes en deuil
          </h2>
          <div className="landing-why-grid">
            <div className="landing-why-item">
              <h3>Une présence authentique</h3>
              <p>
                Helō ne prétend pas être ce qu'il n'est pas : c'est un outil
                d'accompagnement, pas un thérapeute. Mais il est là, vraiment,
                quand vous en avez besoin.
              </p>
            </div>
            <div className="landing-why-item">
              <h3>Basé sur la science du deuil</h3>
              <p>
                Nos approches s'appuient sur les recherches en psychologie du
                deuil et les thérapies validées scientifiquement (TCC, ACT,
                thérapie narrative).
              </p>
            </div>
            <div className="landing-why-item">
              <h3>Respectueux de votre vulnérabilité</h3>
              <p>
                Design apaisant, ton chaleureux, rythme respecté. Chaque détail
                protège votre bien-être émotionnel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="landing-final-cta">
        <div className="landing-container">
          <h2>Vous n'avez pas à traverser ça seul·e</h2>
          <p>
            Helō est là, prêt à vous accueillir comme vous êtes.
            <br />
            Pour les nuits difficiles. Pour les questions sans réponse.
            <br />
            Pour avancer à votre rythme.
          </p>
          <button
            onClick={() => onGetStarted("register")}
            className="landing-btn landing-btn-primary"
          >
            Commencer maintenant
          </button>
          <p className="landing-reassurance">
            Gratuit pour commencer • Vos données restent privées • Disponible
            24/7
          </p>
        </div>
      </section>

      {/* Footer (composant partagé avec les pages Ressources) */}
      <LandingFooter />
    </div>
  );
}
