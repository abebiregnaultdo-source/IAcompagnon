import React from "react";
import Logo from "./components/Logo";

export default function Pricing({ onBack }) {
  return (
    <div
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: "linear-gradient(135deg, #E8F1F5 0%, #F5F5F0 100%)",
        minHeight: "100vh",
        padding: "40px 20px",
      }}
    >
      <div className="container" style={{ maxWidth: 1400, margin: "0 auto" }}>
        {/* Header */}
        <div className="header" style={{ textAlign: "center", marginBottom: 60 }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                marginBottom: 16,
                fontSize: 14,
                color: "#7BA8C0",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              ← Retour
            </button>
          )}
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <Logo size={48} showText={false} />
          </div>
          <h1 style={{ fontSize: 48, color: "#2C3E50", marginBottom: 16 }}>
            Choisissez votre formule
          </h1>
          <p className="subtitle" style={{ fontSize: 20, color: "#7BA8C0", marginBottom: 32 }}>
            Un accompagnement accessible, à votre rythme
          </p>
          <div
            className="beta-badge"
            style={{
              display: "inline-block",
              background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
              color: "white",
              padding: "16px 48px",
              borderRadius: 50,
              fontWeight: 600,
              fontSize: 20,
              boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
              marginBottom: 16,
            }}
          >
            ✨ Essai gratuit 14 jours - Tout Premium
          </div>
          <p
            className="beta-text"
            style={{ fontSize: 16, color: "#666", maxWidth: 600, margin: "16px auto 0", lineHeight: 1.6 }}
          >
            Testez toutes les fonctionnalités Premium pendant 14 jours, sans carte bancaire.
            <br />
            Après votre essai, choisissez la formule qui vous correspond.
          </p>
        </div>

        {/* Pricing Cards */}
        <div
          className="pricing-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 32, marginBottom: 60 }}
        >
          {/* Basique */}
          <div
            className="pricing-card"
            style={{
              background: "white",
              borderRadius: 24,
              padding: "40px 32px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              transition: "all 0.3s",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div className="card-header" style={{ textAlign: "center", marginBottom: 32, paddingBottom: 24, borderBottom: "2px solid #f0f0f0" }}>
              <div className="card-icon" style={{ fontSize: 72, marginBottom: 16 }}>🎨</div>
              <div className="card-title" style={{ fontSize: 32, fontWeight: 700, color: "#2C3E50", marginBottom: 12 }}>Basique</div>
              <div className="card-description" style={{ fontSize: 16, color: "#7BA8C0", lineHeight: 1.6 }}>Outils créatifs en autonomie</div>
            </div>
            <div className="card-price" style={{ textAlign: "center", marginBottom: 32 }}>
              <div
                className="price-amount"
                style={{ fontSize: 64, fontWeight: 800, color: "#2C3E50", display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 4 }}
              >
                <span className="price-currency" style={{ fontSize: 36, marginTop: 12 }}>€</span>
                <span>9</span>
                <span className="price-decimal" style={{ fontSize: 36, marginTop: 12 }}>.90</span>
              </div>
              <div className="price-period" style={{ fontSize: 18, color: "#7BA8C0", marginTop: 8 }}>par mois</div>
            </div>
            <ul className="features-list" style={{ listStyle: "none", marginBottom: 32, padding: 0 }}>
              {[
                "Bibliothèque complète 50+ ressources créatives",
                "Écriture thérapeutique guidée et libre",
                "Dessin expressif et collage numérique",
                "Exercices TIPI en autonomie",
                "20+ méditations audio guidées",
                "Pas de conversation avec l'IA",
                "Pas d'avatar vocal",
                "Pas d'accompagnement personnalisé",
              ].map((text, i) => (
                <li
                  key={i}
                  style={{
                    padding: "14px 0",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: "#2C3E50",
                    borderBottom: "1px solid #f5f5f5",
                  }}
                >
                  <span className="feature-icon" style={{ fontSize: 22, flexShrink: 0, marginTop: 2, color: i < 5 ? "#4CAF50" : "#E0E0E0" }}>
                    {i < 5 ? "✓" : "✗"}
                  </span>
                  <span className="feature-text">{text}</span>
                </li>
              ))}
            </ul>
            <a
              href="#"
              className="cta-button basique"
              style={{
                width: "100%",
                padding: "18px 32px",
                border: "none",
                borderRadius: 12,
                fontSize: 18,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.3s",
                textAlign: "center",
                display: "block",
                textDecoration: "none",
                background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
                color: "white",
                boxShadow: "0 4px 12px rgba(255, 152, 0, 0.3)",
              }}
            >
              Choisir Basique
            </a>
          </div>

          {/* Standard */}
          <div
            className="pricing-card recommended"
            style={{
              background: "white",
              borderRadius: 24,
              padding: "40px 32px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              transition: "all 0.3s",
              position: "relative",
              overflow: "hidden",
              border: "3px solid #7BA8C0",
              transform: "scale(1.05)",
            }}
          >
            <div
              style={{
                content: '"RECOMMANDÉ"',
                position: "absolute",
                top: 20,
                right: -35,
                background: "#7BA8C0",
                color: "white",
                padding: "8px 50px",
                transform: "rotate(45deg)",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              RECOMMANDÉ
            </div>
            <div className="card-header" style={{ textAlign: "center", marginBottom: 32, paddingBottom: 24, borderBottom: "2px solid #f0f0f0" }}>
              <div className="card-icon" style={{ fontSize: 72, marginBottom: 16 }}>💬</div>
              <div className="card-title" style={{ fontSize: 32, fontWeight: 700, color: "#2C3E50", marginBottom: 12 }}>Standard</div>
              <div className="card-description" style={{ fontSize: 16, color: "#7BA8C0", lineHeight: 1.6 }}>Accompagnement complet</div>
            </div>
            <div className="card-price" style={{ textAlign: "center", marginBottom: 32 }}>
              <div
                className="price-amount"
                style={{ fontSize: 64, fontWeight: 800, color: "#2C3E50", display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 4 }}
              >
                <span className="price-currency" style={{ fontSize: 36, marginTop: 12 }}>€</span>
                <span>19</span>
                <span className="price-decimal" style={{ fontSize: 36, marginTop: 12 }}>.90</span>
              </div>
              <div className="price-period" style={{ fontSize: 18, color: "#7BA8C0", marginTop: 8 }}>par mois</div>
            </div>
            <ul className="features-list" style={{ listStyle: "none", marginBottom: 32, padding: 0 }}>
              {[
                "Tout Basique inclus",
                "Conversations illimitées écrites et vocales",
                "Avatar 3D personnalisable dans son bureau",
                "Approche TIPI complète (8 variations)",
                "Historique illimité de toutes vos sessions",
                "Résumés de sessions automatiques",
                "Greetings contextuels intelligents",
                "Disponible 24/7 sans engagement",
              ].map((text, i) => (
                <li
                  key={i}
                  style={{
                    padding: "14px 0",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: "#2C3E50",
                    borderBottom: "1px solid #f5f5f5",
                  }}
                >
                  <span className="feature-icon check" style={{ fontSize: 22, flexShrink: 0, marginTop: 2, color: "#4CAF50" }}>✓</span>
                  <span className="feature-text">{text}</span>
                </li>
              ))}
            </ul>
            <a
              href="#"
              className="cta-button standard"
              style={{
                width: "100%",
                padding: "18px 32px",
                border: "none",
                borderRadius: 12,
                fontSize: 18,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.3s",
                textAlign: "center",
                display: "block",
                textDecoration: "none",
                background: "linear-gradient(135deg, #7BA8C0 0%, #5A8FA8 100%)",
                color: "white",
                boxShadow: "0 4px 12px rgba(123, 168, 192, 0.3)",
              }}
            >
              Choisir Standard
            </a>
          </div>

          {/* Premium */}
          <div
            className="pricing-card"
            style={{
              background: "white",
              borderRadius: 24,
              padding: "40px 32px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              transition: "all 0.3s",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div className="card-header" style={{ textAlign: "center", marginBottom: 32, paddingBottom: 24, borderBottom: "2px solid #f0f0f0" }}>
              <div className="card-icon" style={{ fontSize: 72, marginBottom: 16 }}>💎</div>
              <div className="card-title" style={{ fontSize: 32, fontWeight: 700, color: "#2C3E50", marginBottom: 12 }}>Premium</div>
              <div className="card-description" style={{ fontSize: 16, color: "#7BA8C0", lineHeight: 1.6 }}>Accompagnement + Insights avancés</div>
            </div>
            <div className="card-price" style={{ textAlign: "center", marginBottom: 32 }}>
              <div
                className="price-amount"
                style={{ fontSize: 64, fontWeight: 800, color: "#2C3E50", display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 4 }}
              >
                <span className="price-currency" style={{ fontSize: 36, marginTop: 12 }}>€</span>
                <span>29</span>
                <span className="price-decimal" style={{ fontSize: 36, marginTop: 12 }}>.90</span>
              </div>
              <div className="price-period" style={{ fontSize: 18, color: "#7BA8C0", marginTop: 8 }}>par mois</div>
            </div>
            <ul className="features-list" style={{ listStyle: "none", marginBottom: 32, padding: 0 }}>
              {[
                "Tout Standard inclus",
                "Analyses avancées graphiques émotionnels 3-6 mois",
                "Export données complet (PDF + JSON)",
                "Parcours guidés structurés (8-12 semaines)",
                "Ressources exclusives méditations avancées",
                "Worksheets premium imprimables",
                "Support prioritaire chat + email 24h",
                "Rapport mensuel automatique par email",
              ].map((text, i) => (
                <li
                  key={i}
                  style={{
                    padding: "14px 0",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: "#2C3E50",
                    borderBottom: "1px solid #f5f5f5",
                  }}
                >
                  <span className="feature-icon premium" style={{ fontSize: 22, flexShrink: 0, marginTop: 2, color: "#9C27B0" }}>★</span>
                  <span className="feature-text">{text}</span>
                </li>
              ))}
            </ul>
            <a
              href="#"
              className="cta-button premium"
              style={{
                width: "100%",
                padding: "18px 32px",
                border: "none",
                borderRadius: 12,
                fontSize: 18,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.3s",
                textAlign: "center",
                display: "block",
                textDecoration: "none",
                background: "linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)",
                color: "white",
                boxShadow: "0 4px 12px rgba(156, 39, 176, 0.3)",
              }}
            >
              Choisir Premium
            </a>
          </div>
        </div>

        {/* Comparison Section */}
        <div
          className="comparison-section"
          style={{ background: "white", borderRadius: 24, padding: 48, marginTop: 60, boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)" }}
        >
          <h2 style={{ textAlign: "center", fontSize: 36, color: "#2C3E50", marginBottom: 48 }}>
            Comparaison détaillée des formules
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table className="comparison-table" style={{ width: "100%", borderCollapse: "collapse", marginTop: 24 }}>
              <thead style={{ background: "#F5F5F0" }}>
                <tr>
                  <th
                    style={{
                      padding: "24px 20px",
                      textAlign: "left",
                      fontWeight: 700,
                      color: "#2C3E50",
                      borderBottom: "3px solid #E0E0E0",
                      fontSize: 18,
                      borderRadius: "12px 0 0 0",
                      width: "35%",
                    }}
                  >
                    Fonctionnalité
                  </th>
                  <th style={{ padding: "24px 20px", textAlign: "center", fontWeight: 700, color: "#2C3E50", borderBottom: "3px solid #E0E0E0", fontSize: 18 }}>
                    Basique<br />9.90€
                  </th>
                  <th style={{ padding: "24px 20px", textAlign: "center", fontWeight: 700, color: "#2C3E50", borderBottom: "3px solid #E0E0E0", fontSize: 18 }}>
                    Standard<br />19.90€
                  </th>
                  <th
                    style={{
                      padding: "24px 20px",
                      textAlign: "center",
                      fontWeight: 700,
                      color: "#2C3E50",
                      borderBottom: "3px solid #E0E0E0",
                      fontSize: 18,
                      borderRadius: "0 12px 0 0",
                    }}
                  >
                    Premium<br />29.90€
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* ACCOMPAGNEMENT */}
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      background: "#F5F5F0",
                      fontWeight: 700,
                      color: "#7BA8C0",
                      textAlign: "left",
                      padding: "16px 20px",
                      fontSize: 16,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    ACCOMPAGNEMENT
                  </td>
                </tr>
                {[
                  ["Conversations illimitées (écrit + vocal)", "✗", "✓", "✓"],
                  ["Avatar 3D personnalisable", "✗", "✓", "✓"],
                  ["Approche TIPI complète (8 variations)", "✗", "✓", "✓"],
                  ["Historique complet", "✗", "✓", "✓"],
                  ["Résumés de sessions", "✗", "✓", "✓"],
                  ["Greetings contextuels", "✗", "✓", "✓"],
                ].map((row, i) => (
                  <tr key={`acc-${i}`} style={{ borderBottom: "1px solid #F0F0F0" }}>
                    <td style={{ padding: 20, textAlign: "left", fontWeight: 500, color: "#2C3E50" }}>{row[0]}</td>
                    <td style={{ padding: 20, textAlign: "center", verticalAlign: "middle", color: row[1] === "✓" ? "#4CAF50" : "#E0E0E0", fontSize: 28 }}>{row[1]}</td>
                    <td style={{ padding: 20, textAlign: "center", verticalAlign: "middle", color: row[2] === "✓" ? "#4CAF50" : "#E0E0E0", fontSize: 28 }}>{row[2]}</td>
                    <td style={{ padding: 20, textAlign: "center", verticalAlign: "middle", color: row[3] === "✓" ? "#4CAF50" : "#E0E0E0", fontSize: 28 }}>{row[3]}</td>
                  </tr>
                ))}

                {/* OUTILS CRÉATIFS */}
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      background: "#F5F5F0",
                      fontWeight: 700,
                      color: "#7BA8C0",
                      textAlign: "left",
                      padding: "16px 20px",
                      fontSize: 16,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    OUTILS CRÉATIFS
                  </td>
                </tr>
                {[
                  ["Bibliothèque ressources (50+)", "✓", "✓", "✓"],
                  ["Écriture thérapeutique", "✓", "✓", "✓"],
                  ["Dessin expressif", "✓", "✓", "✓"],
                  ["Exercices TIPI autonomes", "✓", "✓", "✓"],
                  ["Méditations guidées", "20 audio", "20 audio", "40+ audio"],
                  ["Worksheets premium imprimables", "✗", "✗", "★"],
                ].map((row, i) => (
                  <tr key={`tools-${i}`} style={{ borderBottom: "1px solid #F0F0F0" }}>
                    <td style={{ padding: 20, textAlign: "left", fontWeight: 500, color: "#2C3E50" }}>{row[0]}</td>
                    {[1, 2, 3].map((c) => (
                      <td
                        key={c}
                        style={{
                          padding: 20,
                          textAlign: "center",
                          verticalAlign: "middle",
                          color:
                            row[c] === "✓"
                              ? "#4CAF50"
                              : row[c] === "✗"
                              ? "#E0E0E0"
                              : row[c] === "★"
                              ? "#9C27B0"
                              : "#7BA8C0",
                          fontWeight: row[c] === "★" ? 700 : 600,
                          fontSize: row[c] === "★" || row[c] === "✗" || row[c] === "✓" ? 28 : 15,
                        }}
                      >
                        {row[c]}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* ANALYSES & INSIGHTS */}
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      background: "#F5F5F0",
                      fontWeight: 700,
                      color: "#7BA8C0",
                      textAlign: "left",
                      padding: "16px 20px",
                      fontSize: 16,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    ANALYSES & INSIGHTS
                  </td>
                </tr>
                {[
                  ["Analyse émotionnelle basique", "✗", "✓", "✓"],
                  ["Graphiques avancés (3-6 mois)", "✗", "✗", "★"],
                  ["Statistiques détaillées", "✗", "✗", "★"],
                  ["Export données (PDF + JSON)", "✗", "✗", "★"],
                  ["Rapport mensuel automatique", "✗", "✗", "★"],
                ].map((row, i) => (
                  <tr key={`ins-${i}`} style={{ borderBottom: "1px solid #F0F0F0" }}>
                    <td style={{ padding: 20, textAlign: "left", fontWeight: 500, color: "#2C3E50" }}>{row[0]}</td>
                    {[1, 2, 3].map((c) => (
                      <td key={c} style={{ padding: 20, textAlign: "center", verticalAlign: "middle", color: row[c] === "✓" ? "#4CAF50" : row[c] === "✗" ? "#E0E0E0" : "#9C27B0", fontSize: 28 }}>
                        {row[c]}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* PARCOURS GUIDÉS */}
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      background: "#F5F5F0",
                      fontWeight: 700,
                      color: "#7BA8C0",
                      textAlign: "left",
                      padding: "16px 20px",
                      fontSize: 16,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    PARCOURS GUIDÉS
                  </td>
                </tr>
                {[
                  ["Parcours structurés (8-12 semaines)", "✗", "✗", "★"],
                  ['"Traverser le deuil"', "✗", "✗", "★"],
                  ['"Gérer l\'anxiété"', "✗", "✗", "★"],
                  ['"Confiance en soi"', "✗", "✗", "★"],
                ].map((row, i) => (
                  <tr key={`guide-${i}`} style={{ borderBottom: "1px solid #F0F0F0" }}>
                    <td style={{ padding: 20, textAlign: "left", fontWeight: 500, color: "#2C3E50" }}>{row[0]}</td>
                    {[1, 2, 3].map((c) => (
                      <td key={c} style={{ padding: 20, textAlign: "center", verticalAlign: "middle", color: row[c] === "✓" ? "#4CAF50" : row[c] === "✗" ? "#E0E0E0" : "#9C27B0", fontSize: 28 }}>
                        {row[c]}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* SUPPORT */}
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      background: "#F5F5F0",
                      fontWeight: 700,
                      color: "#7BA8C0",
                      textAlign: "left",
                      padding: "16px 20px",
                      fontSize: 16,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    SUPPORT
                  </td>
                </tr>
                {[
                  ["FAQ complète", "✓", "✓", "✓"],
                  ["Email support", "48h", "48h", "24h"],
                  ["Chat support instantané", "✗", "✗", "★"],
                ].map((row, i) => (
                  <tr key={`support-${i}`} style={{ borderBottom: "1px solid #F0F0F0" }}>
                    <td style={{ padding: 20, textAlign: "left", fontWeight: 500, color: "#2C3E50" }}>{row[0]}</td>
                    {[1, 2, 3].map((c) => (
                      <td
                        key={c}
                        style={{
                          padding: 20,
                          textAlign: "center",
                          verticalAlign: "middle",
                          color:
                            row[c] === "✓"
                              ? "#4CAF50"
                              : row[c] === "✗"
                              ? "#E0E0E0"
                              : row[c] === "★"
                              ? "#9C27B0"
                              : "#7BA8C0",
                          fontWeight: row[c] === "★" ? 700 : 600,
                          fontSize: row[c] === "★" || row[c] === "✗" || row[c] === "✓" ? 28 : 15,
                        }}
                      >
                        {row[c]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="faq-section" style={{ background: "white", borderRadius: 24, padding: 48, marginTop: 40, boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)" }}>
          <h2 style={{ textAlign: "center", fontSize: 36, color: "#2C3E50", marginBottom: 40 }}>Questions fréquentes</h2>
          {[
            {
              q: "Pourquoi 14 jours d'essai gratuit ?",
              a:
                "14 jours permettent de vraiment explorer l'accompagnement sur plusieurs sessions. C'est le temps nécessaire pour ressentir les premiers bénéfices de l'approche TIPI et évaluer si IAcompagnon vous correspond. Vous testez TOUTES les fonctionnalités Premium sans aucune limitation.",
            },
            {
              q: "Dois-je fournir une carte bancaire pour l'essai ?",
              a:
                "Non ! L'essai de 14 jours ne nécessite aucune carte bancaire. Vous pouvez tester IAcompagnon en toute tranquillité. À la fin de la période, vous choisissez simplement la formule qui vous convient.",
            },
            {
              q: "La formule Basique, c'est pour qui ?",
              a:
                "La formule Basique (9.90€/mois) est idéale pour ceux qui veulent travailler en autonomie avec nos outils créatifs (écriture, dessin, méditations, exercices TIPI). Par contre, vous n'aurez pas accès aux conversations avec l'IA ni à l'avatar vocal. C'est parfait si vous préférez les outils guidés sans accompagnement personnalisé.",
            },
            {
              q: "Quelle est la différence entre Standard et Premium ?",
              a:
                "La formule Standard (19.90€) offre l'accompagnement complet : conversations illimitées, avatar vocal, approche TIPI complète, historique illimité. C'est le choix de 90% de nos utilisateurs. La formule Premium (29.90€) ajoute des analyses avancées (graphiques, statistiques), l'export de vos données, des parcours guidés structurés, et un support prioritaire. C'est pour ceux qui veulent des insights approfondis sur leur parcours.",
            },
            {
              q: "Puis-je changer de formule ou résilier ?",
              a:
                "Oui, absolument ! Vous pouvez changer de formule à tout moment (upgrade ou downgrade) et résilier quand vous le souhaitez, en 2 clics depuis votre compte. Aucune période d'engagement minimum. Si vous résiliez, vous gardez l'accès jusqu'à la fin de votre période payée.",
            },
            {
              q: "Que se passe-t-il après les 14 jours gratuits ?",
              a:
                "3 jours avant la fin de votre essai, vous recevrez un email vous invitant à choisir votre formule (Basique, Standard ou Premium). Si vous ne faites rien, votre compte passe en mode 'lecture seule' : vous pouvez consulter votre historique mais pas créer de nouvelles sessions. Vous pourrez souscrire à tout moment par la suite.",
            },
            {
              q: "Pourquoi ce prix pour un accompagnement ?",
              a:
                "Notre mission est de rendre l'accompagnement accessible. Une séance avec un thérapeute coûte en moyenne 60-80€. Avec IAcompagnon Standard à 19.90€/mois, vous avez un accompagnement illimité, disponible 24/7. C'est moins cher qu'une séance mensuelle, pour un soutien quotidien quand vous en avez besoin.",
            },
            {
              q: "Mes données sont-elles protégées ?",
              a:
                "Oui, absolument. Vos conversations sont chiffrées de bout en bout. Nous sommes conformes RGPD et hébergés en France. Vos données ne sont jamais vendues ou partagées. Vous pouvez exporter ou supprimer vos données à tout moment depuis votre compte.",
            },
            {
              q: "IAcompagnon remplace-t-il un thérapeute ?",
              a:
                "Non. IAcompagnon est un outil d'accompagnement basé sur l'approche TIPI, mais ne remplace pas un suivi médical ou psychologique professionnel. En cas de détresse aiguë, contactez le 3114 (numéro national de prévention du suicide) ou consultez un professionnel de santé. IAcompagnon peut être complémentaire à un suivi thérapeutique.",
            },
            {
              q: "IAcompagnon est-il disponible sur mobile ?",
              a:
                "Oui ! IAcompagnon fonctionne parfaitement sur mobile, tablette et ordinateur. Vous pouvez passer facilement d'un appareil à l'autre, votre historique et vos préférences sont synchronisés.",
            },
          ].map((item, i) => (
            <div key={i} className="faq-item" style={{ marginBottom: 24, padding: 28, background: "#F5F5F0", borderRadius: 16, transition: "all 0.3s" }}>
              <div className="faq-question" style={{ fontSize: 19, fontWeight: 600, color: "#2C3E50", marginBottom: 12, display: "flex", alignItems: "center", gap: 12 }}>
                <span>{["📅", "💳", "🎨", "💬", "❌", "🔄", "💰", "🔐", "🩺", "📱"][i]}</span>
                <span>{item.q}</span>
              </div>
              <div className="faq-answer" style={{ fontSize: 16, color: "#666", lineHeight: 1.7 }}>{item.a}</div>
            </div>
          ))}
        </div>

        {/* Trust Section */}
        <div
          className="trust-section"
          style={{ textAlign: "center", marginTop: 60, padding: 48, background: "white", borderRadius: 24, boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)" }}
        >
          <h3 style={{ fontSize: 28, color: "#2C3E50", marginBottom: 32 }}>Pourquoi choisir IAcompagnon ?</h3>
          <div className="trust-badges" style={{ display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap" }}>
            {[
              ["🔒", "Données chiffrées\nRGPD compliant"],
              ["🧠", "Approche TIPI\nReconnue"],
              ["💙", "Conçu avec\ndes thérapeutes"],
              ["🇫🇷", "Hébergé\nen France"],
              ["🆘", "Accès direct\nau 3114"],
              ["✅", "Sans engagement\nRésiliation facile"],
            ].map((b, i) => (
              <div key={i} className="trust-badge" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div className="trust-badge-icon" style={{ fontSize: 56 }}>{b[0]}</div>
                <div className="trust-badge-text" style={{ fontSize: 15, color: "#7BA8C0", fontWeight: 500, textAlign: "center", whiteSpace: "pre-line" }}>{b[1]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
