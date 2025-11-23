import { useState, useEffect } from "react";

/**
 * Exercice de grounding pour stabilisation immédiate
 * Affiche des instructions de respiration et d'ancrage
 * Animation de respiration avec cercles concentriques inspirée de l'exemple
 */
export default function GroundingExercise({
  type = "respiration",
  userName = "",
}) {
  const [breathPhase, setBreathPhase] = useState("inhale"); // inhale, hold, exhale

  useEffect(() => {
    if (type !== "respiration") return;

    const interval = setInterval(() => {
      setBreathPhase((prev) => {
        if (prev === "inhale") return "hold";
        if (prev === "hold") return "exhale";
        return "inhale";
      });
    }, 3000); // 3 secondes par phase

    return () => clearInterval(interval);
  }, [type]);

  const exercises = {
    respiration: {
      title: "Respiration guidée",
      content: (
        <div className="grounding-breathing">
          {/* Cercles concentriques animés */}
          <div className="breathing-circles">
            {/* Cercle extérieur */}
            <div
              className={`breathing-circle breathing-circle-outer ${
                breathPhase === "inhale"
                  ? "scale-100 opacity-30"
                  : breathPhase === "hold"
                    ? "scale-100 opacity-30"
                    : "scale-75 opacity-20"
              }`}
            />
            {/* Cercle moyen */}
            <div
              className={`breathing-circle breathing-circle-middle ${
                breathPhase === "inhale"
                  ? "scale-100 opacity-40"
                  : breathPhase === "hold"
                    ? "scale-100 opacity-40"
                    : "scale-75 opacity-30"
              }`}
            />
            {/* Cercle intérieur avec texte */}
            <div
              className={`breathing-circle breathing-circle-inner ${
                breathPhase === "inhale"
                  ? "scale-110 opacity-60"
                  : breathPhase === "hold"
                    ? "scale-110 opacity-60"
                    : "scale-90 opacity-40"
              }`}
            >
              <span className="breathing-instruction-text">
                {breathPhase === "inhale"
                  ? "Inspirez"
                  : breathPhase === "hold"
                    ? "Tenez"
                    : "Expirez"}
              </span>
            </div>
          </div>

          <p className="breathing-message">
            Prenez un moment pour respirer.
            <br />
            Juste ici, maintenant.
          </p>
        </div>
      ),
    },
    grounding_5_4_3_2_1: {
      title: "Technique 5-4-3-2-1",
      content: (
        <div className="grounding-steps">
          <p className="grounding-intro">
            {userName}, ancrons-nous ici et maintenant :
          </p>
          <ul className="grounding-list">
            <li>
              <strong>5 choses</strong> que tu vois autour de toi
            </li>
            <li>
              <strong>4 choses</strong> que tu peux toucher
            </li>
            <li>
              <strong>3 sons</strong> que tu entends
            </li>
            <li>
              <strong>2 odeurs</strong> que tu sens
            </li>
            <li>
              <strong>1 goût</strong> dans ta bouche
            </li>
          </ul>
          <p className="grounding-note">
            Prends tout ton temps. Nomme-les doucement.
          </p>
        </div>
      ),
    },
    ancrage_corporel: {
      title: "Ancrage corporel urgent",
      content: (
        <div className="grounding-steps">
          <p className="grounding-intro">Pose ton attention sur ton corps :</p>
          <ul className="grounding-list">
            <li>
              Sens tes <strong>pieds</strong> sur le sol
            </li>
            <li>
              Sens ton <strong>dos</strong> contre le siège
            </li>
            <li>
              Sens tes <strong>mains</strong> posées
            </li>
            <li>
              Respire <strong>naturellement</strong>
            </li>
          </ul>
          <p className="grounding-note">Rien à changer. Juste sentir.</p>
        </div>
      ),
    },
  };

  const exercise = exercises[type] || exercises.respiration;

  return (
    <div className="grounding-exercise">
      <h3 className="grounding-title">{exercise.title}</h3>
      {exercise.content}
    </div>
  );
}
