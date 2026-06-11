// BR-8: candidate-facing result. No answer keys — just the outcome.

import { ResultAutoRefresh } from '../../../../components/result-auto-refresh';
import { buildCompletionSummary } from '../../../../lib/completion-summary';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Result {
  attempt_id: string;
  status: string;
  score_pct: number | null;
  passed: boolean | null;
  answered: number;
  total_questions: number;
  started_at?: string | null;
  submitted_at?: string | null;
  duration_sec?: number | null;
}

async function fetchResult(id: string, token: string): Promise<Result | null> {
  const base = (process.env.QORIUM_API_BASE_URL ?? 'http://127.0.0.1:5101').replace(/\/+$/, '');
  try {
    const r = await fetch(
      `${base}/v1/attempts/${encodeURIComponent(id)}/result?token=${encodeURIComponent(token)}`,
      { cache: 'no-store' },
    );
    if (!r.ok) return null;
    return (await r.json()) as Result;
  } catch {
    return null;
  }
}

export default async function ResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const token = typeof sp.token === 'string' ? sp.token : '';
  const result = token ? await fetchResult(id, token) : null;

  const wrap: React.CSSProperties = {
    maxWidth: 560,
    margin: '64px auto',
    padding: '0 20px',
    fontFamily: 'system-ui, sans-serif',
    textAlign: 'center',
    color: '#0f172a',
  };

  if (!result) {
    return (
      <main style={wrap}>
        <h1 style={{ fontSize: 22 }}>Result unavailable</h1>
        <p style={{ color: '#64748b' }}>
          We could not load this result. Please contact the recruiter.
        </p>
      </main>
    );
  }

  const graded = result.status === 'graded' && result.score_pct !== null;
  const passed = result.passed === true;

  const summary = buildCompletionSummary({
    answered: result.answered,
    total: result.total_questions,
    durationSec: result.duration_sec ?? null,
  });

  const statRow: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 13,
    padding: '7px 0',
    borderTop: '1px solid #f1f5f9',
  };
  const statLabel: React.CSSProperties = { color: '#64748b' };
  const statValue: React.CSSProperties = { color: '#0f172a', fontWeight: 600 };

  return (
    <main style={wrap}>
      <p style={{ color: '#0d9488', fontSize: 12, fontWeight: 600, letterSpacing: 0.4 }}>
        QORIUM · ASSESSMENT COMPLETE
      </p>
      <div
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          padding: 36,
          marginTop: 14,
        }}
      >
        <h1 style={{ fontSize: 22, marginTop: 0 }}>Thank you — your responses are in.</h1>
        {graded ? (
          <>
            <div
              style={{
                fontSize: 52,
                fontWeight: 700,
                color: passed ? '#0f766e' : '#b45309',
                margin: '10px 0',
              }}
            >
              {Math.round(result.score_pct as number)}%
            </div>
            <p
              style={{
                display: 'inline-block',
                fontSize: 13,
                fontWeight: 600,
                color: passed ? '#0f766e' : '#b45309',
                background: passed ? '#f0fdfa' : '#fffbeb',
                borderRadius: 999,
                padding: '4px 14px',
              }}
            >
              {passed ? 'Meets the bar' : 'Below the pass mark'}
            </p>
          </>
        ) : (
          <>
            <p style={{ color: '#64748b' }}>
              Your assessment was submitted and is being processed.
            </p>
            <ResultAutoRefresh />
          </>
        )}

        <div
          style={{
            marginTop: 22,
            textAlign: 'left',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: '6px 16px 12px',
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 0.4,
              color: '#94a3b8',
              margin: '12px 0 2px',
            }}
          >
            COMPLETION SUMMARY
          </p>
          <div style={{ ...statRow, borderTop: 'none' }}>
            <span style={statLabel}>Questions answered</span>
            <span style={statValue}>
              {summary.answered} of {summary.total} ({summary.completionPct}%)
            </span>
          </div>
          {summary.durationLabel ? (
            <div style={statRow}>
              <span style={statLabel}>Time taken</span>
              <span style={statValue}>{summary.durationLabel}</span>
            </div>
          ) : null}
          {summary.avgPerQuestionLabel ? (
            <div style={statRow}>
              <span style={statLabel}>Avg per question</span>
              <span style={statValue}>{summary.avgPerQuestionLabel}</span>
            </div>
          ) : null}
        </div>

        <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 18 }}>
          The recruiter will follow up with next steps.
        </p>
      </div>
    </main>
  );
}
