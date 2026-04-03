import { useEffect, useRef, useState, useCallback } from "react";

/**
 * DrawingCanvas — Dessin libre au doigt / souris
 *
 * Outil d'expression visuelle thérapeutique.
 * Pas de contrainte, pas de forme imposée. L'utilisateur dessine
 * ce qu'il ressent, librement.
 *
 * Touch-first: optimisé pour mobile (doigt), fonctionne aussi à la souris.
 */

const PALETTES = {
  émotions: [
    "#E53E3E", "#DD6B20", "#D69E2E", "#38A169", "#3182CE",
    "#805AD5", "#D53F8C", "#319795", "#2D3748", "#F2F6F7",
  ],
  apaisement: [
    "#4FD1C5", "#63B3ED", "#90CDF4", "#9AE6B4", "#68D391",
    "#C3DAFE", "#FED7E2", "#FEEBC8", "#E2E8F0", "#F2F6F7",
  ],
  terre: [
    "#6B4B3A", "#8B6914", "#A0522D", "#2F855A", "#276749",
    "#744210", "#9C4221", "#4A5568", "#2D3748", "#F2F6F7",
  ],
};

export default function DrawingCanvas({ user, api, onSaved }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#2D3748");
  const [brushSize, setBrushSize] = useState(6);
  const [palette, setPalette] = useState("émotions");
  const [history, setHistory] = useState([]);
  const [mobileView, setMobileView] = useState(false);
  const [saving, setSaving] = useState(false);

  // Responsive
  useEffect(() => {
    const onResize = () => setMobileView(window.innerWidth < 700);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Init canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Taille du canvas selon le conteneur
    const container = canvas.parentElement;
    const size = Math.min(container.clientWidth, 500);
    canvas.width = size * 2;  // Retina
    canvas.height = size * 2;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const ctx = canvas.getContext("2d");
    ctx.scale(2, 2); // Retina scaling
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctxRef.current = ctx;

    // Fond crème (pas de blanc pur)
    ctx.fillStyle = "#F2F6F7";
    ctx.fillRect(0, 0, size, size);

    // Sauvegarder l'état initial
    saveToHistory();
  }, []);

  // Mettre à jour les paramètres du contexte
  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.strokeStyle = color;
      ctxRef.current.lineWidth = brushSize;
    }
  }, [color, brushSize]);

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const data = canvas.toDataURL("image/png");
    setHistory(prev => [...prev.slice(-20), data]); // Max 20 undo steps
  }, []);

  // Obtenir les coordonnées (touch ou mouse)
  const getPos = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = (canvas.width / 2) / rect.width;
    const scaleY = (canvas.height / 2) / rect.height;

    if (e.touches && e.touches.length > 0) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const startDrawing = useCallback((e) => {
    e.preventDefault();
    const pos = getPos(e);
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  }, [getPos]);

  const draw = useCallback((e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const pos = getPos(e);
    ctxRef.current.lineTo(pos.x, pos.y);
    ctxRef.current.stroke();
  }, [isDrawing, getPos]);

  const stopDrawing = useCallback((e) => {
    if (e) e.preventDefault();
    if (isDrawing) {
      ctxRef.current.closePath();
      setIsDrawing(false);
      saveToHistory();
    }
  }, [isDrawing, saveToHistory]);

  const undo = () => {
    if (history.length <= 1) return;
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = ctxRef.current;
      ctx.clearRect(0, 0, canvas.width / 2, canvas.height / 2);
      ctx.drawImage(img, 0, 0, canvas.width / 2, canvas.height / 2);
    };
    img.src = newHistory[newHistory.length - 1];
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    const size = canvas.width / 2;
    ctx.fillStyle = "#F2F6F7";
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = color;
    saveToHistory();
  };

  const handleSave = async () => {
    if (!canvasRef.current) return;
    setSaving(true);
    try {
      const imageData = canvasRef.current.toDataURL("image/png");
      const res = await fetch(`${api.base}/api/creations/coloring`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          title: "Dessin libre",
          svg_data: imageData, // réutilise le champ existant pour compatibilité
          protocol: "expression_libre",
        }),
      });
      if (res.ok && onSaved) onSaved();
    } catch (e) {
      console.error("Erreur sauvegarde dessin", e);
    } finally {
      setSaving(false);
    }
  };

  const canvasSize = mobileView ? "100%" : "500px";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: mobileView ? "1fr" : "220px 1fr",
        gap: "var(--space-lg)",
      }}
    >
      {/* Panneau outils */}
      <div
        style={{
          background: "var(--color-surface-1)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-lg)",
          display: "flex",
          flexDirection: mobileView ? "row" : "column",
          flexWrap: mobileView ? "wrap" : "nowrap",
          gap: "var(--space-md)",
          alignItems: mobileView ? "center" : "stretch",
        }}
      >
        {/* Palette */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-secondary)",
              marginBottom: 6,
            }}
          >
            Palette
          </label>
          <select
            value={palette}
            onChange={(e) => {
              setPalette(e.target.value);
              setColor(PALETTES[e.target.value][0]);
            }}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              background: "var(--color-background)",
              color: "var(--color-text-primary)",
              fontSize: "var(--font-size-sm)",
            }}
          >
            {Object.keys(PALETTES).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Couleurs */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-secondary)",
              marginBottom: 6,
            }}
          >
            Couleur
          </label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {PALETTES[palette].map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: mobileView ? 36 : 28,
                  height: mobileView ? 36 : 28,
                  borderRadius: "50%",
                  background: c,
                  border: c === color
                    ? "3px solid var(--color-primary)"
                    : "2px solid var(--color-border)",
                  cursor: "pointer",
                  transition: "transform 0.15s",
                  transform: c === color ? "scale(1.15)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Taille */}
        <div style={{ minWidth: mobileView ? "120px" : "auto" }}>
          <label
            style={{
              display: "block",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-secondary)",
              marginBottom: 6,
            }}
          >
            Taille ({brushSize}px)
          </label>
          <input
            type="range"
            min={1}
            max={30}
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>

        {/* Actions */}
        <div style={{
          display: "flex",
          gap: "var(--space-sm)",
          flexDirection: mobileView ? "row" : "column",
          marginTop: mobileView ? 0 : "auto",
        }}>
          <button
            onClick={undo}
            disabled={history.length <= 1}
            style={{
              padding: "8px 14px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface-1)",
              color: history.length > 1 ? "var(--color-text-primary)" : "var(--color-text-tertiary)",
              cursor: history.length > 1 ? "pointer" : "not-allowed",
              fontSize: "var(--font-size-sm)",
            }}
          >
            ↩ Annuler
          </button>
          <button
            onClick={clearCanvas}
            style={{
              padding: "8px 14px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface-1)",
              color: "var(--color-text-secondary)",
              cursor: "pointer",
              fontSize: "var(--font-size-sm)",
            }}
          >
            Effacer tout
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              background: "var(--color-accent-calm)",
              color: "var(--color-primary)",
              cursor: saving ? "wait" : "pointer",
              fontWeight: "var(--font-weight-medium)",
              fontSize: "var(--font-size-sm)",
            }}
          >
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>
      </div>

      {/* Zone de dessin */}
      <div
        style={{
          background: "var(--color-surface-1)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-lg)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            color: "var(--color-text-secondary)",
            fontSize: "var(--font-size-sm)",
            marginBottom: "var(--space-md)",
            textAlign: "center",
          }}
        >
          Dessinez librement ce que vous ressentez. Pas de règle, pas de jugement.
        </div>
        <div
          style={{
            width: canvasSize,
            maxWidth: "100%",
            aspectRatio: "1 / 1",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            border: "1px solid var(--color-border)",
            touchAction: "none", // Empêche le scroll pendant le dessin
            cursor: "crosshair",
          }}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            onTouchCancel={stopDrawing}
            style={{
              display: "block",
              width: "100%",
              height: "100%",
            }}
          />
        </div>
      </div>
    </div>
  );
}
