import { useState, useEffect } from "react";
import Logo from "./components/Logo";
import Button from "./components/Button";
import Text from "./components/Text";
import Panel from "./components/Panel";
import { useDeviceDetection } from "../hooks/useDeviceDetection";

/**
 * Page Créativité - Outils d'expression thérapeutique
 * Journal guidé, narratifs, poèmes, rituels
 *
 * HYPERPERSONNALISATION: Analyse en temps réel du contexte utilisateur
 * pour générer des prompts et suggestions personnalisées
 */
export default function Creativity({ user, api, onBackToHome }) {
  const [activeTab, setActiveTab] = useState("journal");
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [currentContent, setCurrentContent] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");
  const [showIntro, setShowIntro] = useState(true);
  const [showPortfolio, setShowPortfolio] = useState(false);

  // Hyperpersonnalisation
  const [guidedPrompts, setGuidedPrompts] = useState([]);
  const [personalizedContext, setPersonalizedContext] = useState("");
  const [detectedMethod, setDetectedMethod] = useState(null);
  const [detectionConfidence, setDetectionConfidence] = useState(0);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  useEffect(() => {
    loadCreations();
  }, [user.id]);

  const loadCreations = async () => {
    try {
      const response = await fetch(`${api.base}/api/creations/${user.id}`);
      const data = await response.json();
      setCreations(data.creations || []);
      setLoading(false);
    } catch (error) {
      console.error("Erreur chargement créations:", error);
      setLoading(false);
    }
  };

  /**
   * Récupère les dernières entrées de journal pour contexte historique
   */
  const getRecentJournalEntries = async () => {
    try {
      const response = await fetch(
        `${api.base}/api/recent-entries/${user.id}?limit=5`,
      );
      const data = await response.json();
      return data.entries || [];
    } catch (error) {
      console.error("Erreur chargement historique:", error);
      return [];
    }
  };

  /**
   * Analyse le contexte du message en temps réel
   * Appelle /api/analyze-context pour obtenir les prompts personnalisés
   */
  const getPersonalizedPrompt = async (message) => {
    if (!message || message.length < 30) {
      // Pas assez de contenu pour analyser
      return null;
    }

    setAnalysisLoading(true);
    try {
      const recentEntries = await getRecentJournalEntries();

      const response = await fetch(`${api.base}/api/analyze-context`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          current_message: message,
          tool: activeTab,
          conversation_history: recentEntries,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          recommended_prompts: data.recommended_prompts || [],
          personalization_context: data.personalization_context || "",
          detected_method: data.detected_method,
          variation: data.variation,
          confidence: data.confidence,
        };
      }
    } catch (error) {
      console.error("Erreur analyse contextuelle:", error);
    } finally {
      setAnalysisLoading(false);
    }

    return null;
  };

  /**
   * Analyse et guide en temps réel quand l'utilisateur tape
   * Debounced pour ne pas surcharger l'API
   */
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (showEditor && currentContent) {
        const guidance = await getPersonalizedPrompt(currentContent);
        if (guidance) {
          setGuidedPrompts(guidance.recommended_prompts || []);
          setPersonalizedContext(guidance.personalization_context || "");
          setDetectedMethod(guidance.detected_method);
          setDetectionConfidence(guidance.confidence || 0);
        }
      }
    }, 1000); // Attendre 1s après la dernière saisie

    return () => clearTimeout(timer);
  }, [showEditor, currentContent, activeTab]);

  const saveCreation = async () => {
    if (!currentContent.trim()) return;

    try {
      let endpoint = "";
      let body = {};

      switch (activeTab) {
        case "journal":
          endpoint = "/api/creations/journal";
          body = {
            user_id: user.id,
            content: currentContent,
            prompt: currentTitle || "Entrée libre",
          };
          break;
        case "narrative":
          endpoint = "/api/creations/narrative";
          body = {
            user_id: user.id,
            title: currentTitle || "Sans titre",
            content: currentContent,
            narrative_type: "reconstruction_temporelle",
          };
          break;
        case "poem":
          endpoint = "/api/creations/poem";
          body = {
            user_id: user.id,
            title: currentTitle || "Sans titre",
            content: currentContent,
          };
          break;
        case "ritual":
          endpoint = "/api/creations/ritual";
          body = {
            user_id: user.id,
            title: currentTitle || "Sans titre",
            description: currentContent,
            frequency: "ponctuel",
          };
          break;
      }

      const response = await fetch(api.base + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setCurrentContent("");
        setCurrentTitle("");
        setShowEditor(false);
        loadCreations();
      }
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
    }
  };

  const tabs = [
    { id: "journal", label: "Journal", description: "Écrire librement" },
    {
      id: "narrative",
      label: "Narratif",
      description: "Raconter votre histoire",
    },
    { id: "poem", label: "Poème", description: "Expression poétique" },
    {
      id: "ritual",
      label: "Rituel",
      description: "Créer un rituel d'écriture",
    },
    { id: "coloring", label: "Coloriage", description: "Méditation active" },
  ];

  const filteredCreations = creations.filter((c) => c.type === activeTab);

  // Lazy import to avoid circular dependencies
  const CreativeSpaceIntro =
    require("./creativity/CreativeSpaceIntro.jsx").default;
  const ColoringCanvas = require("./creativity/ColoringCanvas.jsx").default;
  const Portfolio = require("./creativity/Portfolio.jsx").default;
  const device = useDeviceDetection();

  if (showIntro) {
    return (
      <div
        className="creativity-container"
        style={{
          padding: device.isMobile ? "var(--space-md)" : "var(--space-xl)",
        }}
      >
        <div
          className="creativity-inner"
          style={{ maxWidth: device.isDesktop ? "1100px" : "900px" }}
        >
          <div className="creativity-header">
            <button
              onClick={() => {
                setShowIntro(false);
                onBackToHome && onBackToHome();
              }}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "24px",
                padding: "0",
                color: "var(--color-primary)",
              }}
              aria-label="Retour"
            >
              ←
            </button>
            <div>
              <Text as="h1" size="lg">
                Créativité
              </Text>
              <Text size="sm" color="secondary">
                Explorez vos formes d'expression
              </Text>
            </div>
          </div>
          <CreativeSpaceIntro
            api={api}
            onOpenTool={(key) => {
              setShowIntro(false);
              if (key === "coloring") {
                setActiveTab("coloring");
                setShowEditor(false);
              } else {
                const tab =
                  key === "poem"
                    ? "poem"
                    : key === "ritual"
                      ? "ritual"
                      : "journal";
                setActiveTab(tab);
                setShowEditor(true);
              }
            }}
            onOpenPortfolio={() => {
              setShowIntro(false);
              setShowPortfolio(true);
            }}
          />
        </div>
      </div>
    );
  }

  if (showPortfolio) {
    return (
      <div
        className="creativity-container"
        style={{
          padding: device.isMobile ? "var(--space-md)" : "var(--space-xl)",
        }}
      >
        <div
          className="creativity-inner"
          style={{ maxWidth: device.isDesktop ? "1100px" : "900px" }}
        >
          <div className="creativity-header">
            <button
              onClick={() => {
                setShowPortfolio(false);
                onBackToHome && onBackToHome();
              }}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "24px",
                padding: "0",
                color: "var(--color-primary)",
              }}
              aria-label="Retour"
            >
              ←
            </button>
            <div>
              <Text as="h1" size="lg">
                Mon portfolio
              </Text>
              <Text size="sm" color="secondary">
                Vos créations sauvegardées
              </Text>
            </div>
          </div>
          <Portfolio user={user} api={api} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="creativity-container"
      style={{
        padding: device.isMobile ? "var(--space-md)" : "var(--space-xl)",
      }}
    >
      <div
        className="creativity-inner"
        style={{ maxWidth: device.isDesktop ? "1100px" : "900px" }}
      >
        {/* Header with back button */}
        <div className="creativity-header">
          <button
            onClick={onBackToHome}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "24px",
              padding: "0",
              color: "var(--color-primary)",
              minWidth: "24px",
            }}
            aria-label="Retour"
          >
            ←
          </button>
          <div>
            <Text as="h1" size="lg">
              Créativité
            </Text>
            <Text size="sm" color="secondary">
              Outils d'expression pour votre parcours
            </Text>
          </div>
        </div>

        {/* Tabs */}
        {(() => {
          const tabsForComponent = tabs.map((t) => ({
            key: t.id,
            label: (
              <>
                <div>{t.label}</div>
                <div style={{ fontSize: "var(--font-size-xs)", opacity: 0.8 }}>
                  {t.description}
                </div>
              </>
            ),
            content: null,
          }));

          return (
            <Panel style={{ marginBottom: "var(--space-xl)" }}>
              {/* Use Tabs component to render header; content handled below */}
              <div>
                {/* Render tab headers */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <div style={{ width: "100%" }}>
                    {/* Tabs header */}
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      {tabsForComponent.map((t) => (
                        <button
                          key={t.key}
                          onClick={() => {
                            setActiveTab(t.key);
                            setShowEditor(false);
                          }}
                          style={{
                            margin: "0 6px",
                            padding: device.isMobile
                              ? "var(--space-sm) var(--space-md)"
                              : "var(--space-md) var(--space-lg)",
                            borderRadius: "var(--radius-md)",
                            border:
                              activeTab === t.key
                                ? "2px solid var(--color-primary)"
                                : "1px solid var(--color-border)",
                            background:
                              activeTab === t.key
                                ? "var(--color-accent-calm)"
                                : "var(--color-surface-1)",
                            color:
                              activeTab === t.key
                                ? "var(--color-primary)"
                                : "var(--color-text-secondary)",
                            fontSize: device.isMobile
                              ? "var(--font-size-xs)"
                              : "var(--font-size-sm)",
                            fontWeight:
                              activeTab === t.key
                                ? "var(--font-weight-medium)"
                                : "normal",
                            cursor: "pointer",
                            transition: "var(--transition-fast)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "var(--space-xs)",
                            width: device.isMobile ? "100%" : "auto",
                          }}
                        >
                          <div>{t.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Panel>
          );
        })()}

        {/* Bouton nouvelle création */}
        {!showEditor && (
          <div style={{ marginBottom: "var(--space-xl)", textAlign: "center" }}>
            <Button
              onClick={() => setShowEditor(true)}
              style={{
                fontSize: "var(--font-size-md)",
                padding: "var(--space-md) var(--space-2xl)",
              }}
            >
              Nouvelle création
            </Button>
          </div>
        )}

        {/* Éditeur ou Coloriage */}
        {showEditor && activeTab !== "coloring" && (
          <Panel style={{ marginBottom: "var(--space-xl)" }}>
            <Text as="h2" size="md">
              {tabs.find((t) => t.id === activeTab)?.label}
            </Text>

            {/* Contexte personnalisé (Hyperpersonnalisation) */}
            {personalizedContext && (
              <div className="creativity-personalized">
                <div
                  style={{
                    fontWeight: "var(--font-weight-medium)",
                    marginBottom: "var(--space-xs)",
                  }}
                >
                  💡{" "}
                  {detectedMethod
                    ? `Détecté: ${detectedMethod}`
                    : "Analyse en cours..."}
                  {detectionConfidence > 0 &&
                    ` (${Math.round(detectionConfidence * 100)}% de confiance)`}
                </div>
                <div>{personalizedContext}</div>
              </div>
            )}

            <input
              type="text"
              className="input creativity-input"
              placeholder="Titre (optionnel)"
              value={currentTitle}
              onChange={(e) => setCurrentTitle(e.target.value)}
            />

            <textarea
              className="creativity-textarea"
              placeholder="Écrivez ici..."
              value={currentContent}
              onChange={(e) => setCurrentContent(e.target.value)}
            />

            {/* Suggestions guidées personnalisées */}
            {guidedPrompts.length > 0 && (
              <div
                style={{
                  marginTop: "var(--space-md)",
                  marginBottom: "var(--space-md)",
                }}
              >
                <p
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-text-secondary)",
                    marginBottom: "var(--space-sm)",
                    fontWeight: "var(--font-weight-medium)",
                  }}
                >
                  ✨ Suggestions basées sur ce que vous écrivez :
                </p>
                <div className="creativity-suggestions">
                  {guidedPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      className="creativity-suggestion"
                      onClick={() => {
                        const newContent = currentContent
                          ? currentContent + "\n\n" + prompt
                          : prompt;
                        setCurrentContent(newContent);
                      }}
                    >
                      💬 {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {analysisLoading && !personalizedContext && (
              <div
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--color-text-tertiary)",
                  marginTop: "var(--space-sm)",
                  fontStyle: "italic",
                }}
              >
                🔍 Analyse de votre contexte en cours...
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: "var(--space-md)",
                marginTop: "var(--space-lg)",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => {
                  setShowEditor(false);
                  setCurrentContent("");
                  setCurrentTitle("");
                  setGuidedPrompts([]);
                  setPersonalizedContext("");
                }}
                style={{
                  padding: "var(--space-sm) var(--space-lg)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  background: "transparent",
                  color: "var(--color-text-secondary)",
                  cursor: "pointer",
                  fontSize: "var(--font-size-sm)",
                }}
              >
                Annuler
              </button>
              <Button onClick={saveCreation}>Sauvegarder</Button>
            </div>
          </Panel>
        )}

        {activeTab === "coloring" && (
          <div style={{ marginBottom: "var(--space-xl)" }}>
            <ColoringCanvas
              user={user}
              api={api}
              onSaved={() => {
                setShowEditor(false);
                loadCreations();
              }}
            />
          </div>
        )}

        {/* Liste des créations */}
        <div>
          <Text as="h2" size="md">
            Vos créations
          </Text>

          {loading ? (
            <div className="creativity-loading">Chargement...</div>
          ) : filteredCreations.length > 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-md)",
              }}
            >
              {filteredCreations.map((creation) => (
                <Panel key={creation.id} style={{ padding: "var(--space-lg)" }}>
                  <div className="creation-header-row">
                    <Text as="h3" size="md">
                      {creation.title || "Sans titre"}
                    </Text>
                    <Text size="sm" color="secondary">
                      {new Date(creation.created_at).toLocaleDateString(
                        "fr-FR",
                      )}
                    </Text>
                  </div>
                  <Text as="p" size="sm" color="secondary">
                    {creation.content?.substring(0, 200)}
                    {creation.content?.length > 200 && "..."}
                  </Text>
                </Panel>
              ))}
            </div>
          ) : (
            <div className="creativity-empty">
              Aucune création pour le moment. Commencez par créer quelque chose
              !
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
