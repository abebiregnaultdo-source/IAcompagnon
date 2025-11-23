import { useEffect, useRef, useState } from "react";
import AvatarRoom from "./avatar/AvatarRoom";
import Message from "./components/Message";
import Button from "./components/Button";
import Text from "./components/Text";
import Panel from "./components/Panel";
import { useDeviceDetection } from "../hooks/useDeviceDetection";

/**
 * VoiceChat - Interface de conversation vocale
 *
 * Permet à l'utilisateur de parler avec l'IA comme lors d'un appel téléphonique
 */
export default function VoiceChat({ api, user, onEmotionalStateChange }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Bonjour ${user.first_name}. Je suis là pour vous écouter. Prenez votre temps.`,
    },
  ]);

  const [isRecording, setIsRecording] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState("disconnected"); // 'connecting' | 'connected' | 'disconnected'
  const [error, setError] = useState(null);

  const wsRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const viewRef = useRef(null);

  // ========================================================================
  // CONNEXION WEBSOCKET
  // ========================================================================

  useEffect(() => {
    connectWebSocket();

    return () => {
      disconnectWebSocket();
    };
  }, []);

  const connectWebSocket = () => {
    setConnectionStatus("connecting");

    const wsUrl = `ws://localhost:8003/ws/voice/${user.id}`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log("WebSocket connected");
      setConnectionStatus("connected");
      setError(null);
    };

    wsRef.current.onmessage = async (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "transcript") {
        // Ajouter transcription à l'historique
        setMessages((prev) => [
          ...prev,
          {
            role: message.role,
            content: message.text,
          },
        ]);
      } else if (message.type === "audio") {
        // Jouer l'audio de l'IA
        await playAudio(message.data);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("Erreur de connexion au service vocal");
      setConnectionStatus("disconnected");
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket closed");
      setConnectionStatus("disconnected");
    };
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  // ========================================================================
  // ENREGISTREMENT AUDIO
  // ========================================================================

  const startRecording = async () => {
    try {
      // Demander permission micro
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Créer MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(stream);

      // Créer AudioContext pour visualisation
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      // Démarrer visualisation
      visualizeAudio();

      // Collecter chunks
      const audioChunks = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        // Convertir en base64
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const audioBase64 = await blobToBase64(audioBlob);

        // Envoyer via WebSocket
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: "audio",
              data: audioBase64,
            }),
          );
        }

        // Arrêter visualisation
        setAudioLevel(0);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone error:", error);
      setError("Impossible d'accéder au microphone");
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Arrêter le stream
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // ========================================================================
  // VISUALISATION AUDIO
  // ========================================================================

  const visualizeAudio = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const update = () => {
      if (!isRecording) return;

      analyserRef.current.getByteFrequencyData(dataArray);

      // Calculer niveau moyen
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average / 255);

      requestAnimationFrame(update);
    };

    update();
  };

  // ========================================================================
  // LECTURE AUDIO
  // ========================================================================

  const playAudio = async (audioBase64) => {
    try {
      setIsAISpeaking(true);

      // Décoder base64
      const audioData = atob(audioBase64);
      const arrayBuffer = new ArrayBuffer(audioData.length);
      const view = new Uint8Array(arrayBuffer);
      for (let i = 0; i < audioData.length; i++) {
        view[i] = audioData.charCodeAt(i);
      }

      // Créer AudioContext si nécessaire
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      // Décoder et jouer
      const audioBuffer =
        await audioContextRef.current.decodeAudioData(arrayBuffer);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);

      source.onended = () => {
        setIsAISpeaking(false);
      };

      source.start();
    } catch (error) {
      console.error("Audio playback error:", error);
      setIsAISpeaking(false);
    }
  };

  // ========================================================================
  // UTILITAIRES
  // ========================================================================

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Auto-scroll
  useEffect(() => {
    viewRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
  }, [messages]);

  // ========================================================================
  // RENDER
  // ========================================================================

  const device = useDeviceDetection();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-background)",
        padding: device.isMobile ? "var(--space-md)" : "var(--space-xl)",
      }}
    >
      <div
        style={{
          maxWidth: device.isDesktop ? "1100px" : "900px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text as="h2" size="lg" style={{ margin: 0 }}>
            Appel vocal
          </Text>
          <Text
            size="sm"
            color={connectionStatus === "connected" ? "primary" : "secondary"}
          >
            {connectionStatus}
            {error ? ` — ${error}` : ""}
          </Text>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {/* Messages / Transcript area */}
          <div
            ref={viewRef}
            style={{
              flex: 1,
              minHeight: 320,
              maxHeight: 520,
              overflow: "auto",
              background: "var(--color-surface-2)",
              padding: 12,
              borderRadius: 10,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {messages.map((m, i) => (
              <Message key={i} role={m.role} text={m.content} />
            ))}
          </div>

          {/* Avatar + controls */}
          <div
            style={{
              width: 320,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <Panel>
              <AvatarRoom user={user} small />
            </Panel>

            <Panel>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text as="div" style={{ fontWeight: 600 }}>
                  Contrôles
                </Text>
                <Text size="sm" color="secondary">
                  {isAISpeaking
                    ? "L'IA parle…"
                    : isRecording
                      ? "Enregistrement…"
                      : "Prêt"}
                </Text>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <Button
                  onClick={toggleRecording}
                  variant={isRecording ? "danger" : "primary"}
                >
                  {isRecording ? "Arrêter" : "Parler"}
                </Button>
                <Button
                  onClick={() => {
                    if (wsRef.current) disconnectWebSocket();
                    else connectWebSocket();
                  }}
                  variant="secondary"
                >
                  {connectionStatus === "connected"
                    ? "Déconnecter"
                    : "Connecter"}
                </Button>
              </div>

              <div style={{ marginTop: 6 }}>
                <div
                  style={{
                    height: 8,
                    background: "rgba(0,0,0,0.06)",
                    borderRadius: 6,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min(100, Math.round((audioLevel || 0) * 100))}%`,
                      background:
                        "linear-gradient(90deg,var(--color-accent),#f4a261)",
                    }}
                  />
                </div>
                <Text size="sm" color="secondary" style={{ marginTop: 6 }}>
                  Niveau audio: {Math.round((audioLevel || 0) * 100)}%
                </Text>
              </div>
            </Panel>

            <div
              style={{
                fontSize: 12,
                color: "var(--color-text-secondary)",
                textAlign: "center",
              }}
            >
              {error ? (
                <span style={{ color: "var(--color-danger)" }}>{error}</span>
              ) : (
                "Micro et WebSocket prêts"
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
