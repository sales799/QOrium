// QOrium Proof-of-Skill reference builder (N13 proof engine).
//
// Pure helper turning a graded attempt into the shareable verification handles
// the recruiter/admin review surfaces expose: the proof code plus the public
// paths a recruiter can copy to share or embed. Centralising this keeps the two
// review endpoints at parity and gives them one length-guarded source of truth —
// a missing/too-short proof secret yields `null` (engine inert) instead of a 500.

import { issueProofCode, MIN_PROOF_SECRET_LENGTH } from './proof-code.js';

export interface ProofRef {
  /** Deterministic, PII-free verification handle for the graded attempt. */
  proof_code: string;
  /** Public path rendering the human-readable trust card. */
  proof_view_path: string;
  /** Public path serving the embeddable SVG badge. */
  proof_badge_path: string;
}

/**
 * Build the proof reference for an attempt, or `null` when none should be
 * exposed. Returns `null` unless the attempt is `graded` AND a usable proof
 * secret is configured (present and >= MIN_PROOF_SECRET_LENGTH). Never throws on
 * a weak or missing secret — the engine simply stays inert.
 */
export function buildProofRef(
  status: string,
  attemptId: string,
  secret: string | undefined | null,
): ProofRef | null {
  if (status !== 'graded') return null;
  if (!secret || secret.length < MIN_PROOF_SECRET_LENGTH) return null;
  const code = issueProofCode(attemptId, secret);
  const enc = encodeURIComponent(code);
  return {
    proof_code: code,
    proof_view_path: `/v1/proof/${enc}/view`,
    proof_badge_path: `/v1/proof/${enc}/badge.svg`,
  };
}
