import { useEffect, useRef, useState, useCallback } from "react";
import AvatarRoom from "./avatar/AvatarRoom";
import AvatarView from "./avatar/AvatarView";
import Message from "./components/Message";
import Text from "./components/Text";
import Panel from "./components/Panel";
import { useDeviceDetection } from "../hooks/useDeviceDetection";
import { saveConversation, getConversations } from "../lib/supabase";

/**
 * Nettoie un texte avant de le vocaliser (TTS) :
 * retire les emojis, le markdown et les artefacts qui rendent la voix bizarre.
 */
function cleanForSpeech(text) {
  if (!text) return "";
  return String(text)
    // Emojis et symboles (pictogrammes, émoticônes, symboles divers, drapeaux)
    .replace(
      /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}]/gu,
      ""
    )
    .replace(/\*\*(.*?)\*\*/g, "$1") // **gras**
    .replace(/\*(.*?)\*/g, "$1")     // *italique*
    .replace(/_{1,2}(.*?)_{1,2}/g, "$1") // _souligné_
    .replace(/`+/g, "")              // `code`
    .replace(/#{1,6}\s*/g, "")       // titres markdown
    .replace(/\s{2,}/g, " ")         // espaces multiples
    .trim();
}

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
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState(null);
  const [showVoicePicker, setShowVoicePicker] = useState(false);

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
  const voicesLoadedRef = useRef(false);
  const ttsUnlockedRef = useRef(false);

  // iOS Safari bloque speechSynthesis.speak() si pas déclenché par un geste utilisateur.
  // On "déverrouille" le TTS au premier tap avec un utterance silencieux.
  const unlockTTS = useCallback(() => {
    if (ttsUnlockedRef.current) return;
    ttsUnlockedRef.current = true;
    const silent = new SpeechSynthesisUtterance("");
    silent.volume = 0;
    silent.lang = "fr-FR";
    window.speechSynthesis.speak(silent);
    // Aussi déverrouiller AudioContext pour iOS
    if (!audioContextRef.current) {
      try { audioContextRef.current = new AudioContext(); } catch(e) {}
    }
    if (audioContextRef.current?.state === "suspended") {
      audioContextRef.current.resume();
    }
  }, []);

  // Charger et filtrer les voix françaises au montage
  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      if (allVoices.length === 0) return;
      voicesLoadedRef.current = true;

      const french = allVoices.filter(v => v.lang.startsWith('fr'));
      if (french.length === 0) return;

      // Préférer fr-FR sur fr-CA / fr-BE / fr-CH
      const scored = french.map(v => {
        const isPremium = /Google|Microsoft|Natural|Neural|Siri|Samantha/i.test(v.name);
        const isFrFR = v.lang === 'fr-FR' || v.lang.toLowerCase() === 'fr_fr';
        return { v, isPremium, isFrFR };
      });

      // Dédupliquer par nom normalisé (retirer suffixes type "(France)", "Compact", etc.)
      const seen = new Map();
      for (const item of scored) {
        const key = item.v.name
          .replace(/\s*\((France|Canada|Belgium|Switzerland)\)/gi, '')
          .replace(/\s*(Compact|Premium|Enhanced|Mobile)/gi, '')
          .trim()
          .toLowerCase();
        const existing = seen.get(key);
        // Garder la meilleure version : fr-FR > autres, et premium > basique
        if (!existing
            || (item.isFrFR && !existing.isFrFR)
            || (item.isPremium && !existing.isPremium)) {
          seen.set(key, item);
        }
      }

      const deduped = [...seen.values()].sort((a, b) => {
        if (a.isPremium !== b.isPremium) return a.isPremium ? -1 : 1;
        if (a.isFrFR !== b.isFrFR) return a.isFrFR ? -1 : 1;
        return a.v.name.localeCompare(b.v.name);
      }).map(s => s.v);

      // Limiter à 6 max pour ne pas noyer l'utilisateur
      const sorted = deduped.slice(0, 6);

      setAvailableVoices(sorted);

      // Sélection par défaut : la meilleure voix premium
      if (!selectedVoiceURI) {
        setSelectedVoiceURI(sorted[0].voiceURI);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const getVoice = useCallback(() => {
    const voices = window.speechSynthesis.getVoices();
    // Utiliser la voix sélectionnée par l'utilisateur
    if (selectedVoiceURI) {
      const selected = voices.find(v => v.voiceURI === selectedVoiceURI);
      if (selected) return selected;
    }
    // Fallback : première voix française premium
    const frenchVoices = voices.filter(v => v.lang.startsWith('fr'));
    const premiumVoice = frenchVoices.find(v =>
      v.name.includes('Google') || v.name.includes('Microsoft') ||
      v.name.includes('Natural') || v.name.includes('Neural')
    );
    return premiumVoice || frenchVoices[0] || voices[0];
  }, [selectedVoiceURI]);

  // Prévisualiser une voix
  const previewVoice = useCallback((voiceURI) => {
    window.speechSynthesis.cancel();
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.voiceURI === voiceURI);
    if (!voice) return;
    const utterance = new SpeechSynthesisUtterance("Bonjour, je suis Helō. Je suis là pour t'écouter.");
    utterance.voice = voice;
    utterance.rate = 0.92;
    utterance.lang = 'fr-FR';
    window.speechSynthesis.speak(utterance);
  }, []);

  // TTS via Edge TTS (voix neurale Microsoft — qualité quasi-humaine)
  // OpenAI TTS via backend — voix neuronale haute qualité
  const speakViaOpenAITTS = useCallback(async (text) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://helo-backend.onrender.com';
      const response = await fetch(backendUrl + "/api/tts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, voice: 'shimmer' }),
      });
      if (!response.ok) throw new Error("OpenAI TTS error " + response.status);

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audio.volume = 1.0;

      if (isComponentMounted.current) {
        setIsSpeaking(true);
        setStatus("speaking");
      }

      return await new Promise((resolve) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          if (isComponentMounted.current) {
            setIsSpeaking(false);
            setStatus("ready");
            if (autoListen) {
              setTimeout(() => { if (isComponentMounted.current) startListening(); }, 500);
            }
          }
          resolve(true);
        };
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          resolve(false);
        };
        audio.play().catch(() => resolve(false));
      });
    } catch (e) {
      console.warn("[HELO] OpenAI TTS failed:", e.message);
      return false;
    }
  }, [autoListen]);

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

  // TTS fallback via navigateur — robuste avec retry si voix pas encore chargées
  const speakViaBrowser = useCallback((text) => {
    window.speechSynthesis.cancel();

    const doSpeak = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = getVoice();
      if (voice) utterance.voice = voice;
      utterance.rate = 0.92;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = 'fr-FR';

      // iOS Safari workaround : le TTS se met en pause après ~15s.
      // On relance périodiquement avec resume/pause.
      let resumeTimer = null;
      const startResumeLoop = () => {
        resumeTimer = setInterval(() => {
          if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }
        }, 10000);
      };
      const stopResumeLoop = () => {
        if (resumeTimer) clearInterval(resumeTimer);
      };

      utterance.onstart = () => {
        startResumeLoop();
        if (isComponentMounted.current) { setIsSpeaking(true); setStatus("speaking"); }
      };
      utterance.onend = () => {
        stopResumeLoop();
        if (isComponentMounted.current) {
          setIsSpeaking(false);
          setStatus("ready");
          if (autoListen) {
            setTimeout(() => { if (isComponentMounted.current) startListening(); }, 500);
          }
        }
      };
      utterance.onerror = (e) => {
        stopResumeLoop();
        console.warn("[HELO] Browser TTS error:", e.error);
        if (isComponentMounted.current) {
          setIsSpeaking(false);
          setStatus("ready");
          if (autoListen) {
            setTimeout(() => { if (isComponentMounted.current) startListening(); }, 500);
          }
        }
      };
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    };

    // Si les voix ne sont pas encore chargées, attendre un court instant
    if (!voicesLoadedRef.current && window.speechSynthesis.getVoices().length === 0) {
      const waitForVoices = setTimeout(() => {
        voicesLoadedRef.current = true;
        doSpeak();
      }, 300);
      window.speechSynthesis.onvoiceschanged = () => {
        clearTimeout(waitForVoices);
        voicesLoadedRef.current = true;
        doSpeak();
      };
    } else {
      doSpeak();
    }
  }, [getVoice, autoListen]);

  // Fonction principale TTS : OpenAI TTS (qualité top) → Edge TTS → navigateur
  const speakText = useCallback(async (rawText) => {
    if (!rawText) return;
    // Nettoyer le texte AVANT de le vocaliser : sinon le TTS lit les emojis
    // ("fleur de cerisier") et le markdown (**gras**), ce qui casse l'immersion.
    const text = cleanForSpeech(rawText);
    if (!text) return;
    window.speechSynthesis.cancel();

    // Priorité 1 : OpenAI TTS (voix neuronale naturelle)
    try {
      const success = await Promise.race([
        speakViaOpenAITTS(text),
        new Promise(resolve => setTimeout(() => resolve(false), 8000))
      ]);
      if (success) return;
    } catch (e) {
      console.warn("[HELO] OpenAI TTS error, trying next fallback");
    }

    // Priorité 2 : Edge TTS si configuré
    if (voiceServiceUrl) {
      try {
        const success = await Promise.race([
          speakViaEdgeTTS(text),
          new Promise(resolve => setTimeout(() => resolve(false), 3000))
        ]);
        if (success) return;
      } catch (e) {
        console.warn("[HELO] Edge TTS error, using browser TTS");
      }
    }

    // Priorité 3 : navigateur
    speakViaBrowser(text);
  }, [voiceServiceUrl, speakViaOpenAITTS, speakViaEdgeTTS, speakViaBrowser]);

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
      // Timeout de 30s — Render gratuit peut prendre jusqu'à 30s pour le cold start
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(api.base + "/generate/stream", {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: controller.signal,
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
      clearTimeout(timeout);

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
      const isTimeout = error.name === 'AbortError';
      const fallback = isTimeout
        ? `Pardon ${user.first_name}, le serveur met un peu de temps à répondre. Réessaie dans quelques secondes.`
        : `Je t'entends, ${user.first_name}. Peux-tu m'en dire plus ?`;
      setMessages(m => [...m, { role: "assistant", content: fallback }]);
      speakText(fallback);
    }
  };

  // ========================================================================
  // CONTRÔLE PRINCIPAL
  // ========================================================================

  const toggleListening = () => {
    // Déverrouiller TTS au premier geste utilisateur (obligatoire sur iOS Safari)
    unlockTTS();

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

        {/* Sélecteur de voix */}
        {availableVoices.length > 1 && (
          <div style={{
            textAlign: "center",
            marginBottom: "12px",
          }}>
            <button
              onClick={() => setShowVoicePicker(prev => !prev)}
              style={{
                background: "transparent",
                border: "1px solid rgba(123, 168, 192, 0.2)",
                borderRadius: "8px",
                padding: "6px 14px",
                fontSize: "12px",
                color: "#7BA8C0",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              🎤 {showVoicePicker ? "Masquer les voix" : "Changer la voix"}
            </button>

            {showVoicePicker && (
              <div style={{
                marginTop: "8px",
                padding: "12px",
                background: "rgba(242, 246, 247, 0.9)",
                borderRadius: "12px",
                border: "1px solid rgba(123, 168, 192, 0.15)",
                maxHeight: "160px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}>
                {availableVoices.map((v) => {
                  const isSelected = v.voiceURI === selectedVoiceURI;
                  const isPremium = /Google|Microsoft|Natural|Neural|Siri/i.test(v.name);
                  // Nom simplifié : retirer les préfixes techniques
                  const displayName = v.name
                    .replace(/Microsoft /gi, '')
                    .replace(/Google /gi, '')
                    .replace(/ Online \(Natural\)/gi, ' ✨')
                    .replace(/ \(Natural\)/gi, ' ✨');
                  return (
                    <div
                      key={v.voiceURI}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "6px 10px",
                        borderRadius: "8px",
                        background: isSelected ? "rgba(123, 168, 192, 0.15)" : "transparent",
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                      onClick={() => {
                        setSelectedVoiceURI(v.voiceURI);
                        previewVoice(v.voiceURI);
                      }}
                    >
                      <span style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        border: isSelected ? "2px solid #7BA8C0" : "2px solid #ccd5dc",
                        background: isSelected ? "#7BA8C0" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        {isSelected && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#fff" }} />}
                      </span>
                      <span style={{
                        fontSize: "13px",
                        color: isSelected ? "#3a4048" : "#7a8490",
                        flex: 1,
                        textAlign: "left",
                      }}>
                        {displayName}
                      </span>
                      {isPremium && <span style={{ fontSize: "10px", color: "#C0A87B" }}>HD</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

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
