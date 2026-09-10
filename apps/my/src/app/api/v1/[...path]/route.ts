import type { NextRequest } from 'next/server';

// Same-origin proxy for the recruiter portal. Forwards the recruiter session
// cookie (qor_session) both ways so cookie-authed /v1 routes work without CORS.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function apiBase(): string {
  return (process.env.QORIUM_API_BASE_URL ?? 'http://127.0.0.1:5101').replace(/\/+$/, '');
}

async function proxy(req: NextRequest, path: string[]): Promise<Response> {
  const url = new URL(req.url);
  const target = `${apiBase()}/v1/${path.map(encodeURIComponent).join('/')}${url.search}`;
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  const cookie = req.headers.get('cookie');
  if (cookie) headers['cookie'] = cookie;
  const init: RequestInit = {
    method: req.method,
    headers,
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  };
  if (req.method !== 'GET' && req.method !== 'HEAD') init.body = await req.text();

  try {
    const r = await fetch(target, init);
    const body = [204, 205, 304].includes(r.status) ? null : await r.arrayBuffer();
    const out = new Headers({
      'content-type': r.headers.get('content-type') ?? 'application/json',
      'cache-control': 'no-store',
    });
    for (const name of ['content-disposition', 'retry-after', 'www-authenticate']) {
      const value = r.headers.get(name);
      if (value) out.set(name, value);
    }
    const setCookies =
      typeof (r.headers as { getSetCookie?: () => string[] }).getSetCookie === 'function'
        ? (r.headers as { getSetCookie: () => string[] }).getSetCookie()
        : (() => {
            const sc = r.headers.get('set-cookie');
            return sc ? [sc] : [];
          })();
    for (const c of setCookies) out.append('set-cookie', c);
    return new Response(body, { status: r.status, headers: out });
  } catch (error) {
    const timedOut =
      (error instanceof Error && error.name === 'TimeoutError') ||
      (init.signal?.aborted && init.signal.reason?.name === 'TimeoutError');
    const status = timedOut ? 504 : 502;
    return new Response(
      JSON.stringify({ title: timedOut ? 'Gateway Timeout' : 'Bad Gateway', status }),
      {
        status,
        headers: { 'content-type': 'application/problem+json', 'cache-control': 'no-store' },
      },
    );
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
