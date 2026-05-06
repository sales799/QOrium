// Brand asset endpoint — Wordmark SVG (mark + Qorium text)
//
// PLACEHOLDER per src/components/site/Logo.tsx — final brand asset replaces
// this without API changes.

const WORDMARK_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 56" width="440" height="112" role="img" aria-label="Qorium">
  <defs>
    <style>
      .ring { fill: none; stroke: #0F172A; stroke-width: 1.6; }
      .node { fill: #0F172A; }
      .edge { stroke: #0F172A; stroke-width: 0.9; stroke-linecap: round; opacity: 0.45; }
      .accent { fill: #1A8FFF; }
      .tail { stroke: #0F172A; stroke-width: 2.2; stroke-linecap: round; }
      .word { font-family: 'Geist Sans', system-ui, sans-serif; font-weight: 600; fill: #0F172A; }
    </style>
  </defs>
  <g transform="translate(8, 14)">
    <circle cx="13" cy="13" r="11" class="ring" />
    <circle cx="13" cy="3" r="1.4" class="node" />
    <circle cx="22.07" cy="8.5" r="1.4" class="node" />
    <circle cx="22.07" cy="17.5" r="1.4" class="node" />
    <circle cx="3.93" cy="8.5" r="1.4" class="node" />
    <path d="M13 3 L13 13 M22.07 8.5 L13 13 M22.07 17.5 L13 13 M3.93 8.5 L13 13" class="edge" fill="none" />
    <circle cx="13" cy="13" r="2.6" class="accent" />
    <path d="M19.5 19.5 L25 25" class="tail" fill="none" />
  </g>
  <text x="50" y="36" class="word" font-size="26" letter-spacing="-0.5">Qorium</text>
</svg>`;

export function GET(): Response {
  return new Response(WORDMARK_SVG, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400, immutable',
      'Content-Disposition': 'inline; filename="qorium-wordmark.svg"',
    },
  });
}
