// Simple mandala library (SVG strings) for MVP coloring

export const MANDALAS = [
  {
    id: "concentric_1",
    name: "Mandalas concentriques",
    protocol: "apaisement",
    svg: `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><style>.st0{fill:none;stroke:#000;stroke-width:2}</style></defs><g><circle class="st0" cx="300" cy="300" r="280"/><circle class="st0" cx="300" cy="300" r="240"/><circle class="st0" cx="300" cy="300" r="200"/><circle class="st0" cx="300" cy="300" r="160"/><circle class="st0" cx="300" cy="300" r="120"/><circle class="st0" cx="300" cy="300" r="80"/><circle class="st0" cx="300" cy="300" r="40"/></g></svg>`,
  },
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
    id: "narrative_sections",
    name: "Mandala narratif (sections)",
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
    id: "kaleidoscope",
    name: "Kaleidoscope",
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
    id: "geometric_lace",
    name: "Geometric Lace",
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
    id: "lotus_pattern",
    name: "Lotus Pattern",
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
];

export const PROTOCOL_PALETTES = {
  apaisement: ["#4FD1C5", "#63B3ED", "#90CDF4", "#BEE3F8", "#E6FFFA"],
  expression: [
    "#E53E3E",
    "#DD6B20",
    "#D69E2E",
    "#38A169",
    "#3182CE",
    "#805AD5",
    "#D53F8C",
  ],
  integration: ["#2B6CB0", "#68D391", "#ED8936", "#9F7AEA", "#319795"],
};
