import Logo from "../components/Logo";

/**
 * Mentions Légales - HELŌ
 */
export default function MentionsLegales({ onBack }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-background)",
        padding: "var(--space-xl)",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        {onBack && (
          <button
            onClick={onBack}
            style={{
              marginBottom: "var(--space-lg)",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-primary)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "var(--space-sm)",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-xs)",
            }}
          >
            ← Retour
          </button>
        )}

        <div style={{ textAlign: "center", marginBottom: "var(--space-xl)" }}>
          <Logo size={40} showText={false} />
        </div>

        <h1
          style={{
            fontSize: "var(--font-size-2xl)",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--color-text-primary)",
            marginBottom: "var(--space-lg)",
          }}
        >
          Mentions Légales
        </h1>

        <p
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-tertiary)",
            marginBottom: "var(--space-2xl)",
          }}
        >
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
        </p>

        <div
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-secondary)",
            lineHeight: "var(--line-height-relaxed)",
          }}
        >
          <section style={{ marginBottom: "var(--space-2xl)" }}>
            <h2
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--color-text-primary)",
                marginBottom: "var(--space-md)",
              }}
            >
              1. Éditeur du site
            </h2>
            <p>Le site Helō est édité par :</p>
            <ul
              style={{
                marginLeft: "var(--space-lg)",
                marginTop: "var(--space-sm)",
                listStyle: "none",
              }}
            >
              <li>
                <strong>Raison sociale :</strong> [NOM DE LA SOCIÉTÉ] SAS
              </li>
              <li>
                <strong>Forme juridique :</strong> Société par Actions
                Simplifiée
              </li>
              <li>
                <strong>Capital social :</strong> [MONTANT] €
              </li>
              <li>
                <strong>RCS :</strong> [VILLE] B [NUMÉRO]
              </li>
              <li>
                <strong>SIRET :</strong> [NUMÉRO SIRET]
              </li>
              <li>
                <strong>Siège social :</strong> [ADRESSE COMPLÈTE]
              </li>
              <li>
                <strong>Directeur de la publication :</strong> [NOM PRÉNOM],
                [FONCTION]
              </li>
              <li>
                <strong>Email :</strong> [EMAIL CONTACT]
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: "var(--space-2xl)" }}>
            <h2
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--color-text-primary)",
                marginBottom: "var(--space-md)",
              }}
            >
              2. Hébergement
            </h2>
            <p>Le site Helō est hébergé par :</p>
            <ul
              style={{
                marginLeft: "var(--space-lg)",
                marginTop: "var(--space-sm)",
                listStyle: "none",
              }}
            >
              <li>
                <strong>Raison sociale :</strong> [NOM HÉBERGEUR]
              </li>
              <li>
                <strong>Adresse :</strong> [ADRESSE HÉBERGEUR]
              </li>
              <li>
                <strong>Téléphone :</strong> [TÉLÉPHONE HÉBERGEUR]
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: "var(--space-2xl)" }}>
            <h2
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--color-text-primary)",
                marginBottom: "var(--space-md)",
              }}
            >
              3. Propriété intellectuelle
            </h2>
            <p>
              L'ensemble du contenu de ce site (structure, textes, logos,
              images, vidéos, etc.) est la propriété exclusive de{" "}
              <strong>[NOM DE LA SOCIÉTÉ] SAS</strong>, sauf mention contraire.
            </p>
            <p style={{ marginTop: "var(--space-md)" }}>
              Toute reproduction, distribution, modification, adaptation,
              retransmission ou publication de ces différents éléments est
              strictement interdite sans l'accord exprès par écrit de
              <strong> [NOM DE LA SOCIÉTÉ] SAS</strong>.
            </p>
          </section>

          <section style={{ marginBottom: "var(--space-2xl)" }}>
            <h2
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--color-text-primary)",
                marginBottom: "var(--space-md)",
              }}
            >
              4. Protection des données personnelles
            </h2>
            <p>
              Conformément au Règlement Général sur la Protection des Données
              (RGPD) et à la loi Informatique et Libertés, vous disposez d'un
              droit d'accès, de rectification, de suppression et d'opposition
              aux données personnelles vous concernant.
            </p>
            <p style={{ marginTop: "var(--space-md)" }}>
              Pour exercer ces droits ou pour toute question sur le traitement
              de vos données, contactez notre Délégué à la Protection des
              Données (DPO) : <strong>[EMAIL DPO]</strong>
            </p>
            <p style={{ marginTop: "var(--space-md)" }}>
              Pour plus d'informations, consultez notre{" "}
              <a
                href="/confidentialite"
                style={{
                  color: "var(--color-primary)",
                  textDecoration: "underline",
                }}
              >
                Politique de Confidentialité
              </a>
              .
            </p>
          </section>

          <section style={{ marginBottom: "var(--space-2xl)" }}>
            <h2
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--color-text-primary)",
                marginBottom: "var(--space-md)",
              }}
            >
              5. Cookies
            </h2>
            <p>
              Le site Helō utilise des cookies strictement nécessaires au
              fonctionnement du service (authentification, préférences
              utilisateur). Aucun cookie de tracking ou publicitaire n'est
              utilisé.
            </p>
          </section>

          <section style={{ marginBottom: "var(--space-2xl)" }}>
            <h2
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--color-text-primary)",
                marginBottom: "var(--space-md)",
              }}
            >
              6. Disclaimer médical
            </h2>
            <p
              style={{
                padding: "var(--space-md)",
                background: "var(--color-accent-warm)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
              }}
            >
              <strong>⚠️ Important :</strong> Helō est un outil d'accompagnement
              numérique et ne se substitue en aucun cas à un suivi médical,
              psychiatrique ou psychologique professionnel. En cas de détresse
              sévère ou d'urgence, contactez immédiatement le{" "}
              <strong>3114</strong> (numéro national de prévention du suicide,
              gratuit 24/7) ou le <strong>15</strong> (SAMU).
            </p>
          </section>

          <section style={{ marginBottom: "var(--space-2xl)" }}>
            <h2
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--color-text-primary)",
                marginBottom: "var(--space-md)",
              }}
            >
              7. Contact
            </h2>
            <p>Pour toute question concernant ces mentions légales :</p>
            <ul
              style={{
                marginLeft: "var(--space-lg)",
                marginTop: "var(--space-sm)",
                listStyle: "none",
              }}
            >
              <li>
                Email : <strong>[EMAIL CONTACT]</strong>
              </li>
              <li>
                Adresse : <strong>[ADRESSE COMPLÈTE]</strong>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
