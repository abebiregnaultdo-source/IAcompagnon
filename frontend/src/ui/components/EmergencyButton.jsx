/**
 * Bouton d'urgence avec icône et numéro de téléphone
 * Utilisé dans le protocole de crise
 */
export default function EmergencyButton({
  type = "3114",
  label,
  number,
  description,
  onClick,
  className = "",
}) {
  const icons = {
    3114: "📞",
    samu: "🏥",
    urgence: "⚠️",
    psy: "💙",
  };

  const icon = icons[type] || "📞";

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <a
      href={
        number && number !== "Configurer" && number !== "Trouver"
          ? `tel:${number}`
          : "#"
      }
      className={`emergency-btn ${className}`.trim()}
      onClick={(e) => {
        if (number === "Configurer" || number === "Trouver") {
          e.preventDefault();
        }
        handleClick();
      }}
      aria-label={`Appeler ${label} au ${number}`}
    >
      <div className="emergency-btn-icon">
        <span style={{ fontSize: "28px" }}>{icon}</span>
      </div>
      <div className="emergency-btn-content">
        <div className="emergency-btn-label">{label}</div>
        <div className="emergency-btn-number">
          {number && number !== "Configurer" && number !== "Trouver" ? (
            <>📞 {number}</>
          ) : (
            number
          )}
        </div>
        {description && (
          <div className="emergency-btn-description">{description}</div>
        )}
      </div>
    </a>
  );
}
