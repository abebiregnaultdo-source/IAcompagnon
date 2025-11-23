import React from "react";

export default function Tabs({
  tabs = [],
  active = null,
  onChange = () => {},
  className = "",
}) {
  const isIndex = typeof active === "number";
  const activeIndex = isIndex
    ? active
    : tabs.findIndex((t) => t.key === active);

  return (
    <div className={`ui-tabs ${className}`}>
      <div
        className="ui-tabs-header"
        style={{ display: "flex", gap: "var(--space-sm)" }}
      >
        {tabs.map((t, i) => {
          const isActive = isIndex ? i === activeIndex : activeIndex === i;
          return (
            <button
              key={t.key || i}
              onClick={() => onChange(isIndex ? i : t.key)}
              style={{
                background: isActive ? "var(--color-primary)" : "transparent",
                color: isActive ? "#fff" : "var(--color-text-primary)",
                border: "none",
                padding: "6px 10px",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <div className="ui-tabs-body" style={{ marginTop: "var(--space-md)" }}>
        {tabs[activeIndex] && tabs[activeIndex].content}
      </div>
    </div>
  );
}
