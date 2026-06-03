import { describe, expect, it } from 'vitest';
import { QoriumClient } from '../src/client.js';
import {
  AuditLogResource,
  JdForgeResource,
  ReadyBankResource,
  StackVaultResource,
  WebhooksResource,
} from '../src/resources.js';

function captured(
  body: unknown,
  status = 200,
): {
  fetchImpl: typeof fetch;
  call: { url: string; method: string; body: string | null };
} {
  const call = { url: '', method: '', body: null as string | null };
  const fetchImpl: typeof fetch = async (url, init) => {
    call.url = String(url);
    call.method = init?.method ?? 'GET';
    call.body = init?.body ? String(init.body) : null;
    if (status === 204) return new Response(null, { status });
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    });
  };
  return { fetchImpl, call };
}

describe('ReadyBankResource', () => {
  it('builds list query params', async () => {
    const cap = captured({ items: [], limit: 10, offset: 0 });
    const c = new QoriumClient({ baseUrl: 'https://api.x/v1', fetchImpl: cap.fetchImpl });
    await new ReadyBankResource(c).list({ limit: 10, sku: 'readybank' });
    expect(cap.call.url).toContain('/questions?');
    expect(cap.call.url).toContain('limit=10');
    expect(cap.call.url).toContain('sku=readybank');
  });
  it('encodes id in the path', async () => {
    const cap = captured({ id: 'q-1' });
    const c = new QoriumClient({ baseUrl: 'https://api.x/v1', fetchImpl: cap.fetchImpl });
    await new ReadyBankResource(c).get('id with space');
    expect(cap.call.url).toContain('/questions/id%20with%20space');
  });
});

describe('JdForgeResource', () => {
  it('POST orders with idempotency key', async () => {
    const cap = captured({ id: 'ord-1' });
    const c = new QoriumClient({ baseUrl: 'https://api.x/v1', fetchImpl: cap.fetchImpl });
    await new JdForgeResource(c).createOrder(
      { jd_text: 'Senior Engineer', tier: 'standard' },
      { idempotencyKey: 'order-key-1' },
    );
    expect(cap.call.method).toBe('POST');
    const body = JSON.parse(cap.call.body!);
    expect(body.tier).toBe('standard');
  });
});

describe('WebhooksResource', () => {
  it('PATCH toggles active', async () => {
    const cap = captured({ id: 'sub-1', isActive: false });
    const c = new QoriumClient({ baseUrl: 'https://api.x/v1', fetchImpl: cap.fetchImpl });
    await new WebhooksResource(c).setActive('sub-1', false);
    expect(cap.call.method).toBe('PATCH');
    expect(JSON.parse(cap.call.body!).is_active).toBe(false);
  });
  it('DELETE returns null', async () => {
    const cap = captured(null, 204);
    const c = new QoriumClient({ baseUrl: 'https://api.x/v1', fetchImpl: cap.fetchImpl });
    await new WebhooksResource(c).delete('sub-1');
    expect(cap.call.method).toBe('DELETE');
  });
});

describe('AuditLogResource', () => {
  it('list builds full filter query string', async () => {
    const cap = captured({ events: [], total: 0, limit: 50, offset: 0 });
    const c = new QoriumClient({ baseUrl: 'https://api.x/v1', fetchImpl: cap.fetchImpl });
    await new AuditLogResource(c).list({
      startDate: '2026-05-01T00:00:00Z',
      endDate: '2026-06-01T00:00:00Z',
      action: 'question.viewed',
      resourceType: 'question',
      actorId: 'usr-1',
      limit: 25,
      offset: 50,
    });
    expect(cap.call.url).toContain('start_date=2026-05-01T00%3A00%3A00Z');
    expect(cap.call.url).toContain('action=question.viewed');
    expect(cap.call.url).toContain('limit=25');
    expect(cap.call.url).toContain('offset=50');
  });
  it('summary builds top param', async () => {
    const cap = captured({ window: {}, top: [] });
    const c = new QoriumClient({ baseUrl: 'https://api.x/v1', fetchImpl: cap.fetchImpl });
    await new AuditLogResource(c).summary({ topN: 5 });
    expect(cap.call.url).toContain('top=5');
  });
});

describe('StackVaultResource', () => {
  it('lists bundles', async () => {
    const cap = captured({ items: [], limit: 50, offset: 0 });
    const c = new QoriumClient({ baseUrl: 'https://api.x/v1', fetchImpl: cap.fetchImpl });
    await new StackVaultResource(c).list();
    expect(cap.call.url).toContain('/stack-vault/bundles');
  });
});
