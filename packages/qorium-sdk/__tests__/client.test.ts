import { describe, expect, it } from 'vitest';
import { QoriumApiError, QoriumClient } from '../src/client.js';

const okResponse =
  (body: unknown, status = 200): typeof fetch =>
  async () =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    });

describe('QoriumClient', () => {
  it('strips trailing slashes from baseUrl', () => {
    const c = new QoriumClient({ baseUrl: 'https://api.qorium.io/v1///' });
    // If we then call something, the URL should be assembled correctly.
    // We probe by passing a stub fetch and inspecting the captured URL.
    let capturedUrl: string | null = null;
    c['fetchImpl' as never] = (async (url: string) => {
      capturedUrl = url;
      return new Response('null', { status: 200 });
    }) as never;
    return c.get('/hello').then(() => {
      expect(capturedUrl).toBe('https://api.qorium.io/v1/hello');
    });
  });

  it('attaches the bearer token from apiKey', async () => {
    let capturedHeaders: Record<string, string> | null = null;
    const c = new QoriumClient({
      baseUrl: 'https://x',
      apiKey: 'qor_readybank_t_abc',
      fetchImpl: async (_url, init) => {
        capturedHeaders = init?.headers as Record<string, string>;
        return new Response('null', { status: 200 });
      },
    });
    await c.get('/foo');
    expect(capturedHeaders?.authorization).toBe('Bearer qor_readybank_t_abc');
  });

  it('attaches x-tenant-id when tenantId is set', async () => {
    let capturedHeaders: Record<string, string> | null = null;
    const c = new QoriumClient({
      baseUrl: 'https://x',
      tenantId: '11111111-2222-3333-4444-555555555555',
      fetchImpl: async (_url, init) => {
        capturedHeaders = init?.headers as Record<string, string>;
        return new Response('null', { status: 200 });
      },
    });
    await c.get('/foo');
    expect(capturedHeaders?.['x-tenant-id']).toBe('11111111-2222-3333-4444-555555555555');
  });

  it('forwards Idempotency-Key header for mutating requests', async () => {
    let capturedHeaders: Record<string, string> | null = null;
    const c = new QoriumClient({
      baseUrl: 'https://x',
      fetchImpl: async (_url, init) => {
        capturedHeaders = init?.headers as Record<string, string>;
        return new Response('null', { status: 200 });
      },
    });
    await c.post('/orders', { name: 'a' }, { idempotencyKey: 'evt-1' });
    expect(capturedHeaders?.['idempotency-key']).toBe('evt-1');
  });

  it('throws QoriumApiError with the title from RFC 7807 body', async () => {
    const c = new QoriumClient({
      baseUrl: 'https://x',
      fetchImpl: okResponse({ title: 'Forbidden', status: 403, type: 'about:blank' }, 403),
    });
    await expect(c.get('/foo')).rejects.toMatchObject({
      name: 'QoriumApiError',
      status: 403,
      message: 'Forbidden',
    });
  });

  it('throws on network failure', async () => {
    const c = new QoriumClient({
      baseUrl: 'https://x',
      fetchImpl: async () => {
        throw new Error('connection refused');
      },
    });
    await expect(c.get('/foo')).rejects.toThrow('connection refused');
  });

  it('returns null body when response is empty', async () => {
    const c = new QoriumClient({
      baseUrl: 'https://x',
      fetchImpl: async () => new Response(null, { status: 204 }),
    });
    const out = await c.delete('/foo');
    expect(out).toBe(null);
  });

  it('preserves QoriumApiError on 5xx', async () => {
    const c = new QoriumClient({
      baseUrl: 'https://x',
      fetchImpl: okResponse({ title: 'Bad Gateway', status: 502 }, 502),
    });
    try {
      await c.get('/foo');
      throw new Error('did not throw');
    } catch (err) {
      expect(err).toBeInstanceOf(QoriumApiError);
      if (err instanceof QoriumApiError) {
        expect(err.status).toBe(502);
        expect(err.body?.title).toBe('Bad Gateway');
      }
    }
  });
});
