import { useState } from "react";
import CrisisProtocol from "./CrisisProtocol";
import Button from "./components/Button";
import Logo from "./components/Logo";

/**
 * Page de démonstration du protocole de crise
 * Permet de visualiser l'interface d'urgence
 */
export default function CrisisDemo() {
  const [showCrisis, setShowCrisis] = useState(false);
  const [callLog, setCallLog] = useState([]);

  const handleEmergencyCall = (type, number) => {
    const timestamp = new Date().toLocaleTimeString("fr-FR");
    setCallLog((prev) => [...prev, { type, number, timestamp }]);
  };

  return (
    <div className="container">
      <div className="crisis-demo-header">
        <Logo size={40} showText={true} />
        <h1 className="crisis-demo-title">
          Démonstration - Protocole de Crise
        </h1>
      </div>

      <div className="card">
        <div className="crisis-demo-content">
          <div className="crisis-demo-info">
            <div style={{ fontSize: "32px", color: "var(--color-primary)" }}>
              ⚠️
            </div>
            <h2>Protocole d'Urgence</h2>
            <p>Ce protocole s'active automatiquement quand :</p>
            <ul className="crisis-demo-list">
              <li>
                Le score de détresse atteint <strong>75/100 ou plus</strong>
              </li>
              <li>
                L'utilisateur clique sur le <strong>bouton d'urgence</strong>
              </li>
            </ul>
            <p>Il combine deux approches :</p>
            <ol className="crisis-demo-list">
              <li>
                <strong>Aide humaine immédiate</strong> - Boutons d'appel
                directs toujours visibles
              </li>
              <li>
                <strong>Stabilisation</strong> - Techniques de grounding pour
                s'ancrer
              </li>
            </ol>
          </div>

          <div className="crisis-demo-actions">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setShowCrisis(true)}
            >
              Voir le protocole de crise
            </Button>
          </div>

          {callLog.length > 0 && (
            <div className="crisis-demo-log">
              <h3>Journal des appels simulés</h3>
              <ul>
                {callLog.map((log, i) => (
                  <li key={i}>
                    <strong>{log.timestamp}</strong> - Tentative d'appel :{" "}
                    {log.type}
                    {log.number && ` (${log.number})`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="crisis-demo-note">
            <p>
              <strong>Note :</strong> Cette démonstration montre l'interface
              telle qu'elle apparaîtrait à un utilisateur en détresse. Les
              boutons d'appel sont fonctionnels et tenteront d'ouvrir le dialer
              du téléphone avec le numéro approprié.
            </p>
          </div>
        </div>
      </div>

      {showCrisis && (
        <CrisisProtocol
          userName="Sophie"
          onClose={() => setShowCrisis(false)}
          onEmergencyCall={handleEmergencyCall}
        />
      )}
    </div>
  );
}
