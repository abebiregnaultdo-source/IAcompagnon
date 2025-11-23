import React from "react";

export default function Panel({
  children,
  className = "",
  style = {},
  ...props
}) {
  return (
    <div
      className={`ui-panel ${className}`}
      style={{
        padding: "var(--space-lg)",
        background: "var(--color-surface-1)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-border)",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
