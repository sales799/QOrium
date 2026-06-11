// Public Proof-of-Skill verification endpoints — the outward face of the N13
// proof engine. Mounted BEFORE the /v1 api-key chain (like the candidate flow)
// because the verifier is an anonymous third party with no credentials.
//
//   GET /v1/proof/:code        ->  200 sanitized public proof (JSON) | 404 | 503
//   GET /v1/proof/:code/view   ->  200 human-readable HTML trust card | 404 | 503
//
// 404 covers both "bad/forged code" and "attempt not graded" so the endpoint
// never confirms the existence of an attempt to an unauthenticated caller.

import { Router } from 'express';
import type { Pool } from '@qorium/db';
import { HttpProblem } from '../middleware/problem.js';
import { verifyProofCode } from '../lib/proof-code.js';
import { getProofRecord } from '../repositories/proof.js';
import { getProofStats } from '../repositories/proof-stats.js';
import { renderProofPage, scoreBand } from '../lib/proof-page.js';

export interface ProofRouterDeps {
  pool: Pool;
  /** HMAC secret used to mint/verify proof codes. When absent the engine is inert (503). */
  secret?: string | undefined;
}

function passedFrom(pct: number | null, passScore: number): boolean | null {
  return pct !== null ? pct / 100 >= passScore : null;
}

// The JSON and HTML views share one CSP. The HTML card is static and carries no
// scripts at all, so we relax style-src to allow the inline <style> block while
// keeping script-src absent (default-src 'none' denies everything else).
const VIEW_CSP =
  "default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";

export function proofRouter(deps: ProofRouterDeps): Router {
  const router = Router();

  // Public Customer-Zero proof funnel — aggregate, non-sensitive platform
  // metrics for the marketing proof/case-study page. Registered BEFORE the
  // /:code route so the literal "stats" segment is never read as a proof code.
  // Available regardless of proof-code config (it mints nothing) and cacheable
  // at the edge.
  router.get('/v1/proof/stats', async (_req, res, next) => {
    try {
      const stats = await getProofStats(deps.pool);
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.status(200).json(stats);
    } catch (err) {
      next(err);
    }
  });

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
        passed: passedFrom(pct, record.pass_score),
        graded_at: record.graded_at,
        // Relative path to the human-readable verification page (slice 2). Kept
        // relative so it is correct behind any host/proxy without guessing.
        verify_path: `/v1/proof/${encodeURIComponent(req.params.code)}/view`,
        attestation:
          'Issued by QOrium — India-built, psychometrically-defensible, AI-graded skills assessment. ' +
          'This record is tamper-evident and verifiable against the issuing tenant.',
      });
    } catch (err) {
      next(err);
    }
  });

  // Human-facing HTML verification card. Sends HTML (not an RFC7807 problem)
  // for every outcome so a person following the link always sees a page.
  router.get('/v1/proof/:code/view', async (req, res, next) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Security-Policy', VIEW_CSP);
    res.setHeader('Cache-Control', 'no-store');

    if (!deps.secret) {
      res.status(503).send(renderProofPage({ kind: 'unconfigured' }));
      return;
    }

    const verified = verifyProofCode(req.params.code, deps.secret);
    if (!verified.ok) {
      res.status(404).send(renderProofPage({ kind: 'invalid' }));
      return;
    }

    try {
      const record = await getProofRecord(deps.pool, verified.attemptId);
      if (!record) {
        res.status(404).send(renderProofPage({ kind: 'invalid' }));
        return;
      }
      const pct = record.total_score;
      res.status(200).send(
        renderProofPage({
          kind: 'verified',
          code: req.params.code,
          issuer: record.issuer,
          assessment: record.assessment_title,
          scorePct: pct,
          scoreBand: scoreBand(pct),
          passed: passedFrom(pct, record.pass_score),
          gradedAt: record.graded_at,
        }),
      );
    } catch (err) {
      next(err);
    }
  });

  return router;
}
