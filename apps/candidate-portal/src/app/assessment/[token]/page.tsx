import { notFound } from 'next/navigation';

// /assessment/[token] — server-rendered candidate view.
//
// The page server-fetches the question payload from qorium-api (which
// verifies the HMAC token); the answer key is stripped server-side before
// the candidate sees anything. The submit form posts back to a sibling
// Next.js route handler which forwards to qorium-api /a4/grade.

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface ServerQuestion {
  question: {
    id: string;
    format: string;
    skill_id: string | null;
    body: Record<string, unknown> & {
      options?: unknown;
      stem?: unknown;
      question?: unknown;
      prompt?: unknown;
    };
  };
  candidate_id: string;
  exp: number;
}

async function fetchQuestion(token: string): Promise<ServerQuestion | null> {
  const apiBase = process.env.QORIUM_API_BASE_URL ?? 'http://127.0.0.1:5101';
  const url = `${apiBase.replace(/\/+$/, '')}/a4/question?token=${encodeURIComponent(token)}`;
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) return null;
  return (await r.json()) as ServerQuestion;
}

function renderOptions(body: ServerQuestion['question']['body']): string[] {
  const opts = body.options;
  if (Array.isArray(opts)) {
    return opts.map((o) => (typeof o === 'string' ? o : JSON.stringify(o)));
  }
  return [];
}

function stem(body: ServerQuestion['question']['body']): string {
  return (
    (typeof body.stem === 'string' && body.stem) ||
    (typeof body.question === 'string' && body.question) ||
    (typeof body.prompt === 'string' && body.prompt) ||
    'Choose the best answer below.'
  );
}

export default async function AssessmentPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await fetchQuestion(token);
  if (!data) notFound();

  const options = renderOptions(data.question.body);
  const startedAt = new Date().toISOString();

  return (
    <main
      style={{ maxWidth: 720, margin: '32px auto', padding: '0 16px', fontFamily: 'system-ui' }}
    >
      <p style={{ color: '#475569', fontSize: 12, marginBottom: 4 }}>
        QOrium · India-resident assessment · model-estimated scoring
      </p>
      <h1 style={{ fontSize: 22, marginTop: 0 }}>Skills assessment</h1>
      <p style={{ marginBottom: 24, lineHeight: 1.55 }}>{stem(data.question.body)}</p>

      <form action="/api/submit" method="post">
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="started_at" value={startedAt} />
        {options.map((opt, idx) => (
          <label
            key={idx}
            style={{
              display: 'block',
              padding: '12px 16px',
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              marginBottom: 12,
              cursor: 'pointer',
            }}
          >
            <input
              type="radio"
              name="answer_index"
              value={idx}
              required
              style={{ marginRight: 12 }}
            />
            {opt}
          </label>
        ))}
        <button
          type="submit"
          style={{
            marginTop: 8,
            padding: '10px 20px',
            background: '#0f172a',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          Submit answer
        </button>
      </form>

      <p style={{ marginTop: 32, fontSize: 12, color: '#64748b' }}>
        Candidate id: {data.candidate_id}
      </p>
    </main>
  );
}
