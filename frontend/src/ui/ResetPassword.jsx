import { useState, useEffect } from "react";
import Logo from "./components/Logo";
import Icon from "./components/Icon";
import Button from "./components/Button";
import Input from "./components/Input";
import { updatePassword, supabase } from "../lib/supabase";

export default function ResetPassword({ onComplete }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Vérifier si l'utilisateur a un token de reset valide
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        // Si on a une session avec un recovery token, c'est valide
        if (session) {
          setIsValidSession(true);
        }
      } catch (e) {
        console.error("Session check error:", e);
      } finally {
        setIsChecking(false);
      }
    };

    // Écouter les événements de récupération de mot de passe
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidSession(true);
        setIsChecking(false);
      }
    });

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  const handleResetPassword = async () => {
    setError("");
    setSuccess("");

    if (!newPassword.trim()) {
      setError("Veuillez entrer un nouveau mot de passe");
      return;
    }

    if (newPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setIsLoading(true);
    try {
      await updatePassword(newPassword);
      setSuccess("Votre mot de passe a été modifié avec succès ! Connexion en cours...");

      // Attendre que Supabase mette à jour la session, puis rediriger
      // La session est déjà active après updatePassword, donc on redirige simplement
      setTimeout(() => {
        // Utiliser window.location.href pour forcer un rechargement complet
        // L'App.jsx détectera la session active et connectera l'utilisateur
        window.location.href = "/";
      }, 1500);
    } catch (err) {
      console.error("Password update error:", err);
      setError("Une erreur est survenue. Le lien a peut-être expiré. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <Logo size={40} showText={false} />
          <p style={{
            marginTop: "var(--space-xl)",
            color: "var(--color-text-secondary)",
            textAlign: "center"
          }}>
            Vérification en cours...
          </p>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <Logo size={40} showText={false} />

          <h2 style={{
            marginTop: "var(--space-xl)",
            marginBottom: "var(--space-lg)",
            fontSize: "var(--font-size-xl)",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--color-text-primary)",
            textAlign: "center"
          }}>
            Lien expiré
          </h2>

          <p style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-secondary)",
            marginBottom: "var(--space-xl)",
            lineHeight: "var(--line-height-relaxed)",
            textAlign: "center"
          }}>
            Ce lien de réinitialisation n'est plus valide ou a expiré.
            Veuillez demander un nouveau lien.
          </p>

          <Button
            onClick={() => window.location.href = "/"}
            style={{ width: "100%" }}
          >
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ marginBottom: "var(--space-xl)" }}>
          <Logo size={40} showText={false} />
        </div>

        <p style={{
          fontSize: "var(--font-size-md)",
          color: "var(--color-text-secondary)",
          marginBottom: "var(--space-2xl)",
          fontWeight: "var(--font-weight-normal)",
          letterSpacing: "0.01em",
          textAlign: "center"
        }}>
          Vous n'êtes pas seul·e
        </p>

        <div className="slide-in">
          <h2 style={{
            marginBottom: "var(--space-lg)",
            fontSize: "var(--font-size-xl)",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--color-text-primary)",
            textAlign: "center"
          }}>
            Nouveau mot de passe
          </h2>

          <p style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-secondary)",
            marginBottom: "var(--space-lg)",
            lineHeight: "var(--line-height-relaxed)",
            textAlign: "center"
          }}>
            Choisissez un nouveau mot de passe pour votre compte HELO.
          </p>

          {error && (
            <div style={{
              padding: "var(--space-md)",
              background: "var(--color-accent-warm)",
              border: "1px solid #D8A8A8",
              borderRadius: "var(--radius-md)",
              marginBottom: "var(--space-lg)",
              fontSize: "var(--font-size-sm)",
              color: "#8B6B6B",
              display: "flex",
              alignItems: "flex-start",
              gap: "var(--space-sm)",
            }}>
              <span style={{ flexShrink: 0, fontSize: "var(--font-size-md)" }}>
                ○
              </span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={{
              padding: "var(--space-md)",
              background: "var(--color-accent-calm)",
              border: "1px solid #A8C8B8",
              borderRadius: "var(--radius-md)",
              marginBottom: "var(--space-lg)",
              fontSize: "var(--font-size-sm)",
              color: "#5B7B6B",
              display: "flex",
              alignItems: "flex-start",
              gap: "var(--space-sm)",
            }}>
              <span style={{ flexShrink: 0, fontSize: "var(--font-size-md)" }}>
                ✓
              </span>
              <span>{success}</span>
            </div>
          )}

          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-md)",
          }}>
            <div style={{ position: "relative" }}>
              <Input
                label="Nouveau mot de passe"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Au moins 6 caractères"
                disabled={isLoading || success}
                aria-label="Nouveau mot de passe"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="auth-password-toggle"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                type="button"
              >
                <Icon name={showPassword ? "eye-off" : "eye"} size={19} color="#7a8088" />
              </button>
            </div>

            <div style={{ position: "relative" }}>
              <Input
                label="Confirmer le mot de passe"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmez votre mot de passe"
                disabled={isLoading || success}
                aria-label="Confirmation mot de passe"
              />
            </div>
          </div>

          <div style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "var(--space-lg)",
            marginBottom: "var(--space-md)",
          }}>
            <Button
              onClick={handleResetPassword}
              disabled={isLoading || !newPassword.trim() || success}
              style={{ width: "100%" }}
            >
              {isLoading ? "Modification en cours..." : success ? "Redirection..." : "Changer le mot de passe"}
            </Button>
          </div>

          <div style={{
            textAlign: "center",
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-secondary)",
          }}>
            <button
              onClick={() => window.location.href = "/"}
              style={{
                background: "none",
                border: "none",
                color: "var(--color-primary)",
                cursor: "pointer",
                fontWeight: "var(--font-weight-semibold)",
                textDecoration: "underline",
                fontSize: "var(--font-size-sm)",
              }}
            >
              Retour à l'accueil
            </button>
          </div>
        </div>

        <div style={{
          marginTop: "var(--space-2xl)",
          paddingTop: "var(--space-lg)",
          borderTop: "1px solid var(--color-surface-2)",
          fontSize: "var(--font-size-xs)",
          color: "var(--color-text-tertiary)",
          textAlign: "center",
          lineHeight: "var(--line-height-relaxed)",
        }}>
          <p>HELO ne remplace pas un professionnel de santé mentale.</p>
          <p style={{ marginTop: "var(--space-sm)" }}>
            Vos données sont chiffrées et restent privées.
          </p>
        </div>
      </div>
    </div>
  );
}
