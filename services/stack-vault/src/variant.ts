/**
 * Stack-Vault per-customer question variant.
 *
 * v0 attaches a deterministic `watermark_id` to every question read from a
 * customer's vault. The watermark_id is the first 16 chars of the
 * HMAC-SHA256 watermark seed shipped by `@qorium/leak-crawler`'s
 * `deriveWatermarkSeed` (Sprint 1.4). The full 64-char seed is kept
 * server-side and used by the Anti-Leak forensics pipeline to attribute
 * leaked questions back to the customer that read them.
 *
 * Mechanical marker substitution (variable-name suffix replacement,
 * test-value perturbation, comment-style swap, etc. per the watermark
 * spec) is **deferred** — see
 * `infra/CTO-deltas/CTO-DELTA-stackvault-marker-substitution-deferred.md`.
 * v0 ships the watermark_id metadata; the body / test-cases stay master-
 * canonical. The substitution upgrade ships in a follow-up sprint with
 * dedicated per-format handlers.
 */

import {
  attributeLeak,
  deriveWatermarkMarkers,
  deriveWatermarkSeed,
  type VariantMarkers,
} from '@qorium/leak-crawler';

export interface MasterQuestion {
  id: string;
  uuid: string;
  format: string;
  bodyMd: string;
  bodyJson: Record<string, unknown>;
  answerKey?: Record<string, unknown> | null;
  testCases?: Array<Record<string, unknown>> | null;
  referenceSolution?: string | null;
  difficultyB?: number | null;
  discriminationA?: number | null;
  guessingC?: number | null;
}

export interface VaultIdentity {
  vaultId: string;
  tenantId: string;
  watermarkSecret: string;
}

export interface CustomerVariant {
  /** Same as the master id — we don't fork rows in v0; the marker travels alongside. */
  id: string;
  uuid: string;
  format: string;
  bodyMd: string;
  bodyJson: Record<string, unknown>;
  answerKey: Record<string, unknown> | null;
  testCases: Array<Record<string, unknown>> | null;
  referenceSolution: string | null;
  difficultyB: number | null;
  discriminationA: number | null;
  guessingC: number | null;
  /** First 16 chars of the HMAC seed; safe to surface to the customer. */
  watermarkId: string;
  /** Per-customer variant markers (the data the forensics step will compare against). */
  watermarkMarkers: VariantMarkers;
}

const WATERMARK_ID_BYTES = 16;

export function deriveWatermarkId(vault: VaultIdentity, questionId: string): string {
  const seed = deriveWatermarkSeed({
    watermarkSecret: vault.watermarkSecret,
    tenantId: vault.tenantId,
    questionId,
  });
  return seed.slice(0, WATERMARK_ID_BYTES);
}

/**
 * Build the customer-facing variant of a master question. Pure function:
 * no DB, no HTTP. The caller is responsible for persisting whatever audit
 * trail is required (see `repositories/access-log.ts`).
 */
export function buildVariant(vault: VaultIdentity, master: MasterQuestion): CustomerVariant {
  const seed = deriveWatermarkSeed({
    watermarkSecret: vault.watermarkSecret,
    tenantId: vault.tenantId,
    questionId: master.id,
  });
  const watermarkId = seed.slice(0, WATERMARK_ID_BYTES);
  const watermarkMarkers = deriveWatermarkMarkers({
    watermarkSecret: vault.watermarkSecret,
    tenantId: vault.tenantId,
    questionId: master.id,
  });
  return {
    id: master.id,
    uuid: master.uuid,
    format: master.format,
    bodyMd: master.bodyMd,
    bodyJson: master.bodyJson,
    answerKey: master.answerKey ?? null,
    testCases: master.testCases ?? null,
    referenceSolution: master.referenceSolution ?? null,
    difficultyB: master.difficultyB ?? null,
    discriminationA: master.discriminationA ?? null,
    guessingC: master.guessingC ?? null,
    watermarkId,
    watermarkMarkers,
  };
}

/**
 * Forensic attribution helper. Given a set of observed markers (extracted
 * from a leaked question on a public site) and a candidate vault, reports
 * how many markers match. Wraps the leak-crawler primitive with the vault
 * identity for the question.
 */
export function attributeLeakToVault(
  vault: VaultIdentity,
  questionId: string,
  observed: VariantMarkers,
): { matchedCount: number; totalCount: number; confidence: number } {
  const candidateSeed = deriveWatermarkSeed({
    watermarkSecret: vault.watermarkSecret,
    tenantId: vault.tenantId,
    questionId,
  });
  const result = attributeLeak(observed, candidateSeed);
  return {
    matchedCount: result.matchedCount,
    totalCount: result.totalCount,
    confidence: result.confidence,
  };
}
