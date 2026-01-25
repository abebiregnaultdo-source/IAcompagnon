// Simple mandala library (SVG strings) for MVP coloring

export const MANDALAS = [
  {
    id: "concentric_1",
    name: "Mandalas concentriques",
    protocol: "apaisement",
    svg: `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><style>.st0{fill:#fff;stroke:#000;stroke-width:2;cursor:pointer}.st0:hover{opacity:0.8}</style></defs><g><circle class="st0" cx="300" cy="300" r="280"/><circle class="st0" cx="300" cy="300" r="240"/><circle class="st0" cx="300" cy="300" r="200"/><circle class="st0" cx="300" cy="300" r="160"/><circle class="st0" cx="300" cy="300" r="120"/><circle class="st0" cx="300" cy="300" r="80"/><circle class="st0" cx="300" cy="300" r="40"/></g></svg>`,
  },
  {
    id: "floral_1",
    name: "Rosace florale",
    protocol: "integration",
    svg: `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><style>.st0{fill:#fff;stroke:#000;stroke-width:2;cursor:pointer}.st0:hover{opacity:0.8}</style></defs><g transform="translate(300,300)"> ${Array.from(
      { length: 12 },
    )
      .map(
        (_, i) =>
          `<g transform='rotate(${i * 30})'><path class='st0' d='M0,0 C40,-40 80,-40 120,0 C80,40 40,40 0,0 Z'/></g>`,
      )
      .join("")}</g></svg>`,
  },
  {
    id: "narrative_sections",
    name: "Mandala narratif (sections)",
    protocol: "expression",
    svg: `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><style>.st0{fill:#fff;stroke:#000;stroke-width:2;cursor:pointer}.st0:hover{opacity:0.8}</style></defs><g>${Array.from(
      { length: 8 },
    )
      .map(
        (_, i) => {
          const angle1 = (i * Math.PI) / 4;
          const angle2 = ((i + 1) * Math.PI) / 4;
          const x1 = 300 + 280 * Math.cos(angle1);
          const y1 = 300 + 280 * Math.sin(angle1);
          const x2 = 300 + 280 * Math.cos(angle2);
          const y2 = 300 + 280 * Math.sin(angle2);
          return `<path class='st0' d='M300,300 L${x1},${y1} A280,280 0 0,1 ${x2},${y2} Z'/>`;
        },
      )
      .join("")}</g></svg>`,
  },
  {
    id: "kaleidoscope",
    name: "Kaleidoscope",
    protocol: "integration",
    svg:
      `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><style>.st0{fill:#fff;stroke:#111;stroke-width:1.5;cursor:pointer}.st0:hover{opacity:0.8}</style></defs><g transform="translate(300,300)"><circle class="st0" r="280"/>` +
      new Array(24)
        .fill(0)
        .map(
          (_, i) =>
            `<g transform="rotate(${i * 15})"><path class="st0" d="M0,0 L0,-280 L20,-260 L0,-240 Z"/></g>`,
        )
        .join("") +
      `<circle class="st0" r="60"/></g></svg>`,
  },
  {
    id: "geometric_lace",
    name: "Geometric Lace",
    protocol: "apaisement",
    svg:
      `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><style>.st0{fill:#fff;stroke:#1b1b1b;stroke-width:1.8;cursor:pointer}.st0:hover{opacity:0.8}</style></defs><g transform="translate(300,300)"><circle class="st0" r="260"/>` +
      new Array(12)
        .fill(0)
        .map(
          (_, i) =>
            `<g transform="rotate(${i * 30})"><ellipse class="st0" cx="60" cy="-210" rx="40" ry="50"/></g>`,
        )
        .join("") +
      new Array(6)
        .fill(0)
        .map(
          (_, i) =>
            `<g transform="rotate(${i * 60})"><circle class='st0' cx='0' cy='-140' r='25'/></g>`,
        )
        .join("") +
      `</g></svg>`,
  },
  {
    id: "lotus_pattern",
    name: "Lotus Pattern",
    protocol: "expression",
    svg:
      `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><style>.st0{fill:#fff;stroke:#0c2733;stroke-width:2;cursor:pointer}.st0:hover{opacity:0.8}</style></defs><g transform="translate(300,300)"><circle class="st0" cx="0" cy="0" r="220"/>` +
      new Array(8)
        .fill(0)
        .map(
          (_, i) =>
            `<g transform="rotate(${i * 45})"><path class='st0' d="M0,-180 C30,-120 60,-120 90,-80 C60,-40 30,-40 0,0 Z"/></g>`,
        )
        .join("") +
      `<circle class="st0" r="50"/></g></svg>`,
  },
];

export const PROTOCOL_PALETTES = {
  apaisement: [
    "#4FD1C5", "#63B3ED", "#90CDF4", "#BEE3F8", "#E6FFFA", // Bleus/Turquoises
    "#9AE6B4", "#68D391", "#48BB78", // Verts doux
    "#E2E8F0", "#CBD5E0", "#A0AEC0", // Gris apaisants
    "#FED7E2", "#FBB6CE", "#F687B3", // Roses doux
    "#C3DAFE", "#A3BFFA", "#7F9CF5", // Lavandes
    "#FEEBC8", "#FBD38D", "#F6AD55", // Pêche/Abricot
  ],
  expression: [
    "#E53E3E", "#C53030", "#9B2C2C", // Rouges
    "#DD6B20", "#C05621", "#9C4221", // Oranges
    "#D69E2E", "#B7791F", "#975A16", // Jaunes/Ors
    "#38A169", "#2F855A", "#276749", // Verts
    "#3182CE", "#2B6CB0", "#2C5282", // Bleus
    "#805AD5", "#6B46C1", "#553C9A", // Violets
    "#D53F8C", "#B83280", "#97266D", // Roses vifs
    "#319795", "#2C7A7B", "#285E61", // Teals
  ],
  integration: [
    "#2B6CB0", "#3182CE", "#4299E1", // Bleus profonds
    "#68D391", "#48BB78", "#38A169", // Verts nature
    "#ED8936", "#DD6B20", "#C05621", // Oranges chauds
    "#9F7AEA", "#805AD5", "#6B46C1", // Violets mystiques
    "#319795", "#2C7A7B", "#285E61", // Teals équilibre
    "#F6AD55", "#ED8936", "#DD6B20", // Ambrés
    "#FC8181", "#F56565", "#E53E3E", // Corail/Rouge
    "#76E4F7", "#0BC5EA", "#00B5D8", // Cyans
  ],
};
