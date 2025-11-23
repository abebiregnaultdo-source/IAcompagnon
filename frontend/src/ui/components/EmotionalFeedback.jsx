/**
 * Feedback visuel subtil selon l'état émotionnel
 * Change subtilement l'ambiance visuelle sans être intrusif
 */
export default function EmotionalFeedback({ state = "calm", children }) {
  const getBackgroundGradient = () => {
    switch (state) {
      case "distress":
        return "linear-gradient(135deg, #F5EFE6 0%, #E8EFF2 100%)";
      case "hope":
        return "linear-gradient(135deg, #F2F6F7 0%, #E8F4E8 100%)";
      case "calm":
      default:
        return "linear-gradient(135deg, #F2F6F7 0%, #F9F5F0 100%)";
    }
  };

  return (
    <div
      style={{
        background: getBackgroundGradient(),
        transition: "background var(--transition-slow)",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      {/* Overlay subtil pour ambiance */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          opacity: 0.03,
          background:
            state === "distress"
              ? "radial-gradient(circle at 50% 50%, #E0CDB8 0%, transparent 70%)"
              : state === "hope"
                ? "radial-gradient(circle at 50% 50%, #C8DCC8 0%, transparent 70%)"
                : "radial-gradient(circle at 50% 50%, #C5D9E3 0%, transparent 70%)",
          transition: "all var(--transition-slow)",
        }}
      />

      {children}
    </div>
  );
}
