import { useEffect, useRef, useState, useCallback } from "react";
import AvatarRoom from "./avatar/AvatarRoom";
import AvatarView from "./avatar/AvatarView";
import Message from "./components/Message";
import Button from "./components/Button";
import Text from "./components/Text";
import Panel from "./components/Panel";
import ContextualSuggestion from "./creativity/ContextualSuggestion";
import { useDeviceDetection } from "../hooks/useDeviceDetection";
import { saveConversation, getConversations, updateProfile, incrementSessionCount } from "../lib/supabase";

// ============================================================================
// SYNTHÈSE VOCALE - Text-to-Speech natif du navigateur
// ============================================================================
const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const utteranceRef = useRef(null);

  // Obtenir une voix française de qualité
  const getVoice = useCallback(() => {
    const voices = window.speechSynthesis.getVoices();
    // Priorité: voix françaises premium
    const frenchVoices = voices.filter(v => v.lang.startsWith('fr'));
    // Préférer les voix "premium" (Google, Microsoft)
    const premiumVoice = frenchVoices.find(v =>
      v.name.includes('Google') ||
      v.name.includes('Microsoft') ||
      v.name.includes('Natural') ||
      v.name.includes('Neural')
    );
    return premiumVoice || frenchVoices[0] || voices[0];
  }, []);

  const speak = useCallback((text) => {
    if (!voiceEnabled || !text) return;

    // Annuler toute lecture en cours
    window.speechSynthesis.cancel();

    const doSpeak = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = getVoice();
      if (voice) utterance.voice = voice;
      utterance.rate = 0.9; // Légèrement plus lent pour la thérapie
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = 'fr-FR';

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (e) => {
        console.warn("[HELO] Chat TTS error:", e.error);
        setIsSpeaking(false);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    };

    // Attendre le chargement des voix si nécessaire
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => doSpeak();
      setTimeout(doSpeak, 300); // Fallback si onvoiceschanged ne se déclenche pas
    } else {
      doSpeak();
    }
  }, [voiceEnabled, getVoice]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const toggleVoice = useCallback(() => {
    if (isSpeaking) stop();
    setVoiceEnabled(prev => !prev);
  }, [isSpeaking, stop]);

  // Charger les voix au démarrage
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  return { speak, stop, isSpeaking, voiceEnabled, toggleVoice };
};

