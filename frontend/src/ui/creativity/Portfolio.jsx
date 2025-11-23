import { useEffect, useState } from "react";

export default function Portfolio({ user, api, onBack }) {
  const [creations, setCreations] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    load();
  }, [user.id]);

  const load = async () => {
    const res = await fetch(`${api.base}/api/creations/${user.id}`);
    const data = await res.json();
    setCreations(data.creations || []);
  };

  const visible = creations.filter((c) =>
    filter === "all" ? true : c.type === filter,
  );

  return (
    <div style={{ padding: "var(--space-xl)" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--space-lg)",
        }}
      >
        <h2 style={{ color: "var(--color-text-primary)" }}>Votre portfolio</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: 8,
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            background: "var(--color-background)",
            color: "var(--color-text-primary)",
          }}
        >
          <option value="all">Tous</option>
          <option value="journal">Journal</option>
          <option value="narrative">Narratif</option>
          <option value="poem">Poème</option>
          <option value="ritual">Rituel</option>
          <option value="coloring">Coloriage</option>
        </select>
      </div>

      {visible.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            color: "var(--color-text-tertiary)",
            padding: "var(--space-2xl)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            background: "var(--color-surface-1)",
          }}
        >
          Aucune création pour le moment.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "var(--space-md)",
          }}
        >
          {visible.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                background: "var(--color-surface-1)",
                padding: "var(--space-md)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "var(--space-xs)",
                }}
              >
                <div
                  style={{
                    color: "var(--color-text-primary)",
                    fontWeight: "var(--font-weight-medium)",
                  }}
                >
                  {item.title || "Sans titre"}
                </div>
                <div
                  style={{
                    color: "var(--color-text-tertiary)",
                    fontSize: "var(--font-size-xs)",
                  }}
                >
                  {new Date(item.created_at).toLocaleDateString("fr-FR")}
                </div>
              </div>
              {item.type === "coloring" ? (
                <div
                  style={{
                    overflow: "hidden",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--color-border)",
                    background: "white",
                    maxHeight: 240,
                  }}
                  dangerouslySetInnerHTML={{ __html: item.content || "" }}
                />
              ) : (
                <div
                  style={{
                    color: "var(--color-text-secondary)",
                    fontSize: "var(--font-size-sm)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {(item.content || item.description || "").slice(0, 220)}
                  {(item.content || item.description || "").length > 220 &&
                    "..."}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
