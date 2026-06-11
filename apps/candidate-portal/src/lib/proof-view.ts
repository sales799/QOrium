// N13: pure presenter for the public Proof-of-Skill verification page.
//
// Maps the sanitized JSON returned by readybank's GET /v1/proof/:code into a
// display model. Privacy posture mirrors the SVG badge: we surface issuer,
// assessment title, performance BAND, and pass/fail outcome only — never the
// candidate's numeric score, PII, questions, or answers. Keeping this pure (no
// React, no fetch) makes it unit-testable in CI without a DB or a browser.

export interface ProofResponse {
  verified?: boolean;
  proof_code?: string;
  issuer?: string;
  assessment?: string;
  score_pct?: number | null;
  score_band?: string | null;
  passed?: boolean | null;
  graded_at?: string | null;
  attestation?: string;
}

export type ProofOutcome = 'pass' | 'fail' | 'unknown';

export interface ProofView {
  issuer: string;
  assessment: string;
  bandLabel: string;
  outcome: ProofOutcome;
  outcomeLabel: string;
  gradedLabel: string | null;
  attestation: string | null;
}

const BAND_LABELS: Record<string, string> = {
  exceptional: 'Exceptional',
  strong: 'Strong',
  proficient: 'Proficient',
  developing: 'Developing',
  emerging: 'Emerging',
};

function clean(value: string | null | undefined, fallback: string): string {
  const v = (value ?? '').trim();
  return v.length > 0 ? v : fallback;
}

export function formatGraded(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

export function bandLabel(band: string | null | undefined): string {
  const key = (band ?? '').trim().toLowerCase();
  if (key.length === 0) return 'Assessed';
  return BAND_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

export function buildProofView(p: ProofResponse): ProofView {
  const outcome: ProofOutcome =
    p.passed === true ? 'pass' : p.passed === false ? 'fail' : 'unknown';
  return {
    issuer: clean(p.issuer, 'QOrium'),
    assessment: clean(p.assessment, 'Skills assessment'),
    bandLabel: bandLabel(p.score_band),
    outcome,
    outcomeLabel: outcome === 'pass' ? 'Passed' : outcome === 'fail' ? 'Did not pass' : 'Assessed',
    gradedLabel: formatGraded(p.graded_at),
    attestation: clean(p.attestation, '').length > 0 ? (p.attestation as string).trim() : null,
  };
}
