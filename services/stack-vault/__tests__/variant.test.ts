import { describe, expect, it } from 'vitest';
import {
  attributeLeakToVault,
  buildVariant,
  deriveWatermarkId,
  type MasterQuestion,
  type VaultIdentity,
} from '../src/variant';
import { deriveWatermarkMarkers } from '@qorium/leak-crawler';

const SECRET = 'stack-vault-watermark-secret-32-chars-min';

const vault = (overrides: Partial<VaultIdentity> = {}): VaultIdentity => ({
  vaultId: 'vault-bosch',
  tenantId: 'tenant-bosch',
  watermarkSecret: SECRET,
  ...overrides,
});

const master = (overrides: Partial<MasterQuestion> = {}): MasterQuestion => ({
  id: 'q-1',
  uuid: '00000000-0000-0000-0000-000000000001',
  format: 'mcq',
  bodyMd: 'Question stem',
  bodyJson: { options: ['A', 'B', 'C', 'D'], correctIndex: 0 },
  answerKey: { correctIndex: 0 },
  testCases: null,
  referenceSolution: null,
  difficultyB: 0,
  discriminationA: 1.2,
  guessingC: 0.25,
  ...overrides,
});

describe('deriveWatermarkId', () => {
  it('is deterministic for the same vault + question', () => {
    const a = deriveWatermarkId(vault(), 'q-1');
    const b = deriveWatermarkId(vault(), 'q-1');
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{16}$/);
  });

  it('differs across tenants', () => {
    const bosch = deriveWatermarkId(vault({ tenantId: 'tenant-bosch' }), 'q-1');
    const tcs = deriveWatermarkId(vault({ tenantId: 'tenant-tcs' }), 'q-1');
    expect(bosch).not.toBe(tcs);
  });

  it('differs across questions', () => {
    expect(deriveWatermarkId(vault(), 'q-1')).not.toBe(deriveWatermarkId(vault(), 'q-2'));
  });

  it('differs across vault secrets', () => {
    const a = deriveWatermarkId(vault(), 'q-1');
    const b = deriveWatermarkId(vault({ watermarkSecret: SECRET + 'x' }), 'q-1');
    expect(a).not.toBe(b);
  });
});

describe('buildVariant', () => {
  it('preserves the master payload + adds watermarkId + watermarkMarkers', () => {
    const v = buildVariant(vault(), master());
    expect(v.id).toBe('q-1');
    expect(v.uuid).toBe(master().uuid);
    expect(v.format).toBe('mcq');
    expect(v.bodyMd).toBe('Question stem');
    expect(v.bodyJson).toEqual(master().bodyJson);
    expect(v.watermarkId).toMatch(/^[0-9a-f]{16}$/);
    expect(v.watermarkMarkers.variableSuffix).toMatch(/^[0-9a-f]{2}$/);
    expect(['cpp', 'c']).toContain(v.watermarkMarkers.commentStyle);
  });

  it('returns null defaults for absent optional fields', () => {
    const v = buildVariant(vault(), master({ answerKey: null, testCases: null }));
    expect(v.answerKey).toBeNull();
    expect(v.testCases).toBeNull();
    expect(v.referenceSolution).toBeNull();
  });

  it('preserves IRT params from master', () => {
    const v = buildVariant(
      vault(),
      master({ difficultyB: 0.7, discriminationA: 1.4, guessingC: 0.1 }),
    );
    expect(v.difficultyB).toBe(0.7);
    expect(v.discriminationA).toBe(1.4);
    expect(v.guessingC).toBe(0.1);
  });

  it('different vaults produce different watermarkIds for the same master', () => {
    const a = buildVariant(vault({ tenantId: 'tenant-a' }), master());
    const b = buildVariant(vault({ tenantId: 'tenant-b' }), master());
    expect(a.watermarkId).not.toBe(b.watermarkId);
    expect(a.watermarkMarkers).not.toEqual(b.watermarkMarkers);
  });
});

describe('attributeLeakToVault', () => {
  it('returns confidence 1.0 when observed markers match the candidate vault', () => {
    const observed = deriveWatermarkMarkers({
      watermarkSecret: SECRET,
      tenantId: 'tenant-bosch',
      questionId: 'q-1',
    });
    const r = attributeLeakToVault(vault({ tenantId: 'tenant-bosch' }), 'q-1', observed);
    expect(r.confidence).toBe(1);
    expect(r.matchedCount).toBe(r.totalCount);
  });

  it('returns lower confidence for the wrong vault', () => {
    const observed = deriveWatermarkMarkers({
      watermarkSecret: SECRET,
      tenantId: 'tenant-tcs',
      questionId: 'q-1',
    });
    const r = attributeLeakToVault(vault({ tenantId: 'tenant-bosch' }), 'q-1', observed);
    expect(r.confidence).toBeLessThan(1);
  });
});
