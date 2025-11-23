/**
 * État de chargement apaisant
 */
export default function LoadingState({ message = "Un instant..." }) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <div className="loading-spinner" aria-hidden="true"></div>
      <div className="loading-text">{message}</div>
    </div>
  );
}
