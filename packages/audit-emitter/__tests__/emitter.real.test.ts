import { describe, expect, it, vi } from 'vitest';
import { createAuditEmitter } from '../src/emitter';

function makeFetch(responder: (req: Request) => Response | Promise<Response>): typeof fetch {
  return ((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    const req = new Request(url, init);
    return Promise.resolve(responder(req));
  }) as typeof fetch;
}

describe('real emitter', () => {
  it('throws when baseUrl or adminToken is missing', () => {
    expect(() => createAuditEmitter({ mode: 'real', baseUrl: '', adminToken: 't' })).toThrow(
      /baseUrl/,
    );
    expect(() => createAuditEmitter({ mode: 'real', baseUrl: 'x', adminToken: '' })).toThrow(
      /baseUrl/,
    );
  });

  it('POSTs to /v1/audit/events with bearer + idempotency-key', async () => {
    const calls: Array<{ url: string; headers: Headers; body: unknown }> = [];
    const fetchImpl = makeFetch(async (req) => {
      calls.push({
        url: req.url,
        headers: req.headers,
        body: await req.json(),
      });
      return new Response(JSON.stringify({ id: 'evt-1' }), {
        status: 201,
        headers: { 'content-type': 'application/json' },
      });
    });

    const emitter = createAuditEmitter({
      mode: 'real',
      baseUrl: 'http://localhost:5111',
      adminToken: 'admin-token',
      fetchImpl,
    });

    const result = await emitter.emit({
      tenantId: 't1',
      actorId: 'u1',
      action: 'api_key.created',
      resourceType: 'api_key',
      resourceId: 'k1',
      payload: { name: 'admin' },
    });

    expect(result.delivered).toBe(true);
    expect(calls).toHaveLength(1);
    const c = calls[0]!;
    expect(c.url).toBe('http://localhost:5111/v1/audit/events');
    expect(c.headers.get('authorization')).toBe('Bearer admin-token');
    expect(c.headers.get('idempotency-key')).toMatch(/^sha256:/);
    expect(c.body).toMatchObject({
      action: 'api_key.created',
      tenant_id: 't1',
      actor_id: 'u1',
      resource_type: 'api_key',
      resource_id: 'k1',
      payload: { name: 'admin' },
    });
  });

  it('honours caller-supplied idempotency key', async () => {
    const calls: Array<{ headers: Headers }> = [];
    const fetchImpl = makeFetch(async (req) => {
      calls.push({ headers: req.headers });
      return new Response('{}', { status: 201 });
    });
    const emitter = createAuditEmitter({
      mode: 'real',
      baseUrl: 'http://x',
      adminToken: 't',
      fetchImpl,
    });
    await emitter.emit({
      tenantId: 't1',
      actorId: 'u1',
      action: 'api_key.created',
      idempotencyKey: 'custom-key',
    });
    expect(calls[0]?.headers.get('idempotency-key')).toBe('custom-key');
  });

  it('treats 409 as deduplicated, not delivered', async () => {
    const fetchImpl = makeFetch(() => new Response('{}', { status: 409 }));
    const emitter = createAuditEmitter({
      mode: 'real',
      baseUrl: 'http://x',
      adminToken: 't',
      fetchImpl,
    });
    const r = await emitter.emit({
      tenantId: 't1',
      actorId: 'u1',
      action: 'api_key.created',
    });
    expect(r.delivered).toBe(false);
    expect(r.deduplicated).toBe(true);
  });

  it('returns delivered=false on 5xx + warns with status', async () => {
    const fetchImpl = makeFetch(() => new Response('{}', { status: 500 }));
    const emitter = createAuditEmitter({
      mode: 'real',
      baseUrl: 'http://x',
      adminToken: 't',
      fetchImpl,
    });
    const r = await emitter.emit({
      tenantId: 't1',
      actorId: 'u1',
      action: 'api_key.created',
    });
    expect(r.delivered).toBe(false);
    expect(r.deduplicated).toBe(false);
    expect(r.warning).toMatch(/500/);
  });

  it('aborts after timeoutMs', async () => {
    const fetchImpl: typeof fetch = vi.fn((_input, init?: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        const signal = init?.signal;
        if (signal) {
          signal.addEventListener('abort', () => {
            const err = new Error('aborted');
            err.name = 'AbortError';
            reject(err);
          });
        }
      });
    }) as unknown as typeof fetch;

    const emitter = createAuditEmitter({
      mode: 'real',
      baseUrl: 'http://x',
      adminToken: 't',
      timeoutMs: 20,
      fetchImpl,
    });

    await expect(
      emitter.emit({ tenantId: 't1', actorId: 'u1', action: 'api_key.created' }),
    ).rejects.toThrow();
  });
});
