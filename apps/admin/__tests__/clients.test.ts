import { describe, expect, it } from 'vitest';
import { callService, resolveServiceUrls } from '../src/lib/clients/services';

describe('resolveServiceUrls', () => {
  it('returns localhost defaults when env is empty', () => {
    const urls = resolveServiceUrls({} as unknown as NodeJS.ProcessEnv);
    expect(urls.sso).toBe('http://localhost:5107');
    expect(urls.webhooks).toBe('http://localhost:5106');
    expect(urls.auditLog).toBe('http://localhost:5111');
    expect(urls.atsBridge).toBe('http://localhost:5105');
    expect(urls.billing).toBe('http://localhost:5112');
    expect(urls.apiKeyMgmt).toBe('http://localhost:5113');
    expect(urls.uptime).toBe('http://localhost:5114');
  });

  it('honours overrides from env', () => {
    const urls = resolveServiceUrls({
      SSO_URL: 'https://sso.example',
      WEBHOOKS_URL: 'https://webhooks.example',
    } as unknown as NodeJS.ProcessEnv);
    expect(urls.sso).toBe('https://sso.example');
    expect(urls.webhooks).toBe('https://webhooks.example');
    expect(urls.auditLog).toBe('http://localhost:5111');
  });
});

describe('callService', () => {
  it('returns ok=true for a 2xx JSON response', async () => {
    const fetchImpl: typeof fetch = async () =>
      new Response(JSON.stringify({ hello: 'world' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    const out = await callService<{ hello: string }>('http://x', '/healthz', { fetchImpl });
    expect(out.ok).toBe(true);
    expect(out.body?.hello).toBe('world');
  });

  it('returns ok=false with the title from RFC 7807 problem json', async () => {
    const fetchImpl: typeof fetch = async () =>
      new Response(JSON.stringify({ title: 'Bad Request', status: 400 }), {
        status: 400,
        headers: { 'content-type': 'application/problem+json' },
      });
    const out = await callService<unknown>('http://x', '/foo', { fetchImpl });
    expect(out.ok).toBe(false);
    expect(out.error).toBe('Bad Request');
    expect(out.status).toBe(400);
  });

  it('forwards the tenant id via x-tenant-id', async () => {
    let capturedHeaders: Record<string, string> | null = null;
    const fetchImpl: typeof fetch = async (_url, init) => {
      capturedHeaders = init?.headers as Record<string, string>;
      return new Response('null', { status: 200 });
    };
    await callService('http://x', '/foo', { fetchImpl, tenantId: 'tenant-1' });
    expect(capturedHeaders?.['x-tenant-id']).toBe('tenant-1');
  });

  it('serialises body as JSON for POST', async () => {
    let capturedBody: string | null = null;
    const fetchImpl: typeof fetch = async (_url, init) => {
      capturedBody = init?.body as string;
      return new Response('null', { status: 200 });
    };
    await callService('http://x', '/foo', {
      fetchImpl,
      method: 'POST',
      body: { name: 'test' },
    });
    expect(JSON.parse(capturedBody!)).toEqual({ name: 'test' });
  });

  it('returns ok=false with a message when fetch throws', async () => {
    const fetchImpl: typeof fetch = async () => {
      throw new Error('connection refused');
    };
    const out = await callService('http://x', '/foo', { fetchImpl });
    expect(out.ok).toBe(false);
    expect(out.error).toBe('connection refused');
  });
});
