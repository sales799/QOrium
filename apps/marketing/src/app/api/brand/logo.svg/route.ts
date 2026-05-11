// Brand asset endpoint — Logo SVG
// Mirrors the inline mark from src/components/site/Logo.tsx but exposed as a
// standalone, downloadable SVG for press / partner use.
//
// PLACEHOLDER per src/components/site/Logo.tsx — final brand asset replaces
// this without API changes.

const LOGO_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="280" height="280" role="img" aria-label="Qorium">
  <defs>
    <style>
      .ring { fill: none; stroke: #0F172A; stroke-width: 1.6; }
      .node { fill: #0F172A; }
      .edge { stroke: #0F172A; stroke-width: 0.9; stroke-linecap: round; opacity: 0.45; }
      .accent { fill: #1A8FFF; }
      .tail { stroke: #0F172A; stroke-width: 2.2; stroke-linecap: round; }
    </style>
  </defs>
  <circle cx="13" cy="13" r="11" class="ring" />
  <circle cx="13" cy="3" r="1.4" class="node" />
  <circle cx="22.07" cy="8.5" r="1.4" class="node" />
  <circle cx="22.07" cy="17.5" r="1.4" class="node" />
  <circle cx="3.93" cy="8.5" r="1.4" class="node" />
  <path d="M13 3 L13 13 M22.07 8.5 L13 13 M22.07 17.5 L13 13 M3.93 8.5 L13 13" class="edge" fill="none" />
  <circle cx="13" cy="13" r="2.6" class="accent" />
  <path d="M19.5 19.5 L25 25" class="tail" fill="none" />
</svg>`;

export function GET(): Response {
  return new Response(LOGO_SVG, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400, immutable',
      'Content-Disposition': 'inline; filename="qorium-logo.svg"',
    },
  });
}
