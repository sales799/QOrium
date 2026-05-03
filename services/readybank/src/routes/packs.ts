import { Router } from 'express';
import { z } from 'zod';
import type { Pool } from '@qorium/db';
import { recordAuditEvent } from '@qorium/auth';
import type { AuthenticatedRequest } from '@qorium/auth';
import { HttpProblem } from '../middleware/problem.js';
import {
  createPack,
  getPackByIdForTenant,
  recordExport,
  streamPackQuestions,
} from '../repositories/packs.js';
import { streamCsv } from '../exporters/csv.js';
import { streamJson } from '../exporters/json.js';
import { streamHackerrankYaml } from '../exporters/hackerrank-yaml.js';
import type { DifficultyBand } from '../types/question.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const FilterSchema = z.object({
  skill: z.string().min(1).max(100).optional(),
  sub_skill: z.string().min(1).max(100).optional(),
  format: z
    .enum([
      'mcq',
      'msq',
      'coding-fn',
      'coding-project',
      'sql',
      'sjt',
      'design',
      'casestudy',
      'video',
    ])
    .optional(),
  difficulty: z.number().int().min(1).max(5).optional(),
  language: z
    .string()
    .length(2)
    .regex(/^[a-z]{2}$/)
    .optional(),
});

const GenerateBodySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  filters: FilterSchema.default({}),
  limit: z.number().int().min(1).max(100).optional(),
  expires_in_days: z.number().int().min(1).max(365).optional(),
});

const ExportQuerySchema = z.object({
  format: z.enum(['csv', 'json', 'hackerrank-yaml']).default('json'),
});

export interface PacksRouterDeps {
  pool: Pool;
  /** When true (default), records pack.exported audit events. */
  audit?: boolean;
}

export function packsRouter(deps: PacksRouterDeps): Router {
  const router = Router();
  const auditEnabled = deps.audit ?? true;

  router.post('/packs/generate', async (req, res, next) => {
    const auth = (req as AuthenticatedRequest).auth;
    if (!auth) {
      next(new HttpProblem({ status: 401, title: 'Unauthorized', detail: 'API key required' }));
      return;
    }

    let parsed;
    try {
      parsed = GenerateBodySchema.parse(req.body);
    } catch (err) {
      if (err instanceof z.ZodError) {
        next(
          new HttpProblem({
            status: 400,
            title: 'Bad Request',
            detail: 'Invalid pack-generation body',
            extensions: { violations: err.flatten() },
          }),
        );
        return;
      }
      next(err);
      return;
    }

    try {
      const pack = await createPack(deps.pool, {
        tenantId: auth.tenantId,
        apiKeyId: auth.apiKeyId,
        name: parsed.name ?? null,
        filters: {
          ...(parsed.filters.skill !== undefined ? { skill: parsed.filters.skill } : {}),
          ...(parsed.filters.sub_skill !== undefined ? { subSkill: parsed.filters.sub_skill } : {}),
          ...(parsed.filters.format !== undefined ? { format: parsed.filters.format } : {}),
          ...(parsed.filters.difficulty !== undefined
            ? { difficulty: parsed.filters.difficulty as DifficultyBand }
            : {}),
          ...(parsed.filters.language !== undefined ? { language: parsed.filters.language } : {}),
        },
        ...(parsed.limit !== undefined ? { limit: parsed.limit } : {}),
        ...(parsed.expires_in_days !== undefined ? { expiresInDays: parsed.expires_in_days } : {}),
      });

      if (auditEnabled) {
        void recordAuditEvent({
          pool: deps.pool,
          event: {
            actor_type: 'api_key',
            actor_id: auth.apiKeyId,
            event_type: 'pack.generated',
            entity_type: 'pack',
            entity_id: pack.id,
            payload: {
              question_count: pack.question_count,
              filters: parsed.filters,
            },
          },
        });
      }

      res.status(201).json({
        id: pack.id,
        name: pack.name,
        question_count: pack.question_count,
        question_ids: pack.question_ids,
        status: pack.status,
        filters: pack.filters,
        created_at: pack.created_at.toISOString(),
        expires_at: pack.expires_at !== null ? pack.expires_at.toISOString() : null,
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/packs/:id/export', async (req, res, next) => {
    const auth = (req as AuthenticatedRequest).auth;
    if (!auth) {
      next(new HttpProblem({ status: 401, title: 'Unauthorized', detail: 'API key required' }));
      return;
    }

    const packId = req.params.id;
    if (typeof packId !== 'string' || !UUID_PATTERN.test(packId)) {
      next(
        new HttpProblem({ status: 400, title: 'Bad Request', detail: 'Pack id must be a UUID' }),
      );
      return;
    }

    let query;
    try {
      query = ExportQuerySchema.parse(req.query);
    } catch (err) {
      if (err instanceof z.ZodError) {
        next(
          new HttpProblem({
            status: 400,
            title: 'Bad Request',
            detail: 'Invalid export query',
            extensions: { violations: err.flatten() },
          }),
        );
        return;
      }
      next(err);
      return;
    }

    let pack;
    try {
      pack = await getPackByIdForTenant(deps.pool, packId, auth.tenantId);
    } catch (err) {
      next(err);
      return;
    }
    if (pack === null) {
      next(
        new HttpProblem({
          status: 404,
          title: 'Not Found',
          detail: `Pack ${packId} does not exist, is expired, or belongs to another tenant`,
        }),
      );
      return;
    }

    const filenameBase = pack.name ? pack.name.replace(/[^a-z0-9._-]/gi, '_') : pack.id;
    const fileExt =
      query.format === 'csv' ? 'csv' : query.format === 'hackerrank-yaml' ? 'yaml' : 'json';
    res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.${fileExt}"`);

    try {
      const iter = streamPackQuestions(deps.pool, pack);
      let count = 0;
      if (query.format === 'csv') {
        count = await streamCsv(res, iter);
      } else if (query.format === 'hackerrank-yaml') {
        count = await streamHackerrankYaml(res, iter);
      } else {
        count = await streamJson(res, pack, iter);
      }
      res.end();

      void recordExport(deps.pool, pack.id);

      if (auditEnabled) {
        void recordAuditEvent({
          pool: deps.pool,
          event: {
            actor_type: 'api_key',
            actor_id: auth.apiKeyId,
            event_type: 'pack.exported',
            entity_type: 'pack',
            entity_id: pack.id,
            payload: { format: query.format, row_count: count },
          },
        });
      }
    } catch (err) {
      // If headers have been sent (mid-stream), we can't switch to a problem
      // response; surface to express's default error handler so the client
      // sees a connection reset rather than a malformed half-document.
      next(err);
    }
  });

  return router;
}
