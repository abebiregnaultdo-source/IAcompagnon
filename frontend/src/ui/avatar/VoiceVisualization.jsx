import React, { useEffect, useRef, useState } from "react";

/**
 * Subtle voice visualization - not a mouth, but a gentle presence indicator
 * Shows when the therapeutic presence is "speaking" through subtle light waves
 */
export default function VoiceVisualization({
  isActive = false,
  audioLevel = 0,
}) {
  const [waves, setWaves] = useState([0, 0, 0]);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!isActive) {
      setWaves([0, 0, 0]);
      return;
    }

    let startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const baseLevel = audioLevel * 0.6 + 0.2; // Normalize to 0.2-0.8 range

      // Three waves with different frequencies for organic feel
      const wave1 = Math.sin(elapsed * 0.003) * baseLevel;
      const wave2 = Math.sin(elapsed * 0.004 + 1) * baseLevel * 0.8;
      const wave3 = Math.sin(elapsed * 0.0035 + 2) * baseLevel * 0.9;

      setWaves([wave1, wave2, wave3]);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, audioLevel]);

  if (!isActive) return null;

  return (
    <div className="voice-visualization" aria-hidden="true">
      <svg
        width="100%"
        height="40"
        viewBox="0 0 200 40"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Subtle wave lines - not intrusive */}
        <path
          d={`M 20 20 Q 60 ${20 - waves[0] * 8}, 100 20 T 180 20`}
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="1.5"
          fill="none"
          className="voice-wave"
        />
        <path
          d={`M 20 20 Q 60 ${20 - waves[1] * 6}, 100 20 T 180 20`}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="1"
          fill="none"
          className="voice-wave"
        />
        <path
          d={`M 20 20 Q 60 ${20 - waves[2] * 7}, 100 20 T 180 20`}
          stroke="rgba(255, 255, 255, 0.25)"
          strokeWidth="1.2"
          fill="none"
          className="voice-wave"
        />
      </svg>
    </div>
  );
}
