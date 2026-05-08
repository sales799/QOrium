import { describe, it, expect } from 'vitest';
import {
  applyHomoglyphStego,
  applyVisibleFooter,
  computeDoubleWatermark,
} from '../src/stack-vault/watermark.js';

const VAULT_PEPPER = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'; // 32 chars
const TENANT_A = '11111111-1111-1111-1111-111111111111';
const TENANT_B = '22222222-2222-2222-2222-222222222222';
const BASE_SEED = 'qor-base-seed-question-001';

describe('computeDoubleWatermark', () => {
  it('produces deterministic signature for same inputs', () => {
    const a = computeDoubleWatermark({
      baseSeed: BASE_SEED,
      tenantId: TENANT_A,
      vaultPepper: VAULT_PEPPER,
      renderId: 'fixed-render-id',
    });
    const b = computeDoubleWatermark({
      baseSeed: BASE_SEED,
      tenantId: TENANT_A,
      vaultPepper: VAULT_PEPPER,
      renderId: 'fixed-render-id',
    });
    expect(a.signature).toBe(b.signature);
    expect(a.signature.length).toBe(64); // hex sha256
  });

  it('produces DIFFERENT signature when tenant changes (cross-tenant unforgeable)', () => {
    const a = computeDoubleWatermark({
      baseSeed: BASE_SEED,
      tenantId: TENANT_A,
      vaultPepper: VAULT_PEPPER,
      renderId: 'r1',
    });
    const b = computeDoubleWatermark({
      baseSeed: BASE_SEED,
      tenantId: TENANT_B,
      vaultPepper: VAULT_PEPPER,
      renderId: 'r1',
    });
    expect(a.signature).not.toBe(b.signature);
  });

  it('produces DIFFERENT signature when pepper rotates', () => {
    const a = computeDoubleWatermark({
      baseSeed: BASE_SEED,
      tenantId: TENANT_A,
      vaultPepper: VAULT_PEPPER,
      renderId: 'r1',
    });
    const b = computeDoubleWatermark({
      baseSeed: BASE_SEED,
      tenantId: TENANT_A,
      vaultPepper: 'b'.repeat(32),
      renderId: 'r1',
    });
    expect(a.signature).not.toBe(b.signature);
  });

  it('produces DIFFERENT signature per render event', () => {
    const a = computeDoubleWatermark({
      baseSeed: BASE_SEED,
      tenantId: TENANT_A,
      vaultPepper: VAULT_PEPPER,
      renderId: 'r1',
    });
    const b = computeDoubleWatermark({
      baseSeed: BASE_SEED,
      tenantId: TENANT_A,
      vaultPepper: VAULT_PEPPER,
      renderId: 'r2',
    });
    expect(a.signature).not.toBe(b.signature);
  });

  it('visible footer carries tenant prefix + 8 sig chars', () => {
    const w = computeDoubleWatermark({
      baseSeed: BASE_SEED,
      tenantId: TENANT_A,
      vaultPepper: VAULT_PEPPER,
    });
    expect(w.visibleFooter).toMatch(/^QOR-11111111-[0-9a-f]{8}$/);
  });

  it('rejects short pepper', () => {
    expect(() =>
      computeDoubleWatermark({
        baseSeed: BASE_SEED,
        tenantId: TENANT_A,
        vaultPepper: 'short',
      }),
    ).toThrow(/vaultPepper/);
  });

  it('rejects missing baseSeed or tenantId', () => {
    expect(() =>
      computeDoubleWatermark({
        baseSeed: '',
        tenantId: TENANT_A,
        vaultPepper: VAULT_PEPPER,
      }),
    ).toThrow(/baseSeed/);
    expect(() =>
      computeDoubleWatermark({
        baseSeed: BASE_SEED,
        tenantId: '',
        vaultPepper: VAULT_PEPPER,
      }),
    ).toThrow(/tenantId/);
  });

  it('auto-generates renderId when not provided (different per call)', () => {
    const a = computeDoubleWatermark({
      baseSeed: BASE_SEED,
      tenantId: TENANT_A,
      vaultPepper: VAULT_PEPPER,
    });
    const b = computeDoubleWatermark({
      baseSeed: BASE_SEED,
      tenantId: TENANT_A,
      vaultPepper: VAULT_PEPPER,
    });
    expect(a.renderId).not.toBe(b.renderId);
    expect(a.signature).not.toBe(b.signature);
  });
});

describe('applyVisibleFooter', () => {
  it('appends footer to body', () => {
    const result = applyVisibleFooter('# Question\n\nWhat is X?', 'QOR-tenant-abc12345');
    expect(result).toContain('<!-- watermark: QOR-tenant-abc12345 -->');
    expect(result.endsWith('<!-- watermark: QOR-tenant-abc12345 -->\n')).toBe(true);
  });

  it('replaces existing footer (idempotent on re-render)', () => {
    const once = applyVisibleFooter('# Q', 'QOR-abc-deadbeef');
    const twice = applyVisibleFooter(once, 'QOR-abc-cafebabe');
    expect(twice).not.toContain('deadbeef');
    expect(twice).toContain('cafebabe');
    // Only one watermark comment, not nested.
    expect((twice.match(/watermark:/g) ?? []).length).toBe(1);
  });
});

describe('applyHomoglyphStego', () => {
  it('preserves text length character-for-character', () => {
    const body = 'pace and grace';
    const stego = applyHomoglyphStego(body, 'a'.repeat(64));
    expect([...stego].length).toBe([...body].length);
  });

  it('produces different output for different signatures', () => {
    const body = 'aeop cAEOPC ' + 'aeop cAEOPC '.repeat(20); // 240+ stego-eligible chars
    const sigA = '0'.repeat(64); // all bits 0 = no homoglyph swaps
    const sigB = 'f'.repeat(64); // all bits 1 = max swaps
    const a = applyHomoglyphStego(body, sigA);
    const b = applyHomoglyphStego(body, sigB);
    expect(a).not.toBe(b);
  });

  it('handles body with no stego-eligible chars (returns unchanged)', () => {
    const body = '12345 !@#';
    const stego = applyHomoglyphStego(body, 'a'.repeat(64));
    expect(stego).toBe(body);
  });

  it('is deterministic for same (body, signature)', () => {
    const body = 'pace and place';
    const sig = '7'.repeat(64);
    expect(applyHomoglyphStego(body, sig)).toBe(applyHomoglyphStego(body, sig));
  });
});
