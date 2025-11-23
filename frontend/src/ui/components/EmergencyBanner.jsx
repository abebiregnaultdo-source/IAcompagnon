/**
 * Banner d'urgence - TOUJOURS visible en haut de chaque écran
 * Inspiré du design de l'exemple avec banner persistant
 */
export default function EmergencyBanner({
  variant = "full", // 'full' ou 'compact'
  className = "",
}) {
  return (
    <div
      className={`emergency-banner ${variant} ${className}`.trim()}
      role="banner"
      aria-label="Banner d'urgence"
    >
      <div className="emergency-banner-content">
        <div className="emergency-banner-left">
          <span className="emergency-banner-icon">⚠️</span>
          <span className="emergency-banner-text">
            {variant === "full"
              ? "Besoin d'aide immédiate ?"
              : "Aide immédiate"}
          </span>
        </div>
        <a
          href="tel:3114"
          className="emergency-banner-button"
          aria-label="Appeler le 3114 - Ligne nationale de prévention du suicide"
        >
          📞 3114
        </a>
      </div>
      {variant === "full" && (
        <p className="emergency-banner-description">
          Ligne nationale de prévention du suicide (gratuit, 24/7)
        </p>
      )}
    </div>
  );
}
