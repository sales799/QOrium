import { describe, expect, it } from 'vitest';
import { isoTimestamp, signRequest } from '../src/signing.js';

describe('signRequest', () => {
  it('produces a deterministic HMAC-SHA256 hex signature', () => {
    const a = signRequest({
      method: 'POST',
      path: '/v1/jd-forge/orders',
      body: '{"jd_text":"Engineer"}',
      timestamp: '2026-05-03T10:30:00Z',
      credential: 'qor_jdforge_acme_abc123',
      secret: 'super-secret-key',
    });
    const b = signRequest({
      method: 'POST',
      path: '/v1/jd-forge/orders',
      body: '{"jd_text":"Engineer"}',
      timestamp: '2026-05-03T10:30:00Z',
      credential: 'qor_jdforge_acme_abc123',
      secret: 'super-secret-key',
    });
    expect(a.signature).toBe(b.signature);
    expect(a.signature).toMatch(/^[0-9a-f]{64}$/);
  });

  it('changes signature when the body changes', () => {
    const a = signRequest({
      method: 'POST',
      path: '/v1/foo',
      body: 'a',
      timestamp: '2026-05-03T10:30:00Z',
      credential: 'k',
      secret: 's',
    });
    const b = signRequest({
      method: 'POST',
      path: '/v1/foo',
      body: 'b',
      timestamp: '2026-05-03T10:30:00Z',
      credential: 'k',
      secret: 's',
    });
    expect(a.signature).not.toBe(b.signature);
  });

  it('uses the spec-mandated authorization scheme', () => {
    const r = signRequest({
      method: 'GET',
      path: '/v1/questions',
      body: '',
      timestamp: '2026-05-03T10:30:00Z',
      credential: 'qor_readybank_t_abc',
      secret: 'secret',
    });
    expect(r.authorization).toMatch(/^QOR-HMAC-SHA256 /);
    expect(r.authorization).toContain('Credential=qor_readybank_t_abc');
    expect(r.authorization).toContain('SignedHeaders=host;x-qor-date');
    expect(r.authorization).toContain(`Signature=${r.signature}`);
  });

  it('lets caller override signed-headers list', () => {
    const r = signRequest({
      method: 'GET',
      path: '/v1/foo',
      body: '',
      timestamp: '2026-05-03T10:30:00Z',
      credential: 'k',
      secret: 's',
      signedHeaders: 'host;x-qor-date;x-qor-tenant',
    });
    expect(r.signedHeadersValue).toBe('host;x-qor-date;x-qor-tenant');
  });

  it('isoTimestamp returns ISO 8601 with Z suffix', () => {
    const ts = isoTimestamp(new Date('2026-05-03T10:30:00Z'));
    expect(ts).toBe('2026-05-03T10:30:00.000Z');
  });
});
