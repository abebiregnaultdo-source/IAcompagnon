import React, { useMemo, useState, useEffect, useRef } from "react";
import AvatarView from "./AvatarView";
import ConsultationRoom from "./ConsultationRoom";
import VoiceVisualization from "./VoiceVisualization";
import "./avatar.css";
import {
  SKIN_TONES,
  HAIR_STYLES,
  PRESENTATION_STYLES,
  loadPrefs,
  savePrefs,
  mapContextToLighting,
} from "./controls";

export default function AvatarRoom({
  context,
  initialPrefs,
  onPrefsChange,
  mode = "chat",
  isSpeaking = false,
  audioLevel = 0,
  showControls = false,
}) {
  const [prefs, setPrefs] = useState(() => ({
    ...loadPrefs(),
    ...initialPrefs,
  }));
  const [breathingPhase, setBreathingPhase] = useState(0);
  const animationRef = useRef(null);

  useEffect(() => {
    savePrefs(prefs);
    onPrefsChange && onPrefsChange(prefs);
  }, [prefs]);

  // Breathing animation - 6 second cycle
  useEffect(() => {
    let startTime = Date.now();
    const breathingCycle = 6000; // 6 seconds per breath

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const phase = ((elapsed % breathingCycle) / breathingCycle) * Math.PI * 2;
      setBreathingPhase(phase);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const lighting = useMemo(() => mapContextToLighting(context), [context]);

  const skinColor = useMemo(() => {
    const found =
      SKIN_TONES.find((s) => s.id === prefs.skinTone) || SKIN_TONES[1];
    return found.color;
  }, [prefs.skinTone]);

  return (
    <div className={`avatar-room ${mode === "voice" ? "voice" : ""}`}>
      <div
        className={`avatar-canvas ${mode === "overlay" ? "overlay" : ""}`}
        role="img"
        aria-label="Espace de consultation avec présence thérapeutique"
      >
        <ConsultationRoom theme={prefs.roomTheme} lighting={lighting} />
        <AvatarView
          skinColor={skinColor}
          hairStyle={prefs.hairStyle}
          presentation={prefs.presentation}
          breathingPhase={breathingPhase}
        />
        <VoiceVisualization isActive={isSpeaking} audioLevel={audioLevel} />
      </div>

      {(mode === "overlay" || showControls) && (
        <div className="avatar-controls" aria-label="Contrôles de présence">
          <label>
            Présentation
            <select
              value={prefs.presentation}
              onChange={(e) =>
                setPrefs((p) => ({ ...p, presentation: e.target.value }))
              }
            >
              {PRESENTATION_STYLES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Teint
            <select
              value={prefs.skinTone}
              onChange={(e) =>
                setPrefs((p) => ({ ...p, skinTone: e.target.value }))
              }
            >
              {SKIN_TONES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Cheveux
            <select
              value={prefs.hairStyle}
              onChange={(e) =>
                setPrefs((p) => ({ ...p, hairStyle: e.target.value }))
              }
            >
              {HAIR_STYLES.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Ambiance
            <select
              value={prefs.roomTheme}
              onChange={(e) =>
                setPrefs((p) => ({ ...p, roomTheme: e.target.value }))
              }
            >
              <option value="calm">Calme</option>
              <option value="warm">Chaleureux</option>
              <option value="pro">Professionnel</option>
            </select>
          </label>
          <div className="spacer" />
          <button
            onClick={() =>
              setPrefs({
                skinTone: "medium",
                hairStyle: "none",
                presentation: "neutral",
                roomTheme: "calm",
                showAvatar: true,
              })
            }
          >
            Réinitialiser
          </button>
        </div>
      )}
    </div>
  );
}
