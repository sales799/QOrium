import { describe, expect, it } from 'vitest';
import { callService } from '../src/lib/clients/services';

const TENANT = '11111111-2222-3333-4444-555555555555';

const fakeOk =
  (payload: unknown): typeof fetch =>
  async () =>
    new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });

describe('sso client wrappers', () => {
  it('GET /v1/sso/configurations carries x-tenant-id', async () => {
    let capturedUrl = '';
    let capturedHeaders: Record<string, string> | null = null;
    const fetchImpl: typeof fetch = async (url, init) => {
      capturedUrl = String(url);
      capturedHeaders = init?.headers as Record<string, string>;
      return new Response(JSON.stringify({ id: 'cfg', tenantId: TENANT }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    };
    await callService('http://sso', '/v1/sso/configurations', {
      fetchImpl,
      tenantId: TENANT,
    });
    expect(capturedUrl).toBe('http://sso/v1/sso/configurations');
    expect(capturedHeaders?.['x-tenant-id']).toBe(TENANT);
  });

  it('PUT body is serialised JSON', async () => {
    let body: string | null = null;
    const fetchImpl: typeof fetch = async (_u, init) => {
      body = init?.body as string;
      return new Response('null', { status: 200 });
    };
    await callService('http://sso', '/v1/sso/configurations', {
      fetchImpl,
      method: 'PUT',
      tenantId: TENANT,
      body: { protocol: 'saml', idp_type: 'okta', status: 'draft' },
    });
    expect(JSON.parse(body!)).toMatchObject({ protocol: 'saml', idp_type: 'okta' });
  });

  it('webhooks list returns parsed body', async () => {
    const out = await callService<{ count: number; subscriptions: unknown[] }>(
      'http://wh',
      '/v1/webhooks/subscriptions',
      {
        fetchImpl: fakeOk({ count: 2, subscriptions: [{ id: 'a' }, { id: 'b' }] }),
        tenantId: TENANT,
      },
    );
    expect(out.ok).toBe(true);
    expect(out.body?.count).toBe(2);
  });

  it('audit list returns parsed events', async () => {
    const out = await callService<{ events: unknown[]; total: number }>(
      'http://au',
      '/v1/audit/events?action=question.viewed',
      {
        fetchImpl: fakeOk({ events: [{ id: '1' }], total: 1, limit: 50, offset: 0 }),
        tenantId: TENANT,
      },
    );
    expect(out.ok).toBe(true);
    expect(out.body?.total).toBe(1);
  });
});
