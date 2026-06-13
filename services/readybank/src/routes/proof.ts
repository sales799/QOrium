// Public Proof-of-Skill verification endpoints — the outward face of the N13
// proof engine. Mounted BEFORE the /v1 api-key chain (like the candidate flow)
// because the verifier is an anonymous third party with no credentials.
//
//   GET /v1/proof/:code        ->  200 sanitized public proof (JSON) | 404 | 503
//   GET /v1/proof/:code/view   ->  200 human-readable HTML trust card | 404 | 503
//   GET /v1/proof/:code/badge.svg -> 200 embeddable SVG badge | 404 | 503
//
// 404 covers both "bad/forged code" and "attempt not graded" so the endpoint
// never confirms the existence of an attempt to an unauthenticated caller.

import { Router } from 'express';
import type { Pool } from '@qorium/db';
import { HttpProblem } from '../middleware/problem.js';
import { verifyProofCode } from '../lib/proof-code.js';
import { getProofRecord } from '../repositories/proof.js';
import { getProofStats } from '../repositories/proof-stats.js';
import { getPsychometricsCoverage } from '../repositories/psychometrics-stats.js';
import { getCalibrationBacklog } from '../repositories/calibration-backlog.js';
import { computeCalibrationProgress } from '../lib/calibration-progress.js';
import { buildProofStatsJsonLd } from '../lib/proof-jsonld.js';
import { buildPsychometricsJsonLd } from '../lib/psychometrics-jsonld.js';
import { renderProofPage, scoreBand } from '../lib/proof-page.js';
import { renderProofBadgeSvg } from '../lib/proof-badge.js';

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

  // Public psychometrics-coverage surface (N19). Aggregate, non-sensitive proof
  // of how calibrated the live bank actually is - released item count plus IRT /
  // empirical / refit-ready coverage. Like /stats it mints nothing, so it is
  // available regardless of proof-code config and is edge-cacheable. Registered
  // BEFORE the /:code route so the literal "psychometrics" segment is never read
  // as a proof code.
  router.get('/v1/proof/psychometrics', async (_req, res, next) => {
    try {
      const coverage = await getPsychometricsCoverage(deps.pool);
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.status(200).json(coverage);
    } catch (err) {
      next(err);
    }
  });

  // Public machine-readable proof funnel (N14 AEO). The same aggregate counts as
  // /v1/proof/stats re-expressed as schema.org Dataset JSON-LD so AI answer
  // engines and crawlers can discover and cite QOrium's real assessment activity
  // without scraping HTML. Mints nothing, so it is available regardless of
  // proof-code config and is edge-cacheable. Registered (with the other literal
  // segments) BEFORE the /:code route so "stats.jsonld" is never read as a code.
  router.get('/v1/proof/stats.jsonld', async (_req, res, next) => {
    try {
      const stats = await getProofStats(deps.pool);
      res.setHeader('Content-Type', 'application/ld+json; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.status(200).send(JSON.stringify(buildProofStatsJsonLd(stats)));
    } catch (err) {
      next(err);
    }
  });

  // Public machine-readable psychometrics coverage (N14 AEO / N19). The same
  // aggregate coverage as /v1/proof/psychometrics re-expressed as schema.org
  // Dataset JSON-LD so AI answer engines and crawlers can discover and cite how
  // calibrated QOrium's live bank is without scraping HTML. Mints nothing, so it
  // is available regardless of proof-code config and is edge-cacheable.
  // Registered BEFORE the /:code route so "psychometrics.jsonld" is never read
  // as a proof code.
  router.get('/v1/proof/psychometrics.jsonld', async (_req, res, next) => {
    try {
      const coverage = await getPsychometricsCoverage(deps.pool);
      res.setHeader('Content-Type', 'application/ld+json; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.status(200).send(JSON.stringify(buildPsychometricsJsonLd(coverage)));
    } catch (err) {
      next(err);
    }
  });

  // Public calibration-PROGRESS surface (N19 / N13). Where /v1/proof/psychometrics
  // reports how calibrated the bank is, this reports the honest "actively
  // calibrating" signal: of the items that are calibration-eligible (released
  // AND carrying an IRT parameter), how many are already seeded with empirical
  // responses versus how many remain a cold backlog, plus seeded / cold
  // percentages. Aggregate, no-PII, no question content - it reuses the same
  // released + readybank universe as the admin per-family backlog so the public
  // figure reconciles exactly with the operator view. Mints nothing, so it is
  // available regardless of proof-code config and is edge-cacheable. Registered
  // BEFORE the /:code route so the literal "calibration" segment is never read
  // as a proof code.
  router.get('/v1/proof/calibration', async (_req, res, next) => {
    try {
      const backlog = await getCalibrationBacklog(deps.pool);
      const progress = computeCalibrationProgress(backlog);
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.status(200).json(progress);
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

  // Embeddable Proof-of-Skill badge (SVG). The portable face of a proof: a
  // candidate drops it in a resume / LinkedIn / portfolio, a viewer sees a
  // tamper-evident QOrium mark. Script-free SVG; verified badges are
  // edge-cacheable, invalid/unconfigured are no-store. Shows issuer + band +
  // outcome only — never candidate PII, numeric score, question, or answer.
  router.get('/v1/proof/:code/badge.svg', async (req, res, next) => {
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    if (!deps.secret) {
      res.setHeader('Cache-Control', 'no-store');
      res.status(503).send(renderProofBadgeSvg({ kind: 'unconfigured' }));
      return;
    }

    const verified = verifyProofCode(req.params.code, deps.secret);
    if (!verified.ok) {
      res.setHeader('Cache-Control', 'no-store');
      res.status(404).send(renderProofBadgeSvg({ kind: 'invalid' }));
      return;
    }

    try {
      const record = await getProofRecord(deps.pool, verified.attemptId);
      if (!record) {
        res.setHeader('Cache-Control', 'no-store');
        res.status(404).send(renderProofBadgeSvg({ kind: 'invalid' }));
        return;
      }
      const pct = record.total_score;
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.status(200).send(
        renderProofBadgeSvg({
          kind: 'verified',
          issuer: record.issuer,
          assessment: record.assessment_title,
          scoreBand: scoreBand(pct),
          passed: passedFrom(pct, record.pass_score),
        }),
      );
    } catch (err) {
      next(err);
    }
  });

  return router;
}
