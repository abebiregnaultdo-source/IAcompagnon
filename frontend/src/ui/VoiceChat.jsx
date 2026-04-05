import { useEffect, useRef, useState, useCallback } from "react";
import AvatarRoom from "./avatar/AvatarRoom";
import AvatarView from "./avatar/AvatarView";
import Message from "./components/Message";
import Text from "./components/Text";
import Panel from "./components/Panel";
import { useDeviceDetection } from "../hooks/useDeviceDetection";
import { saveConversation, getConversations } from "../lib/supabase";

/**
 * VoiceChat - Interface de conversation vocale native
 *
 * Fonctionne entièrement côté navigateur :
 * - STT : Web Speech API (SpeechRecognition)
 * - IA : Endpoint /generate/stream (SSE)
 * - TTS : SpeechSynthesis API
 */
export default function VoiceChat({ api, user, onEmotionalStateChange, onBackToHome }) {
  const device = useDeviceDetection();
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("ready"); // ready | listening | processing | speaking
  const [error, setError] = useState(null);
  const [conversationMemory, setConversationMemory] = useState(null);
  const [autoListen, setAutoListen] = useState(true);

  const recognitionRef = useRef(null);
  const viewRef = useRef(null);
  const utteranceRef = useRef(null);
  const isComponentMounted = useRef(true);

  // ========================================================================
  // INITIALISATION
  // ========================================================================

  // Vérifier support Web Speech API
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const speechSupported = !!SpeechRecognition;

  // Charger mémoire + message d'accueil
  useEffect(() => {
    isComponentMounted.current = true;

    const init = async () => {
      // Charger mémoire des sessions précédentes
      try {
        const prevConversations = await getConversations(user.id, 5);
        if (prevConversations?.length > 0) {
          const memory = prevConversations
            .filter(c => c.messages?.length > 2)
            .slice(0, 3)
            .map(c => {
              const userMsgs = c.messages.filter(m => m.role === 'user').map(m => m.content);
              return {
                date: c.updated_at || c.created_at,
                themes: (userMsgs[0] || '').slice(0, 100),
                last_topic: (userMsgs[userMsgs.length - 1] || '').slice(0, 100),
                message_count: c.messages.length,
              };
            });
          setConversationMemory(memory);
        }
      } catch (e) {
        // Fallback localStorage
        try {
          const localConvs = localStorage.getItem(`helo_conversations_${user.id}`);
          if (localConvs) {
            const parsed = JSON.parse(localConvs);
            const memory = parsed.filter(c => c.messages?.length > 2).slice(0, 3).map(c => {
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
        } catch (e2) {}
      }

      // Message d'accueil
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
            },
            policy: {
              tone: user.tone || "neutre",
              phase: "ancrage",
              scores: { detresse: 50, espoir: 50, energie: 50 },
              is_welcome: true
            },
          }),
        });
        if (response.ok) {
          const data = await response.json();
          const welcomeMsg = { role: "assistant", content: data.text };
          setMessages([welcomeMsg]);
          // Lire le message d'accueil à voix haute
          speakText(data.text);
        } else {
          throw new Error("Backend unavailable");
        }
      } catch (e) {
        const fallback = `Bonjour ${user.first_name}. Je suis Helō. Je suis là pour vous écouter.`;
        setMessages([{ role: "assistant", content: fallback }]);
        speakText(fallback);
      }
    };

    init();

    return () => {
      isComponentMounted.current = false;
      stopListening();
      window.speechSynthesis.cancel();
    };
  }, []);

  // Auto-scroll
  useEffect(() => {
    viewRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
  }, [messages, transcript]);

  // ========================================================================
  // TTS — Synthèse vocale (Edge TTS haute qualité → fallback navigateur)
  // ========================================================================

  const voiceServiceUrl = import.meta.env.VITE_VOICE_SERVICE_URL;
  const audioContextRef = useRef(null);

  const getVoice = useCallback(() => {
    const voices = window.speechSynthesis.getVoices();
    const frenchVoices = voices.filter(v => v.lang.startsWith('fr'));
    const premiumVoice = frenchVoices.find(v =>
      v.name.includes('Google') || v.name.includes('Microsoft') ||
      v.name.includes('Natural') || v.name.includes('Neural')
    );
    return premiumVoice || frenchVoices[0] || voices[0];
  }, []);

  // TTS via Edge TTS (voix neurale Microsoft — qualité quasi-humaine)
  const speakViaEdgeTTS = useCallback(async (text) => {
    try {
      const response = await fetch(voiceServiceUrl + "/api/synthesize", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          text,
          voice_config: { voice_id: "fr-FR-DeniseNeural", speed: 0.95, pitch: 1.0 }
        }),
      });
      if (!response.ok) throw new Error("Voice service error");
      const data = await response.json();
      if (!data.audio_base64) throw new Error("No audio data");

      // Décoder et jouer l'audio MP3
      const audioBytes = Uint8Array.from(atob(data.audio_base64), c => c.charCodeAt(0));
      if (!audioContextRef.current) audioContextRef.current = new AudioContext();
      const audioBuffer = await audioContextRef.current.decodeAudioData(audioBytes.buffer);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);

      if (isComponentMounted.current) {
        setIsSpeaking(true);
        setStatus("speaking");
      }

      source.onended = () => {
        if (isComponentMounted.current) {
          setIsSpeaking(false);
          setStatus("ready");
          if (autoListen) {
            setTimeout(() => { if (isComponentMounted.current) startListening(); }, 500);
          }
        }
      };

      source.start();
      return true; // Succès
    } catch (e) {
      console.warn("[HELO] Edge TTS failed, falling back to browser TTS:", e.message);
      return false; // Échec → fallback
    }
  }, [voiceServiceUrl, autoListen]);

  // TTS fallback via navigateur
  const speakViaBrowser = useCallback((text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = getVoice();
    utterance.rate = 0.92;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.lang = 'fr-FR';

    utterance.onstart = () => {
      if (isComponentMounted.current) { setIsSpeaking(true); setStatus("speaking"); }
    };
    utterance.onend = () => {
      if (isComponentMounted.current) {
        setIsSpeaking(false);
        setStatus("ready");
        if (autoListen) {
          setTimeout(() => { if (isComponentMounted.current) startListening(); }, 500);
        }
      }
    };
    utterance.onerror = () => {
      if (isComponentMounted.current) { setIsSpeaking(false); setStatus("ready"); }
    };
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [getVoice, autoListen]);

  // Fonction principale TTS : Edge TTS si disponible, sinon navigateur
  const speakText = useCallback(async (text) => {
    if (!text) return;
    window.speechSynthesis.cancel();

    if (voiceServiceUrl) {
      const success = await speakViaEdgeTTS(text);
      if (success) return;
    }
    // Fallback navigateur
    speakViaBrowser(text);
  }, [voiceServiceUrl, speakViaEdgeTTS, speakViaBrowser]);

  // ========================================================================
  // STT — Reconnaissance vocale
  // ========================================================================

  const startListening = useCallback(() => {
    if (!speechSupported) {
      setError("La reconnaissance vocale n'est pas supportée par ce navigateur.");
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      if (isComponentMounted.current) {
        setIsListening(true);
        setStatus("listening");
        setTranscript("");
        setError(null);
      }
    };

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      if (isComponentMounted.current) {
        setTranscript(final || interim);
      }
    };

    recognition.onend = () => {
      if (isComponentMounted.current) {
        setIsListening(false);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      if (isComponentMounted.current) {
        setError(`Erreur micro: ${event.error}`);
        setIsListening(false);
        setStatus("ready");
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [speechSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // ========================================================================
  // ENVOI DU MESSAGE (quand l'utilisateur arrête de parler)
  // ========================================================================

  const sendVoiceMessage = async () => {
    const text = transcript.trim();
    if (!text || isProcessing) return;

    stopListening();
    setTranscript("");
    setIsProcessing(true);
    setStatus("processing");

    const userMsg = { role: "user", content: text };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);

    try {
      const response = await fetch(api.base + "/generate/stream", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: newMsgs.map(m => ({ role: m.role, content: m.content })),
          profile: {
            first_name: user.first_name,
            user_id_hash: user.id,
            extended_profile: user.extended_profile || null,
            conversation_memory: conversationMemory,
          },
          policy: { tone: user.tone || "neutre", phase: "ancrage", scores: { detresse: 50, espoir: 50, energie: 50 } },
        }),
      });

      if (!response.ok) throw new Error("Backend non disponible");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";
      let buffer = "";

      // Ajouter message assistant vide
      setMessages(m => [...m, { role: "assistant", content: "" }]);

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
              accumulatedText += event.text;
              setMessages(m => {
                const updated = [...m];
                updated[updated.length - 1] = { role: "assistant", content: accumulatedText };
                return updated;
              });
            }
          } catch (e) {}
        }
      }

      setIsProcessing(false);

      // Lire la réponse à voix haute
      if (accumulatedText) {
        speakText(accumulatedText);
      } else {
        setStatus("ready");
        if (autoListen) startListening();
      }

    } catch (error) {
      setIsProcessing(false);
      const fallback = `Je t'entends, ${user.first_name}. Peux-tu m'en dire plus ?`;
      setMessages(m => [...m, { role: "assistant", content: fallback }]);
      speakText(fallback);
    }
  };

  // ========================================================================
  // CONTRÔLE PRINCIPAL
  // ========================================================================

  const toggleListening = () => {
    if (isSpeaking) {
      // Interrompre l'IA qui parle
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setStatus("ready");
      return;
    }

    if (isListening) {
      // L'utilisateur a fini de parler → envoyer
      sendVoiceMessage();
    } else {
      startListening();
    }
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  if (!speechSupported) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f5f2ed 0%, #eef3f6 50%, #f5f2ed 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}>
        <div style={{
          maxWidth: "400px",
          textAlign: "center",
          color: "#3a4048",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎙️</div>
          <h2 style={{ fontSize: "20px", fontWeight: 500, marginBottom: "12px" }}>
            Navigateur non compatible
          </h2>
          <p style={{ fontSize: "15px", color: "#7a8490", marginBottom: "24px" }}>
            La conversation vocale nécessite Chrome, Edge ou Safari. Veuillez changer de navigateur ou utiliser le chat écrit.
          </p>
          <button
            onClick={onBackToHome}
            style={{
              padding: "12px 24px",
              background: "linear-gradient(135deg, #7BA8C0 0%, #8ab4c8 100%)",
              border: "none",
              borderRadius: "12px",
              color: "#F2F6F7",
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = {
    ready: { label: "Prêt", color: "#7a8490", icon: "🎙️" },
    listening: { label: "Je vous écoute...", color: "#7BA8C0", icon: "🔴" },
    processing: { label: "Réflexion...", color: "#C0A87B", icon: "💭" },
    speaking: { label: "Helō parle...", color: "#8ABAA8", icon: "🔊" },
  };

  const currentStatus = statusConfig[status] || statusConfig.ready;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #f5f2ed 0%, #eef3f6 50%, #f5f2ed 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: device.isMobile ? "16px" : "32px 24px",
    }}>
      <div style={{
        maxWidth: "520px",
        width: "100%",
        flex: 1,
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}>
          <button
            onClick={() => {
              stopListening();
              window.speechSynthesis.cancel();
              onBackToHome();
            }}
            style={{
              background: "transparent",
              border: "none",
              color: "#7BA8C0",
              fontSize: "14px",
              cursor: "pointer",
              padding: "8px",
            }}
          >
            ← Retour
          </button>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px",
            color: currentStatus.color,
          }}>
            <span>{currentStatus.icon}</span>
            <span>{currentStatus.label}</span>
          </div>
          <button
            onClick={() => setAutoListen(prev => !prev)}
            style={{
              background: autoListen ? "rgba(123, 168, 192, 0.15)" : "rgba(0,0,0,0.04)",
              border: "1px solid " + (autoListen ? "rgba(123, 168, 192, 0.3)" : "rgba(0,0,0,0.08)"),
              borderRadius: "8px",
              padding: "6px 12px",
              fontSize: "12px",
              color: autoListen ? "#7BA8C0" : "#7a8490",
              cursor: "pointer",
            }}
            title="Écoute automatique après chaque réponse"
          >
            Auto {autoListen ? "ON" : "OFF"}
          </button>
        </div>

        {/* Avatar central — comme un appel audio */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "16px",
          padding: "20px 0",
        }}>
          <div style={{
            width: device.isMobile ? "100px" : "120px",
            height: device.isMobile ? "100px" : "120px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #e8f0f5 0%, #d4e4ed 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            boxShadow: isSpeaking
              ? "0 0 0 6px rgba(138, 186, 168, 0.3), 0 8px 32px rgba(0,0,0,0.1)"
              : isListening
                ? "0 0 0 6px rgba(224, 80, 80, 0.2), 0 8px 32px rgba(0,0,0,0.1)"
                : "0 4px 20px rgba(0,0,0,0.08)",
            transition: "box-shadow 0.5s ease",
          }}>
            <AvatarView
              skinColor="#C98E6B"
              hairStyle="bun"
              presentation="feminine"
            />
          </div>
          <div style={{
            marginTop: "12px",
            fontSize: "18px",
            fontWeight: 500,
            color: "#3a4048",
          }}>
            Helō
          </div>
          <div style={{
            fontSize: "13px",
            color: currentStatus.color,
            marginTop: "4px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}>
            <span style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: currentStatus.color,
              display: "inline-block",
              animation: (isListening || isSpeaking) ? "pulse 1.5s infinite" : "none",
            }} />
            {currentStatus.label}
          </div>
        </div>

        {/* Zone messages */}
        <div
          ref={viewRef}
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginBottom: "20px",
            padding: "16px",
            background: "rgba(242, 246, 247, 0.5)",
            borderRadius: "16px",
            border: "1px solid rgba(123, 168, 192, 0.1)",
            minHeight: "300px",
            maxHeight: device.isMobile ? "50vh" : "60vh",
          }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%",
                padding: "12px 16px",
                borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: m.role === "user"
                  ? "linear-gradient(135deg, #7BA8C0, #8ab4c8)"
                  : "rgba(242, 246, 247, 0.9)",
                color: m.role === "user" ? "#F2F6F7" : "#3a4048",
                fontSize: "15px",
                lineHeight: 1.5,
                border: m.role === "user" ? "none" : "1px solid rgba(123, 168, 192, 0.12)",
              }}
            >
              {m.content || (m.role === "assistant" ? "..." : "")}
            </div>
          ))}

          {/* Transcript en cours */}
          {transcript && (
            <div style={{
              alignSelf: "flex-end",
              maxWidth: "85%",
              padding: "12px 16px",
              borderRadius: "16px 16px 4px 16px",
              background: "rgba(123, 168, 192, 0.15)",
              color: "#7BA8C0",
              fontSize: "15px",
              lineHeight: 1.5,
              fontStyle: "italic",
              border: "1px dashed rgba(123, 168, 192, 0.3)",
            }}>
              {transcript}
            </div>
          )}
        </div>

        {/* Bouton principal */}
        <div style={{ textAlign: "center", paddingBottom: "24px" }}>
          {error && (
            <div style={{
              fontSize: "13px",
              color: "#c45",
              marginBottom: "12px",
            }}>
              {error}
            </div>
          )}

          <button
            onClick={toggleListening}
            disabled={isProcessing}
            style={{
              width: device.isMobile ? "80px" : "88px",
              height: device.isMobile ? "80px" : "88px",
              borderRadius: "50%",
              border: "none",
              background: isListening
                ? "linear-gradient(135deg, #e05050, #c44040)"
                : isSpeaking
                  ? "linear-gradient(135deg, #8ABAA8, #6a9d8a)"
                  : "linear-gradient(135deg, #7BA8C0 0%, #8ab4c8 100%)",
              cursor: isProcessing ? "wait" : "pointer",
              boxShadow: isListening
                ? "0 0 0 8px rgba(224, 80, 80, 0.15), 0 8px 24px rgba(224, 80, 80, 0.3)"
                : "0 8px 24px rgba(123, 168, 192, 0.3)",
              transition: "all 0.35s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              transform: isListening ? "scale(1.08)" : "scale(1)",
            }}
          >
            <span style={{ fontSize: "32px" }}>
              {isProcessing ? "💭" : isListening ? "⏹️" : isSpeaking ? "🔊" : "🎙️"}
            </span>
          </button>

          <div style={{
            marginTop: "12px",
            fontSize: "13px",
            color: "#7a8490",
          }}>
            {isProcessing
              ? "Helō réfléchit..."
              : isListening
                ? "Appuyez pour envoyer"
                : isSpeaking
                  ? "Appuyez pour interrompre"
                  : "Appuyez pour parler"}
          </div>
        </div>
      </div>
    </div>
  );
}
