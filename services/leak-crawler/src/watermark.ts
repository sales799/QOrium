/**
 * Per-customer watermark seed + forensic markers per
 * Anti-Leak-Engine-v0-Design.md §3.
 *
 * The seed is HMAC-SHA256(stack_vault.watermark_secret, "<tenant_id>|<question_id>|watermark").
 * Each variant of a Stack-Vault question receives a deterministic set of
 * markers derived from the seed: variable suffix, test-value perturbation,
 * scenario synonym replacement, comment style, helper-function reordering.
 *
 * This file owns ONLY the deterministic seed + marker derivation. The actual
 * variant generation (Anthropic prompt + validation loop) is out of scope
 * for the crawler service; it lives in the rotation pipeline (Sprint ≥1.5).
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

export interface WatermarkInputs {
  watermarkSecret: string;
  tenantId: string;
  questionId: string;
}

export interface VariantMarkers {
  /** 2-char hex suffix appended to variable names (e.g., `crc_value` → `crc_value_7f`). */
  variableSuffix: string;
  /** Percentage to shift non-critical numeric test values, 0–9 (% of original). */
  testValuePercent: number;
  /** Index into the synonym dictionary used for scenario rewording, 0–9. */
  synonymIndex: number;
  /** `cpp` (line `//`) or `c` (block C-style). */
  commentStyle: 'cpp' | 'c';
  /** Helper-function ordering parity (0=as-authored, 1=reverse). */
  helperReorderParity: 0 | 1;
}

const HMAC_MESSAGE_SUFFIX = '|watermark';

/** Deterministic per-(tenant, question) HMAC. */
export function deriveWatermarkSeed(inputs: WatermarkInputs): string {
  if (!inputs.watermarkSecret) throw new Error('watermarkSecret is required');
  if (!inputs.tenantId) throw new Error('tenantId is required');
  if (!inputs.questionId) throw new Error('questionId is required');
  return createHmac('sha256', inputs.watermarkSecret)
    .update(inputs.tenantId)
    .update('|')
    .update(inputs.questionId)
    .update(HMAC_MESSAGE_SUFFIX)
    .digest('hex');
}

/** Project the 64-char hex seed onto the 5 forensic markers. */
export function deriveMarkers(seedHex: string): VariantMarkers {
  if (!/^[0-9a-f]{64}$/.test(seedHex)) {
    throw new Error('seedHex must be 64 lowercase hex chars (HMAC-SHA256 output)');
  }
  const buf = Buffer.from(seedHex, 'hex');
  const variableSuffix = seedHex.slice(0, 2);
  const testValuePercent = (buf[2] ?? 0) % 10;
  const synonymIndex = (buf[3] ?? 0) % 10;
  const commentStyle: VariantMarkers['commentStyle'] = ((buf[4] ?? 0) & 1) === 0 ? 'cpp' : 'c';
  const helperReorderParity: VariantMarkers['helperReorderParity'] =
    ((buf[5] ?? 0) & 1) === 0 ? 0 : 1;
  return {
    variableSuffix,
    testValuePercent,
    synonymIndex,
    commentStyle,
    helperReorderParity,
  };
}

/** Convenience: seed → markers in one call. */
export function deriveWatermarkMarkers(inputs: WatermarkInputs): VariantMarkers {
  return deriveMarkers(deriveWatermarkSeed(inputs));
}

/**
 * Forensic attribution: given an observed set of markers (from a leaked
 * variant) and a candidate watermark seed, return the per-marker match
 * confidence + a composite confidence in [0, 1]. Three or more matches at
 * 0.95 each → HIGH attribution per spec §9.
 */
export interface AttributionResult {
  markerMatches: { marker: keyof VariantMarkers; matched: boolean }[];
  matchedCount: number;
  totalCount: number;
  confidence: number;
}

export function attributeLeak(observed: VariantMarkers, candidateSeed: string): AttributionResult {
  const candidate = deriveMarkers(candidateSeed);
  const keys: (keyof VariantMarkers)[] = [
    'variableSuffix',
    'testValuePercent',
    'synonymIndex',
    'commentStyle',
    'helperReorderParity',
  ];
  const markerMatches = keys.map((k) => ({ marker: k, matched: observed[k] === candidate[k] }));
  const matchedCount = markerMatches.filter((m) => m.matched).length;
  const totalCount = keys.length;
  return {
    markerMatches,
    matchedCount,
    totalCount,
    confidence: matchedCount / totalCount,
  };
}

/** Constant-time comparison of two seeds. Defends against any future code path
 * that surfaces seeds in a setting where timing matters (e.g., webhook signing). */
export function seedsEqual(a: string, b: string): boolean {
  if (a.length !== b.length || a.length !== 64) return false;
  return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
}
