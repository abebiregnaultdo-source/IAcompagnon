import { useState, useEffect } from "react";
import Logo from "./components/Logo";
import Button from "./components/Button";
import Text from "./components/Text";
import Panel from "./components/Panel";
import { useDeviceDetection } from "../hooks/useDeviceDetection";
import CreativeSpaceIntro from "./creativity/CreativeSpaceIntro";
import ColoringCanvas from "./creativity/ColoringCanvas";
import Portfolio from "./creativity/Portfolio";

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

  // Prompts d'inspiration initiaux (générés par IA au chargement)
  const [initialPrompts, setInitialPrompts] = useState([]);
  const [initialPromptsLoading, setInitialPromptsLoading] = useState(false);

  useEffect(() => {
    loadCreations();
  }, [user.id]);

  /**
   * Charge des prompts d'inspiration initiaux quand l'éditeur s'ouvre
   * Basés sur l'outil choisi et l'historique de l'utilisateur
   */
  const loadInitialPrompts = async (tool) => {
    setInitialPromptsLoading(true);
    try {
      const response = await fetch(`${api.base}/api/creative/prompts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          tool: tool,
          first_name: user.first_name,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setInitialPrompts(data.prompts || []);
      } else {
        // Fallback prompts selon l'outil
        setInitialPrompts(getDefaultPrompts(tool));
      }
    } catch (error) {
      console.error("Erreur chargement prompts:", error);
      setInitialPrompts(getDefaultPrompts(tool));
    } finally {
      setInitialPromptsLoading(false);
    }
  };

  /**
   * Prompts par défaut si le backend n'est pas disponible
   */
  const getDefaultPrompts = (tool) => {
    const prompts = {
      journal: [
        "Comment vous sentez-vous en ce moment, vraiment ?",
        "Qu'est-ce qui vous a marqué aujourd'hui ?",
        "Si vous pouviez parler à quelqu'un qui vous manque, que lui diriez-vous ?",
        "Quelle petite chose vous a apporté un peu de réconfort récemment ?",
        "Qu'est-ce que vous portez en vous que vous aimeriez déposer ici ?",
      ],
      narrative: [
        "Racontez un souvenir qui vous revient souvent...",
        "Décrivez un moment où vous vous êtes senti(e) compris(e)...",
        "Qu'est-ce que cette personne vous a appris de plus précieux ?",
        "Si vous deviez écrire une lettre à vous-même d'il y a un an...",
        "Quel chapitre de votre histoire êtes-vous en train d'écrire ?",
      ],
      creative: [
        "La lumière ce matin ressemblait à...",
        "Je porte en moi un silence qui...",
        "Si ma douleur avait une couleur, elle serait...",
        "Il y a des mots que je n'ai jamais dit, comme...",
        "Dans mes rêves, je retrouve parfois...",
      ],
      poem: [
        "La lumière ce matin ressemblait à...",
        "Je porte en moi un silence qui...",
        "Si ma douleur avait une couleur, elle serait...",
        "Il y a des mots que je n'ai jamais dit, comme...",
        "Dans mes rêves, je retrouve parfois...",
      ],
    };
    return prompts[tool] || prompts.journal;
  };

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
        case "creative":
          // Création artistique (poème par défaut)
          endpoint = "/api/creations/poem";
          body = {
            user_id: user.id,
            title: currentTitle || "Sans titre",
            content: currentContent,
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
    { id: "journal", label: "📝 Journal", description: "Écriture libre quotidienne" },
    { id: "narrative", label: "📖 Récit", description: "Raconter votre histoire" },
    { id: "creative", label: "🎨 Création artistique", description: "Poème, coloriage, expression visuelle" },
  ];

  const filteredCreations = creations.filter((c) => {
    if (activeTab === "creative") {
      // L'onglet "Création artistique" regroupe poem, ritual, coloring
      return ["poem", "ritual", "coloring"].includes(c.type);
    }
    return c.type === activeTab;
  });
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
                    ? "creative"
                    : key === "ritual"
                      ? "narrative"
                      : "journal";
                setActiveTab(tab);
                setShowEditor(true);
                // Ne pas charger les prompts automatiquement - l'utilisateur choisit
                setInitialPrompts([]);
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
              onClick={() => {
                setShowEditor(true);
                // Ne pas charger les prompts automatiquement - l'utilisateur choisit
                setInitialPrompts([]);
              }}
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

            {/* Message d'accueil chaleureux */}
            {!currentContent && (
              <div
                style={{
                  background: "linear-gradient(135deg, var(--color-accent-calm) 0%, var(--color-surface-0) 100%)",
                  borderRadius: "var(--radius-lg)",
                  padding: "var(--space-lg)",
                  marginBottom: "var(--space-lg)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <Text
                  size="md"
                  style={{
                    color: "var(--color-text-primary)",
                    fontWeight: "var(--font-weight-medium)",
                    marginBottom: "var(--space-sm)",
                  }}
                >
                  {activeTab === "journal" && "Bienvenue dans votre journal"}
                  {activeTab === "narrative" && "Votre histoire mérite d'être racontée"}
                  {activeTab === "creative" && "Laissez parler votre créativité"}
                </Text>
                <Text size="sm" color="secondary" style={{ marginBottom: "var(--space-md)" }}>
                  {activeTab === "journal" && "Cet espace est à vous. Pas de règle, pas de jugement. Écrivez ce qui vous vient, à votre rythme."}
                  {activeTab === "narrative" && "Raconter son histoire aide à donner du sens. Commencez par ce qui vous appelle."}
                  {activeTab === "creative" && "Les mots peuvent devenir poésie, les émotions peuvent prendre forme. Laissez-vous guider."}
                </Text>

                {/* Option pour afficher/masquer les suggestions */}
                {!initialPromptsLoading && initialPrompts.length > 0 && (
                  <div style={{ marginBottom: "var(--space-md)" }}>
                    <button
                      onClick={() => setInitialPrompts([])}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--color-text-tertiary)",
                        fontSize: "var(--font-size-xs)",
                        cursor: "pointer",
                        textDecoration: "underline",
                        padding: 0,
                      }}
                    >
                      Masquer les suggestions
                    </button>
                  </div>
                )}

                {/* Prompts d'inspiration (optionnels) */}
                {initialPromptsLoading ? (
                  <div style={{ textAlign: "center", padding: "var(--space-md)" }}>
                    <Text size="sm" color="secondary">Préparation de vos inspirations...</Text>
                  </div>
                ) : initialPrompts.length > 0 ? (
                  <div>
                    <Text
                      size="sm"
                      style={{
                        color: "var(--color-primary)",
                        fontWeight: "var(--font-weight-medium)",
                        marginBottom: "var(--space-sm)",
                      }}
                    >
                      Besoin d'inspiration ? Voici quelques pistes :
                    </Text>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "var(--space-sm)",
                      }}
                    >
                      {initialPrompts.slice(0, 4).map((prompt, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentContent(prompt + "\n\n")}
                          style={{
                            textAlign: "left",
                            padding: "var(--space-sm) var(--space-md)",
                            background: "white",
                            border: "1px solid var(--color-border)",
                            borderRadius: "var(--radius-md)",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            color: "var(--color-text-secondary)",
                            fontSize: "var(--font-size-sm)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "var(--color-accent-calm)";
                            e.currentTarget.style.borderColor = "var(--color-primary)";
                            e.currentTarget.style.color = "var(--color-text-primary)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "white";
                            e.currentTarget.style.borderColor = "var(--color-border)";
                            e.currentTarget.style.color = "var(--color-text-secondary)";
                          }}
                        >
                          "{prompt}"
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={() => loadInitialPrompts(activeTab)}
                      style={{
                        background: "white",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-md)",
                        padding: "var(--space-sm) var(--space-md)",
                        cursor: "pointer",
                        color: "var(--color-primary)",
                        fontSize: "var(--font-size-sm)",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--color-accent-calm)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "white";
                      }}
                    >
                      Besoin d'inspiration ?
                    </button>
                  </div>
                )}

                <Text
                  size="xs"
                  color="tertiary"
                  style={{ marginTop: "var(--space-md)", fontStyle: "italic" }}
                >
                  Vous pouvez aussi commencer à écrire librement ci-dessous
                </Text>
              </div>
            )}

            {/* Contexte personnalisé (Hyperpersonnalisation) - affiché une fois qu'on écrit */}
            {currentContent && personalizedContext && (
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
              placeholder={currentContent ? "Continuez à écrire..." : "Ou commencez à écrire librement ici..."}
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
                  setInitialPrompts([]);
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

        {activeTab === "creative" && !showEditor && (
          <div style={{ marginBottom: "var(--space-xl)" }}>
            <ColoringCanvas
              user={user}
              api={api}
              onSaved={() => {
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
