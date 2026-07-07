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
import { updatePassword, downloadUserData, deleteUserData, updateProfile } from "../lib/supabase";

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

  // État pour le changement de mot de passe
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // RGPD — export & suppression
  const [isExporting, setIsExporting] = useState(false);
  const [rgpdMessage, setRgpdMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // RGPD — retrait/consentement de l'amélioration anonyme (par défaut activé)
  const [improveConsent, setImproveConsent] = useState(
    user?.consent?.analytics_improvement !== false
  );

  // Retrait/octroi du consentement à l'amélioration anonyme (révocable à tout moment)
  const handleToggleImproveConsent = async (value) => {
    setImproveConsent(value);
    try {
      await updateProfile(user.id, {
        consent: { ...(user?.consent || {}), analytics_improvement: value },
      });
      if (user?.consent) user.consent.analytics_improvement = value;
      setRgpdMessage(
        value
          ? "Merci — vous contribuez à améliorer HELŌ (données anonymes)."
          : "C'est noté. Vos données ne serviront plus à l'amélioration du service."
      );
    } catch (e) {
      setImproveConsent(!value); // rollback visuel
      setRgpdMessage("La modification a échoué. Réessayez.");
    }
  };

  // RGPD Art. 15/20 — télécharger toutes ses données
  const handleExportData = async () => {
    setIsExporting(true);
    setRgpdMessage("");
    try {
      await downloadUserData(user.id, user?.first_name);
      setRgpdMessage("Vos données ont été téléchargées.");
    } catch (e) {
      setRgpdMessage("Le téléchargement a échoué. Réessayez ou contactez-nous.");
    } finally {
      setIsExporting(false);
    }
  };

  // RGPD Art. 17 — supprimer définitivement le compte
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setRgpdMessage("");
    try {
      // 1. Effacer les données côté client (RLS-safe)
      await deleteUserData(user.id);
      // 2. Demander au backend d'effacer le compte auth (service_role)
      try {
        await fetch(api.base + "/api/account/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user.id }),
        });
      } catch (e) {
        // Les données sont déjà effacées ; on déconnecte quoi qu'il arrive.
      }
      // 3. Nettoyer le localStorage et déconnecter
      try {
        Object.keys(localStorage)
          .filter((k) => k.includes(user.id) || k.startsWith("helo_"))
          .forEach((k) => localStorage.removeItem(k));
      } catch (e) {}
      onLogout && onLogout();
    } catch (e) {
      setRgpdMessage("La suppression a échoué. Réessayez ou contactez-nous.");
      setIsDeleting(false);
    }
  };

  // Charger le contact de confiance depuis localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`helo_settings_${user.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }, [user.id]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage("");

    try {
      // Sauvegarder dans localStorage
      localStorage.setItem(`helo_settings_${user.id}`, JSON.stringify(settings));
      setSaveMessage("Paramètres sauvegardés");
      onSave && onSave(settings);
    } catch (error) {
      console.error("Save error:", error);
      setSaveMessage("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordMessage("");

    if (!newPassword.trim()) {
      setPasswordMessage("Veuillez entrer un nouveau mot de passe");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage("Les mots de passe ne correspondent pas");
      return;
    }

    setIsChangingPassword(true);
    try {
      await updatePassword(newPassword);
      setPasswordMessage("Mot de passe modifié avec succès !");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordChange(false);
      setTimeout(() => setPasswordMessage(""), 3000);
    } catch (error) {
      console.error("Password change error:", error);
      setPasswordMessage("Erreur lors du changement de mot de passe");
    } finally {
      setIsChangingPassword(false);
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

          {/* Section : Sécurité */}
          <Panel className="settings-section">
            <Text as="h2" className="settings-section-title">
              Sécurité
            </Text>

            {!showPasswordChange ? (
              <Button
                onClick={() => setShowPasswordChange(true)}
                variant="secondary"
                style={{ width: "100%" }}
              >
                Changer mon mot de passe
              </Button>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-md)",
                }}
              >
                <div className="settings-field">
                  <label htmlFor="newPassword">Nouveau mot de passe</label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Au moins 6 caractères"
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
                  <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmez votre mot de passe"
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

                {passwordMessage && (
                  <div
                    style={{
                      padding: "var(--space-sm)",
                      borderRadius: "var(--radius-md)",
                      fontSize: "var(--font-size-sm)",
                      textAlign: "center",
                      background: passwordMessage.includes("succès")
                        ? "var(--color-accent-calm)"
                        : "var(--color-accent-warm)",
                      color: passwordMessage.includes("succès")
                        ? "#5B7B6B"
                        : "#8B6B6B",
                    }}
                  >
                    {passwordMessage}
                  </div>
                )}

                <div style={{ display: "flex", gap: "var(--space-md)" }}>
                  <Button
                    onClick={handlePasswordChange}
                    disabled={isChangingPassword}
                    style={{ flex: 1 }}
                  >
                    {isChangingPassword ? "Modification..." : "Confirmer"}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowPasswordChange(false);
                      setNewPassword("");
                      setConfirmPassword("");
                      setPasswordMessage("");
                    }}
                    variant="secondary"
                    style={{ flex: 1 }}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}
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

        {/* Mes données (RGPD) */}
        <Panel className="settings-section">
          <Text as="h2" className="settings-section-title">
            Mes données
          </Text>
          <p
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-secondary)",
              lineHeight: "var(--line-height-relaxed)",
              marginBottom: "var(--space-lg)",
            }}
          >
            Vos données vous appartiennent. Vous pouvez les récupérer à tout
            moment, ou supprimer définitivement votre compte.
          </p>

          {rgpdMessage && (
            <div
              style={{
                padding: "var(--space-md)",
                background: "var(--color-surface-2)",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--font-size-sm)",
                color: "var(--color-text-secondary)",
                marginBottom: "var(--space-md)",
              }}
            >
              {rgpdMessage}
            </div>
          )}

          {/* Retrait / consentement amélioration anonyme */}
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "var(--space-sm)",
              padding: "var(--space-md)",
              background: "var(--color-surface-2)",
              borderRadius: "var(--radius-md)",
              marginBottom: "var(--space-lg)",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-secondary)",
              lineHeight: "var(--line-height-relaxed)",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={improveConsent}
              onChange={(e) => handleToggleImproveConsent(e.target.checked)}
              style={{ marginTop: "3px", flexShrink: 0 }}
            />
            <span>
              Autoriser l'utilisation de <strong>statistiques anonymes</strong>{" "}
              pour améliorer HELŌ. Le contenu de vos conversations n'est jamais
              réutilisé, et vous n'êtes jamais identifié. Vous pouvez retirer cet
              accord ici à tout moment, sans rien perdre de votre accompagnement.
            </span>
          </label>

          {/* Export */}
          <Button onClick={handleExportData} disabled={isExporting}>
            {isExporting ? "Préparation…" : "Télécharger mes données"}
          </Button>

          {/* Suppression */}
          <div
            style={{
              marginTop: "var(--space-xl)",
              paddingTop: "var(--space-lg)",
              borderTop: "1px solid var(--color-border)",
            }}
          >
            {!showDeleteConfirm ? (
              <button
                onClick={() => {
                  setShowDeleteConfirm(true);
                  setDeleteConfirmText("");
                  setRgpdMessage("");
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
                Supprimer mon compte
              </button>
            ) : (
              <div>
                <p
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-text-primary)",
                    lineHeight: "var(--line-height-relaxed)",
                    marginBottom: "var(--space-md)",
                  }}
                >
                  Cette action est <strong>définitive</strong>. Toutes vos
                  conversations, rêves, écrits et votre profil seront effacés,
                  sans possibilité de récupération. Pour confirmer, écrivez{" "}
                  <strong>SUPPRIMER</strong> ci-dessous.
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="SUPPRIMER"
                  disabled={isDeleting}
                  style={{
                    width: "100%",
                    padding: "var(--space-md)",
                    border: "1.5px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    background: "var(--color-surface-1)",
                    color: "var(--color-text-primary)",
                    fontSize: "var(--font-size-base)",
                    marginBottom: "var(--space-md)",
                  }}
                />
                <div style={{ display: "flex", gap: "var(--space-md)" }}>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting || deleteConfirmText !== "SUPPRIMER"}
                    style={{
                      padding: "var(--space-sm) var(--space-lg)",
                      border: "none",
                      borderRadius: "var(--radius-md)",
                      background:
                        deleteConfirmText === "SUPPRIMER"
                          ? "#E76F51"
                          : "var(--color-surface-2)",
                      color:
                        deleteConfirmText === "SUPPRIMER"
                          ? "#fff"
                          : "var(--color-text-tertiary)",
                      fontSize: "var(--font-size-sm)",
                      cursor:
                        deleteConfirmText === "SUPPRIMER" && !isDeleting
                          ? "pointer"
                          : "not-allowed",
                      transition: "var(--transition-fast)",
                    }}
                  >
                    {isDeleting ? "Suppression…" : "Confirmer la suppression"}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    style={{
                      padding: "var(--space-sm) var(--space-lg)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      background: "transparent",
                      color: "var(--color-text-secondary)",
                      fontSize: "var(--font-size-sm)",
                      cursor: "pointer",
                    }}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </Panel>

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
