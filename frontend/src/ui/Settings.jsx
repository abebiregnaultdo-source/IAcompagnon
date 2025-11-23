import { useState, useEffect } from "react";
import {
  SKIN_TONES,
  HAIR_STYLES,
  PRESENTATION_STYLES,
  ROOM_THEMES,
  loadPrefs,
} from "./avatar/controls";
import Logo from "./components/Logo";
import Button from "./components/Button";
import { useDeviceDetection } from "../hooks/useDeviceDetection";
import Text from "./components/Text";
import Panel from "./components/Panel";

/**
 * Page Paramètres Utilisateur
 *
 * Permet de configurer :
 * - Préférences thérapeutiques (ton, rythme)
 * - Contact de confiance
 * - Abonnement
 */
export default function Settings({
  user,
  api,
  onSave,
  onBackToHome,
  onOpenLegal,
  onLogout,
}) {
  const [settings, setSettings] = useState({
    // Préférences thérapeutiques
    tone: user?.tone || "neutre",
    rhythm: user?.rhythm || 2,
    // Avatar / apparence
    avatar: loadPrefs(),

    // Contact de confiance
    trustedContact: {
      name: "",
      phone: "",
      email: "",
      relationship: "",
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const device = useDeviceDetection();

  // Charger le contact de confiance au montage
  useEffect(() => {
    const loadTrustedContact = async () => {
      try {
        const response = await fetch(
          `${api.base}/api/trusted-contact/${user.id}`,
        );
        if (response.ok) {
          const data = await response.json();
          if (data.contact) {
            setSettings((prev) => ({ ...prev, trustedContact: data.contact }));
          }
        }
      } catch (error) {
        console.error("Error loading trusted contact:", error);
      }
    };
    loadTrustedContact();
  }, [user.id, api.base]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage("");

    try {
      // Sauvegarder les préférences thérapeutiques
      const prefsResponse = await fetch(api.base + "/api/prefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id_hash: user.id,
          prefs: {
            tone: settings.tone,
            rhythm: settings.rhythm,
            avatar: settings.avatar,
          },
        }),
      });

      // Sauvegarder le contact de confiance
      const contactResponse = await fetch(api.base + "/api/trusted-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          contact: settings.trustedContact,
        }),
      });

      if (prefsResponse.ok && contactResponse.ok) {
        setSaveMessage("✓ Paramètres sauvegardés");
        onSave && onSave(settings);
      } else {
        setSaveMessage("✗ Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Save error:", error);
      setSaveMessage("✗ Erreur de connexion");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  return (
    <div
      className="fade-in"
      style={{
        minHeight: "100vh",
        background: "var(--color-background)",
        padding: device.isMobile ? "var(--space-md)" : "var(--space-xl)",
      }}
    >
      <div
        style={{
          maxWidth: device.isDesktop ? "900px" : "800px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-md)",
            marginBottom: "var(--space-xl)",
            paddingBottom: "var(--space-md)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <button
            onClick={onBackToHome}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "24px",
              padding: "0",
              color: "var(--color-primary)",
            }}
            aria-label="Retour à l'accueil"
          >
            ←
          </button>
          <div>
            <Text as="h1" size="lg">
              Paramètres
            </Text>
            <Text size="sm" color="secondary">
              Personnalisez votre expérience Helō
            </Text>
          </div>
        </div>

        {/* Sections container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-xl)",
          }}
        >
          {/* Section 1 : Contact de confiance */}
          <Panel className="settings-section">
            <Text as="h2" className="settings-section-title">
              Contact de confiance
            </Text>
            <p
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--color-text-secondary)",
                marginBottom: "var(--space-lg)",
                lineHeight: "var(--line-height-relaxed)",
              }}
            >
              Désignez une personne de confiance qui pourra être contactée en
              cas de besoin. Ces informations restent strictement
              confidentielles.
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-md)",
              }}
            >
              <div className="settings-field">
                <label htmlFor="contactName">Nom et prénom</label>
                <input
                  id="contactName"
                  type="text"
                  value={settings.trustedContact.name}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      trustedContact: {
                        ...settings.trustedContact,
                        name: e.target.value,
                      },
                    })
                  }
                  placeholder="Ex: Marie Dupont"
                  style={{
                    width: "100%",
                    padding: "var(--space-sm)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "var(--font-size-sm)",
                    background: "var(--color-surface-1)",
                  }}
                />
              </div>

              <div className="settings-field">
                <label htmlFor="contactPhone">Téléphone</label>
                <input
                  id="contactPhone"
                  type="tel"
                  value={settings.trustedContact.phone}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      trustedContact: {
                        ...settings.trustedContact,
                        phone: e.target.value,
                      },
                    })
                  }
                  placeholder="Ex: 06 12 34 56 78"
                  style={{
                    width: "100%",
                    padding: "var(--space-sm)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "var(--font-size-sm)",
                    background: "var(--color-surface-1)",
                  }}
                />
              </div>

              <div className="settings-field">
                <label htmlFor="contactEmail">Email (optionnel)</label>
                <input
                  id="contactEmail"
                  type="email"
                  value={settings.trustedContact.email}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      trustedContact: {
                        ...settings.trustedContact,
                        email: e.target.value,
                      },
                    })
                  }
                  placeholder="Ex: marie.dupont@email.com"
                  style={{
                    width: "100%",
                    padding: "var(--space-sm)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "var(--font-size-sm)",
                    background: "var(--color-surface-1)",
                  }}
                />
              </div>

              <div className="settings-field">
                <label htmlFor="contactRelationship">Lien avec vous</label>
                <input
                  id="contactRelationship"
                  type="text"
                  value={settings.trustedContact.relationship}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      trustedContact: {
                        ...settings.trustedContact,
                        relationship: e.target.value,
                      },
                    })
                  }
                  placeholder="Ex: Ami·e, Famille, Conjoint·e"
                  style={{
                    width: "100%",
                    padding: "var(--space-sm)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "var(--font-size-sm)",
                    background: "var(--color-surface-1)",
                  }}
                />
              </div>
            </div>
          </Panel>

          {/* Section : Personnalisation de l'avatar */}
          <Panel className="settings-section">
            <Text as="h2" className="settings-section-title">
              Personnalisation de l'avatar
            </Text>

            <div className="settings-field">
              <label htmlFor="presentation">Présentation</label>
              <select
                id="presentation"
                value={settings.avatar.presentation}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    avatar: { ...s.avatar, presentation: e.target.value },
                  }))
                }
                className="settings-select"
              >
                {PRESENTATION_STYLES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="settings-field">
              <label htmlFor="skinTone">Teint</label>
              <select
                id="skinTone"
                value={settings.avatar.skinTone}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    avatar: { ...s.avatar, skinTone: e.target.value },
                  }))
                }
                className="settings-select"
              >
                {SKIN_TONES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="settings-field">
              <label htmlFor="hairStyle">Cheveux</label>
              <select
                id="hairStyle"
                value={settings.avatar.hairStyle}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    avatar: { ...s.avatar, hairStyle: e.target.value },
                  }))
                }
                className="settings-select"
              >
                {HAIR_STYLES.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="settings-field">
              <label htmlFor="roomTheme">Ambiance</label>
              <select
                id="roomTheme"
                value={settings.avatar.roomTheme}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    avatar: { ...s.avatar, roomTheme: e.target.value },
                  }))
                }
                className="settings-select"
              >
                {ROOM_THEMES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </Panel>

          {/* Section 2 : Préférences thérapeutiques */}
          <Panel className="settings-section">
            <Text as="h2" className="settings-section-title">
              Préférences thérapeutiques
            </Text>

            <div className="settings-field">
              <label htmlFor="tone">Ton de l'accompagnement</label>
              <select
                id="tone"
                value={settings.tone}
                onChange={(e) =>
                  setSettings({ ...settings, tone: e.target.value })
                }
                className="settings-select"
              >
                <option value="lent">Lent (doux, phrases courtes)</option>
                <option value="neutre">Neutre (simple, non-directif)</option>
                <option value="enveloppant">
                  Enveloppant (contenant, rassurant)
                </option>
              </select>
            </div>

            <div className="settings-field">
              <label htmlFor="rhythm">Rythme des échanges</label>
              <input
                id="rhythm"
                type="range"
                min="1"
                max="3"
                step="1"
                value={settings.rhythm}
                onChange={(e) =>
                  setSettings({ ...settings, rhythm: parseInt(e.target.value) })
                }
                className="settings-range"
              />
              <div className="settings-range-labels">
                <span>Lent</span>
                <span>
                  {settings.rhythm === 1
                    ? "Lent"
                    : settings.rhythm === 2
                      ? "Modéré"
                      : "Rapide"}
                </span>
                <span>Rapide</span>
              </div>
            </div>
          </Panel>

          {/* Section 4 : Gestion de l'abonnement */}
          <Panel className="settings-section">
            <Text as="h2" className="settings-section-title">
              Mon abonnement
            </Text>

            <div
              style={{
                padding: "var(--space-lg)",
                background: "var(--color-surface-2)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "var(--space-md)",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "var(--font-size-md)",
                      fontWeight: "var(--font-weight-semibold)",
                      color: "var(--color-text-primary)",
                      marginBottom: "var(--space-xs)",
                    }}
                  >
                    Offre actuelle :{" "}
                    <span style={{ color: "var(--color-primary)" }}>
                      Gratuit
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "var(--font-size-sm)",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    Accès aux fonctionnalités de base
                  </div>
                </div>
              </div>

              <Button
                onClick={() => {
                  // TODO: Ouvrir la page Pricing
                  window.location.href = "/?pricing=true";
                }}
                style={{
                  width: "100%",
                  background: "var(--color-primary)",
                  color: "white",
                }}
              >
                Découvrir l'accompagnement complet
              </Button>

              <div
                style={{
                  marginTop: "var(--space-lg)",
                  paddingTop: "var(--space-lg)",
                  borderTop: "1px solid var(--color-border)",
                  fontSize: "var(--font-size-xs)",
                  color: "var(--color-text-tertiary)",
                  textAlign: "center",
                }}
              >
                <p>
                  Pour gérer votre abonnement ou résilier, contactez-nous à{" "}
                  <a
                    href="mailto:support@helo-app.com"
                    style={{
                      color: "var(--color-primary)",
                      textDecoration: "underline",
                    }}
                  >
                    support@helo-app.com
                  </a>
                </p>
                <p style={{ marginTop: "var(--space-sm)" }}>
                  Résiliation facile • Pas de frais cachés • Pas d'engagement
                </p>
              </div>
            </div>
          </Panel>
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: "var(--space-md)",
            justifyContent: "center",
            marginTop: "var(--space-2xl)",
          }}
        >
          <Button
            onClick={handleSave}
            disabled={isSaving}
            style={{ minWidth: "200px" }}
          >
            {isSaving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>

        {saveMessage && (
          <div
            style={{
              textAlign: "center",
              marginTop: "var(--space-md)",
              color: saveMessage.startsWith("✓")
                ? "var(--color-success)"
                : "var(--color-error)",
              fontSize: "var(--font-size-md)",
              fontWeight: "var(--font-weight-medium)",
            }}
          >
            {saveMessage}
          </div>
        )}

        {/* Bouton de déconnexion */}
        <div
          style={{
            marginTop: "var(--space-2xl)",
            paddingTop: "var(--space-xl)",
            borderTop: "1px solid var(--color-border)",
            textAlign: "center",
          }}
        >
          <button
            onClick={() => {
              if (
                window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")
              ) {
                onLogout && onLogout();
              }
            }}
            style={{
              padding: "var(--space-sm) var(--space-lg)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              background: "transparent",
              color: "var(--color-text-tertiary)",
              fontSize: "var(--font-size-sm)",
              cursor: "pointer",
              transition: "var(--transition-fast)",
              marginBottom: "var(--space-xl)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#E76F51";
              e.currentTarget.style.color = "#E76F51";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--color-border)";
              e.currentTarget.style.color = "var(--color-text-tertiary)";
            }}
          >
            Se déconnecter
          </button>
        </div>

        {/* Liens légaux */}
        <div
          style={{
            marginTop: "var(--space-lg)",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--color-text-tertiary)",
              marginBottom: "var(--space-md)",
            }}
          >
            Informations légales
          </p>
          <div
            style={{
              display: "flex",
              gap: "var(--space-lg)",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => onOpenLegal && onOpenLegal("cgv")}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--color-primary)",
                fontSize: "var(--font-size-xs)",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              CGV
            </button>
            <button
              onClick={() => onOpenLegal && onOpenLegal("mentions")}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--color-primary)",
                fontSize: "var(--font-size-xs)",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Mentions légales
            </button>
            <button
              onClick={() => onOpenLegal && onOpenLegal("confidentialite")}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--color-primary)",
                fontSize: "var(--font-size-xs)",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Confidentialité
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
