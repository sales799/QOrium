import type { NextRequest } from 'next/server';

// Same-origin proxy for the candidate assessment loop. The browser calls
// /api/v1/... on candidate.qorium.online; this handler forwards server-side to
// the readybank API (qorium-api), avoiding CORS and keeping the candidate
// token off third-party origins. Only token-scoped /v1 routes are exercised by
// the candidate UI; API-key routes still require a key and 401 without one.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function apiBase(): string {
  const base = process.env.QORIUM_API_BASE_URL ?? 'http://127.0.0.1:5101';
  return base.replace(/\/+$/, '');
}

async function proxy(req: NextRequest, path: string[]): Promise<Response> {
  const url = new URL(req.url);
  const target = `${apiBase()}/v1/${path.map(encodeURIComponent).join('/')}${url.search}`;
  const init: RequestInit = {
    method: req.method,
    headers: { 'content-type': 'application/json' },
    cache: 'no-store',
  };
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = await req.text();
  }
  try {
    const r = await fetch(target, init);
    const body = await r.text();
    return new Response(body, {
      status: r.status,
      headers: { 'content-type': r.headers.get('content-type') ?? 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ title: 'Bad Gateway', status: 502 }), {
      status: 502,
      headers: { 'content-type': 'application/problem+json' },
    });
  }
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
