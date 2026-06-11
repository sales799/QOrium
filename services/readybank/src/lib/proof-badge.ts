// N13 proof engine — slice 3: the embeddable Proof-of-Skill badge.
//
// Slice 1 shipped GET /v1/proof/:code (sanitized JSON) and slice 2 the /view
// HTML trust card. A badge is the *portable* face of a proof: a candidate
// embeds it in a resume, LinkedIn, or a portfolio; a viewer sees a
// tamper-evident QOrium mark and can follow it back to the live /view page.
// This module renders that badge as a self-contained, script-free SVG.
//
// Pure function of its input — no DB, no Express, no I/O — so it is fully
// unit-testable and cannot leak anything the route did not hand it. Every
// interpolated string is XML-escaped (reusing escapeHtml, which covers
// & < > " '). The badge deliberately shows only issuer + performance band +
// outcome — never a candidate name, numeric score, question, or answer.

import { escapeHtml } from './proof-page.js';

export type ProofBadgeState =
  | {
      kind: 'verified';
      issuer: string;
      assessment: string;
      scoreBand: string;
      passed: boolean | null;
    }
  | { kind: 'invalid' }
  | { kind: 'unconfigured' };

/** Clip a display string so the fixed-width badge never overflows. Pure and
 *  deterministic; appends an ellipsis when it shortens. */
export function truncate(value: string, max: number): string {
  const v = value.trim();
  if (v.length <= max) return v;
  return `${v.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

const W = 440;
const H = 150;

// Fills are inlined on every element (no <style>/<script>/external refs) so the
// badge renders identically whether loaded via <img>, CSS background, or inline
// — embed sanitizers that strip <style> cannot break it.
function shell(inner: string): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" ` +
    `viewBox="0 0 ${W} ${H}" role="img" aria-label="QOrium Proof of Skill">` +
    `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="16" ` +
    `fill="#131a30" stroke="#243150"/>` +
    inner +
    `</svg>`
  );
}

const BRAND =
  `<text x="${W - 26}" y="130" text-anchor="end" font-family="ui-sans-serif,system-ui,` +
  `-apple-system,Segoe UI,Roboto,sans-serif" font-size="12" font-weight="700" ` +
  `fill="#8ab4ff">QOrium</text>`;

function verifiedBody(s: Extract<ProofBadgeState, { kind: 'verified' }>): string {
  const assessment = escapeHtml(truncate(s.assessment, 36));
  const issuer = escapeHtml(truncate(s.issuer, 40));
  const band = escapeHtml(s.scoreBand);
  const ff = `font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif"`;

  const outcome =
    s.passed === null
      ? ''
      : s.passed
        ? ` · <tspan fill="#4ade80" font-weight="600">Met the bar</tspan>`
        : ` · <tspan fill="#f87171" font-weight="600">Below the bar</tspan>`;

  return (
    `<text x="26" y="40" ${ff} font-size="13" font-weight="600" fill="#4ade80">` +
    `✓ VERIFIED PROOF OF SKILL</text>` +
    `<text x="26" y="72" ${ff} font-size="20" font-weight="700" fill="#e8ecf6">${assessment}</text>` +
    `<text x="26" y="96" ${ff} font-size="13" fill="#9aa6c4">Issued by ${issuer}</text>` +
    `<text x="26" y="126" ${ff} font-size="13" fill="#9aa6c4">Band ` +
    `<tspan fill="#cdd6ef" font-weight="600" class="band">${band}</tspan>${outcome}</text>` +
    BRAND
  );
}

function invalidBody(): string {
  const ff = `font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif"`;
  return (
    `<text x="26" y="46" ${ff} font-size="13" font-weight="600" fill="#f87171">` +
    `✕ COULD NOT VERIFY</text>` +
    `<text x="26" y="80" ${ff} font-size="18" font-weight="700" fill="#e8ecf6">` +
    `Proof not verified</text>` +
    `<text x="26" y="106" ${ff} font-size="13" fill="#9aa6c4">` +
    `This code is invalid, altered, or not graded.</text>` +
    BRAND
  );
}

function unconfiguredBody(): string {
  const ff = `font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif"`;
  return (
    `<text x="26" y="46" ${ff} font-size="13" font-weight="600" fill="#9aa6c4">` +
    `PROOF VERIFICATION UNAVAILABLE</text>` +
    `<text x="26" y="80" ${ff} font-size="18" font-weight="700" fill="#e8ecf6">` +
    `Not enabled here</text>` +
    `<text x="26" y="106" ${ff} font-size="13" fill="#9aa6c4">` +
    `This deployment cannot verify Proof-of-Skill codes.</text>` +
    BRAND
  );
}

/** Render the full embeddable SVG badge for a proof state. Pure. */
export function renderProofBadgeSvg(state: ProofBadgeState): string {
  switch (state.kind) {
    case 'verified':
      return shell(verifiedBody(state));
    case 'invalid':
      return shell(invalidBody());
    case 'unconfigured':
      return shell(unconfiguredBody());
  }
}
