import { NextResponse } from 'next/server';

// POST /api/submit — receives form submission from /assessment/[token],
// forwards the answer to qorium-api /a4/grade, then redirects (303) to a
// result page rendering the scored payload.
//
// Accepts both `application/x-www-form-urlencoded` (default form post) and
// `application/json` (programmatic client). The token never leaves the
// server; only the result payload is shown to the candidate.

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface SubmitInput {
  token: string;
  answer_index: number;
  started_at?: string;
  time_taken_ms?: number;
}

async function readInput(req: Request): Promise<SubmitInput | null> {
  const ct = req.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) {
    const j = (await req.json()) as Record<string, unknown>;
    const token = typeof j.token === 'string' ? j.token : null;
    const ai = typeof j.answer_index === 'number' ? j.answer_index : Number(j.answer_index);
    if (!token || !Number.isFinite(ai)) return null;
    return {
      token,
      answer_index: ai,
      ...(typeof j.started_at === 'string' ? { started_at: j.started_at } : {}),
      ...(typeof j.time_taken_ms === 'number' ? { time_taken_ms: j.time_taken_ms } : {}),
    };
  }
  const form = await req.formData();
  const token = form.get('token');
  const ai = form.get('answer_index');
  const startedAt = form.get('started_at');
  if (typeof token !== 'string' || typeof ai !== 'string') return null;
  const idx = Number(ai);
  if (!Number.isFinite(idx)) return null;
  return {
    token,
    answer_index: idx,
    ...(typeof startedAt === 'string' && startedAt ? { started_at: startedAt } : {}),
  };
}

export async function POST(req: Request): Promise<Response> {
  const input = await readInput(req);
  if (!input) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }

  const apiBase = process.env.QORIUM_API_BASE_URL ?? 'http://127.0.0.1:5101';
  const startedAtMs = input.started_at ? Date.parse(input.started_at) : Number.NaN;
  const timeTakenMs = Number.isFinite(startedAtMs)
    ? Math.max(0, Date.now() - startedAtMs)
    : (input.time_taken_ms ?? 0);

  let r: Response;
  try {
    r = await fetch(`${apiBase.replace(/\/+$/, '')}/a4/grade`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        token: input.token,
        response_body: { answer_index: input.answer_index },
        time_taken_ms: timeTakenMs,
        ...(input.started_at ? { started_at: input.started_at } : {}),
      }),
      cache: 'no-store',
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'upstream_unreachable', detail: (err as Error).message },
      { status: 502 },
    );
  }

  const body = await r.text();
  const status = r.status;
  const contentType = r.headers.get('content-type') ?? 'application/json';

  // Programmatic clients receive the raw upstream payload.
  const acceptsHtml = (req.headers.get('accept') ?? '').includes('text/html');
  if (!acceptsHtml) {
    return new Response(body, { status, headers: { 'content-type': contentType } });
  }

  // Browser flow: render a minimal HTML result page so the candidate sees a
  // confirmation rather than a JSON dump.
  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(body) as Record<string, unknown>;
  } catch {
    /* fall through */
  }
  const score = typeof parsed.score === 'number' ? parsed.score : null;
  const correct = parsed.correct;
  const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Assessment submitted</title></head>
<body style="font-family:system-ui;max-width:720px;margin:48px auto;padding:0 16px">
<h1 style="font-size:22px">Thanks — your answer was recorded.</h1>
<p style="color:#475569">Region: IN · scoring: model-estimated (irt_status)</p>
<dl style="font-size:14px">
<dt>Status</dt><dd>${status}</dd>
<dt>Score</dt><dd>${score === null ? '—' : score}</dd>
<dt>Correct</dt><dd>${correct === true ? 'yes' : correct === false ? 'no' : '—'}</dd>
<dt>Response id</dt><dd>${typeof parsed.response_id === 'string' ? parsed.response_id : '—'}</dd>
</dl>
<details style="margin-top:24px"><summary>Raw payload</summary><pre style="background:#f1f5f9;padding:12px;border-radius:6px;overflow:auto">${body
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')}</pre></details>
</body></html>`;
  return new Response(html, {
    status: status < 400 ? 200 : status,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
