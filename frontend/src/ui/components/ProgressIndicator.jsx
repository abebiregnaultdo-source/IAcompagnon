/**
 * Indicateur de progression pour l'onboarding
 */
export default function ProgressIndicator({ current, total }) {
  return (
    <div className="progress-indicator">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`progress-step ${
            i < current ? "completed" : i === current ? "active" : ""
          }`}
        />
      ))}
    </div>
  );
}
