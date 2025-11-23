import { useEffect, useRef, useState } from "react";
import { MANDALAS, PROTOCOL_PALETTES } from "./Mandalas";

export default function ColoringCanvas({ user, api, onSaved }) {
  const [selectedMandala, setSelectedMandala] = useState(MANDALAS[0]);
  const [protocol, setProtocol] = useState(
    selectedMandala.protocol || "apaisement",
  );
  const [color, setColor] = useState(PROTOCOL_PALETTES[protocol][0]);
  const [brushSize, setBrushSize] = useState(8);
  const svgContainerRef = useRef(null);
  const [availableManifests, setAvailableManifests] = useState([]);
  const [mobileView, setMobileView] = useState(false);

  useEffect(() => {
    setProtocol(selectedMandala.protocol || "apaisement");
    setColor(PROTOCOL_PALETTES[selectedMandala.protocol || "apaisement"][0]);
  }, [selectedMandala]);

  useEffect(() => {
    // detect mobile (simple heuristic)
    const onResize = () => setMobileView(window.innerWidth < 700);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        gap: "var(--space-lg)",
      }}
    >
      <div
        style={{
          background: "var(--color-surface-1)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-lg)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-md)",
        }}
      >
        <h3
          style={{
            fontSize: "var(--font-size-md)",
            color: "var(--color-text-primary)",
            marginBottom: "var(--space-md)",
          }}
        >
          Paramètres
        </h3>

        <div style={{ marginBottom: "var(--space-md)" }}>
          <label
            style={{
              display: "block",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-secondary)",
              marginBottom: 6,
            }}
          >
            Mandala
          </label>
          {/* Thumbnails (touch-friendly) */}
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {availableManifests.map((mf, i) => (
              <button
                key={`mf-${i}`}
                onClick={async () => {
                  // try to find in MANDALAS by name otherwise fetch svg
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
                  width: mobileView ? 84 : 64,
                  height: mobileView ? 84 : 64,
                  padding: 6,
                  borderRadius: 8,
                  border: "1px solid var(--color-border)",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
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
                  width: mobileView ? 84 : 64,
                  height: mobileView ? 84 : 64,
                  padding: 6,
                  borderRadius: 8,
                  border: "1px solid var(--color-border)",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
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

        <div style={{ marginBottom: "var(--space-md)" }}>
          <label
            style={{
              display: "block",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-secondary)",
              marginBottom: 6,
            }}
          >
            Protocole
          </label>
          <select
            value={protocol}
            onChange={(e) => setProtocol(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              background: "var(--color-background)",
              color: "var(--color-text-primary)",
            }}
          >
            {Object.keys(PROTOCOL_PALETTES).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "var(--space-md)" }}>
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
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(PROTOCOL_PALETTES[protocol] || []).map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                title={c}
                style={{
                  width: mobileView ? 40 : 28,
                  height: mobileView ? 40 : 28,
                  borderRadius: 8,
                  background: c,
                  border:
                    c === color
                      ? "3px solid var(--color-primary)"
                      : "1px solid var(--color-border)",
                  cursor: "pointer",
                  boxShadow:
                    c === color ? "0 0 0 3px rgba(0,0,0,0.04)" : "none",
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "var(--space-md)" }}>
          <label
            style={{
              display: "block",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-secondary)",
              marginBottom: 6,
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
          />
        </div>

        <button
          onClick={handleSave}
          style={{
            padding: "10px 14px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
            background: "var(--color-accent-calm)",
            color: "var(--color-primary)",
            cursor: "pointer",
          }}
        >
          Sauvegarder
        </button>
      </div>

      <div
        style={{
          background: "var(--color-surface-1)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-lg)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "var(--space-md)",
          }}
        >
          <div style={{ color: "var(--color-text-secondary)" }}>
            Cliquez une forme pour la remplir avec la couleur sélectionnée
          </div>
          <div
            style={{
              color: "var(--color-text-tertiary)",
              fontSize: "var(--font-size-xs)",
            }}
          >
            {selectedMandala.name}
          </div>
        </div>
        <div
          ref={svgContainerRef}
          onClick={handleFill}
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
          dangerouslySetInnerHTML={{ __html: selectedMandala.svg }}
        />
      </div>
    </div>
  );
}
