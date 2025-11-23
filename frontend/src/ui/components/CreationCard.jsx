import React from "react";

export default function CreationCard({ creation }) {
  return (
    <div className="dc-card">
      <div className="dc-card-title">
        {creation.title || creation.type || "Sans titre"}
      </div>
      {creation.date && (
        <div className="dc-card-meta">
          {new Date(creation.date).toLocaleDateString()}
        </div>
      )}
      {creation.excerpt && (
        <div className="dc-card-body">{creation.excerpt}</div>
      )}
    </div>
  );
}