// ============================================================================
// COMPOSANT CHAT PRINCIPAL
// ============================================================================
export default function Chat({
  api,
  user,
  onEmotionalStateChange,
  onBackToHome,
  onSwitchToVoice,
  onOpenCreativity,
  onOpenLibrary,
  onOpenDreams,
  resumeSessionId,
}) {
  const device = useDeviceDetection();
  const [messages, setMessages] = useState([]);
  const [welcomeLoaded, setWelcomeLoaded] = useState(false);
  const [input, setInput] = useState("");
  const [scores, setScores] = useState({
    detresse: 50,
    espoir: 50,
    energie: 50,
    phase: "ancrage",
  });
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [showAvatarFullscreen, setShowAvatarFullscreen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [savedConversations, setSavedConversations] = useState([]);
  const [conversationMemory, setConversationMemory] = useState(null);
  const [creativitySuggestion, setCreativitySuggestion] = useState(null);

  // Synthèse vocale
  const { speak, stop, isSpeaking, voiceEnabled, toggleVoice } = useSpeechSynthesis();

  const viewRef = useRef(null);
  const inputRef = useRef(null);

  // === TRACKING SILENCIEUX ===
  const sessionStartRef = useRef(Date.now());
  const lastResponseTimeRef = useRef(null);
  const messageCountRef = useRef(0);
  const lastTechniqueRef = useRef(null);
  // ID stable de la conversation en cours → permet d'upsert la même ligne Supabase
  // à chaque échange (au lieu de ne persister qu'au clic "nouvelle conversation").
  const conversationIdRef = useRef(
    typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now())
  );

  const trackSession = async (eventType, extraData = {}) => {
    try {
      await fetch(api.base + "/analytics/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          user_id_hash: user.id,
          event_type: eventType,
          session_duration_ms: Date.now() - sessionStartRef.current,
          message_count: messageCountRef.current,
          timestamp: new Date().toISOString(),
          // RGPD : respect du consentement retirable (défaut activé)
          analytics_consent: user?.consent?.analytics_improvement !== false,
          ...extraData,
        }),
      });
    } catch (e) {
      // Silencieux
    }
  };

  const trackReadingTime = async () => {
    // RGPD : le feedback implicite sert à l'amélioration anonyme. Si l'utilisateur
    // a retiré son consentement, on ne l'envoie tout simplement pas.
    if (user?.consent?.analytics_improvement === false) return;
    if (lastResponseTimeRef.current) {
      const readingTimeMs = Date.now() - lastResponseTimeRef.current;
      try {
        await fetch(api.base + "/feedback/implicit", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            user_id_hash: user.id,
            target: { technique: lastTechniqueRef.current },
            reading_ms: readingTimeMs,
            response_latency_ms: null,
          }),
        });
      } catch (e) {
        // Silencieux
      }
    }
  };

  // Track session start + incrémenter session_count (nouvelle conversation uniquement)
  useEffect(() => {
    trackSession("session_start");
    if (!resumeSessionId && user?.id) {
      incrementSessionCount(user.id).catch(() => {});
    }
    return () => {
      trackSession("session_end");
      stop(); // Arrêter la synthèse vocale
    };
  }, []);

  // Si on reprend une session, charger ses messages
  useEffect(() => {
    if (!resumeSessionId || welcomeLoaded) return;
    (async () => {
      try {
        const all = await getConversations(user.id, 50);
        const session = all && all.find(c => c.id === resumeSessionId);
        if (session && Array.isArray(session.messages) && session.messages.length > 0) {
          setMessages(session.messages);
          setWelcomeLoaded(true);
        }
      } catch (e) {
        console.warn("[HELO] Failed to resume session:", e);
      }
    })();
  }, [resumeSessionId, user.id, welcomeLoaded]);

  // Charger l'historique ou le message d'accueil
  useEffect(() => {
    const loadChatData = async () => {
      if (welcomeLoaded) return;

      // Charger la mémoire des sessions précédentes
      try {
        const prevConversations = await getConversations(user.id, 5);
        if (prevConversations && prevConversations.length > 0) {
          const memory = prevConversations
            .filter(c => c.messages && c.messages.length > 2)
            .map(c => {
              const userMsgs = c.messages.filter(m => m.role === 'user').map(m => m.content);
              const lastMsg = userMsgs[userMsgs.length - 1] || '';
              const firstMsg = userMsgs[0] || '';
              return {
                date: c.updated_at || c.created_at,
                themes: firstMsg.slice(0, 100),
                last_topic: lastMsg.slice(0, 100),
                message_count: c.messages.length,
              };
            })
            .slice(0, 3);
          setConversationMemory(memory);
        }
      } catch (e) {
        // Fallback localStorage
        try {
          const localConvs = localStorage.getItem(`helo_conversations_${user.id}`);
          if (localConvs) {
            const parsed = JSON.parse(localConvs);
            const memory = parsed
              .filter(c => c.messages && c.messages.length > 2)
              .slice(0, 3)
              .map(c => {
                const userMsgs = c.messages.filter(m => m.role === 'user').map(m => m.content);
                return {
                  date: c.date,
                  themes: (userMsgs[0] || '').slice(0, 100),
                  last_topic: (userMsgs[userMsgs.length - 1] || '').slice(0, 100),
                  message_count: c.messages.length,
                };
              });
            setConversationMemory(memory);
          }
        } catch (e2) {
          // Pas de mémoire, ce n'est pas grave
        }
      }

      // Charger l'historique des conversations sauvegardées
      try {
        const savedHistory = localStorage.getItem(`helo_conversations_${user.id}`);
        if (savedHistory) {
          setSavedConversations(JSON.parse(savedHistory));
        }
      } catch (e) {
        // Silencieux
      }

      // Charger la conversation en cours (session actuelle)
      try {
        const currentSession = localStorage.getItem(`helo_chat_history_${user.id}`);
        if (currentSession) {
          const parsedMessages = JSON.parse(currentSession);
          if (parsedMessages && parsedMessages.length > 0) {
            setMessages(parsedMessages);
            setIsTyping(false);
            setWelcomeLoaded(true);
            setHistoryLoaded(true);
            return; // On a rechargé l'historique, pas besoin du message d'accueil
          }
        }
      } catch (e) {
        // Silencieux - on continue avec le message d'accueil
      }

      // Pas d'historique, charger le message d'accueil
      setIsTyping(true);

      try {
        const response = await fetch(api.base + "/generate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            messages: [],
            profile: {
              first_name: user.first_name,
              user_id_hash: user.id,
              is_first_message: true,
              extended_profile: user.extended_profile || null,
              conversation_memory: conversationMemory
            },
            policy: {
              tone: user.tone || "neutre",
              phase: "ancrage",
              scores: { detresse: 50, espoir: 50, energie: 50 },
              is_welcome: true
            },
          }),
        });

        if (!response.ok) throw new Error("Backend non disponible");

        const data = await response.json();
        const welcomeText = data.text;
        setMessages([{ role: "assistant", content: welcomeText }]);

        // Lire le message d'accueil si voix activée
        if (voiceEnabled) {
          speak(welcomeText);
        }

        lastTechniqueRef.current = data.technique || "welcome";
        lastResponseTimeRef.current = Date.now();

      } catch (error) {
        const fallbackWelcome = `Bonjour ${user.first_name}. Je suis Helō, ton compagnon. Comment te sens-tu aujourd'hui ?`;
        setMessages([{ role: "assistant", content: fallbackWelcome }]);
        if (voiceEnabled) speak(fallbackWelcome);
      } finally {
        setIsTyping(false);
        setWelcomeLoaded(true);
        setHistoryLoaded(true);
      }
    };

    loadChatData();
  }, [api.base, user.first_name, user.id, user.tone, welcomeLoaded]);

  // Auto-scroll
  useEffect(() => {
    viewRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
  }, [messages, isTyping]);

  // Sauvegarder l'historique des conversations dans localStorage
  // Pour que la section Créativité puisse proposer des thèmes personnalisés
  // + Auto-sauvegarder dans l'historique des conversations après chaque échange
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(`helo_chat_history_${user.id}`, JSON.stringify(messages));
      } catch (e) {
        // localStorage peut échouer en mode privé
      }

      // Auto-sauvegarder dans l'historique si au moins 3 messages (accueil + 1 échange)
      const userMessages = messages.filter(m => m.role === "user");
      if (userMessages.length >= 1) {
        try {
          const savedHistory = localStorage.getItem(`helo_conversations_${user.id}`);
          const existingConversations = savedHistory ? JSON.parse(savedHistory) : [];

          // Chercher si une conversation "en cours" existe déjà (id = "current")
          const withoutCurrent = existingConversations.filter(c => c.id !== "current");

          const currentConversation = {
            id: "current",
            date: new Date().toISOString(),
            preview: userMessages[0]?.content?.slice(0, 50) || "Conversation en cours",
            messages: messages,
            isActive: true,
          };

          const updatedConversations = [currentConversation, ...withoutCurrent].slice(0, 20);
          setSavedConversations(updatedConversations);
          localStorage.setItem(`helo_conversations_${user.id}`, JSON.stringify(updatedConversations));
        } catch (e) {
          // Silencieux
        }

        // Persister aussi dans Supabase (fire-and-forget), pas seulement en localStorage.
        // On ne pousse qu'à échange complet (dernière réponse de l'assistant reçue),
        // pour éviter de spammer la base à chaque frappe. Upsert sur un id stable.
        const lastMsg = messages[messages.length - 1];
        if (lastMsg && lastMsg.role === "assistant") {
          (async () => {
            try {
              await saveConversation(user.id, {
                id: conversationIdRef.current,
                messages,
                summary: userMessages[0]?.content?.slice(0, 200) || null,
                emotional_state: scores || null,
              });
            } catch (e) {
              // Échec réseau/RLS → localStorage reste le filet de sécurité
              console.error("[HELO] auto-save Supabase échoué:", e?.message || e);
            }
          })();
        }
      }
    }
  }, [messages, user.id]);

  // Focus input après chargement
  useEffect(() => {
    if (historyLoaded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [historyLoaded]);

  // Sauvegarder la conversation actuelle dans l'historique et en commencer une nouvelle
  const startNewConversation = () => {
    if (messages.length > 1) { // Au moins un échange (accueil + message)
      const conversation = {
        id: Date.now(),
        date: new Date().toISOString(),
        preview: messages.find(m => m.role === "user")?.content?.slice(0, 50) || "Conversation",
        messages: messages,
      };
      // Remplacer la conversation "current" par une finalisée avec un vrai ID
      const withoutCurrent = savedConversations.filter(c => c.id !== "current");
      const updatedConversations = [conversation, ...withoutCurrent].slice(0, 20);
      setSavedConversations(updatedConversations);
      try {
        localStorage.setItem(`helo_conversations_${user.id}`, JSON.stringify(updatedConversations));
      } catch (e) {
        // Silencieux
      }
      // Finaliser la ligne Supabase de la session en cours (même id que l'auto-save),
      // puis repartir sur un nouvel id pour la prochaine conversation.
      const finishedId = conversationIdRef.current;
      const endedMessages = messages;
      (async () => {
        try {
          await saveConversation(user.id, {
            id: finishedId,
            messages: endedMessages,
            summary: conversation.preview,
            emotional_state: scores || null,
          });
        } catch (e) {
          console.error("[HELO] Failed to save conversation to Supabase:", e);
        }
      })();

      // Sédimentation du contexte de vie : extraction des faits durables en fin
      // de session (fire-and-forget, hors chemin critique). Le résultat est
      // persisté dans le profil pour que Helō "se souvienne" à la session suivante.
      (async () => {
        try {
          const res = await fetch(api.base + "/api/session/end", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: endedMessages
                .filter(m => m.role === "user" || m.role === "assistant")
                .map(m => ({ role: m.role, content: m.content })),
              conversation_insights: user.conversation_insights || null,
            }),
          });
          const data = await res.json();
          if (data?.conversation_insights) {
            await updateProfile(user.id, { conversation_insights: data.conversation_insights });
            user.conversation_insights = data.conversation_insights; // maj locale
          }
        } catch (e) {
          console.error("[HELO] Extraction insights (fin de session) échouée:", e);
        }
      })();
    }
    // Nouvel id de conversation pour la session suivante
    conversationIdRef.current =
      typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
    // Effacer la session en cours
    localStorage.removeItem(`helo_chat_history_${user.id}`);
    setMessages([]);
    setWelcomeLoaded(false);
  };

  // Charger une conversation depuis l'historique
  const loadConversation = (conversation) => {
    setMessages(conversation.messages);
    setShowHistory(false);
  };

  // Supprimer une conversation de l'historique
  const deleteConversation = (conversationId) => {
    const updated = savedConversations.filter(c => c.id !== conversationId);
    setSavedConversations(updated);
    try {
      localStorage.setItem(`helo_conversations_${user.id}`, JSON.stringify(updated));
    } catch (e) {
      // Silencieux
    }
  };

  const send = async () => {
    if (!input.trim() || isSending) return;

    trackReadingTime();
    stop(); // Arrêter toute lecture en cours

    const userMessage = input.trim();
    const newMsgs = [...messages, { role: "user", content: userMessage }];
    setMessages(newMsgs);
    setInput("");
    setIsSending(true);
    setIsTyping(true); // Affiche "Helō réfléchit..." pendant l'attente du premier chunk
    messageCountRef.current += 1;

    const sendStartTime = Date.now();
    const requestBody = {
      messages: newMsgs.map((m) => ({ role: m.role, content: m.content })),
      profile: {
        first_name: user.first_name,
        user_id_hash: user.id,
        session_count: user.session_count || 1,
        extended_profile: user.extended_profile || null,
        conversation_memory: conversationMemory
      },
      policy: { tone: user.tone || "neutre", phase: scores.phase, scores },
    };

    try {
      // Tenter le streaming SSE d'abord
      const response = await fetch(api.base + "/generate/stream", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok || !response.body) throw new Error("Streaming non disponible");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";
      let technique = "unknown";
      let buffer = "";
      let firstChunkReceived = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === "chunk") {
              // Premier chunk : masquer l'indicateur de frappe, ajouter le message
              if (!firstChunkReceived) {
                firstChunkReceived = true;
                setIsTyping(false);
                setMessages((m) => [...m, { role: "assistant", content: "" }]);
              }
              accumulatedText += event.text;
              setMessages((m) => {
                const updated = [...m];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: accumulatedText,
                };
                return updated;
              });
            } else if (event.type === "done") {
              technique = event.technique || "unknown";
            } else if (event.type === "suggest_module") {
              setCreativitySuggestion({
                module: event.module || "creativity",
                title: event.title || "Une suggestion pour toi",
                message: event.message || "Un outil pourrait t'aider à explorer ce que tu ressens.",
                tool: event.tool || "journal"
              });
            } else if (event.type === "suggest_creativity") {
              // Backward compatibility
              if (!creativitySuggestion) {
                setCreativitySuggestion({
                  module: "creativity",
                  title: event.title || "Envie d'exprimer ce que tu ressens ?",
                  message: event.message || "Tu pourrais essayer un outil créatif pour explorer tes émotions.",
                  tool: event.tool || "journal"
                });
              }
            }
          } catch (e) {
            // Ligne SSE mal formée, ignorer
          }
        }
      }

      // Si aucun chunk n'a été reçu, fallback
      if (!firstChunkReceived) throw new Error("Streaming vide");

      // Détection côté client de suggestion de module (fallback si le backend n'a pas envoyé)
      // Basé sur le contenu de la réponse, pas sur un compteur de messages
      if (!creativitySuggestion) {
        const lowerText = accumulatedText.toLowerCase();

        // Signaux de besoin de lecture/ressources
        const libraryPatterns = ['je vous recommande', 'tu pourrais lire', 'un livre qui', 'des ressources', 'podcast', 'vidéo', 'témoignages'];
        if (libraryPatterns.some(p => lowerText.includes(p))) {
          setCreativitySuggestion({
            module: 'library',
            title: "Des ressources qui pourraient t'aider",
            message: "Notre bibliothèque contient des livres, podcasts et articles sur ce sujet.",
            tool: 'resources'
          });
        }

        // Signaux de besoin d'écriture/créativité
        const creativityPatterns = ['tu pourrais écrire', 'essayer de mettre en mots', 'journal', 'lettre', 'poème', 'dessin', 'rituel'];
        if (!creativitySuggestion && creativityPatterns.some(p => lowerText.includes(p))) {
          let suggestedTool = 'journal';
          if (lowerText.includes('lettre')) suggestedTool = 'narrative';
          if (lowerText.includes('poème') || lowerText.includes('poésie')) suggestedTool = 'poem';
          if (lowerText.includes('coloriage') || lowerText.includes('dessiner')) suggestedTool = 'coloring';
          if (lowerText.includes('rituel')) suggestedTool = 'ritual';
          setCreativitySuggestion({
            module: 'creativity',
            title: "Envie d'explorer tes émotions autrement ?",
            message: "Tu pourrais essayer un outil créatif pour exprimer ce que tu ressens.",
            tool: suggestedTool
          });
        }

        // Signaux de besoin d'exploration des rêves
        const dreamPatterns = ['noter tes rêves', 'noter vos rêves', 'journal de rêves', 'explorer tes rêves', 'rêves récurrents'];
        if (!creativitySuggestion && dreamPatterns.some(p => lowerText.includes(p))) {
          setCreativitySuggestion({
            module: 'dreams',
            title: "Explorer tes rêves ?",
            message: "Le journal de rêves peut t'aider à comprendre ce qui se passe en toi.",
            tool: 'dream_journal'
          });
        }
      }

      if (voiceEnabled && accumulatedText) {
        speak(accumulatedText);
      }

      lastResponseTimeRef.current = Date.now();
      lastTechniqueRef.current = technique;

      trackSession("message_exchange", {
        technique,
        response_time_ms: Date.now() - sendStartTime,
        phase: scores.phase,
      });

      if (onEmotionalStateChange) {
        onEmotionalStateChange("calm");
      }
    } catch (streamError) {
      // Fallback : endpoint non-streaming classique
      try {
        const cr = await fetch(api.base + "/generate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        if (!cr.ok) throw new Error("Backend non disponible");

        const data = await cr.json();
        setIsTyping(false);
        setMessages((m) => [...m, { role: "assistant", content: data.text }]);

        if (voiceEnabled) speak(data.text);

        lastResponseTimeRef.current = Date.now();
        lastTechniqueRef.current = data.technique || "unknown";

        trackSession("message_exchange", {
          technique: data.technique || "fallback",
          response_time_ms: Date.now() - sendStartTime,
          phase: scores.phase,
        });

        if (onEmotionalStateChange) onEmotionalStateChange("calm");
      } catch (finalError) {
        setIsTyping(false);
        const fallbackResponses = [
          `Je t'entends, ${user.first_name}. Prends le temps qu'il te faut. Je suis là.`,
          `Merci de partager cela avec moi. Qu'est-ce qui te pèse le plus ?`,
          `Je comprends. Mettre des mots sur ce qu'on ressent est déjà important.`,
          `Ce que tu vis semble difficile. Je suis là, sans jugement.`,
        ];
        const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        setMessages((m) => [...m, { role: "assistant", content: randomResponse }]);
        if (voiceEnabled) speak(randomResponse);
        trackSession("fallback_used", { reason: "backend_error" });
      }
    } finally {
      setIsSending(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div
      className="fade-in"
      style={{
        height: "100vh",
        background: "linear-gradient(180deg, #f8fafb 0%, #eef3f6 100%)",
        padding: device.isMobile ? "16px" : "32px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* Header modernisé */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: device.isMobile ? "12px" : "24px",
            padding: device.isMobile ? "10px 12px" : "16px 20px",
            background: "#F8FAFB",
            borderRadius: "16px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            gap: "8px",
            flexWrap: "nowrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={onBackToHome}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "20px",
                padding: "8px",
                borderRadius: "8px",
                color: "#5A8FA8",
              }}
              aria-label="Retour"
            >
              ←
            </button>

            {/* Mini avatar dans le header */}
            <div style={{
              width: device.isMobile ? "40px" : "48px",
              height: device.isMobile ? "40px" : "48px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #e8f0f5 0%, #d4e4ed 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              overflow: "hidden",
              boxShadow: isTyping || isSpeaking
                ? "0 0 0 3px rgba(90, 143, 168, 0.3)"
                : "0 1px 3px rgba(0,0,0,0.1)",
              transition: "box-shadow 0.3s ease",
            }}>
              <AvatarView
                skinColor="#C98E6B"
                hairStyle="bun"
                presentation="feminine"
              />
            </div>

            <div>
              <Text as="h1" size="lg" style={{ margin: 0, color: "#2d3748" }}>
                Helō
              </Text>
              <Text size="sm" style={{ color: "#718096", margin: 0 }}>
                {isSpeaking ? "Je parle..." : isTyping ? "Je réfléchis..." : "Je t'écoute"}
              </Text>
            </div>
          </div>

          <div style={{ display: "flex", gap: device.isMobile ? "4px" : "8px" }}>
            {/* Bouton historique */}
            <button
              onClick={() => setShowHistory(true)}
              style={{
                width: device.isMobile ? "36px" : "44px",
                height: device.isMobile ? "36px" : "44px",
                borderRadius: "12px",
                background: savedConversations.length > 0 ? "#e2e8f0" : "#f7fafc",
                border: "none",
                color: savedConversations.length > 0 ? "#5A8FA8" : "#a0aec0",
                fontSize: "18px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
                position: "relative",
              }}
              title="Historique des conversations"
            >
              📋
              {savedConversations.length > 0 && (
                <span style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  background: "#5A8FA8",
                  color: "#F2F6F7",
                  fontSize: "10px",
                  borderRadius: "50%",
                  width: "18px",
                  height: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {savedConversations.length}
                </span>
              )}
            </button>

            {/* Bouton nouvelle conversation */}
            <button
              onClick={startNewConversation}
              style={{
                width: device.isMobile ? "36px" : "44px",
                height: device.isMobile ? "36px" : "44px",
                borderRadius: "12px",
                background: "#e2e8f0",
                border: "none",
                color: "#5A8FA8",
                fontSize: device.isMobile ? "16px" : "18px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
              title="Nouvelle conversation"
            >
              ✨
            </button>

            {/* Bouton voix */}
            <button
              onClick={toggleVoice}
              style={{
                width: device.isMobile ? "36px" : "44px",
                height: device.isMobile ? "36px" : "44px",
                borderRadius: "12px",
                background: voiceEnabled ? "#5A8FA8" : "#e2e8f0",
                border: "none",
                color: voiceEnabled ? "#F2F6F7" : "#718096",
                fontSize: device.isMobile ? "16px" : "18px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
              title={voiceEnabled ? "Désactiver la voix" : "Activer la voix"}
            >
              {voiceEnabled ? "🔊" : "🔇"}
            </button>

            {/* Bouton consultation vidéo */}
            <button
              onClick={() => setShowAvatarFullscreen(true)}
              style={{
                width: device.isMobile ? "36px" : "44px",
                height: device.isMobile ? "36px" : "44px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #5A8FA8 0%, #7BA8C0 100%)",
                border: "none",
                color: "#F2F6F7",
                fontSize: device.isMobile ? "16px" : "18px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(90, 143, 168, 0.3)",
              }}
              title="Mode consultation"
            >
              📹
            </button>
          </div>
        </div>

        {/* Zone de conversation */}
        <div
          style={{
            background: "#F8FAFB",
            borderRadius: "20px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            overflow: "hidden",
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Messages */}
          <div
            ref={viewRef}
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              padding: "24px",
            }}
          >
            {messages.map((m, i) => {
              // Montrer l'avatar seulement pour le premier msg consécutif de l'assistant
              const showAvatar = m.role === "assistant" &&
                (i === 0 || messages[i - 1]?.role !== "assistant");

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                    alignItems: "flex-end",
                    marginBottom: m.role === "assistant" && messages[i + 1]?.role === "assistant" ? "4px" : "16px",
                    gap: "8px",
                  }}
                >
                  {/* Mini avatar à gauche des messages assistant */}
                  {m.role === "assistant" && (
                    <div style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #e8f0f5 0%, #d4e4ed 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      overflow: "hidden",
                      visibility: showAvatar ? "visible" : "hidden",
                    }}>
                      <AvatarView
                        skinColor="#C98E6B"
                        hairStyle="bun"
                        presentation="feminine"
                      />
                    </div>
                  )}

                  <div
                    style={{
                      maxWidth: "75%",
                      padding: "14px 18px",
                      borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      background: m.role === "user"
                        ? "linear-gradient(135deg, #5A8FA8 0%, #7BA8C0 100%)"
                        : "#f7fafc",
                      color: m.role === "user" ? "#F2F6F7" : "#2d3748",
                      fontSize: "15px",
                      lineHeight: "1.6",
                      boxShadow: m.role === "user"
                        ? "0 2px 8px rgba(90, 143, 168, 0.25)"
                        : "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "flex-end", gap: "8px", marginBottom: "16px" }}>
                <div style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #e8f0f5 0%, #d4e4ed 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  overflow: "hidden",
                  boxShadow: "0 0 0 3px rgba(90, 143, 168, 0.2)",
                  animation: "pulse 2s infinite",
                }}>
                  <AvatarView
                    skinColor="#C98E6B"
                    hairStyle="bun"
                    presentation="feminine"
                  />
                </div>
                <div
                  style={{
                    padding: "14px 18px",
                    borderRadius: "18px 18px 18px 4px",
                    background: "#f7fafc",
                    color: "#718096",
                  }}
                >
                  <span className="typing-dots">
                    <span>.</span><span>.</span><span>.</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {creativitySuggestion && (
            <div style={{ padding: "0 4px", marginBottom: "8px" }}>
              <ContextualSuggestion
                suggestion={creativitySuggestion}
                onClose={() => setCreativitySuggestion(null)}
                onAction={() => {
                  const mod = creativitySuggestion?.module || 'creativity';
                  setCreativitySuggestion(null);
                  if (mod === 'library' && onOpenLibrary) onOpenLibrary();
                  else if (mod === 'dreams' && onOpenDreams) onOpenDreams();
                  else if (onOpenCreativity) onOpenCreativity();
                }}
              />
            </div>
          )}

          {/* Zone de saisie */}
          <div
            style={{
              padding: "16px 24px 24px",
              borderTop: "1px solid #edf2f7",
              background: "#fafbfc",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "flex-end",
              }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Écris ce qui te vient..."
                disabled={isSending}
                rows={1}
                style={{
                  flex: 1,
                  padding: "14px 18px",
                  border: "2px solid #e2e8f0",
                  borderRadius: "16px",
                  fontSize: "15px",
                  resize: "none",
                  outline: "none",
                  fontFamily: "inherit",
                  transition: "border-color 0.2s",
                  minHeight: "52px",
                  maxHeight: "120px",
                }}
                onFocus={(e) => e.target.style.borderColor = "#5A8FA8"}
                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
              />
              <button
                onClick={send}
                disabled={!input.trim() || isSending}
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "16px",
                  background: input.trim() && !isSending
                    ? "linear-gradient(135deg, #5A8FA8 0%, #7BA8C0 100%)"
                    : "#e2e8f0",
                  border: "none",
                  color: input.trim() && !isSending ? "#F2F6F7" : "#a0aec0",
                  fontSize: "20px",
                  cursor: input.trim() && !isSending ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                  boxShadow: input.trim() && !isSending
                    ? "0 2px 8px rgba(90, 143, 168, 0.3)"
                    : "none",
                }}
              >
                {isSending ? "..." : "→"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mode consultation plein écran */}
      {showAvatarFullscreen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 1000,
            background: "linear-gradient(180deg, #1a202c 0%, #2d3748 100%)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header consultation */}
          <div
            style={{
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              position: "relative",
              zIndex: 2,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <Text as="h2" size="lg" style={{ margin: 0, color: "#F2F6F7" }}>
                Consultation avec Helō
              </Text>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: isSpeaking ? "#48bb78" : "#68d391",
                  animation: isSpeaking ? "pulse 1s infinite" : "none",
                }}
              />
            </div>

            <button
              onClick={() => setShowAvatarFullscreen(false)}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.1)",
                border: "none",
                color: "#F2F6F7",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>

          {/* Avatar background layer — position fixed via CSS .avatar-canvas.overlay */}
          <AvatarRoom
            context={{ phase: scores.phase, scores }}
            mode="overlay"
            isSpeaking={isSpeaking || isTyping}
          />

          {/* Content layer — sits above the avatar background */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px", position: "relative", zIndex: 2 }}>
            {/* Spacer to push controls to bottom */}
            <div style={{ flex: 1 }} />

            {/* Dernier message + contrôles */}
            <div style={{ textAlign: "center", marginTop: "auto" }}>
              {/* Dernier message de l'IA */}
              {messages.length > 0 && messages[messages.length - 1].role === "assistant" && (
                <div
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    padding: "20px 32px",
                    borderRadius: "20px",
                    marginBottom: "24px",
                    maxWidth: "600px",
                    margin: "0 auto 24px",
                  }}
                >
                  <Text style={{ color: "#F2F6F7", fontSize: "16px", lineHeight: "1.6" }}>
                    "{messages[messages.length - 1].content}"
                  </Text>
                </div>
              )}

              {/* Contrôles voix */}
              <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
                <button
                  onClick={toggleVoice}
                  style={{
                    padding: "14px 28px",
                    borderRadius: "30px",
                    background: voiceEnabled ? "#48bb78" : "rgba(255,255,255,0.2)",
                    border: "none",
                    color: "#F2F6F7",
                    fontSize: "15px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {voiceEnabled ? "🔊 Voix activée" : "🔇 Activer la voix"}
                </button>

                {isSpeaking && (
                  <button
                    onClick={stop}
                    style={{
                      padding: "14px 28px",
                      borderRadius: "30px",
                      background: "#e53e3e",
                      border: "none",
                      color: "#F2F6F7",
                      fontSize: "15px",
                      cursor: "pointer",
                    }}
                  >
                    ⏹ Arrêter
                  </button>
                )}
              </div>

              {/* Indicateur d'état */}
              <Text style={{ color: "rgba(255,255,255,0.6)", marginTop: "16px", fontSize: "14px" }}>
                {isSpeaking ? "Helō parle..." : isTyping ? "Helō réfléchit..." : "En attente de votre message"}
              </Text>
            </div>
          </div>
        </div>
      )}

      {/* Panneau historique des conversations */}
      {showHistory && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 1000,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
          }}
          onClick={() => setShowHistory(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#F8FAFB",
              borderRadius: "20px",
              maxWidth: "500px",
              width: "100%",
              maxHeight: "80vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text as="h2" size="lg" style={{ margin: 0, color: "#2d3748" }}>
                📋 Historique
              </Text>
              <button
                onClick={() => setShowHistory(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#718096",
                }}
              >
                ✕
              </button>
            </div>

            {/* Liste des conversations */}
            <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
              {savedConversations.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#718096" }}>
                  <p style={{ fontSize: "48px", marginBottom: "16px" }}>💬</p>
                  <p>Aucune conversation sauvegardée</p>
                  <p style={{ fontSize: "14px", marginTop: "8px" }}>
                    Utilise le bouton ✨ pour terminer une conversation et la sauvegarder ici
                  </p>
                </div>
              ) : (
                savedConversations.map((conv) => (
                  <div
                    key={conv.id}
                    style={{
                      padding: "16px",
                      marginBottom: "12px",
                      background: "#f7fafc",
                      borderRadius: "12px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      border: "1px solid transparent",
                    }}
                    onClick={() => loadConversation(conv)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#edf2f7";
                      e.currentTarget.style.borderColor = "#5A8FA8";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#f7fafc";
                      e.currentTarget.style.borderColor = "transparent";
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <Text size="sm" style={{ color: "#718096", marginBottom: "4px" }}>
                          {conv.isActive ? "En cours — " : ""}
                          {new Date(conv.date).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>
                        <Text style={{ color: "#2d3748" }}>
                          {conv.preview}...
                        </Text>
                        <Text size="sm" style={{ color: "#a0aec0", marginTop: "4px" }}>
                          {conv.messages.length} messages
                        </Text>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.id);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#e53e3e",
                          cursor: "pointer",
                          padding: "8px",
                          fontSize: "16px",
                          opacity: 0.6,
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = 0.6}
                        title="Supprimer"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* CSS pour l'animation des points */}
      <style>{`
        .typing-dots span {
          animation: blink 1.4s infinite both;
          font-size: 24px;
        }
        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blink {
          0%, 80%, 100% { opacity: 0; }
          40% { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
