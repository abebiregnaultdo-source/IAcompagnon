import Logo from "../components/Logo";
import { useDeviceDetection } from "../../hooks/useDeviceDetection";

/**
 * Conditions Générales de Vente - HELŌ
 */
export default function CGV({ onBack }) {
  const device = useDeviceDetection();

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, var(--color-bg-calm) 0%, var(--color-bg-light) 100%)",
        padding: device.isMobile ? "var(--space-md)" : "var(--space-xl)",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {onBack && (
          <button
            onClick={onBack}
            style={{
              marginBottom: "var(--space-xl)",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-primary)",
              background: "var(--color-surface-1)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              padding: "var(--space-sm) var(--space-md)",
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-xs)",
              fontWeight: "var(--font-weight-medium)",
              transition: "var(--transition-fast)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--color-primary)";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--color-surface-1)";
              e.currentTarget.style.color = "var(--color-primary)";
            }}
          >
            ← Retour aux paramètres
          </button>
        )}

        {/* Card principale avec le contenu */}
        <div
          style={{
            background: "var(--color-white-soft)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-lg)",
            padding: device.isMobile ? "var(--space-xl)" : "var(--space-2xl)",
            marginBottom: "var(--space-xl)",
          }}
        >
          <div
            style={{ textAlign: "center", marginBottom: "var(--space-2xl)" }}
          >
            <Logo size={50} showText={false} />
            <h1
              style={{
                fontSize: device.isMobile
                  ? "var(--font-size-xl)"
                  : "var(--font-size-3xl)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--color-text-primary)",
                marginTop: "var(--space-lg)",
                marginBottom: "var(--space-sm)",
                fontFamily: "var(--font-family-display)",
              }}
            >
              Conditions Générales de Vente
            </h1>
            <p
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--color-text-tertiary)",
                fontStyle: "italic",
              }}
            >
              Dernière mise à jour :{" "}
              {new Date().toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <div
            style={{
              fontSize: "var(--font-size-base)",
              color: "var(--color-text-secondary)",
              lineHeight: "var(--line-height-relaxed)",
            }}
          >
            <section
              style={{
                marginBottom: "var(--space-2xl)",
                padding: "var(--space-lg)",
                background: "var(--color-surface-1)",
                borderRadius: "var(--radius-lg)",
                borderLeft: "4px solid var(--color-primary)",
              }}
            >
              <h2
                style={{
                  fontSize: "var(--font-size-lg)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: "var(--color-text-primary)",
                  marginBottom: "var(--space-md)",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-sm)",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "var(--color-primary)",
                    color: "white",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--font-weight-bold)",
                    flexShrink: 0,
                  }}
                >
                  1
                </span>
                Présentation du service
              </h2>
              <p>
                Helō est un service d'accompagnement numérique au deuil proposé
                par <strong>[NOM DE LA SOCIÉTÉ] SAS</strong>, société par
                actions simplifiée au capital de <strong>[MONTANT] €</strong>,
                immatriculée au RCS de <strong>[VILLE]</strong> sous le numéro{" "}
                <strong>[NUMÉRO RCS]</strong>, dont le siège social est situé au{" "}
                <strong>[ADRESSE COMPLÈTE]</strong>.
              </p>
              <div
                style={{
                  marginTop: "var(--space-lg)",
                  padding: "var(--space-md)",
                  background: "var(--color-alert-bg)",
                  border: "1px solid var(--color-alert-border)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--color-alert-text-dark)",
                }}
              >
                <p
                  style={{
                    fontWeight: "var(--font-weight-semibold)",
                    marginBottom: "var(--space-sm)",
                    fontSize: "var(--font-size-md)",
                  }}
                >
                  ⚠️ Disclaimer médical obligatoire
                </p>
                <p>
                  Helō est un outil d'accompagnement numérique et ne se
                  substitue en aucun cas à un suivi médical, psychiatrique ou
                  psychologique professionnel. En cas de détresse sévère ou
                  d'urgence, contactez immédiatement le <strong>3114</strong>{" "}
                  (numéro national de prévention du suicide, gratuit 24/7) ou le{" "}
                  <strong>15</strong> (SAMU).
                </p>
              </div>
            </section>

            <section
              style={{
                marginBottom: "var(--space-2xl)",
                padding: "var(--space-lg)",
                background: "var(--color-surface-1)",
                borderRadius: "var(--radius-lg)",
                borderLeft: "4px solid var(--color-primary)",
              }}
            >
              <h2
                style={{
                  fontSize: "var(--font-size-lg)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: "var(--color-text-primary)",
                  marginBottom: "var(--space-md)",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-sm)",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "var(--color-primary)",
                    color: "white",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--font-weight-bold)",
                    flexShrink: 0,
                  }}
                >
                  2
                </span>
                Description des offres
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
                2.1 Offre Gratuite
              </h3>
              <p>
                L'offre gratuite donne accès aux fonctionnalités de base de Helō
                :
              </p>
              <ul
                style={{
                  marginLeft: "var(--space-lg)",
                  marginTop: "var(--space-sm)",
                }}
              >
                <li>Conversations avec Helō (limitées à 5 par jour)</li>
                <li>Journal thérapeutique guidé</li>
                <li>Radar émotionnel</li>
                <li>Espace créatif de base</li>
                <li>Sauvegarde de votre parcours</li>
              </ul>

              <h3
                style={{
                  fontSize: "var(--font-size-md)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: "var(--color-text-primary)",
                  marginTop: "var(--space-lg)",
                  marginBottom: "var(--space-sm)",
                }}
              >
                2.2 Accompagnement Complet
              </h3>
              <p>
                L'abonnement "Accompagnement Complet" au tarif de{" "}
                <strong>24€/mois</strong> inclut :
              </p>
              <ul
                style={{
                  marginLeft: "var(--space-lg)",
                  marginTop: "var(--space-sm)",
                }}
              >
                <li>Conversations illimitées avec Helō</li>
                <li>Tous les outils créatifs avancés</li>
                <li>Sessions vocales (disponible prochainement)</li>
                <li>Dashboard de progression détaillé</li>
                <li>Export de vos créations</li>
                <li>Protocoles thérapeutiques avancés</li>
                <li>Accès prioritaire aux nouvelles fonctionnalités</li>
              </ul>

              <h3
                style={{
                  fontSize: "var(--font-size-md)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: "var(--color-text-primary)",
                  marginTop: "var(--space-lg)",
                  marginBottom: "var(--space-sm)",
                }}
              >
                2.3 Essai gratuit
              </h3>
              <p>
                Un essai gratuit de 7 jours est proposé pour l'offre
                "Accompagnement Complet". Aucun paiement n'est effectué pendant
                la période d'essai. À l'issue de cette période, l'abonnement se
                poursuit automatiquement sauf résiliation avant la fin de
                l'essai.
              </p>
            </section>

            <section
              style={{
                marginBottom: "var(--space-2xl)",
                padding: "var(--space-lg)",
                background: "var(--color-surface-1)",
                borderRadius: "var(--radius-lg)",
                borderLeft: "4px solid var(--color-primary)",
              }}
            >
              <h2
                style={{
                  fontSize: "var(--font-size-lg)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: "var(--color-text-primary)",
                  marginBottom: "var(--space-md)",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-sm)",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "var(--color-primary)",
                    color: "white",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--font-weight-bold)",
                    flexShrink: 0,
                  }}
                >
                  3
                </span>
                Modalités d'abonnement et de paiement
              </h2>
              <p>
                L'abonnement est souscrit pour une durée d'un mois, renouvelable
                automatiquement par tacite reconduction. Le paiement s'effectue
                par carte bancaire via notre prestataire de paiement sécurisé{" "}
                <strong>[NOM DU PRESTATAIRE]</strong>.
              </p>
              <p style={{ marginTop: "var(--space-md)" }}>
                Le montant de l'abonnement est prélevé le jour de la
                souscription puis à chaque date anniversaire mensuelle. Aucun
                remboursement n'est effectué en cas de résiliation en cours de
                période.
              </p>
            </section>

            <section
              style={{
                marginBottom: "var(--space-2xl)",
                padding: "var(--space-lg)",
                background: "var(--color-surface-1)",
                borderRadius: "var(--radius-lg)",
                borderLeft: "4px solid var(--color-primary)",
              }}
            >
              <h2
                style={{
                  fontSize: "var(--font-size-lg)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: "var(--color-text-primary)",
                  marginBottom: "var(--space-md)",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-sm)",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "var(--color-primary)",
                    color: "white",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--font-weight-bold)",
                    flexShrink: 0,
                  }}
                >
                  4
                </span>
                Résiliation
              </h2>
              <p>
                Vous pouvez résilier votre abonnement à tout moment, sans frais
                ni pénalités, directement depuis les paramètres de l'application
                (Paramètres → Mon abonnement → Gérer l'abonnement).
              </p>
              <p style={{ marginTop: "var(--space-md)" }}>
                La résiliation prend effet à la fin de la période d'abonnement
                en cours. Vous conservez l'accès aux fonctionnalités payantes
                jusqu'à cette date. Après résiliation, vous conservez l'accès à
                l'offre gratuite et vos données restent intactes.
              </p>
              <p style={{ marginTop: "var(--space-md)" }}>
                Vous pouvez également nous contacter à{" "}
                <strong>[EMAIL SUPPORT]</strong> pour toute demande de
                résiliation.
              </p>
            </section>

            <section
              style={{
                marginBottom: "var(--space-2xl)",
                padding: "var(--space-lg)",
                background: "var(--color-surface-1)",
                borderRadius: "var(--radius-lg)",
                borderLeft: "4px solid var(--color-primary)",
              }}
            >
              <h2
                style={{
                  fontSize: "var(--font-size-lg)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: "var(--color-text-primary)",
                  marginBottom: "var(--space-md)",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-sm)",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "var(--color-primary)",
                    color: "white",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--font-weight-bold)",
                    flexShrink: 0,
                  }}
                >
                  5
                </span>
                Droit de rétractation
              </h2>
              <p>
                Conformément à l'article L221-18 du Code de la consommation,
                vous disposez d'un délai de 14 jours à compter de la
                souscription pour exercer votre droit de rétractation, sans
                avoir à justifier de motifs ni à payer de pénalités.
              </p>
              <p style={{ marginTop: "var(--space-md)" }}>
                Pour exercer ce droit, contactez-nous à{" "}
                <strong>[EMAIL SUPPORT]</strong>.
              </p>
            </section>

            <section
              style={{
                marginBottom: "var(--space-2xl)",
                padding: "var(--space-lg)",
                background: "var(--color-surface-1)",
                borderRadius: "var(--radius-lg)",
                borderLeft: "4px solid var(--color-primary)",
              }}
            >
              <h2
                style={{
                  fontSize: "var(--font-size-lg)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: "var(--color-text-primary)",
                  marginBottom: "var(--space-md)",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-sm)",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "var(--color-primary)",
                    color: "white",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--font-weight-bold)",
                    flexShrink: 0,
                  }}
                >
                  6
                </span>
                Limites de responsabilité
              </h2>
              <p>
                Helō s'engage à fournir un service de qualité mais ne peut
                garantir :
              </p>
              <ul
                style={{
                  marginLeft: "var(--space-lg)",
                  marginTop: "var(--space-sm)",
                }}
              >
                <li>
                  Une disponibilité du service 100% du temps (maintenance,
                  pannes techniques)
                </li>
                <li>Des résultats thérapeutiques spécifiques</li>
                <li>Une intervention en cas de crise ou d'urgence médicale</li>
              </ul>
              <p style={{ marginTop: "var(--space-md)" }}>
                L'utilisateur reconnaît que Helō est un outil complémentaire et
                ne remplace pas un suivi professionnel.
              </p>
            </section>

            <section
              style={{
                marginBottom: "var(--space-2xl)",
                padding: "var(--space-lg)",
                background: "var(--color-surface-1)",
                borderRadius: "var(--radius-lg)",
                borderLeft: "4px solid var(--color-primary)",
              }}
            >
              <h2
                style={{
                  fontSize: "var(--font-size-lg)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: "var(--color-text-primary)",
                  marginBottom: "var(--space-md)",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-sm)",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "var(--color-primary)",
                    color: "white",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--font-weight-bold)",
                    flexShrink: 0,
                  }}
                >
                  7
                </span>
                Propriété intellectuelle
              </h2>
              <p>
                Tous les contenus présents sur Helō (textes, graphismes,
                logiciels, etc.) sont la propriété exclusive de{" "}
                <strong>[NOM DE LA SOCIÉTÉ] SAS</strong> et sont protégés par le
                droit d'auteur.
              </p>
              <p style={{ marginTop: "var(--space-md)" }}>
                Les créations réalisées par l'utilisateur (journal, textes
                créatifs, etc.) restent sa propriété exclusive.
              </p>
            </section>

            <section
              style={{
                marginBottom: "var(--space-2xl)",
                padding: "var(--space-lg)",
                background: "var(--color-surface-1)",
                borderRadius: "var(--radius-lg)",
                borderLeft: "4px solid var(--color-primary)",
              }}
            >
              <h2
                style={{
                  fontSize: "var(--font-size-lg)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: "var(--color-text-primary)",
                  marginBottom: "var(--space-md)",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-sm)",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "var(--color-primary)",
                    color: "white",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--font-weight-bold)",
                    flexShrink: 0,
                  }}
                >
                  8
                </span>
                Droit applicable et juridiction
              </h2>
              <p>
                Les présentes CGV sont soumises au droit français. En cas de
                litige, une solution amiable sera recherchée avant toute action
                judiciaire. À défaut, les tribunaux français seront seuls
                compétents.
              </p>
            </section>

            <section
              style={{
                marginBottom: 0,
                padding: "var(--space-lg)",
                background: "var(--color-surface-1)",
                borderRadius: "var(--radius-lg)",
                borderLeft: "4px solid var(--color-primary)",
              }}
            >
              <h2
                style={{
                  fontSize: "var(--font-size-lg)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: "var(--color-text-primary)",
                  marginBottom: "var(--space-md)",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-sm)",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "var(--color-primary)",
                    color: "white",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--font-weight-bold)",
                    flexShrink: 0,
                  }}
                >
                  9
                </span>
                Contact
              </h2>
              <p>Pour toute question concernant ces CGV, contactez-nous :</p>
              <ul
                style={{
                  marginLeft: "var(--space-lg)",
                  marginTop: "var(--space-sm)",
                  listStyle: "none",
                }}
              >
                <li>
                  Email : <strong>[EMAIL SUPPORT]</strong>
                </li>
                <li>
                  Adresse : <strong>[ADRESSE COMPLÈTE]</strong>
                </li>
              </ul>
            </section>
          </div>
        </div>

        {/* Footer avec note légale */}
        <div
          style={{
            textAlign: "center",
            padding: "var(--space-lg)",
            color: "var(--color-text-tertiary)",
            fontSize: "var(--font-size-xs)",
            fontStyle: "italic",
          }}
        >
          <p>
            Ces CGV sont conformes au droit français et à la réglementation
            européenne (RGPD).
          </p>
          <p style={{ marginTop: "var(--space-sm)" }}>
            Pour toute question, n'hésitez pas à nous contacter.
          </p>
        </div>
      </div>
    </div>
  );
}
