/**
 * Boutons de feedback pour les messages
 */
export default function FeedbackButtons({ onFeedback, disabled = false }) {
  return (
    <div
      className="feedback-buttons"
      role="group"
      aria-label="Évaluation de la réponse"
    >
      <button
        className="feedback-btn"
        onClick={() => onFeedback(1)}
        disabled={disabled}
        aria-label="Cette réponse m'aide"
      >
        Ça m'aide 👍
      </button>
      <button
        className="feedback-btn"
        onClick={() => onFeedback(-1)}
        disabled={disabled}
        aria-label="Cette réponse ne m'aide pas vraiment"
      >
        Pas vraiment 👎
      </button>
    </div>
  );
}
