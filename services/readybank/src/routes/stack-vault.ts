/**
 * Stack-Vault routes — exclusive customer library.
 *
 * Per Constitution §1.2 SKU 3 + infra/API-Documentation-v0.md
 * §"Stack-Vault Endpoints". All routes are gated by:
 *   1. `apiKeyAuth` (already mounted globally on /v1/*)
 *   2. `requireActiveVault` (this file) — verifies vault is active +
 *      attaches `req.vault`
 *
 * Cross-tenant reads return 404, never 403, to avoid existence leak.
 * Watermarking is applied at render time (double layer per spec).
 */

import { Router } from 'express';
import { z } from 'zod';
import type { Pool } from '@qorium/db';
import { HttpProblem } from '../middleware/problem.js';
import {
  requireActiveVault,
  type TenantIsolationDeps,
  type VaultedRequest,
} from '../middleware/tenant-isolation.js';
import {
  getVaultQuestionByUuid,
  insertVaultQuestion,
  listVaultQuestions,
} from '../repositories/stack-vault.js';
import {
  applyHomoglyphStego,
  applyVisibleFooter,
  computeDoubleWatermark,
} from '../stack-vault/watermark.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

const CreateBodySchema = z.object({
  qor_id: z.string().min(1).max(64),
  format: z.enum([
    'mcq',
    'msq',
    'coding-fn',
    'coding-project',
    'sql',
    'sjt',
    'design',
    'casestudy',
    'video',
  ]),
  language: z
    .string()
    .length(2)
    .regex(/^[a-z]{2}$/),
  body_md: z.string().min(1),
  body_json: z.record(z.unknown()),
  watermark_seed: z.string().min(8).max(128),
  difficulty_b: z.number().nullable().optional(),
});

export interface StackVaultRouterDeps extends TenantIsolationDeps {
  pool: Pool;
}

export function stackVaultRouter(deps: StackVaultRouterDeps): Router {
  const router = Router();
  const vaultGuard = requireActiveVault(deps);

  // GET /v1/stack-vault/questions — list this tenant's vault questions.
  router.get('/stack-vault/questions', vaultGuard, async (req: VaultedRequest, res, next) => {
    let parsed;
    try {
      parsed = ListQuerySchema.parse(req.query);
    } catch (err) {
      next(
        new HttpProblem({
          status: 400,
          title: 'Bad Request',
          detail: err instanceof z.ZodError ? 'Invalid query parameters' : 'Bad request',
          ...(err instanceof z.ZodError && { extensions: { violations: err.flatten() } }),
        }),
      );
      return;
    }

    const vault = req.vault;
    if (!vault) {
      next(
        new HttpProblem({ status: 500, title: 'Internal Error', detail: 'vault context missing' }),
      );
      return;
    }

    try {
      const rows = await listVaultQuestions(deps.pool, vault.tenantId, parsed.limit, parsed.offset);
      res.status(200).json({
        items: rows.map((r) => ({
          uuid: r.uuid,
          qor_id: r.qor_id,
          format: r.format,
          language: r.language,
          difficulty_b: r.difficulty_b,
          created_at: r.created_at,
        })),
        limit: parsed.limit,
        offset: parsed.offset,
      });
    } catch (err) {
      next(err);
    }
  });

  // GET /v1/stack-vault/questions/:uuid — fetch + render with double watermark.
  router.get('/stack-vault/questions/:uuid', vaultGuard, async (req: VaultedRequest, res, next) => {
    const uuidRaw = req.params['uuid'];
    const uuid = typeof uuidRaw === 'string' ? uuidRaw : '';
    if (!UUID_PATTERN.test(uuid)) {
      next(new HttpProblem({ status: 400, title: 'Bad Request', detail: 'Invalid UUID' }));
      return;
    }
    const vault = req.vault;
    if (!vault) {
      next(
        new HttpProblem({ status: 500, title: 'Internal Error', detail: 'vault context missing' }),
      );
      return;
    }

    try {
      const row = await getVaultQuestionByUuid(deps.pool, vault.tenantId, uuid);
      if (!row) {
        // 404 for both not-found and wrong-tenant — no existence leak.
        next(new HttpProblem({ status: 404, title: 'Not Found', detail: 'Question not found' }));
        return;
      }

      // Apply double watermark.
      const wm = computeDoubleWatermark({
        baseSeed: row.watermark_seed ?? row.qor_id,
        tenantId: vault.tenantId,
        vaultPepper: vault.watermarkPepper,
      });
      const stegoBody = applyHomoglyphStego(row.body_md, wm.signature);
      const renderedBody = applyVisibleFooter(stegoBody, wm.visibleFooter);

      res.status(200).json({
        uuid: row.uuid,
        qor_id: row.qor_id,
        format: row.format,
        language: row.language,
        body_md: renderedBody,
        body_json: row.body_json,
        difficulty_b: row.difficulty_b,
        watermark: {
          render_id: wm.renderId,
          footer: wm.visibleFooter,
          // signature returned only to caller; persisted server-side
          // via audit log (not implemented in this alpha — add in beta).
        },
        created_at: row.created_at,
      });
    } catch (err) {
      next(err);
    }
  });

  // POST /v1/stack-vault/questions — author a new question into this tenant's vault.
  router.post('/stack-vault/questions', vaultGuard, async (req: VaultedRequest, res, next) => {
    let body;
    try {
      body = CreateBodySchema.parse(req.body);
    } catch (err) {
      next(
        new HttpProblem({
          status: 400,
          title: 'Bad Request',
          detail: err instanceof z.ZodError ? 'Invalid request body' : 'Bad request',
          ...(err instanceof z.ZodError && { extensions: { violations: err.flatten() } }),
        }),
      );
      return;
    }
    const vault = req.vault;
    if (!vault) {
      next(
        new HttpProblem({ status: 500, title: 'Internal Error', detail: 'vault context missing' }),
      );
      return;
    }

    try {
      const inserted = await insertVaultQuestion(deps.pool, {
        tenantId: vault.tenantId,
        qorId: body.qor_id,
        body_md: body.body_md,
        body_json: body.body_json,
        watermark_seed: body.watermark_seed,
        format: body.format,
        language: body.language,
        difficulty_b: body.difficulty_b ?? null,
      });
      res.status(201).json({ uuid: inserted.uuid, qor_id: body.qor_id });
    } catch (err) {
      // Composite uniqueness violation surfaces as 23505 from Postgres.
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code?: string }).code === '23505'
      ) {
        next(
          new HttpProblem({
            status: 409,
            title: 'Conflict',
            detail: `qor_id ${body.qor_id} already exists in this tenant's vault`,
          }),
        );
        return;
      }
      next(err);
    }
  });

  return router;
}
