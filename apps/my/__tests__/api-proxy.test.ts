import { afterEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';
import { GET, POST } from '../src/app/api/v1/[...path]/route';

const context = { params: Promise.resolve({ path: ['admin', 'export'] }) };
function request(method = 'GET') {
  return new Request('https://my.example.test/api/v1/admin/export?format=csv', {
    method,
    headers: { cookie: 'qor_session=test-session', 'content-type': 'application/json' },
    ...(method === 'POST' ? { body: JSON.stringify({ reviewed: true }) } : {}),
  }) as NextRequest;
}
afterEach(() => vi.unstubAllGlobals());

describe('portal API proxy', () => {
  it('preserves a successful no-content response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    const result = await POST(request('POST'), context);
    expect(result.status).toBe(204);
    expect(await result.text()).toBe('');
  });
  it('preserves export and retry metadata without allowing private response caching', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('a,b\n1,2', { headers: {
      'content-type': 'text/csv', 'content-disposition': 'attachment; filename="report.csv"',
      'retry-after': '60', 'cache-control': 'public, max-age=3600',
    } })));
    const result = await GET(request(), context);
    expect(result.headers.get('content-disposition')).toContain('report.csv');
    expect(result.headers.get('retry-after')).toBe('60');
    expect(result.headers.get('cache-control')).toBe('no-store');
    expect(await result.text()).toBe('a,b\n1,2');
  });
  it('preserves binary export bytes', async () => {
    const bytes = new Uint8Array([0, 255, 128, 196, 80, 75]);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(bytes, { headers: { 'content-type': 'application/octet-stream' } })));
    const result = await GET(request(), context);
    expect(new Uint8Array(await result.arrayBuffer())).toEqual(bytes);
  });
  it('forwards the session and POST body with a bounded upstream request', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('{}'));
    vi.stubGlobal('fetch', fetch);
    await POST(request('POST'), context);
    const [url, init] = fetch.mock.calls[0];
    expect(url).toContain('/v1/admin/export?format=csv');
    expect(init.headers.cookie).toBe('qor_session=test-session');
    expect(init.body).toBe('{"reviewed":true}');
    expect(init.signal).toBeInstanceOf(AbortSignal);
    expect(init.cache).toBe('no-store');
  });
  it('returns a safe timeout response without leaking internal errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('private upstream address', 'TimeoutError')));
    const result = await GET(request(), context);
    expect(result.status).toBe(504);
    expect(await result.text()).not.toContain('private upstream');
    expect(result.headers.get('cache-control')).toBe('no-store');
  });
  it('keeps authentication errors and session cookies intact', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"title":"Unauthorized"}', { status: 401, headers: { 'set-cookie': 'qor_session=; Max-Age=0; HttpOnly' } })));
    const result = await GET(request(), context);
    expect(result.status).toBe(401);
    expect(result.headers.get('set-cookie')).toContain('Max-Age=0');
  });
});
