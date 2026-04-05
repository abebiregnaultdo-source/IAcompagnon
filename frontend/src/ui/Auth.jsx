import { useState } from "react";
import Logo from "./components/Logo";
import Button from "./components/Button";
import Input from "./components/Input";
import { signIn, signUp, resetPasswordForEmail, getProfile } from "../lib/supabase";

export default function Auth({ onAuthenticated }) {
  const [mode, setMode] = useState("login"); // 'login', 'register' ou 'forgot'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleForgotPassword = async () => {
    setError("");
    setSuccess("");
    if (!email.trim()) {
      setError("Veuillez entrer votre adresse email");
      return;
    }
    if (!validateEmail(email)) {
      setError("Email invalide");
      return;
    }

    setIsLoading(true);
    try {
      await resetPasswordForEmail(email);
      // Message clair : on envoie un mail si l'adresse existe
      setSuccess("Si cette adresse email est associée à un compte HELO, vous recevrez un lien de réinitialisation.");
    } catch (err) {
      // Même message pour des raisons de sécurité (ne pas révéler si l'email existe)
      setSuccess("Si cette adresse email est associée à un compte HELO, vous recevrez un lien de réinitialisation.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Email et mot de passe requis");
      return;
    }
    if (!validateEmail(email)) {
      setError("Email invalide");
      return;
    }

    setIsLoading(true);
    try {
      const { user, session } = await signIn(email, password);
      if (!user) {
        setError("Email ou mot de passe incorrect");
        setIsLoading(false);
        return;
      }

      // Récupérer le profil depuis Supabase
      const profile = await getProfile(user.id);
      const userData = {
        id: user.id,
        email: user.email,
        first_name: profile?.first_name || user.user_metadata?.first_name || '',
        onboarding_completed: profile?.onboarding_completed === true
          || localStorage.getItem(`helo_onboarding_${user.id}`) === "true",
        preferences: profile?.preferences || {},
        ...profile,
      };

      onAuthenticated(userData);
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message === "Invalid login credentials"
        ? "Email ou mot de passe incorrect"
        : "Erreur lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setError("");
    if (!email.trim() || !password.trim() || !firstName.trim()) {
      setError("Tous les champs sont requis");
      return;
    }
    if (!validateEmail(email)) {
      setError("Email invalide");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setIsLoading(true);
    try {
      const data = await signUp(email, password, firstName);
      const user = data.user;

      if (!user) {
        setError("Erreur lors de la création du compte");
        setIsLoading(false);
        return;
      }

      // Si session disponible (autoconfirm activé), connecter directement
      if (data.session) {
        const profile = await getProfile(user.id);
        const userData = {
          id: user.id,
          email: user.email,
          first_name: profile?.first_name || user.user_metadata?.first_name || firstName,
          onboarding_completed: false,
          preferences: profile?.preferences || {},
          ...profile,
        };
        onAuthenticated(userData);
      } else {
        // Email confirmation requis
        setSuccess("Compte créé ! Vérifiez votre email pour confirmer votre inscription.");
        setMode("login");
      }
    } catch (err) {
      console.error("Register error:", err);
      setError(err.message === "User already registered"
        ? "Cet email est déjà utilisé"
        : "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div
          style={{
            marginBottom: "var(--space-xl)",
          }}
        >
          <Logo size={40} showText={false} />
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: "var(--font-size-md)",
            color: "var(--color-text-secondary)",
            marginBottom: "var(--space-2xl)",
            fontWeight: "var(--font-weight-normal)",
            letterSpacing: "0.01em",
          }}
        >
          Vous n'êtes pas seul·e
        </p>

        {mode === "login" ? (
          <div className="slide-in">
            <h2
              style={{
                marginBottom: "var(--space-lg)",
                fontSize: "var(--font-size-xl)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--color-text-primary)",
              }}
            >
              Se connecter
            </h2>

            {error && (
              <div
                style={{
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
                }}
              >
                <span
                  style={{ flexShrink: 0, fontSize: "var(--font-size-md)" }}
                >
                  ○
                </span>
                <span>{error}</span>
              </div>
            )}

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-md)",
              }}
            >
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                disabled={isLoading}
                aria-label="Email"
              />
              <div style={{ position: "relative" }}>
                <Input
                  label="Mot de passe"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrez votre mot de passe"
                  disabled={isLoading}
                  aria-label="Mot de passe"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-password-toggle"
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                  type="button"
                >
                  {showPassword ? "🙈" : "👀"}
                </button>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "var(--space-lg)",
                marginBottom: "var(--space-md)",
              }}
            >
              <Button
                onClick={handleLogin}
                disabled={isLoading || !email.trim() || !password.trim()}
                style={{ width: "100%" }}
              >
                {isLoading ? "Connexion en cours..." : "Se connecter"}
              </Button>
            </div>

            <div
              style={{
                textAlign: "center",
                fontSize: "var(--font-size-sm)",
                color: "var(--color-text-secondary)",
                marginBottom: "var(--space-md)",
              }}
            >
              <button
                onClick={() => {
                  setMode("forgot");
                  setError("");
                  setSuccess("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-text-secondary)",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontSize: "var(--font-size-sm)",
                }}
              >
                Mot de passe oublié ?
              </button>
            </div>

            <div
              style={{
                textAlign: "center",
                fontSize: "var(--font-size-sm)",
                color: "var(--color-text-secondary)",
              }}
            >
              Pas encore de compte ?{" "}
              <button
                onClick={() => {
                  setMode("register");
                  setError("");
                  setSuccess("");
                  setEmail("");
                  setPassword("");
                }}
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
                S'inscrire
              </button>
            </div>
          </div>
        ) : mode === "register" ? (
          <div className="slide-in">
            <h2
              style={{
                marginBottom: "var(--space-lg)",
                fontSize: "var(--font-size-xl)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--color-text-primary)",
              }}
            >
              Créer un compte
            </h2>

            {error && (
              <div
                style={{
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
                }}
              >
                <span
                  style={{ flexShrink: 0, fontSize: "var(--font-size-md)" }}
                >
                  ○
                </span>
                <span>{error}</span>
              </div>
            )}

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-md)",
              }}
            >
              <Input
                label="Prénom"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Votre prénom"
                disabled={isLoading}
                aria-label="Prénom"
              />
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                disabled={isLoading}
                aria-label="Email"
              />
              <div style={{ position: "relative" }}>
                <Input
                  label="Mot de passe"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Au moins 6 caractères"
                  disabled={isLoading}
                  aria-label="Mot de passe"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-password-toggle"
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                  type="button"
                >
                  {showPassword ? "🙈" : "👀"}
                </button>
              </div>
              <div style={{ position: "relative" }}>
                <Input
                  label="Confirmer le mot de passe"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmez votre mot de passe"
                  disabled={isLoading}
                  aria-label="Confirmation mot de passe"
                />
                <button
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="auth-password-toggle"
                  aria-label={
                    showConfirmPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                  type="button"
                >
                  {showConfirmPassword ? "🙈" : "👀"}
                </button>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "var(--space-lg)",
                marginBottom: "var(--space-md)",
              }}
            >
              <Button
                onClick={handleRegister}
                disabled={
                  isLoading ||
                  !email.trim() ||
                  !password.trim() ||
                  !firstName.trim()
                }
                style={{ width: "100%" }}
              >
                {isLoading ? "Inscription en cours..." : "S'inscrire"}
              </Button>
            </div>

            <div
              style={{
                textAlign: "center",
                fontSize: "var(--font-size-sm)",
                color: "var(--color-text-secondary)",
              }}
            >
              Vous avez déjà un compte ?{" "}
              <button
                onClick={() => {
                  setMode("login");
                  setError("");
                  setEmail("");
                  setPassword("");
                  setFirstName("");
                  setConfirmPassword("");
                }}
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
                Se connecter
              </button>
            </div>
          </div>
        ) : (
          /* Mode: Mot de passe oublié */
          <div className="slide-in">
            <h2
              style={{
                marginBottom: "var(--space-lg)",
                fontSize: "var(--font-size-xl)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--color-text-primary)",
              }}
            >
              Mot de passe oublié
            </h2>

            <p
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--color-text-secondary)",
                marginBottom: "var(--space-lg)",
                lineHeight: "var(--line-height-relaxed)",
              }}
            >
              Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>

            {error && (
              <div
                style={{
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
                }}
              >
                <span
                  style={{ flexShrink: 0, fontSize: "var(--font-size-md)" }}
                >
                  ○
                </span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div
                style={{
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
                }}
              >
                <span
                  style={{ flexShrink: 0, fontSize: "var(--font-size-md)" }}
                >
                  ✓
                </span>
                <span>{success}</span>
              </div>
            )}

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-md)",
              }}
            >
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                disabled={isLoading}
                aria-label="Email"
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "var(--space-lg)",
                marginBottom: "var(--space-md)",
              }}
            >
              <Button
                onClick={handleForgotPassword}
                disabled={isLoading || !email.trim()}
                style={{ width: "100%" }}
              >
                {isLoading ? "Envoi en cours..." : "Envoyer le lien"}
              </Button>
            </div>

            <div
              style={{
                textAlign: "center",
                fontSize: "var(--font-size-sm)",
                color: "var(--color-text-secondary)",
              }}
            >
              <button
                onClick={() => {
                  setMode("login");
                  setError("");
                  setSuccess("");
                }}
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
                Retour à la connexion
              </button>
            </div>
          </div>
        )}

        <div
          style={{
            marginTop: "var(--space-2xl)",
            paddingTop: "var(--space-lg)",
            borderTop: "1px solid var(--color-surface-2)",
            fontSize: "var(--font-size-xs)",
            color: "var(--color-text-tertiary)",
            textAlign: "center",
            lineHeight: "var(--line-height-relaxed)",
          }}
        >
          <p>HELŌ ne remplace pas un professionnel de santé mentale.</p>
          <p style={{ marginTop: "var(--space-sm)" }}>
            Vos données sont chiffrées et restent privées.
          </p>
        </div>
      </div>
    </div>
  );
}
