import React from "react";

export default function ResourceCard({ resource }) {
  return (
    <div className="dc-card">
      <div className="dc-card-title">{resource.name}</div>
      <div className="dc-card-body">{resource.description}</div>
      {resource.url && (
        <div className="dc-card-actions">
          <a
            className="dc-link"
            href={resource.url}
            target="_blank"
            rel="noreferrer"
          >
            Ouvrir
          </a>
        </div>
      )}
    </div>
  );
}
