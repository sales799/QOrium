import { describe, it, expect } from 'vitest';
import { hashAssertionKey, hashAssertionKeyHex } from '../src/replay-guard.js';

const PEPPER = 'test-pepper-32-chars-aaaaaaaaaaaa';

describe('hashAssertionKey', () => {
  it('binds tenant + assertion id (different tenants → different hashes)', () => {
    const a = hashAssertionKey({ id: '_assertion_1', tenantId: 'tenant-A', pepper: PEPPER });
    const b = hashAssertionKey({ id: '_assertion_1', tenantId: 'tenant-B', pepper: PEPPER });
    expect(a.equals(b)).toBe(false);
  });

  it('produces deterministic hash for same inputs', () => {
    const a = hashAssertionKey({ id: '_x', tenantId: 't', pepper: PEPPER });
    const b = hashAssertionKey({ id: '_x', tenantId: 't', pepper: PEPPER });
    expect(a.equals(b)).toBe(true);
    expect(a.length).toBe(32);
  });

  it('rejects short pepper', () => {
    expect(() => hashAssertionKey({ id: '_x', tenantId: 't', pepper: 'short' })).toThrow(/pepper/);
  });

  it('rejects empty id or tenantId', () => {
    expect(() => hashAssertionKey({ id: '', tenantId: 't', pepper: PEPPER })).toThrow();
    expect(() => hashAssertionKey({ id: '_x', tenantId: '', pepper: PEPPER })).toThrow();
  });

  it('hex helper produces 64-char hex', () => {
    const hex = hashAssertionKeyHex({ id: '_x', tenantId: 't', pepper: PEPPER });
    expect(hex).toMatch(/^[0-9a-f]{64}$/);
  });
});
