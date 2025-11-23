import { useState } from "react";
import EmergencyBanner from "./components/EmergencyBanner";
import EmergencyButton from "./components/EmergencyButton";
import GroundingExercise from "./components/GroundingExercise";
import Button from "./components/Button";

/**
 * Protocole de crise - Affichage d'urgence
 * Double action : stabilisation + accès aide humaine
 *
 * Déclenché quand : detresse >= 75 OU bouton urgence cliqué
 * Design révisé : banner d'urgence toujours visible + respiration en premier
 */
export default function CrisisProtocol({
  userName = "ami",
  onClose,
  onEmergencyCall,
}) {
  const [selectedExercise, setSelectedExercise] = useState("respiration");
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const handleEmergencyCall = (type, number) => {
    if (onEmergencyCall) {
      onEmergencyCall(type, number);
    }
    // En production, cela ouvrirait le dialer du téléphone
    window.location.href = `tel:${number}`;
  };

  const handleClose = () => {
    if (showExitConfirm) {
      onClose?.();
    } else {
      setShowExitConfirm(true);
    }
  };

  return (
    <div
      className="crisis-overlay"
      role="dialog"
      aria-labelledby="crisis-title"
      aria-modal="true"
    >
      <div className="crisis-container">
        {/* Banner d'urgence TOUJOURS visible en haut */}
        <EmergencyBanner variant="full" />

        {/* Header simplifié */}
        <div className="crisis-header">
          <h1 id="crisis-title" className="crisis-title">
            Protocole de soutien immédiat
          </h1>
          <button
            className="crisis-close"
            onClick={handleClose}
            aria-label="Fermer le protocole d'urgence"
          >
            <span style={{ fontSize: "24px" }}>×</span>
          </button>
        </div>

        {/* Message de soutien */}
        <div className="crisis-message">
          <p>{userName}, je suis là avec toi. Tu n'es pas seul·e.</p>
          <p>Prends un moment pour respirer et te stabiliser.</p>
        </div>

        {/* Section 1: Respiration EN PREMIER (comme dans l'exemple) */}
        <section
          className="crisis-section"
          aria-labelledby="stabilization-title"
        >
          <h2 id="stabilization-title" className="crisis-section-title">
            Stabilisation immédiate
          </h2>
          <p className="crisis-section-subtitle">
            Commencez par la respiration, puis explorez d'autres exercices :
          </p>

          {/* Sélecteur d'exercice */}
          <div className="exercise-selector" role="tablist">
            <button
              role="tab"
              aria-selected={selectedExercise === "respiration"}
              className={`exercise-tab ${selectedExercise === "respiration" ? "active" : ""}`}
              onClick={() => setSelectedExercise("respiration")}
            >
              Respiration
            </button>
            <button
              role="tab"
              aria-selected={selectedExercise === "grounding_5_4_3_2_1"}
              className={`exercise-tab ${selectedExercise === "grounding_5_4_3_2_1" ? "active" : ""}`}
              onClick={() => setSelectedExercise("grounding_5_4_3_2_1")}
            >
              5-4-3-2-1
            </button>
            <button
              role="tab"
              aria-selected={selectedExercise === "ancrage_corporel"}
              className={`exercise-tab ${selectedExercise === "ancrage_corporel" ? "active" : ""}`}
              onClick={() => setSelectedExercise("ancrage_corporel")}
            >
              Ancrage corporel
            </button>
          </div>

          {/* Exercice actif */}
          <div role="tabpanel">
            <GroundingExercise type={selectedExercise} userName={userName} />
          </div>
        </section>

        {/* Section 2: Message d'urgence clair */}
        <section
          className="crisis-section crisis-urgent-message"
          aria-labelledby="urgent-message-title"
        >
          <div className="crisis-urgent-alert">
            <h2 id="urgent-message-title" className="crisis-urgent-title">
              ⚠️ Vous êtes en situation d'urgence
            </h2>
            <p className="crisis-urgent-text">
              Il est <strong>fortement recommandé</strong> d'appeler un numéro
              d'urgence maintenant.
            </p>
            <p className="crisis-urgent-subtext">
              Vous n'êtes pas seul·e. Des professionnels sont disponibles 24h/24
              pour vous écouter.
            </p>
          </div>
        </section>

        {/* Section 3: Boutons d'urgence EN BAS (fixes sur mobile) */}
        <section
          className="crisis-section crisis-emergency-section"
          aria-labelledby="emergency-contacts-title"
        >
          <h2 id="emergency-contacts-title" className="crisis-section-title">
            Appelez maintenant
          </h2>
          <p className="crisis-section-subtitle">
            Cliquez sur un numéro pour appeler directement :
          </p>
          <div className="emergency-buttons-grid">
            <EmergencyButton
              type="3114"
              label="Prévention du Suicide"
              number="3114"
              description="Gratuit, 24h/24, 7j/7"
              onClick={() => handleEmergencyCall("3114", "3114")}
            />
            <EmergencyButton
              type="samu"
              label="SAMU"
              number="15"
              description="Urgence médicale"
              onClick={() => handleEmergencyCall("samu", "15")}
            />
            <EmergencyButton
              type="urgence"
              label="Contact d'urgence personnel"
              number="Configurer"
              description="Ton contact de confiance"
              onClick={() => handleEmergencyCall("urgence", "")}
            />
          </div>
        </section>

        {/* Confirmation de sortie */}
        {showExitConfirm && (
          <div className="crisis-exit-confirm">
            <p>Es-tu sûr·e de vouloir fermer ce protocole ?</p>
            <div className="crisis-exit-actions">
              <Button
                variant="secondary"
                onClick={() => setShowExitConfirm(false)}
              >
                Rester ici
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Oui, fermer
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
