// Bibliothèque de mandalas thérapeutiques enrichie
// Tous les mandalas sont générés algorithmiquement = 100% open source

export const MANDALAS = [
  // ========== APAISEMENT ==========
  {
    id: "concentric_1",
    name: "Cercles apaisants",
    protocol: "apaisement",
    svg: `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><style>.st0{fill:none;stroke:#000;stroke-width:2}</style></defs><g><circle class="st0" cx="300" cy="300" r="280"/><circle class="st0" cx="300" cy="300" r="240"/><circle class="st0" cx="300" cy="300" r="200"/><circle class="st0" cx="300" cy="300" r="160"/><circle class="st0" cx="300" cy="300" r="120"/><circle class="st0" cx="300" cy="300" r="80"/><circle class="st0" cx="300" cy="300" r="40"/></g></svg>`,
  },
  {
    id: "spiral_zen",
    name: "Spirale zen",
    protocol: "apaisement",
    svg: `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><style>.st0{fill:none;stroke:#000;stroke-width:1.5}</style></defs><g transform="translate(300,300)">${Array.from({ length: 8 }).map((_, i) => {
      const angle = (i * 360) / 8;
      const r = 250;
      return `<path class="st0" d="M0,0 Q${r * 0.5 * Math.cos((angle * Math.PI) / 180)},${r * 0.5 * Math.sin((angle * Math.PI) / 180)} ${r * Math.cos((angle * Math.PI) / 180)},${r * Math.sin((angle * Math.PI) / 180)}"/>`;
    }).join("")}<circle class="st0" r="280"/><circle class="st0" r="200"/><circle class="st0" r="120"/></g></svg>`,
  },
  {
    id: "waves_calm",
    name: "Vagues apaisantes",
    protocol: "apaisement",
    svg: `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><style>.st0{fill:none;stroke:#000;stroke-width:1.8}</style></defs><g transform="translate(300,300)">${Array.from({ length: 12 }).map((_, i) => `<g transform="rotate(${i * 30})"><path class="st0" d="M0,0 Q40,-40 0,-80 T0,-160 T0,-240"/></g>`).join("")}<circle class="st0" r="280"/></g></svg>`,
  },
  {
    id: "geometric_lace",
    name: "Dentelle géométrique",
    protocol: "apaisement",
    svg:
      `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><style>.st0{fill:none;stroke:#1b1b1b;stroke-width:1.8}</style></defs><g transform="translate(300,300)"><circle class="st0" r="260"/>` +
      new Array(12)
        .fill(0)
        .map(
          (_, i) =>
            `<g transform="rotate(${i * 30})"><path class="st0" d="M0,-260 C40,-200 80,-200 120,-160"/></g>`,
        )
        .join("") +
      new Array(6)
        .fill(0)
        .map(
          (_, i) =>
            `<g transform="rotate(${i * 60})"><circle class='st0' cx='0' cy='-140' r='18'/></g>`,
        )
        .join("") +
      `</g></svg>`,
  },
  {
    id: "dots_meditation",
    name: "Points méditatifs",
    protocol: "apaisement",
    svg: `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><style>.st0{fill:none;stroke:#000;stroke-width:1.5}</style></defs><g transform="translate(300,300)"><circle class="st0" r="280"/>${Array.from({ length: 24 }).map((_, i) => {
      const angle = (i * 360) / 24;
      const r1 = 220, r2 = 180, r3 = 140, r4 = 100;
      return `<circle class="st0" cx="${r1 * Math.cos((angle * Math.PI) / 180)}" cy="${r1 * Math.sin((angle * Math.PI) / 180)}" r="8"/>
              <circle class="st0" cx="${r2 * Math.cos((angle * Math.PI) / 180)}" cy="${r2 * Math.sin((angle * Math.PI) / 180)}" r="6"/>
              <circle class="st0" cx="${r3 * Math.cos((angle * Math.PI) / 180)}" cy="${r3 * Math.sin((angle * Math.PI) / 180)}" r="5"/>
              <circle class="st0" cx="${r4 * Math.cos((angle * Math.PI) / 180)}" cy="${r4 * Math.sin((angle * Math.PI) / 180)}" r="4"/>`;
    }).join("")}</g></svg>`,
  },

  // ========== EXPRESSION ==========
  {
    id: "narrative_sections",
    name: "Sections narratives",
    protocol: "expression",
    svg: `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><style>.st0{fill:none;stroke:#000;stroke-width:2}</style></defs><g><circle class="st0" cx="300" cy="300" r="280"/> ${Array.from(
      { length: 8 },
    )
      .map(
        (_, i) =>
          `<line class='st0' x1='300' y1='300' x2='${300 + 280 * Math.cos((i * Math.PI) / 4)}' y2='${300 + 280 * Math.sin((i * Math.PI) / 4)}'/>`,
      )
      .join("")} </g></svg>`,
  },
  {
    id: "lotus_pattern",
    name: "Fleur de lotus",
    protocol: "expression",
    svg:
      `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><style>.st0{fill:none;stroke:#0c2733;stroke-width:2}</style></defs><g transform="translate(300,340)"><circle class="st0" cx="0" cy="-40" r="220"/>` +
      new Array(8)
        .fill(0)
        .map(
          (_, i) =>
            `<g transform="rotate(${i * 45})"><path class='st0' d="M0,-180 C30,-120 60,-120 90,-80 C60,-40 30,-40 0,0 Z"/></g>`,
        )
        .join("") +
      `<circle class="st0" r="40"/></g></svg>`,
  },
  {
    id: "heart_petals",
    name: "Pétales de cœur",
    protocol: "expression",
    svg: `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><style>.st0{fill:none;stroke:#000;stroke-width:2}</style></defs><g transform="translate(300,300)">${Array.from({ length: 12 }).map((_, i) => `<g transform="rotate(${i * 30})"><path class="st0" d="M0,-20 C-30,-60 -30,-100 0,-120 C30,-100 30,-60 0,-20 Z" transform="translate(0,-120)"/></g>`).join("")}<circle class="st0" r="280"/><circle class="st0" r="180"/></g></svg>`,
  },
  {
    id: "stars_expression",
    name: "Étoiles d'expression",
    protocol: "expression",
    svg: `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><style>.st0{fill:none;stroke:#000;stroke-width:1.8}</style></defs><g transform="translate(300,300)">${Array.from({ length: 16 }).map((_, i) => {
      const angle = (i * 360) / 16;
      const r = 250;
      return `<path class="st0" d="M0,0 L${r * 0.4 * Math.cos((angle * Math.PI) / 180)},${r * 0.4 * Math.sin((angle * Math.PI) / 180)} L${r * Math.cos((angle * Math.PI) / 180)},${r * Math.sin((angle * Math.PI) / 180)}"/>`;
    }).join("")}<circle class="st0" r="280"/><circle class="st0" r="100"/></g></svg>`,
  },
  {
    id: "waves_expression",
    name: "Vagues d'émotion",
    protocol: "expression",
    svg: `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><style>.st0{fill:none;stroke:#000;stroke-width:1.5}</style></defs><g transform="translate(300,300)">${Array.from({ length: 8 }).map((_, ring) => `<path class="st0" d="${Array.from({ length: 48 }).map((_, i) => {
      const angle = (i * 360) / 48;
      const r = 250 - ring * 30;
      const wave = Math.sin((i * Math.PI * 3) / 24) * 10;
      const x = (r + wave) * Math.cos((angle * Math.PI) / 180);
      const y = (r + wave) * Math.sin((angle * Math.PI) / 180);
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    }).join(' ')} Z"/>`).join("")}</g></svg>`,
  },

  // ========== INTÉGRATION ==========
  {
    id: "floral_1",
    name: "Rosace florale",
    protocol: "integration",
    svg: `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><style>.st0{fill:none;stroke:#000;stroke-width:2}</style></defs><g transform="translate(300,300)"> ${Array.from(
      { length: 12 },
    )
      .map(
        (_, i) =>
          `<g transform='rotate(${i * 30})'><path class='st0' d='M0,0 C40,-40 80,-40 120,0 C80,40 40,40 0,0 Z'/></g>`,
      )
      .join("")}</g></svg>`,
  },
  {
    id: "kaleidoscope",
    name: "Kaléidoscope",
    protocol: "integration",
    svg:
      `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><style>.st0{fill:none;stroke:#111;stroke-width:1.5}</style></defs><g transform="translate(300,300)"><circle class="st0" r="280"/>` +
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
    id: "sun_rays",
    name: "Rayons solaires",
    protocol: "integration",
    svg: `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><style>.st0{fill:none;stroke:#000;stroke-width:2}</style></defs><g transform="translate(300,300)">${Array.from({ length: 32 }).map((_, i) => {
      const angle = (i * 360) / 32;
      const r1 = i % 2 === 0 ? 280 : 240;
      return `<line class="st0" x1="0" y1="0" x2="${r1 * Math.cos((angle * Math.PI) / 180)}" y2="${r1 * Math.sin((angle * Math.PI) / 180)}"/>`;
    }).join("")}<circle class="st0" r="60"/><circle class="st0" r="180"/></g></svg>`,
  },
  {
    id: "sacred_geometry",
    name: "Géométrie sacrée",
    protocol: "integration",
    svg: `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><style>.st0{fill:none;stroke:#000;stroke-width:1.8}</style></defs><g transform="translate(300,300)"><circle class="st0" r="280"/><circle class="st0" r="240"/><circle class="st0" r="200"/>${Array.from({ length: 6 }).map((_, i) => {
      const angle = (i * 360) / 6;
      const r = 200;
      return `<circle class="st0" cx="${r * Math.cos((angle * Math.PI) / 180)}" cy="${r * Math.sin((angle * Math.PI) / 180)}" r="200"/>`;
    }).join("")}</g></svg>`,
  },
  {
    id: "flower_life",
    name: "Fleur de vie",
    protocol: "integration",
    svg: `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><style>.st0{fill:none;stroke:#000;stroke-width:1.5}</style></defs><g transform="translate(300,300)"><circle class="st0" r="80"/>${Array.from({ length: 6 }).map((_, i) => {
      const angle = (i * 360) / 6;
      const r = 80;
      return `<circle class="st0" cx="${r * Math.cos((angle * Math.PI) / 180)}" cy="${r * Math.sin((angle * Math.PI) / 180)}" r="80"/>`;
    }).join("")}${Array.from({ length: 6 }).map((_, i) => {
      const angle = (i * 360) / 6 + 30;
      const r = 140;
      return `<circle class="st0" cx="${r * Math.cos((angle * Math.PI) / 180)}" cy="${r * Math.sin((angle * Math.PI) / 180)}" r="80"/>`;
    }).join("")}<circle class="st0" r="280"/></g></svg>`,
  },
  {
    id: "mandala_complex",
    name: "Mandala complexe",
    protocol: "integration",
    svg: `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><style>.st0{fill:none;stroke:#000;stroke-width:1.3}</style></defs><g transform="translate(300,300)">${Array.from({ length: 16 }).map((_, i) => `<g transform="rotate(${i * 22.5})"><path class="st0" d="M0,-280 L0,-240 L20,-220 L0,-200 L0,-160 L15,-150 L0,-140 L0,-100"/>
      <circle class="st0" cx="0" cy="-260" r="12"/>
      <circle class="st0" cx="0" cy="-180" r="10"/>
      <circle class="st0" cx="0" cy="-120" r="8"/></g>`).join("")}<circle class="st0" r="280"/><circle class="st0" r="240"/><circle class="st0" r="200"/><circle class="st0" r="160"/><circle class="st0" r="90"/><circle class="st0" r="50"/></g></svg>`,
  },
];

export const PROTOCOL_PALETTES = {
  apaisement: [
    "#4FD1C5", // Turquoise clair
    "#63B3ED", // Bleu doux
    "#90CDF4", // Bleu ciel
    "#BEE3F8", // Bleu pâle
    "#E6FFFA", // Bleu très clair
    "#B2F5EA", // Vert d'eau
    "#81E6D9", // Turquoise
  ],
  expression: [
    "#E53E3E", // Rouge
    "#DD6B20", // Orange
    "#D69E2E", // Jaune
    "#38A169", // Vert
    "#3182CE", // Bleu
    "#805AD5", // Violet
    "#D53F8C", // Rose
    "#F687B3", // Rose clair
    "#FC8181", // Rouge clair
  ],
  integration: [
    "#2B6CB0", // Bleu profond
    "#68D391", // Vert clair
    "#ED8936", // Orange chaud
    "#9F7AEA", // Violet
    "#319795", // Turquoise foncé
    "#E6FFFA", // Bleu très clair
    "#FBD38D", // Jaune doux
  ],
};
