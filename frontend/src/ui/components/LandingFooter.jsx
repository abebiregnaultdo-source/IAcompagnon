/**
 * LandingFooter — pied de page complet (3 colonnes + mentions), partagé entre
 * la landing et les pages Ressources pour une expérience homogène sur tout le site.
 * S'appuie sur window.showResources (exposé par LandingPage) pour la navigation.
 */
export default function LandingFooter({ onNavigate }) {
  // Navigation robuste : onNavigate si fourni (ex. depuis Resources), sinon
  // window.showResources (exposé par LandingPage).
  const go = (page) => (onNavigate ? onNavigate(page) : window.showResources?.(page));
  return (
    <footer className="landing-footer">
      <div className="landing-container">
        <div className="landing-footer-content">
          <div className="landing-footer-section">
            <h4>À propos de Helō</h4>
            <p>
              Helō est une application d'accompagnement dans le deuil, conçue
              avec empathie et rigueur scientifique.
            </p>
          </div>
          <div className="landing-footer-section">
            <h4>Ressources</h4>
            <button onClick={() => go("how-it-works")} className="landing-footer-link">
              Comment ça marche
            </button>
            <button onClick={() => go("approaches")} className="landing-footer-link">
              Approches thérapeutiques
            </button>
            <button onClick={() => go("faq")} className="landing-footer-link">
              Questions fréquentes
            </button>
            <button onClick={() => go("security")} className="landing-footer-link">
              Confidentialité et sécurité
            </button>
          </div>
          <div className="landing-footer-section">
            <h4>Contact</h4>
            <a href="mailto:support@helo-app.com">support@helo-app.com</a>
            <button onClick={() => go("approaches")} className="landing-footer-link">
              Ressources d'urgence
            </button>
          </div>
        </div>
        <div className="landing-footer-bottom">
          <p>
            © 2025 Helō. Tous droits réservés. • Helō ne remplace pas un
            professionnel de santé mentale.
          </p>
        </div>
      </div>
    </footer>
  );
}
