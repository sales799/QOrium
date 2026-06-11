// Public Proof-of-Skill verification endpoint — the outward face of the N13
// proof engine. Mounted BEFORE the /v1 api-key chain (like the candidate flow)
// because the verifier is an anonymous third party with no credentials.
//
//   GET /v1/proof/:code  ->  200 sanitized public proof | 404 | 503
//
// 404 covers both "bad/forged code" and "attempt not graded" so the endpoint
// never confirms the existence of an attempt to an unauthenticated caller.

import { Router } from 'express';
import type { Pool } from '@qorium/db';
import { HttpProblem } from '../middleware/problem.js';
import { verifyProofCode } from '../lib/proof-code.js';
import { getProofRecord } from '../repositories/proof.js';

export interface ProofRouterDeps {
  pool: Pool;
  /** HMAC secret used to mint/verify proof codes. When absent the engine is inert (503). */
  secret?: string | undefined;
}

function scoreBand(pct: number | null): string {
  if (pct === null) return 'unscored';
  if (pct >= 90) return 'exceptional';
  if (pct >= 75) return 'strong';
  if (pct >= 60) return 'proficient';
  if (pct >= 40) return 'developing';
  return 'foundational';
}

export function proofRouter(deps: ProofRouterDeps): Router {
  const router = Router();

  router.get('/v1/proof/:code', async (req, res, next) => {
    if (!deps.secret) {
      next(
        new HttpProblem({
          status: 503,
          title: 'Service Unavailable',
          detail: 'Proof verification is not configured on this deployment.',
        }),
      );
      return;
    }

    const verified = verifyProofCode(req.params.code, deps.secret);
    if (!verified.ok) {
      next(new HttpProblem({ status: 404, title: 'Not Found', detail: 'Proof not found.' }));
      return;
    }

    try {
      const record = await getProofRecord(deps.pool, verified.attemptId);
      if (!record) {
        next(new HttpProblem({ status: 404, title: 'Not Found', detail: 'Proof not found.' }));
        return;
      }
      const pct = record.total_score;
      res.status(200).json({
        verified: true,
        proof_code: req.params.code,
        issuer: record.issuer,
        assessment: record.assessment_title,
        score_pct: pct,
        score_band: scoreBand(pct),
        passed: pct !== null ? pct / 100 >= record.pass_score : null,
        graded_at: record.graded_at,
        attestation:
          'Issued by QOrium — India-built, psychometrically-defensible, AI-graded skills assessment. ' +
          'This record is tamper-evident and verifiable against the issuing tenant.',
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
