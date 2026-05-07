import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import type { Pool } from '@qorium/db';
import { HttpProblem } from '../middleware/problem.js';
import { panelTokenAuth } from '../middleware/panel-token-auth.js';
import type { Config } from '../config.js';
import { recordAuditEvent } from '@qorium/auth';

const ResponseBodySchema = z.object({
  question_id: z.string().uuid(),
  response_body: z.unknown(),
  /** Score on a 0–100 scale OR points; either is fine. */
  score: z.number().min(0).max(100).optional(),
  /** Whether the response is correct, for SO-21 IRT calibration. Required
   *  for binary items; optional for polytomous. */
  correct: z.boolean().optional(),
  time_taken_ms: z.number().int().min(0).optional(),
  started_at: z.string().datetime().optional(),
  suspicious_signals: z.record(z.unknown()).optional(),
});

export interface ReferencePanelRouterDeps {
  pool: Pool;
  config: Config;
}

/** Reference Panel response ingestion. Authed via bearer token in
 *  `app.reference_panel_tokens`; writes to `content.responses` with
 *  `is_reference_panel = TRUE` so the IRT calibration job can isolate
 *  panel data downstream.
 *
 *  Endpoint: POST /v1/reference-panel/responses
 *
 *  Per Reference Panel Governance v0: panelist identity is represented
 *  as the SHA-256 hash carried in the token; recruiter/customer PII
 *  never enters this path. */
export function referencePanelRouter(deps: ReferencePanelRouterDeps): Router {
  const router = Router();

  // No pepper means no /v1/* gating elsewhere either; mount as no-op so
  // the surface is uniformly absent rather than half-wired. server.ts
  // already guards this; the check here is defence-in-depth.
  const pepper = deps.config.apiKeyPepper;
  if (!pepper) return router;

  router.post(
    '/v1/reference-panel/responses',
    panelTokenAuth({ pool: deps.pool, pepper }),
    async (req: Request, res: Response, next) => {
      try {
        const panel = req.panel;
        if (!panel) {
          // Should be unreachable — middleware would have thrown — but the
          // type guard keeps TS happy without optional-chaining everywhere.
          throw new HttpProblem({ status: 500, title: 'panel-context-missing' });
        }

        const parsed = ResponseBodySchema.safeParse(req.body);
        if (!parsed.success) {
          throw new HttpProblem({
            status: 400,
            title: 'reference-panel/invalid-body',
            detail: parsed.error.issues
              .map((i) => `${i.path.join('.') || '(body)'}: ${i.message}`)
              .join('; '),
          });
        }
        const body = parsed.data;

        // Insert into content.responses. tenant_id is the synthetic
        // reference-panel tenant from the panel-token row.
        // candidate_id is the hex-encoded panelist hash so calibration
        // queries can group by panelist without touching PII.
        const candidateId = panel.panelistIdHash.toString('hex');
        const score = body.score ?? (body.correct ? 100 : 0);

        const insert = await deps.pool.query<{ id: string }>(
          `INSERT INTO content.responses
             (question_id, tenant_id, candidate_id, response_body, score,
              time_taken_ms, suspicious_signals, started_at, is_reference_panel)
           VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7::jsonb, $8, TRUE)
           RETURNING id`,
          [
            body.question_id,
            panel.tenantId,
            candidateId,
            JSON.stringify(body.response_body ?? null),
            score,
            body.time_taken_ms ?? null,
            JSON.stringify(body.suspicious_signals ?? {}),
            body.started_at ?? null,
          ],
        );

        const responseId = insert.rows[0]?.id;

        // Audit-log the ingestion (fire-and-forget; never throws).
        // actor_type='api_key' is the closest fit in the existing CHECK
        // constraint; actor_id is null because the FK targets app.users
        // and panel-token rows live in a different table — we record the
        // token id in payload instead so the trail is complete.
        void recordAuditEvent({
          pool: deps.pool,
          event: {
            actor_type: 'api_key',
            actor_id: null,
            event_type: 'reference_panel.response.recorded',
            entity_type: 'response',
            entity_id: responseId ?? undefined,
            payload: {
              tenant_id: panel.tenantId,
              token_id: panel.tokenId,
              question_id: body.question_id,
              correct: body.correct ?? null,
              score,
            },
          },
        });

        res.status(201).json({
          id: responseId,
          question_id: body.question_id,
          recorded_at: new Date().toISOString(),
        });
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
}
