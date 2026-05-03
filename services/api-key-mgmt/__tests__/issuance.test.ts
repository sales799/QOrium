import { describe, expect, it } from 'vitest';
import { hashApiKey } from '@qorium/auth';
import { issueKey, nextRotationDueAt } from '../src/issuance';

const PEPPER = 'test-pepper-32-chars-or-longer-please';

describe('issueKey', () => {
  it('produces a qor_live_<32hex> raw key', () => {
    const key = issueKey({ family: 'live', pepper: PEPPER });
    expect(key.raw).toMatch(/^qor_live_[0-9a-f]{32}$/);
    expect(key.prefix).toBe('qor_live');
    expect(key.hash).toBe(hashApiKey(key.raw, PEPPER));
  });

  it('produces a qor_test_<32hex> raw key', () => {
    const key = issueKey({ family: 'test', pepper: PEPPER });
    expect(key.raw).toMatch(/^qor_test_[0-9a-f]{32}$/);
    expect(key.prefix).toBe('qor_test');
  });

  it('produces a qor_internal_<tenant>_<32hex> raw key', () => {
    const key = issueKey({
      family: 'internal',
      tenantPrefix: 'talind001',
      pepper: PEPPER,
    });
    expect(key.raw).toMatch(/^qor_internal_talind001_[0-9a-f]{32}$/);
    expect(key.prefix).toBe('qor_intern');
  });

  it('throws for internal family without a tenant prefix', () => {
    expect(() => issueKey({ family: 'internal', pepper: PEPPER })).toThrow(/tenantPrefix/);
  });

  it('throws on a malformed tenant prefix', () => {
    expect(() => issueKey({ family: 'internal', tenantPrefix: 'short', pepper: PEPPER })).toThrow(
      /tenantPrefix/,
    );
  });

  it('honours an injected random source for deterministic tests', () => {
    const fixed = Buffer.from('00112233445566778899aabbccddeeff', 'hex');
    const key = issueKey({
      family: 'live',
      pepper: PEPPER,
      randomSource: () => fixed,
    });
    expect(key.raw).toBe('qor_live_00112233445566778899aabbccddeeff');
  });
});

describe('nextRotationDueAt', () => {
  it('internal keys rotate at 180 days per D3 §2.3', () => {
    const now = new Date('2026-05-01T00:00:00Z');
    const due = nextRotationDueAt(now, 'internal');
    expect((due.getTime() - now.getTime()) / 86_400_000).toBe(180);
  });
  it('customer keys rotate at 365 days', () => {
    const now = new Date('2026-05-01T00:00:00Z');
    const due = nextRotationDueAt(now, 'live');
    expect((due.getTime() - now.getTime()) / 86_400_000).toBe(365);
  });
});
