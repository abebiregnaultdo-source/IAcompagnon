import { useState } from "react";
import Logo from "./components/Logo";
import Button from "./components/Button";
import "../styles/resources.css";

export default function Resources({ onBack, initialPage = "home" }) {
  const [activePage, setActivePage] = useState(initialPage);

  const showPage = (pageId) => {
    setActivePage(pageId);
    window.scrollTo(0, 0);
  };

  // Si onBack n'est pas fourni, retourner à la page d'accueil des ressources
  const handleBack = onBack || (() => showPage("home"));

  return (
    <div className="resources-wrapper">
      {/* Navigation */}
      <nav className="resources-nav">
        <div className="resources-nav-content">
          <div onClick={handleBack} style={{ cursor: "pointer" }}>
            <Logo size={40} showText={true} />
          </div>
          <div className="resources-nav-links">
            <button
              className={`resources-nav-link ${activePage === "how-it-works" ? "active" : ""}`}
              onClick={() => showPage("how-it-works")}
            >
              Comment ça marche
            </button>
            <button
              className={`resources-nav-link ${activePage === "approaches" ? "active" : ""}`}
              onClick={() => showPage("approaches")}
            >
              Approches thérapeutiques
            </button>
            <button
              className={`resources-nav-link ${activePage === "faq" ? "active" : ""}`}
              onClick={() => showPage("faq")}
            >
              FAQ
            </button>
            <button
              className={`resources-nav-link ${activePage === "security" ? "active" : ""}`}
              onClick={() => showPage("security")}
            >
              Confidentialité
            </button>
          </div>
        </div>
      </nav>

      {/* Page d'accueil */}
      {activePage === "home" && (
        <section className="resources-page">
          <div className="resources-container">
            <div className="resources-header">
              <h1 className="resources-title">Ressources Helō</h1>
              <p className="resources-subtitle">
                Tout comprendre sur votre accompagnement thérapeutique numérique
              </p>
            </div>

            <div className="feature-grid">
              <div className="feature-item fade-in">
                <div className="feature-icon">📖</div>
                <h3>Comment ça marche</h3>
                <p>
                  Découvrez le fonctionnement d'Helō, de votre arrivée à votre
                  progression
                </p>
                <Button
                  variant="secondary"
                  onClick={() => showPage("how-it-works")}
                >
                  Explorer
                </Button>
              </div>

              <div className="feature-item fade-in">
                <div className="feature-icon">🧘</div>
                <h3>Approches thérapeutiques</h3>
                <p>
                  Les méthodes scientifiques qui fondent votre accompagnement
                </p>
                <Button
                  variant="secondary"
                  onClick={() => showPage("approaches")}
                >
                  Découvrir
                </Button>
              </div>

              <div className="feature-item fade-in">
                <div className="feature-icon">💭</div>
                <h3>Questions fréquentes</h3>
                <p>Réponses aux questions que vous vous posez sur Helō</p>
                <Button variant="secondary" onClick={() => showPage("faq")}>
                  Consulter
                </Button>
              </div>

              <div className="feature-item fade-in">
                <div className="feature-icon">🔒</div>
                <h3>Confidentialité et sécurité</h3>
                <p>Comment nous protégeons vos données et votre bien-être</p>
                <Button
                  variant="secondary"
                  onClick={() => showPage("security")}
                >
                  En savoir plus
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Page Comment ça marche */}
      {activePage === "how-it-works" && (
        <section className="resources-page">
          <div className="resources-container">
            <button
              className="resources-back-btn"
              onClick={() => showPage("home")}
            >
              ← Retour aux ressources
            </button>

            <div className="resources-header">
              <h1 className="resources-title">Comment ça marche</h1>
              <p className="resources-subtitle">
                Helō est un compagnon quotidien pour vivre votre deuil à votre
                rythme.
              </p>
            </div>

            {/* Ce que vous pouvez faire */}
            <div className="info-card fade-in">
              <h2>Ce que vous pouvez faire</h2>

              <h3>Écrire librement</h3>
              <p>
                Un journal guidé où poser vos pensées, sans structure imposée.
                Vos mots restent privés, toujours.
              </p>

              <h3>Trouver l'apaisement</h3>
              <p>
                Exercices de respiration, d'ancrage, de présence. Courts (2-5
                minutes), adaptés à votre état du moment.
              </p>

              <h3>Comprendre ce qui se passe</h3>
              <p>
                Repères sur le deuil : ce qui est normal, ce qui aide, ce qui ne
                sert à rien de forcer.
              </p>

              <h3>Être accompagné·e</h3>
              <p>
                Une présence douce, disponible 24/7, qui ne juge pas. Vous
                choisissez quand vous en avez besoin.
              </p>
            </div>

            {/* Comment l'app s'adapte à vous */}
            <div className="info-card fade-in">
              <h2>Comment l'app s'adapte à vous</h2>
              <p>
                Helō ne suit pas un programme fixe. L'app observe ce que vous
                exprimez et ajuste son accompagnement :
              </p>
              <ul>
                <li>Si vous êtes submergé·e → exercices d'ancrage doux</li>
                <li>
                  Si vous avez besoin de comprendre → informations claires
                </li>
                <li>Si vous voulez juste écrire → espace libre</li>
                <li>Si vous ne savez pas → proposition douce</li>
              </ul>

              <div
                className="protocol-card"
                style={{ marginTop: "var(--space-lg)" }}
              >
                <p
                  style={{
                    margin: 0,
                    textAlign: "center",
                    fontSize: "var(--font-size-lg)",
                  }}
                >
                  <strong>
                    Pas de pression. Pas d'objectifs. Juste un espace qui
                    respire avec vous.
                  </strong>
                </p>
              </div>
            </div>

            {/* Ce que Helō n'est pas */}
            <div className="info-card fade-in">
              <h2>Ce que Helō n'est pas</h2>
              <div className="negative-list">
                <div className="negative-item">
                  <div className="negative-item-icon">⊘</div>
                  <div className="negative-item-content">
                    <div className="negative-item-title">
                      Un remplacement à un thérapeute humain
                    </div>
                  </div>
                </div>
                <div className="negative-item">
                  <div className="negative-item-icon">⊘</div>
                  <div className="negative-item-content">
                    <div className="negative-item-title">
                      Une solution miracle qui "guérit" le deuil
                    </div>
                  </div>
                </div>
                <div className="negative-item">
                  <div className="negative-item-icon">⊘</div>
                  <div className="negative-item-content">
                    <div className="negative-item-title">
                      Un réseau social où partager publiquement
                    </div>
                  </div>
                </div>
                <div className="negative-item">
                  <div className="negative-item-icon">⊘</div>
                  <div className="negative-item-content">
                    <div className="negative-item-title">
                      Un outil de productivité avec objectifs et streaks
                    </div>
                  </div>
                </div>
              </div>
              <p style={{ marginTop: "var(--space-lg)" }}>
                Helō complète votre soutien existant. Si vous êtes en danger,
                contactez le <strong>3114</strong> (gratuit, 24/7).
              </p>
            </div>

            {/* Combien ça coûte */}
            <div className="info-card fade-in">
              <h2>Combien ça coûte ?</h2>

              <p>
                <strong>Gratuit pour commencer</strong> : accès complet aux
                outils de base.
              </p>

              <p>
                <strong>Version complète</strong> : [X€/mois] pour :
              </p>
              <ul>
                <li>Parcours personnalisé avancé</li>
                <li>Analyses de progression</li>
                <li>Contenu approfondi</li>
                <li>Aucune limite</li>
              </ul>

              <p style={{ marginTop: "var(--space-lg)" }}>
                Vous pouvez annuler à tout moment.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Page Approches thérapeutiques */}
      {activePage === "approaches" && (
        <section className="resources-page">
          <div className="resources-container">
            <button
              className="resources-back-btn"
              onClick={() => showPage("home")}
            >
              ← Retour aux ressources
            </button>

            <div className="resources-header">
              <h1 className="resources-title">Approches thérapeutiques</h1>
              <p className="resources-subtitle">
                Helō s'appuie sur des méthodes validées scientifiquement pour
                accompagner le deuil.
              </p>
            </div>

            {/* Les fondations scientifiques */}
            <div className="info-card fade-in">
              <h2>Les fondations scientifiques</h2>

              <h3>TIPI (Régulation sensorielle)</h3>
              <p>
                Réguler les émotions par la connexion aux sensations
                corporelles.
              </p>
              <p>
                <strong>Dans Helō :</strong>
              </p>
              <ul>
                <li>Ancrage corporel</li>
                <li>Scan corporel</li>
                <li>Régulation par la respiration</li>
              </ul>

              <h3>Logothérapie (Recherche de sens)</h3>
              <p>Retrouver du sens et un but après une perte significative.</p>
              <p>
                <strong>Dans Helō :</strong>
              </p>
              <ul>
                <li>Dialogue sur les valeurs</li>
                <li>Reconstruction identitaire</li>
                <li>Ritualisation</li>
              </ul>

              <h3>Théorie polyvagale (Sécurité interne)</h3>
              <p>
                Recréer un sentiment de sécurité interne par la régulation du
                système nerveux.
              </p>
              <p>
                <strong>Dans Helō :</strong>
              </p>
              <ul>
                <li>Exercices de co-régulation</li>
                <li>Ton vocal apaisant</li>
                <li>Environnement sécurisant</li>
              </ul>

              <h3>Pleine conscience</h3>
              <p>
                Développer la présence à l'instant et l'acceptation des
                émotions.
              </p>
              <p>
                <strong>Dans Helō :</strong>
              </p>
              <ul>
                <li>Exercices de présence (respiration, ancrage)</li>
                <li>Méditations guidées courtes</li>
                <li>Observation sans jugement</li>
              </ul>

              <h3>Thérapie narrative (Reconstruction)</h3>
              <p>
                Retravailler son histoire pour intégrer la perte de manière
                constructive.
              </p>
              <p>
                <strong>Dans Helō :</strong>
              </p>
              <ul>
                <li>Journal guidé pour raconter votre histoire</li>
                <li>Lettres symboliques (à la personne disparue)</li>
                <li>Rituels d'écriture</li>
              </ul>
            </div>

            {/* Comment Helō s'adapte à vous */}
            <div className="info-card fade-in">
              <h2>Comment Helō s'adapte à vous</h2>
              <p>
                Helō analyse votre message et active automatiquement le
                protocole le plus adapté.
              </p>

              <h3>🎯 Détection intelligente</h3>
              <p>
                Notre moteur évalue votre état émotionnel et choisit la
                meilleure réponse.
              </p>

              <h3>🔄 Adaptation en temps réel</h3>
              <p>
                Si un exercice ne convient pas, Helō propose autre chose
                immédiatement.
              </p>

              <h3>🧭 Mémoire de votre parcours</h3>
              <p>
                Helō se souvient de ce qui vous aide et adapte ses suggestions.
              </p>
            </div>

            {/* Les visages d'Helō */}
            <div className="info-card fade-in">
              <h2>Les visages d'Helō</h2>

              <h3>🌱 Le guide</h3>
              <p>
                Quand vous avez besoin d'exercices pratiques : respiration,
                ancrage, relaxation...
              </p>

              <h3>💙 L'écoutant</h3>
              <p>
                Quand vous avez besoin de parler : écoute active, validation,
                soutien...
              </p>

              <h3>🛡️ Le protecteur</h3>
              <p>
                En cas de crise : stabilisation immédiate, accès aux urgences...
              </p>

              <div
                className="protocol-card"
                style={{ marginTop: "var(--space-lg)" }}
              >
                <p
                  style={{
                    margin: 0,
                    textAlign: "center",
                    fontSize: "var(--font-size-lg)",
                  }}
                >
                  <strong>Prêt·e à converser avec Helō ?</strong>
                  <br />
                  Il n'y a rien à préparer. Arrivez comme vous êtes.
                </p>
              </div>
            </div>

            {/* Ce que nous évitons */}
            <div className="info-card fade-in">
              <h2>Ce que nous évitons</h2>
              <div className="negative-list">
                <div className="negative-item">
                  <div className="negative-item-icon">⊘</div>
                  <div className="negative-item-content">
                    <div className="negative-item-title">
                      Le modèle des "5 étapes"
                    </div>
                    <div className="negative-item-description">
                      (dépassé, culpabilisant, non-linéaire dans la réalité)
                    </div>
                  </div>
                </div>
                <div className="negative-item">
                  <div className="negative-item-icon">⊘</div>
                  <div className="negative-item-content">
                    <div className="negative-item-title">
                      L'injonction au "travail de deuil"
                    </div>
                    <div className="negative-item-description">
                      (pas une tâche à "accomplir")
                    </div>
                  </div>
                </div>
                <div className="negative-item">
                  <div className="negative-item-icon">⊘</div>
                  <div className="negative-item-content">
                    <div className="negative-item-title">
                      L'optimisme toxique
                    </div>
                    <div className="negative-item-description">
                      ("tout arrive pour une raison", "ça ira mieux")
                    </div>
                  </div>
                </div>
                <div className="negative-item">
                  <div className="negative-item-icon">⊘</div>
                  <div className="negative-item-content">
                    <div className="negative-item-title">
                      La médicalisation excessive
                    </div>
                    <div className="negative-item-description">
                      (le deuil n'est pas une maladie)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Limites importantes */}
            <div className="emergency-notice fade-in">
              <h3>Limites importantes</h3>
              <p>
                Helō est un outil d'accompagnement, pas un traitement médical.
              </p>
              <p>
                <strong>Consultez un professionnel si :</strong>
              </p>
              <ul style={{ textAlign: "left", marginTop: "var(--space-md)" }}>
                <li>
                  Pensées suicidaires persistantes → <strong>3114</strong>{" "}
                  (immédiat)
                </li>
                <li>
                  Incapacité à fonctionner au quotidien depuis plusieurs mois
                </li>
                <li>Abus de substances pour gérer la douleur</li>
                <li>Dissociation ou déréalisation prolongée</li>
              </ul>
              <p
                style={{
                  marginTop: "var(--space-lg)",
                  fontWeight: "var(--font-weight-semibold)",
                }}
              >
                Helō peut accompagner une thérapie, jamais la remplacer.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Page FAQ */}
      {activePage === "faq" && (
        <section className="resources-page">
          <div className="resources-container">
            <button
              className="resources-back-btn"
              onClick={() => showPage("home")}
            >
              ← Retour aux ressources
            </button>

            <div className="resources-header">
              <h1 className="resources-title">Questions fréquentes</h1>
              <p className="resources-subtitle">
                Les réponses aux questions que vous vous posez sur Helō
              </p>
            </div>

            {/* Général */}
            <div className="faq-section fade-in">
              <h2 className="faq-section-title">Général</h2>

              <div className="faq-item">
                <h3 className="faq-question">Qu'est-ce que Helō ?</h3>
                <div className="faq-answer">
                  <p>
                    Helō est une application d'accompagnement dans le deuil. Un
                    espace sûr pour écrire, comprendre ce que vous vivez, et
                    trouver l'apaisement quand vous en avez besoin.
                  </p>
                </div>
              </div>

              <div className="faq-item">
                <h3 className="faq-question">
                  Helō remplace-t-il un thérapeute ?
                </h3>
                <div className="faq-answer">
                  <p>
                    Non. Helō complète votre soutien existant (thérapeute,
                    proches, groupes de parole). C'est un compagnon disponible
                    24/7, entre les séances.
                  </p>
                </div>
              </div>

              <div className="faq-item">
                <h3 className="faq-question">Pour qui est fait Helō ?</h3>
                <div className="faq-answer">
                  <p>Pour toute personne qui traverse un deuil :</p>
                  <ul>
                    <li>
                      Perte d'un proche (parent, enfant, conjoint, ami...)
                    </li>
                    <li>Deuil récent ou ancien</li>
                    <li>Deuil "compliqué" ou "normal"</li>
                  </ul>
                  <p>Helō n'est pas réservé à un type de deuil spécifique.</p>
                </div>
              </div>

              <div className="faq-item">
                <h3 className="faq-question">
                  Je ne sais pas si j'en ai besoin. Comment savoir ?
                </h3>
                <div className="faq-answer">
                  <p>
                    Si vous vous posez la question, essayez. Helō est gratuit
                    pour commencer. Vous verrez si ça vous apporte quelque
                    chose.
                  </p>
                  <p>Il n'y a pas de "seuil" pour mériter de l'aide.</p>
                </div>
              </div>
            </div>

            {/* Utilisation */}
            <div className="faq-section fade-in">
              <h2 className="faq-section-title">Utilisation</h2>

              <div className="faq-item">
                <h3 className="faq-question">
                  Combien de temps par jour faut-il utiliser Helō ?
                </h3>
                <div className="faq-answer">
                  <p>
                    Aucune durée imposée. Certains ouvrent l'app 2 minutes pour
                    respirer. D'autres écrivent 30 minutes dans leur journal.
                    C'est vous qui choisissez.
                  </p>
                </div>
              </div>

              <div className="faq-item">
                <h3 className="faq-question">
                  Dois-je utiliser Helō tous les jours ?
                </h3>
                <div className="faq-answer">
                  <p>
                    Non. Utilisez-le quand vous en ressentez le besoin. Pas de
                    streaks, pas d'objectifs quotidiens. Le deuil n'est pas une
                    routine à optimiser.
                  </p>
                </div>
              </div>

              <div className="faq-item">
                <h3 className="faq-question">
                  Que faire si je ne sais pas par où commencer ?
                </h3>
                <div className="faq-answer">
                  <p>Helō vous propose 3 entrées simples :</p>
                  <ul>
                    <li>Écrire ce que vous ressentez</li>
                    <li>Respirer quelques instants</li>
                    <li>Comprendre le deuil</li>
                  </ul>
                  <p>Choisissez ce qui vous appelle. Le reste viendra.</p>
                </div>
              </div>

              <div className="faq-item">
                <h3 className="faq-question">
                  L'IA va-t-elle me dire quoi faire ?
                </h3>
                <div className="faq-answer">
                  <p>
                    Non. L'IA propose, jamais impose. Vous gardez toujours le
                    contrôle. Si une proposition ne vous convient pas, vous
                    pouvez :
                  </p>
                  <ul>
                    <li>La refuser</li>
                    <li>Demander autre chose</li>
                    <li>Juste écrire librement</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Sécurité et confidentialité */}
            <div className="faq-section fade-in">
              <h2 className="faq-section-title">Sécurité et confidentialité</h2>

              <div className="faq-item">
                <h3 className="faq-question">
                  Mes écrits sont-ils vraiment privés ?
                </h3>
                <div className="faq-answer">
                  <p>
                    Oui. Chiffrés, accessibles uniquement par vous. Même
                    l'équipe Helō ne peut pas les lire.
                  </p>
                </div>
              </div>

              <div className="faq-item">
                <h3 className="faq-question">
                  Que se passe-t-il si j'exprime des pensées suicidaires ?
                </h3>
                <div className="faq-answer">
                  <p>
                    Helō vous rappellera immédiatement les ressources d'urgence
                    (3114, numéro gratuit 24/7).
                  </p>
                  <p>
                    Nous ne pouvons pas intervenir directement car nous ne
                    sommes pas un service d'urgence.
                  </p>
                  <p>En cas de danger immédiat, appelez le 3114 ou le 15.</p>
                </div>
              </div>

              <div className="faq-item">
                <h3 className="faq-question">
                  Puis-je supprimer des choses que j'ai écrites ?
                </h3>
                <div className="faq-answer">
                  <p>
                    Oui. À tout moment. Chaque entrée de journal peut être
                    modifiée ou supprimée.
                  </p>
                </div>
              </div>
            </div>

            {/* Tarifs et abonnement */}
            <div className="faq-section fade-in">
              <h2 className="faq-section-title">Tarifs et abonnement</h2>

              <div className="faq-item">
                <h3 className="faq-question">Combien ça coûte ?</h3>
                <div className="faq-answer">
                  <p>
                    <strong>Gratuit pour commencer</strong> : accès aux outils
                    de base.
                    <br />
                    <strong>Version complète</strong> : [X€/mois] pour accès
                    illimité.
                  </p>
                  <p>Pas de frais cachés. Pas d'engagement.</p>
                </div>
              </div>

              <div className="faq-item">
                <h3 className="faq-question">
                  Puis-je essayer avant de payer ?
                </h3>
                <div className="faq-answer">
                  <p>
                    Oui. La version gratuite est fonctionnelle, pas juste un
                    "teaser".
                  </p>
                  <p>
                    Vous pouvez rester en gratuit aussi longtemps que vous
                    voulez.
                  </p>
                </div>
              </div>

              <div className="faq-item">
                <h3 className="faq-question">
                  Comment annuler mon abonnement ?
                </h3>
                <div className="faq-answer">
                  <p>
                    Directement dans les réglages de l'app, ou en nous écrivant
                    : support@helo-app.com
                  </p>
                  <p>Pas de pénalités. Pas de questions posées.</p>
                </div>
              </div>

              <div className="faq-item">
                <h3 className="faq-question">
                  Que se passe-t-il si j'annule ?
                </h3>
                <div className="faq-answer">
                  <p>
                    Vous gardez accès à la version gratuite. Vos données restent
                    intactes.
                  </p>
                </div>
              </div>
            </div>

            {/* Efficacité et résultats */}
            <div className="faq-section fade-in">
              <h2 className="faq-section-title">Efficacité et résultats</h2>

              <div className="faq-item">
                <h3 className="faq-question">
                  Est-ce que ça marche vraiment ?
                </h3>
                <div className="faq-answer">
                  <p>
                    Helō s'appuie sur des approches thérapeutiques validées
                    (TCC, ACT, thérapie narrative).
                  </p>
                  <p>
                    Mais chaque deuil est unique. Certains trouvent un
                    soulagement immédiat. D'autres ont besoin de temps.
                  </p>
                  <p>
                    Helō n'est pas une solution miracle. C'est un outil parmi
                    d'autres.
                  </p>
                </div>
              </div>

              <div className="faq-item">
                <h3 className="faq-question">
                  Combien de temps avant de "voir des résultats" ?
                </h3>
                <div className="faq-answer">
                  <p>
                    Le deuil n'a pas de timeline. Certains ressentent un
                    apaisement dès la première utilisation. D'autres prennent
                    des semaines.
                  </p>
                  <p>
                    Helō ne promet pas de "résultats". Il offre un espace, un
                    accompagnement. Le reste vous appartient.
                  </p>
                </div>
              </div>

              <div className="faq-item">
                <h3 className="faq-question">Et si ça ne m'aide pas ?</h3>
                <div className="faq-answer">
                  <p>
                    C'est possible. Helō ne convient pas à tout le monde. Si
                    après quelques essais ça ne résonne pas, n'hésitez pas à
                    chercher d'autres formes de soutien (thérapeute, groupe de
                    parole, etc.).
                  </p>
                  <p>Pas de honte à ça.</p>
                </div>
              </div>
            </div>

            {/* Support et contact */}
            <div className="faq-section fade-in">
              <h2 className="faq-section-title">Support et contact</h2>

              <div className="faq-item">
                <h3 className="faq-question">
                  J'ai un problème technique. Qui contacter ?
                </h3>
                <div className="faq-answer">
                  <p>
                    support@helo-app.com
                    <br />
                    Réponse sous 24-48h (jours ouvrés).
                  </p>
                </div>
              </div>

              <div className="faq-item">
                <h3 className="faq-question">
                  J'ai une suggestion pour améliorer Helō.
                </h3>
                <div className="faq-answer">
                  <p>
                    Nous sommes preneurs !<br />
                    Écrivez-nous : feedback@helo-app.com
                  </p>
                </div>
              </div>

              <div className="faq-item">
                <h3 className="faq-question">Puis-je parler à un humain ?</h3>
                <div className="faq-answer">
                  <p>
                    Oui. Nous ne sommes pas un chatbot anonyme. Une vraie équipe
                    répond à vos messages.
                  </p>
                </div>
              </div>
            </div>

            {/* Autres questions */}
            <div className="info-card fade-in">
              <h2>Autres questions ?</h2>
              <p>
                Si votre question n'est pas ici, écrivez-nous :{" "}
                <strong>support@helo-app.com</strong>
              </p>
              <p>Nous complétons cette FAQ régulièrement.</p>
            </div>
          </div>
        </section>
      )}

      {/* Page Confidentialité et sécurité */}
      {activePage === "security" && (
        <section className="resources-page">
          <div className="resources-container">
            <button
              className="resources-back-btn"
              onClick={() => showPage("home")}
            >
              ← Retour aux ressources
            </button>

            <div className="resources-header">
              <h1 className="resources-title">Confidentialité et sécurité</h1>
              <p className="resources-subtitle">
                Votre deuil vous appartient. Vos données aussi.
              </p>
            </div>

            {/* Ce que nous collectons */}
            <div className="info-card fade-in">
              <h2>Ce que nous collectons</h2>

              <h3>Données obligatoires (minimum)</h3>
              <ul>
                <li>Adresse email (pour votre compte)</li>
                <li>
                  Hachage de mot de passe (jamais le mot de passe en clair)
                </li>
              </ul>

              <h3>Données optionnelles (que vous choisissez)</h3>
              <ul>
                <li>Prénom (pour personnaliser l'expérience)</li>
                <li>Date de la perte (pour contexte temporel)</li>
                <li>Type de relation (parent, conjoint, ami...)</li>
              </ul>

              <h3>Données générées par l'utilisation</h3>
              <ul>
                <li>Ce que vous écrivez dans le journal</li>
                <li>Les exercices que vous utilisez</li>
                <li>Votre rythme d'utilisation</li>
                <li>Vos préférences d'accompagnement</li>
              </ul>

              <div className="security-never">
                <p>
                  <strong>Nous ne collectons jamais :</strong>
                </p>
                <ul>
                  <li>❌ Données bancaires (paiements via Stripe sécurisé)</li>
                  <li>❌ Contacts de votre téléphone</li>
                  <li>❌ Localisation précise</li>
                  <li>❌ Données d'autres apps</li>
                </ul>
              </div>
            </div>

            {/* Comment nous protégeons vos données */}
            <div className="info-card fade-in">
              <h2>Comment nous protégeons vos données</h2>

              <h3>Chiffrement</h3>
              <ul>
                <li>Toutes les données en transit : TLS 1.3</li>
                <li>Toutes les données au repos : AES-256</li>
                <li>Vos écrits sont chiffrés côté serveur</li>
              </ul>

              <h3>Stockage</h3>
              <ul>
                <li>Serveurs en Europe (RGPD)</li>
                <li>Hébergement certifié ISO 27001</li>
                <li>Sauvegardes chiffrées quotidiennes</li>
              </ul>

              <h3>Accès</h3>
              <ul>
                <li>Seul vous avez accès à vos écrits</li>
                <li>Aucun employé ne peut lire votre journal</li>
                <li>L'IA traite vos messages de manière chiffrée</li>
                <li>Logs anonymisés pour améliorer l'app</li>
              </ul>

              <div
                className="protocol-card"
                style={{ marginTop: "var(--space-lg)" }}
              >
                <h3>IA et confidentialité</h3>
                <p>
                  L'IA d'accompagnement traite vos messages en temps réel mais{" "}
                  <strong>ne stocke pas</strong> l'historique complet de vos
                  écrits pour entraîner d'autres modèles.
                </p>
                <p>Vos données restent les vôtres.</p>
              </div>
            </div>

            {/* Vos droits (RGPD) */}
            <div className="info-card fade-in">
              <h2>Vos droits (RGPD)</h2>

              <h3>Vous pouvez toujours :</h3>
              <ul>
                <li>✅ Consulter toutes vos données</li>
                <li>✅ Exporter vos écrits (format JSON, PDF)</li>
                <li>
                  ✅ Supprimer votre compte (suppression définitive sous 30
                  jours)
                </li>
                <li>✅ Corriger des informations erronées</li>
                <li>✅ Retirer votre consentement</li>
              </ul>

              <p style={{ marginTop: "var(--space-lg)" }}>
                <strong>Pour exercer vos droits :</strong> support@helo-app.com
              </p>
            </div>

            {/* Ce que nous ne faisons JAMAIS */}
            <div className="info-card fade-in">
              <h2>Ce que nous ne faisons JAMAIS</h2>
              <div className="negative-list">
                <div className="negative-item">
                  <div className="negative-item-icon">⊘</div>
                  <div className="negative-item-content">
                    <div className="negative-item-title">
                      Vendre vos données à des tiers
                    </div>
                  </div>
                </div>
                <div className="negative-item">
                  <div className="negative-item-icon">⊘</div>
                  <div className="negative-item-content">
                    <div className="negative-item-title">
                      Partager vos écrits sans votre accord explicite
                    </div>
                  </div>
                </div>
                <div className="negative-item">
                  <div className="negative-item-icon">⊘</div>
                  <div className="negative-item-content">
                    <div className="negative-item-title">
                      Utiliser vos données pour de la publicité ciblée
                    </div>
                  </div>
                </div>
                <div className="negative-item">
                  <div className="negative-item-icon">⊘</div>
                  <div className="negative-item-content">
                    <div className="negative-item-title">
                      Transmettre à des assurances, employeurs, etc.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Exceptions légales */}
            <div className="protocol-card fade-in">
              <h3>Exceptions légales (transparence)</h3>
              <p>
                Nous pouvons être contraints de transmettre des données si
                requis par la justice (mandat, réquisition).
              </p>
              <p>
                <strong>En cas de danger imminent pour vous ou autrui,</strong>
                nous pouvons contacter les services d'urgence. Cela reste
                exceptionnel et proportionné.
              </p>
            </div>

            {/* Questions fréquentes sur la sécurité */}
            <div className="faq-section fade-in">
              <h2 className="faq-section-title">Questions fréquentes</h2>

              <div className="faq-item">
                <h3 className="faq-question">Qui peut voir mes écrits ?</h3>
                <div className="faq-answer">
                  <p>Personne. Même pas nous.</p>
                </div>
              </div>

              <div className="faq-item">
                <h3 className="faq-question">
                  L'IA se "souvient" de tout ce que je dis ?
                </h3>
                <div className="faq-answer">
                  <p>
                    L'IA a accès au contexte récent (derniers échanges) pour
                    maintenir la cohérence. Mais nous ne conservons pas
                    d'historique complet pour entraîner d'autres modèles.
                  </p>
                </div>
              </div>

              <div className="faq-item">
                <h3 className="faq-question">
                  Si je supprime mon compte, tout disparaît ?
                </h3>
                <div className="faq-answer">
                  <p>
                    Oui. Suppression définitive sous 30 jours. Avant ça, vous
                    pouvez exporter vos données.
                  </p>
                </div>
              </div>

              <div className="faq-item">
                <h3 className="faq-question">Helō utilise des cookies ?</h3>
                <div className="faq-answer">
                  <p>
                    Uniquement essentiels (session, préférences). Pas de
                    tracking publicitaire.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="info-card fade-in">
              <p
                style={{ textAlign: "center", marginBottom: "var(--space-sm)" }}
              >
                <strong>Dernière mise à jour :</strong> Janvier 2025
              </p>
              <p style={{ textAlign: "center" }}>
                Pour toute question : <strong>privacy@helo-app.com</strong>
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
