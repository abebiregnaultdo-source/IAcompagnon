import Logo from "../components/Logo";

/**
 * Politique de Confidentialité - HELŌ (RGPD)
 */
export default function Confidentialite({ onBack }) {
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
          Politique de Confidentialité
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
              1. Responsable du traitement
            </h2>
            <p>Le responsable du traitement des données personnelles est :</p>
            <ul
              style={{
                marginLeft: "var(--space-lg)",
                marginTop: "var(--space-sm)",
                listStyle: "none",
              }}
            >
              <li>
                <strong>[NOM DE LA SOCIÉTÉ] SAS</strong>
              </li>
              <li>
                Siège social : <strong>[ADRESSE COMPLÈTE]</strong>
              </li>
              <li>
                Email : <strong>[EMAIL CONTACT]</strong>
              </li>
              <li>
                DPO (Délégué à la Protection des Données) :{" "}
                <strong>[EMAIL DPO]</strong>
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
              2. Données collectées et finalités
            </h2>

            <h3
              style={{
                fontSize: "var(--font-size-md)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--color-text-primary)",
                marginTop: "var(--space-lg)",
                marginBottom: "var(--space-sm)",
              }}
            >
              2.1 Données d'identification
            </h3>
            <p>
              <strong>Données collectées :</strong> Prénom, email, mot de passe
              (chiffré)
            </p>
            <p>
              <strong>Finalité :</strong> Création et gestion de votre compte,
              authentification
            </p>
            <p>
              <strong>Base légale :</strong> Exécution du contrat
            </p>

            <h3
              style={{
                fontSize: "var(--font-size-md)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--color-text-primary)",
                marginTop: "var(--space-lg)",
                marginBottom: "var(--space-sm)",
              }}
            >
              2.2 Données thérapeutiques
            </h3>
            <p>
              <strong>Données collectées :</strong> Conversations avec Helō,
              journal personnel, créations, état émotionnel (radar), préférences
              thérapeutiques
            </p>
            <p>
              <strong>Finalité :</strong> Fourniture du service d'accompagnement
              personnalisé
            </p>
            <p>
              <strong>Base légale :</strong> Consentement explicite (données de
              santé sensibles au sens du RGPD)
            </p>
            <p
              style={{
                marginTop: "var(--space-sm)",
                padding: "var(--space-sm)",
                background: "var(--color-primary-light)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              🔒 Ces données sont <strong>chiffrées au repos et en transit</strong>{" "}
              (HTTPS et chiffrement du stockage), et leur accès est strictement
              limité. Elles ne sont jamais vendues ni partagées avec des tiers à
              des fins commerciales.
            </p>

            <h3
              style={{
                fontSize: "var(--font-size-md)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--color-text-primary)",
                marginTop: "var(--space-lg)",
                marginBottom: "var(--space-sm)",
              }}
            >
              2.3 Données de paiement
            </h3>
            <p>
              <strong>Données collectées :</strong> Informations de paiement
              (via prestataire sécurisé)
            </p>
            <p>
              <strong>Finalité :</strong> Gestion des abonnements
            </p>
            <p>
              <strong>Base légale :</strong> Exécution du contrat
            </p>
            <p style={{ marginTop: "var(--space-sm)" }}>
              ℹ️ Helō ne stocke jamais vos coordonnées bancaires. Le paiement
              est géré par <strong>[NOM PRESTATAIRE]</strong>, certifié PCI-DSS.
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
              3. Durée de conservation
            </h2>
            <ul style={{ marginLeft: "var(--space-lg)" }}>
              <li>
                <strong>Compte actif :</strong> Tant que votre compte est actif
              </li>
              <li>
                <strong>Après résiliation :</strong> Conservation pendant 2 ans
                en lecture seule (possibilité d'export)
              </li>
              <li>
                <strong>Suppression définitive :</strong> Sur demande explicite
                ou après 2 ans d'inactivité
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
              4. Vos droits (RGPD)
            </h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul
              style={{
                marginLeft: "var(--space-lg)",
                marginTop: "var(--space-sm)",
              }}
            >
              <li>
                <strong>Droit d'accès :</strong> Obtenir une copie de vos
                données personnelles
              </li>
              <li>
                <strong>Droit de rectification :</strong> Corriger vos données
                inexactes
              </li>
              <li>
                <strong>Droit à l'effacement :</strong> Supprimer vos données («
                droit à l'oubli »)
              </li>
              <li>
                <strong>Droit à la portabilité :</strong> Récupérer vos données
                dans un format structuré
              </li>
              <li>
                <strong>Droit d'opposition :</strong> Vous opposer au traitement
                de vos données
              </li>
              <li>
                <strong>Droit de limitation :</strong> Limiter le traitement de
                vos données
              </li>
              <li>
                <strong>Droit de retirer votre consentement :</strong> À tout
                moment pour les données de santé
              </li>
            </ul>
            <p style={{ marginTop: "var(--space-md)" }}>
              Pour exercer ces droits, contactez notre DPO :{" "}
              <strong>[EMAIL DPO]</strong>
            </p>
            <p style={{ marginTop: "var(--space-sm)" }}>
              Vous pouvez également déposer une réclamation auprès de la CNIL :{" "}
              <a
                href="https://www.cnil.fr"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--color-primary)",
                  textDecoration: "underline",
                }}
              >
                www.cnil.fr
              </a>
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
              5. Sécurité des données
            </h2>
            <p>
              Helō met en œuvre toutes les mesures techniques et
              organisationnelles appropriées pour protéger vos données :
            </p>
            <ul
              style={{
                marginLeft: "var(--space-lg)",
                marginTop: "var(--space-sm)",
              }}
            >
              <li>🔐 Chiffrement des données au repos (stockage) et en transit</li>
              <li>🔒 Connexions HTTPS sécurisées</li>
              <li>🛡️ Authentification sécurisée (mots de passe hashés)</li>
              <li>🏢 Hébergement dans l'Union européenne (Irlande), conforme au RGPD</li>
              <li>
                👥 Accès limité aux données (principe du moindre privilège)
              </li>
              <li>📊 Audits de sécurité réguliers</li>
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
              6. Partage des données
            </h2>
            <p>
              <strong>Helō ne vend jamais vos données personnelles.</strong>
            </p>
            <p style={{ marginTop: "var(--space-md)" }}>
              Vos données peuvent être partagées uniquement dans les cas
              suivants :
            </p>
            <ul
              style={{
                marginLeft: "var(--space-lg)",
                marginTop: "var(--space-sm)",
              }}
            >
              <li>
                <strong>Prestataires techniques :</strong> Hébergement ([NOM
                HÉBERGEUR]), paiement ([NOM PRESTATAIRE PAIEMENT]) - sous
                contrat de confidentialité strict
              </li>
              <li>
                <strong>Obligations légales :</strong> Si requis par la loi ou
                une autorité judiciaire
              </li>
            </ul>
            <p style={{ marginTop: "var(--space-md)" }}>
              Aucune donnée n'est transférée hors de l'Union Européenne.
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
              7. Cookies et traceurs
            </h2>
            <p>
              Helō utilise uniquement des cookies strictement nécessaires au
              fonctionnement du service :
            </p>
            <ul
              style={{
                marginLeft: "var(--space-lg)",
                marginTop: "var(--space-sm)",
              }}
            >
              <li>
                <strong>Authentification :</strong> Pour maintenir votre session
                connectée
              </li>
              <li>
                <strong>Préférences :</strong> Pour sauvegarder vos paramètres
                (ton, rythme, etc.)
              </li>
            </ul>
            <p style={{ marginTop: "var(--space-md)" }}>
              ✅ Aucun cookie de tracking, publicité ou analytics tiers n'est
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
              8. Modifications de la politique
            </h2>
            <p>
              Cette politique de confidentialité peut être mise à jour. En cas
              de modification substantielle, vous serez informé par email et/ou
              via une notification dans l'application.
            </p>
            <p style={{ marginTop: "var(--space-md)" }}>
              Date de dernière mise à jour :{" "}
              <strong>{new Date().toLocaleDateString("fr-FR")}</strong>
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
              9. Contact
            </h2>
            <p>
              Pour toute question concernant cette politique de confidentialité
              ou vos données personnelles :
            </p>
            <ul
              style={{
                marginLeft: "var(--space-lg)",
                marginTop: "var(--space-sm)",
                listStyle: "none",
              }}
            >
              <li>
                DPO : <strong>[EMAIL DPO]</strong>
              </li>
              <li>
                Support : <strong>[EMAIL SUPPORT]</strong>
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
