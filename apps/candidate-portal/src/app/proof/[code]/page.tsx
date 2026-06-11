// N13: public Proof-of-Skill verification page.
//
// A candidate shares candidate.qorium.online/proof/<code>; anyone can open it
// to verify a tamper-evident QOrium credential. The page server-fetches the
// sanitized JSON from readybank (GET /v1/proof/:code) and renders a trust card.
// It surfaces issuer + assessment + performance band + pass/fail only — never
// the numeric score, PII, questions, or answers (same posture as the badge).
//
// The embeddable SVG badge and the canonical HTML trust card load through the
// candidate origin's same-origin /api/v1 proxy so no third-party origin is
// involved. Forged/ungraded codes return null -> a generic "not verifiable"
// card that leaks nothing.

import { buildProofView, type ProofResponse } from '@/lib/proof-view';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function fetchProof(code: string): Promise<ProofResponse | null> {
  const base = (process.env.QORIUM_API_BASE_URL ?? 'http://127.0.0.1:5101').replace(/\/+$/, '');
  try {
    const r = await fetch(`${base}/v1/proof/${encodeURIComponent(code)}`, { cache: 'no-store' });
    if (!r.ok) return null;
    return (await r.json()) as ProofResponse;
  } catch {
    return null;
  }
}

const wrap: React.CSSProperties = {
  maxWidth: 560,
  margin: '56px auto',
  padding: '0 20px',
  fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  color: '#0f172a',
};
const card: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: 16,
  padding: 32,
  background: '#ffffff',
  boxShadow: '0 1px 2px rgba(15,23,42,0.05)',
};
const kicker: React.CSSProperties = {
  color: '#0d9488',
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: 0.5,
  margin: 0,
};
const rows: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  gap: '10px 18px',
  margin: '22px 0 6px',
  fontSize: 15,
};
const label: React.CSSProperties = { color: '#64748b' };
const value: React.CSSProperties = { fontWeight: 600, textAlign: 'right' };

function Pill({ outcome, text }: { outcome: 'pass' | 'fail' | 'unknown'; text: string }) {
  const palette =
    outcome === 'pass'
      ? { bg: '#ecfdf5', fg: '#047857', br: '#a7f3d0' }
      : outcome === 'fail'
        ? { bg: '#fef2f2', fg: '#b91c1c', br: '#fecaca' }
        : { bg: '#f1f5f9', fg: '#475569', br: '#e2e8f0' };
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 12px',
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 600,
        background: palette.bg,
        color: palette.fg,
        border: `1px solid ${palette.br}`,
      }}
    >
      {text}
    </span>
  );
}

export default async function ProofPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const proof = await fetchProof(code);

  if (!proof) {
    return (
      <main style={wrap}>
        <div style={card}>
          <p style={kicker}>QORIUM · PROOF OF SKILL</p>
          <h1 style={{ fontSize: 22, margin: '10px 0 6px' }}>
            This credential can&rsquo;t be verified
          </h1>
          <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.55 }}>
            The proof link is invalid, expired, or the assessment has not been graded yet. A valid
            QOrium proof verifies against the issuing organization and is tamper-evident.
          </p>
        </div>
        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12, marginTop: 18 }}>
          QOrium — India-built, psychometrically-defensible, AI-graded skills assessment.
        </p>
      </main>
    );
  }

  const v = buildProofView(proof);
  const badgeSrc = `/api/v1/proof/${encodeURIComponent(code)}/badge.svg`;
  const cardHref = `/api/v1/proof/${encodeURIComponent(code)}/view`;

  return (
    <main style={wrap}>
      <div style={card}>
        <p style={kicker}>QORIUM · VERIFIED PROOF OF SKILL</p>
        <h1 style={{ fontSize: 23, margin: '10px 0 4px' }}>{v.assessment}</h1>
        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Issued by {v.issuer}</p>

        <div style={{ margin: '24px 0' }}>
          <img
            src={badgeSrc}
            alt={`QOrium proof badge: ${v.bandLabel}`}
            width={320}
            height={120}
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>

        <div style={rows}>
          <span style={label}>Outcome</span>
          <span style={{ ...value }}>
            <Pill outcome={v.outcome} text={v.outcomeLabel} />
          </span>
          <span style={label}>Performance band</span>
          <span style={value}>{v.bandLabel}</span>
          {v.gradedLabel ? (
            <>
              <span style={label}>Graded</span>
              <span style={value}>{v.gradedLabel}</span>
            </>
          ) : null}
        </div>

        <p style={{ color: '#475569', fontSize: 13, lineHeight: 1.55, marginTop: 18 }}>
          {v.attestation ??
            'This record is tamper-evident and verifiable against the issuing organization.'}
        </p>

        <p style={{ marginTop: 20, fontSize: 14 }}>
          <a href={cardHref} style={{ color: '#0d9488', fontWeight: 600, textDecoration: 'none' }}>
            View the canonical QOrium trust card &rarr;
          </a>
        </p>
      </div>
      <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12, marginTop: 18 }}>
        Performance band and outcome only — no score, answers, or personal data are shown.
      </p>
    </main>
  );
}
