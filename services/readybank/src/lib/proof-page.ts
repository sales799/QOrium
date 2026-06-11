// N13 proof engine — slice 2: the human-facing verification surface.
//
// Slice 1 shipped GET /v1/proof/:code returning a sanitized JSON record. JSON
// is fine for machines, but the whole point of a Proof-of-Skill is that an
// anonymous third party (a hiring manager, a marketplace, a candidate sharing
// their own result) can SEE that it is genuine. This module renders that JSON
// record into a static, no-JavaScript HTML trust card.
//
// Everything here is a pure function of its input — no DB, no Express, no I/O —
// so it is exhaustively unit-testable and cannot leak anything the route did
// not already hand it. All caller-supplied / DB-supplied strings are HTML-
// escaped before interpolation.

export type ProofPageState =
  | {
      kind: 'verified';
      code: string;
      issuer: string;
      assessment: string;
      scorePct: number | null;
      scoreBand: string;
      passed: boolean | null;
      gradedAt: string | null;
    }
  | { kind: 'invalid' }
  | { kind: 'unconfigured' };

/** Map a 0-100 score to a buyer-facing band. Single source of truth, shared
 *  with the JSON route so the two surfaces never drift. */
export function scoreBand(pct: number | null): string {
  if (pct === null) return 'unscored';
  if (pct >= 90) return 'exceptional';
  if (pct >= 75) return 'strong';
  if (pct >= 60) return 'proficient';
  if (pct >= 40) return 'developing';
  return 'foundational';
}

/** Escape the five HTML-significant characters. Applied to every interpolated
 *  value — issuer/assessment come from the DB, code comes from the URL. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Render an ISO timestamp to a stable, timezone-free YYYY-MM-DD for display.
 *  Returns null for null/unparseable input. Deterministic for unit tests. */
export function formatGradedDate(iso: string | null): string | null {
  if (!iso) return null;
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(iso);
  return m?.[1] ?? null;
}

const SHELL_OPEN = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>QOrium · Proof of Skill</title>
<style>
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: flex; align-items: center;
    justify-content: center; padding: 24px;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    background: #0b1020; color: #e8ecf6; }
  .card { width: 100%; max-width: 520px; background: #131a30;
    border: 1px solid #243150; border-radius: 16px; padding: 32px;
    box-shadow: 0 12px 40px rgba(0,0,0,.35); }
  .badge { display: inline-flex; align-items: center; gap: 8px;
    font-size: 13px; font-weight: 600; letter-spacing: .02em;
    padding: 6px 12px; border-radius: 999px; }
  .ok { background: rgba(34,197,94,.15); color: #4ade80; }
  .no { background: rgba(248,113,113,.15); color: #f87171; }
  .muted { color: #9aa6c4; }
  h1 { font-size: 22px; margin: 18px 0 4px; }
  .row { display: flex; justify-content: space-between; gap: 16px;
    padding: 12px 0; border-top: 1px solid #1e2742; }
  .row:first-of-type { border-top: 0; }
  .label { color: #9aa6c4; font-size: 14px; }
  .value { font-weight: 600; text-align: right; }
  .band { text-transform: capitalize; }
  .foot { margin-top: 20px; font-size: 12px; line-height: 1.5; color: #7e8aa8; }
  .brand { font-weight: 700; color: #cdd6ef; }
  a { color: #8ab4ff; }
</style>
</head>
<body>
<main class="card">`;

const SHELL_CLOSE = `</main>
</body>
</html>`;

function verifiedBody(s: Extract<ProofPageState, { kind: 'verified' }>): string {
  const issuer = escapeHtml(s.issuer);
  const assessment = escapeHtml(s.assessment);
  const band = escapeHtml(s.scoreBand);
  const code = escapeHtml(s.code);
  const date = formatGradedDate(s.gradedAt);

  const passBadge =
    s.passed === null
      ? ''
      : s.passed
        ? `<span class="badge ok">● Met the bar</span>`
        : `<span class="badge no">● Below the bar</span>`;

  const scoreRow =
    s.scorePct === null
      ? ''
      : `<div class="row"><span class="label">Score</span><span class="value">${s.scorePct}%</span></div>`;

  const dateRow = date
    ? `<div class="row"><span class="label">Graded</span><span class="value">${escapeHtml(date)}</span></div>`
    : '';

  return `<span class="badge ok">✓ Verified Proof of Skill</span>
<h1>${assessment}</h1>
<p class="muted">Issued by <strong>${issuer}</strong></p>
<div style="margin-top:18px">
  ${scoreRow}
  <div class="row"><span class="label">Performance band</span><span class="value band">${band}</span></div>
  <div class="row"><span class="label">Outcome</span><span class="value">${passBadge || '<span class="muted">—</span>'}</span></div>
  ${dateRow}
</div>
<p class="foot">This is a tamper-evident record verified against the issuing tenant on
<span class="brand">QOrium</span> — India-built, psychometrically-defensible, AI-graded
skills assessments. Proof code <code>${code}</code> was checked cryptographically;
any alteration would invalidate it.</p>`;
}

function invalidBody(): string {
  return `<span class="badge no">✕ Could not verify</span>
<h1>This proof could not be verified</h1>
<p class="muted">The code is invalid, has been altered, or refers to an assessment
that has not been graded. No record is shown.</p>
<p class="foot">If you were given this link by a candidate, ask them for a fresh
verification link from their <span class="brand">QOrium</span> result page.</p>`;
}

function unconfiguredBody(): string {
  return `<span class="badge no">Unavailable</span>
<h1>Proof verification is not enabled here</h1>
<p class="muted">This deployment is not configured to verify Proof-of-Skill codes.</p>`;
}

/** Render the full HTML document for a proof verification view. Pure. */
export function renderProofPage(state: ProofPageState): string {
  let body: string;
  switch (state.kind) {
    case 'verified':
      body = verifiedBody(state);
      break;
    case 'invalid':
      body = invalidBody();
      break;
    case 'unconfigured':
      body = unconfiguredBody();
      break;
  }
  return `${SHELL_OPEN}\n${body}\n${SHELL_CLOSE}`;
}
