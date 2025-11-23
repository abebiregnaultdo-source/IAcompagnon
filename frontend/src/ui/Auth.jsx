import { useState } from "react";
import Logo from "./components/Logo";
import Button from "./components/Button";
import Input from "./components/Input";

export default function Auth({ onAuthenticated }) {
  const [mode, setMode] = useState("login"); // 'login' ou 'register'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

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
      // Simuler appel API login
      // En production : POST /api/auth/login { email, password }
      const users = JSON.parse(localStorage.getItem("helo_users") || "{}");
      const user = Object.values(users).find((u) => u.email === email);

      if (!user || user.password !== password) {
        setError("Email ou mot de passe incorrect");
        setIsLoading(false);
        return;
      }

      // Login réussi
      localStorage.setItem("helo_current_user", JSON.stringify(user));
      onAuthenticated(user);
    } catch (err) {
      setError("Erreur lors de la connexion");
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
      // Vérifier si email existe déjà
      const users = JSON.parse(localStorage.getItem("helo_users") || "{}");
      if (Object.values(users).find((u) => u.email === email)) {
        setError("Cet email est déjà utilisé");
        setIsLoading(false);
        return;
      }

      // Créer nouvel utilisateur
      const newUser = {
        id: Math.random().toString(36).slice(2) + Date.now().toString(36),
        email,
        password, // ⚠️ En production : hasher le mot de passe!
        first_name: firstName,
        created_at: new Date().toISOString(),
        tone: "neutre",
        rhythm: 2,
        active_module: "grief",
      };

      users[newUser.id] = newUser;
      localStorage.setItem("helo_users", JSON.stringify(users));
      localStorage.setItem("helo_current_user", JSON.stringify(newUser));

      onAuthenticated(newUser);
    } catch (err) {
      setError("Erreur lors de l'inscription");
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
              }}
            >
              Pas encore de compte ?{" "}
              <button
                onClick={() => {
                  setMode("register");
                  setError("");
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
        ) : (
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
