import React from "react";

export default function Text({
  size = "md",
  color = "primary",
  as = "span",
  className = "",
  children,
  ...rest
}) {
  const Tag = as;
  const sizeClass =
    size === "lg" ? "ui-text-lg" : size === "sm" ? "ui-text-sm" : "ui-text-md";
  const colorClass =
    color === "secondary" ? "ui-text-secondary" : "ui-text-primary";
  return (
    <Tag
      className={`ui-text ${sizeClass} ${colorClass} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
