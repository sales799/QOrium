import { NextResponse } from 'next/server';

import { rateLimit } from '@/lib/rate-limit';

export function ok(data: unknown, init?: ResponseInit): NextResponse {
  const headers = new Headers(init?.headers);
  if (!headers.has('Cache-Control')) {
    headers.set('Cache-Control', 'no-store');
  }

  return NextResponse.json(
    { ok: true, data },
    {
      status: init?.status ?? 200,
      headers,
    },
  );
}

export function problem(status: number, title: string, detail: string): NextResponse {
  return NextResponse.json(
    {
      ok: false,
      type: 'https://qorium.online/problems/interactive-proof',
      title,
      status,
      detail,
    },
    {
      status,
      headers: {
        'Content-Type': 'application/problem+json',
        'Cache-Control': 'no-store',
      },
    },
  );
}

export function rateLimitResponse(
  request: Request,
  namespace: string,
  options: { max: number; windowMs: number },
): NextResponse | null {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';
  const result = rateLimit(`${namespace}:${ip}`, options);
  if (result.allowed) return null;

  return NextResponse.json(
    {
      ok: false,
      type: 'https://qorium.online/problems/rate-limit',
      title: 'Too Many Requests',
      status: 429,
      detail: 'This public proof endpoint is rate-limited. Please try again later.',
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
        'Cache-Control': 'no-store',
      },
    },
  );
}

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
