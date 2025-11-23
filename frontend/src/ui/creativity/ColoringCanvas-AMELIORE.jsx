import { useEffect, useRef, useState } from "react";
import { MANDALAS, PROTOCOL_PALETTES } from "./Mandalas";
import { useDeviceDetection } from "../../hooks/useDeviceDetection";

/**
 * ColoringCanvas - Version améliorée
 * 
 * Améliorations:
 * 1. Sidebar sticky élégante
 * 2. Canvas avec fond apaisant
 * 3. Palette en grille
 * 4. Boutons d'action repensés
 * 5. Meilleur responsive
 */
export default function ColoringCanvas({ user, api, onSaved }) {
  const device = useDeviceDetection();
  const [selectedMandala, setSelectedMandala] = useState(MANDALAS[0]);
  const [protocol, setProtocol] = useState(
    selectedMandala.protocol || "apaisement",
  );
  const [color, setColor] = useState(PROTOCOL_PALETTES[protocol][0]);
  const [brushSize, setBrushSize] = useState(8);
  const svgContainerRef = useRef(null);
  const [availableManifests, setAvailableManifests] = useState([]);

  useEffect(() => {
    setProtocol(selectedMandala.protocol || "apaisement");
    setColor(PROTOCOL_PALETTES[selectedMandala.protocol || "apaisement"][0]);
  }, [selectedMandala]);

  useEffect(() => {
    // Try to load public manifest of mandalas for thumbnails
    const loadManifest = async () => {
      try {
        const res = await fetch("/mandalas/manifest.json");
        if (!res.ok) return;
        const data = await res.json();
        setAvailableManifests(data || []);
      } catch (e) {
        // ignore
      }
    };
    loadManifest();
  }, []);

  const handleFill = (evt) => {
    const target = evt.target;
    if (
      !target ||
      !(
        target.tagName === "path" ||
        target.tagName === "circle" ||
        target.tagName === "polygon" ||
        target.tagName === "rect"
      )
    )
      return;
    // set fill on clicked shape
    target.setAttribute("fill", color);
  };

  const handleSave = async () => {
    try {
      const svgEl = svgContainerRef.current.querySelector("svg");
      if (!svgEl) return;
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgEl);

      const res = await fetch(`${api.base}/api/creations/coloring`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          title: selectedMandala.name,
          svg_data: svgString,
          protocol,
        }),
      });
      if (res.ok) {
        if (onSaved) onSaved();
      }
    } catch (e) {
      console.error("Erreur sauvegarde coloriage", e);
    }
  };

  const handleReset = () => {
    if (window.confirm("Recommencer ? Votre coloriage actuel sera perdu.")) {
      const svgEl = svgContainerRef.current.querySelector("svg");
      if (!svgEl) return;
      svgEl.querySelectorAll("path, circle, polygon, rect").forEach((el) => {
        el.setAttribute("fill", "white");
      });
    }
  };

  return (
    <div
      style={{
        display: device.isMobile ? "block" : "grid",
        gridTemplateColumns: device.isMobile ? "1fr" : "300px 1fr",
        gap: "var(--space-lg)",
      }}
    >
      {/* SIDEBAR */}
      <div
        style={{
          background: "var(--color-surface-1)",
          border: "1px solid var(--color-accent-calm)",
          borderRadius: "20px",
          padding: "var(--space-lg)",
          height: "fit-content",
          position: device.isMobile ? "static" : "sticky",
          top: "20px",
          marginBottom: device.isMobile ? "var(--space-lg)" : 0,
        }}
      >
        <h2
          style={{
            fontSize: "18px",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--color-text-primary)",
            marginBottom: "var(--space-lg)",
          }}
        >
          Paramètres
        </h2>

        {/* Mandalas */}
        <div style={{ marginBottom: "var(--space-lg)" }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--color-text-secondary)",
              marginBottom: "var(--space-sm)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Mandala
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "var(--space-xs)",
            }}
          >
            {availableManifests.map((mf, i) => (
              <button
                key={`mf-${i}`}
                onClick={async () => {
                  const local = MANDALAS.find(
                    (m) =>
                      m.name === mf.name ||
                      m.id === mf.name.toLowerCase().replace(/\s+/g, "_"),
                  );
                  if (local) {
                    setSelectedMandala(local);
                    return;
                  }
                  try {
                    const r = await fetch(mf.src);
                    const txt = await r.text();
                    setSelectedMandala({
                      id: mf.src,
                      name: mf.name,
                      protocol:
                        mf.tags && mf.tags.includes("energy")
                          ? "integration"
                          : "apaisement",
                      svg: txt,
                    });
                  } catch (e) {
                    console.error("Failed load mandala svg", e);
                  }
                }}
                aria-label={`Select ${mf.name}`}
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  padding: "8px",
                  borderRadius: "10px",
                  border:
                    selectedMandala.name === mf.name
                      ? "2px solid var(--color-primary)"
                      : "2px solid var(--color-accent-calm)",
                  background: "var(--color-surface-1)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (selectedMandala.name !== mf.name) {
                    e.currentTarget.style.borderColor = "var(--color-primary)";
                    e.currentTarget.style.transform = "scale(1.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedMandala.name !== mf.name) {
                    e.currentTarget.style.borderColor =
                      "var(--color-accent-calm)";
                    e.currentTarget.style.transform = "scale(1)";
                  }
                }}
              >
                <img
                  src={mf.src}
                  alt={mf.name}
                  style={{ maxWidth: "100%", maxHeight: "100%" }}
                />
              </button>
            ))}

            {MANDALAS.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMandala(m)}
                aria-label={`Select ${m.name}`}
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  padding: "8px",
                  borderRadius: "10px",
                  border:
                    selectedMandala.id === m.id
                      ? "2px solid var(--color-primary)"
                      : "2px solid var(--color-accent-calm)",
                  background:
                    selectedMandala.id === m.id
                      ? "var(--color-surface-calm)"
                      : "var(--color-surface-1)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (selectedMandala.id !== m.id) {
                    e.currentTarget.style.borderColor = "var(--color-primary)";
                    e.currentTarget.style.transform = "scale(1.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedMandala.id !== m.id) {
                    e.currentTarget.style.borderColor =
                      "var(--color-accent-calm)";
                    e.currentTarget.style.transform = "scale(1)";
                  }
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  dangerouslySetInnerHTML={{ __html: m.svg }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Protocole */}
        <div style={{ marginBottom: "var(--space-lg)" }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--color-text-secondary)",
              marginBottom: "var(--space-sm)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Protocole
          </label>
          <select
            value={protocol}
            onChange={(e) => setProtocol(e.target.value)}
            style={{
              width: "100%",
              padding: "var(--space-sm)",
              borderRadius: "10px",
              border: "1px solid var(--color-accent-calm)",
              background: "var(--color-surface-calm)",
              color: "var(--color-text-primary)",
              fontSize: "14px",
              cursor: "pointer",
              transition: "border-color 0.2s ease",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--color-primary)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--color-accent-calm)";
            }}
          >
            {Object.keys(PROTOCOL_PALETTES).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Palette de couleurs */}
        <div style={{ marginBottom: "var(--space-lg)" }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--color-text-secondary)",
              marginBottom: "var(--space-sm)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Palette
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "var(--space-xs)",
            }}
          >
            {(PROTOCOL_PALETTES[protocol] || []).map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                title={c}
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  borderRadius: "8px",
                  background: c,
                  border:
                    c === color
                      ? "2px solid var(--color-text-primary)"
                      : "2px solid transparent",
                  cursor: "pointer",
                  boxShadow:
                    c === color ? "0 0 0 3px rgba(0,0,0,0.1)" : "none",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              />
            ))}
          </div>
        </div>

        {/* Taille du pinceau */}
        <div style={{ marginBottom: "var(--space-lg)" }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--color-text-secondary)",
              marginBottom: "var(--space-sm)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Taille du pinceau
          </label>
          <input
            type="range"
            min={2}
            max={24}
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            style={{
              width: "100%",
              height: "6px",
              borderRadius: "3px",
              background: "var(--color-accent-calm)",
              outline: "none",
              WebkitAppearance: "none",
            }}
          />
        </div>

        {/* Boutons d'action */}
        <div>
          <button
            onClick={handleSave}
            style={{
              width: "100%",
              padding: "var(--space-md)",
              background: "var(--color-primary)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "15px",
              fontWeight: "var(--font-weight-medium)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--color-primary-dark)";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(123, 168, 192, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--color-primary)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            💾 Sauvegarder
          </button>
          <button
            onClick={handleReset}
            style={{
              width: "100%",
              padding: "var(--space-sm)",
              background: "transparent",
              color: "var(--color-text-secondary)",
              border: "1px solid var(--color-accent-calm)",
              borderRadius: "10px",
              fontSize: "14px",
              cursor: "pointer",
              marginTop: "var(--space-sm)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--color-primary)";
              e.currentTarget.style.color = "var(--color-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--color-accent-calm)";
              e.currentTarget.style.color = "var(--color-text-secondary)";
            }}
          >
            🔄 Recommencer
          </button>
        </div>
      </div>

      {/* CANVAS AREA */}
      <div
        style={{
          background: "var(--color-surface-1)",
          border: "1px solid var(--color-accent-calm)",
          borderRadius: "20px",
          padding: device.isMobile ? "var(--space-md)" : "var(--space-xl)",
          minHeight: device.isMobile ? "400px" : "600px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Canvas Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "var(--space-lg)",
            paddingBottom: "var(--space-md)",
            borderBottom: "1px solid var(--color-accent-calm)",
            flexWrap: "wrap",
            gap: "var(--space-sm)",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              color: "var(--color-text-secondary)",
            }}
          >
            Cliquez une forme pour la remplir
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "var(--color-text-tertiary)",
            }}
          >
            {selectedMandala.name}
          </div>
        </div>

        {/* SVG Container */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: device.isMobile ? "var(--space-md)" : "var(--space-xl)",
            background: "var(--color-surface-calm)",
            borderRadius: "16px",
          }}
        >
          <div
            ref={svgContainerRef}
            onClick={handleFill}
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.05))",
            }}
            dangerouslySetInnerHTML={{ __html: selectedMandala.svg }}
          />
        </div>
      </div>
    </div>
  );
}
