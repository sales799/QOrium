import { Router, type Request } from 'express';
import { randomBytes, createHmac } from 'node:crypto';
import { z } from 'zod';
import type { Pool } from '@qorium/db';
import { recordAuditEvent } from '@qorium/auth';
import { HttpProblem } from '../middleware/problem.js';
import { recruiterAuth, type RecruiterRequest } from '../middleware/recruiter-auth.js';
import type { Config } from '../config.js';

/**
 * Admin console API — Sprint 1.8d.
 *
 * Surfaces SME review queue, IRT calibration outcomes, anti-leak
 * detection inbox, and reference-panel token issuance to the existing
 * recruiter-auth cookie session. No new auth scheme; admin = recruiter
 * (RBAC sub-roles deferred to Sprint 3.3 alongside SAML/SSO claim mapping).
 *
 * Every state-changing endpoint audit-logs to `audit.events` per
 * Constitutional Article XI / SO-9 forensic requirements.
 *
 * Routes are mounted at `/v1/admin/*`.
 */

export interface AdminRouterDeps {
  pool: Pool;
  config: Config;
}

// ─── GET /v1/admin/leak-alerts ─────────────────────────────────────────
const LeakAlertQuerySchema = z.object({
  status: z.enum(['detected', 'under_review', 'rotated', 'dismissed', 'false_positive']).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

interface LeakAlertRow {
  id: string;
  question_id: string;
  source_url: string;
  source_type: string | null;
  detected_at: Date;
  similarity_score: string;
  severity: string;
  status: string;
  rotated_to_question_id: string | null;
  evidence_jsonb: Record<string, unknown> | null;
  reviewed_by: string | null;
  review_notes: string | null;
}

// ─── POST /v1/admin/leak-alerts/:id/review ─────────────────────────────
const ReviewLeakAlertSchema = z.object({
  decision: z.enum(['dismissed', 'false_positive', 'under_review']),
  notes: z.string().max(2000).optional(),
});

// ─── GET /v1/admin/sme-queue ───────────────────────────────────────────
const SmeQueueQuerySchema = z.object({
  status: z.enum(['draft', 'sme_review', 'calibrating']).default('sme_review'),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

interface QuestionRow {
  id: string;
  sku: string;
  format: string;
  status: string;
  difficulty_b: string | null;
  discrimination_a: string | null;
  empirical_pass_rate: string | null;
  body_md: string;
  authored_by: string;
  bloom_level: string | null;
  bloom_dimension: string | null;
  created_at: Date;
}

// ─── GET /v1/admin/calibration ─────────────────────────────────────────
const CalibrationQuerySchema = z.object({
  /** Show items needing calibration ('calibrating') OR all released ('released'). */
  status: z.enum(['calibrating', 'released']).default('calibrating'),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

// ─── POST /v1/admin/panel-tokens ───────────────────────────────────────
const MintTokenSchema = z.object({
  /** Stable hash of panelist identity (governance-managed; never PII). */
  panelist_id_hash_hex: z
    .string()
    .regex(/^[0-9a-f]{32,128}$/i, 'panelist_id_hash_hex must be 32–128 hex chars'),
  /** Days until expiry. Default 90; max 365. */
  ttl_days: z.coerce.number().int().min(1).max(365).default(90),
  /** Cohort label / paid/volunteer flag / DIF group — never PII. */
  metadata: z.record(z.unknown()).optional(),
  scopes: z.array(z.string()).optional(),
});

export function adminRouter(deps: AdminRouterDeps): Router {
  const router = Router();
  const auth = recruiterAuth({
    jwtSecret: deps.config.jwtSecret ?? '',
    cookieSecure: deps.config.cookieSecure,
  });

  // GET /v1/admin/leak-alerts ────────────────────────────────────────
  router.get('/v1/admin/leak-alerts', auth, async (req: Request, res, next) => {
    try {
      const parsed = LeakAlertQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new HttpProblem({
          status: 400,
          title: 'admin/invalid-query',
          detail: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
        });
      }
      const q = parsed.data;
      const conditions: string[] = [];
      const params: unknown[] = [];
      if (q.status) {
        conditions.push(`status = $${params.length + 1}`);
        params.push(q.status);
      }
      if (q.severity) {
        conditions.push(`severity = $${params.length + 1}`);
        params.push(q.severity);
      }
      const whereSql = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      params.push(q.limit);
      const result = await deps.pool.query<LeakAlertRow>(
        `SELECT id, question_id, source_url, source_type, detected_at,
                similarity_score, severity, status, rotated_to_question_id,
                evidence_jsonb, reviewed_by, review_notes
           FROM content.leak_alerts
           ${whereSql}
          ORDER BY detected_at DESC
          LIMIT $${params.length}`,
        params,
      );
      res.json({
        alerts: result.rows.map((r) => ({
          ...r,
          similarity_score: Number.parseFloat(r.similarity_score),
        })),
      });
    } catch (err) {
      next(err);
    }
  });

  // POST /v1/admin/leak-alerts/:id/review ───────────────────────────
  router.post('/v1/admin/leak-alerts/:id/review', auth, async (req: Request, res, next) => {
    try {
      const idRaw = req.params['id'];
      const id = typeof idRaw === 'string' ? idRaw : '';
      if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
        throw new HttpProblem({ status: 400, title: 'admin/invalid-id' });
      }
      const parsed = ReviewLeakAlertSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new HttpProblem({
          status: 400,
          title: 'admin/invalid-body',
          detail: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
        });
      }
      const { decision, notes } = parsed.data;
      const reviewer = (req as RecruiterRequest).recruiter;

      const update = await deps.pool.query<{ id: string; question_id: string }>(
        `UPDATE content.leak_alerts
            SET status = $1,
                review_notes = COALESCE($2, review_notes),
                reviewed_by = $3,
                updated_at = NOW()
          WHERE id = $4
          RETURNING id, question_id`,
        [decision, notes ?? null, reviewer?.id ?? null, id],
      );
      if (update.rowCount === 0) {
        throw new HttpProblem({ status: 404, title: 'admin/leak-alert-not-found' });
      }

      void recordAuditEvent({
        pool: deps.pool,
        event: {
          actor_type: 'user',
          actor_id: reviewer?.id ?? null,
          tenant_id: reviewer?.tenantId ?? null,
          event_type: `leak.${decision}`,
          entity_type: 'leak_alerts',
          entity_id: id,
          payload: { question_id: update.rows[0]!.question_id, notes: notes ?? undefined },
        },
      });

      res.json({ id, decision, reviewed_by: reviewer?.id ?? null });
    } catch (err) {
      next(err);
    }
  });

  // GET /v1/admin/sme-queue ────────────────────────────────────────
  router.get('/v1/admin/sme-queue', auth, async (req: Request, res, next) => {
    try {
      const parsed = SmeQueueQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new HttpProblem({
          status: 400,
          title: 'admin/invalid-query',
          detail: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
        });
      }
      const result = await deps.pool.query<QuestionRow>(
        `SELECT id, sku, format, status, difficulty_b, discrimination_a,
                empirical_pass_rate, LEFT(body_md, 500) AS body_md,
                authored_by, bloom_level, bloom_dimension, created_at
           FROM content.questions
          WHERE status = $1
          ORDER BY created_at ASC
          LIMIT $2`,
        [parsed.data.status, parsed.data.limit],
      );
      res.json({ questions: result.rows });
    } catch (err) {
      next(err);
    }
  });

  // GET /v1/admin/calibration ─────────────────────────────────────
  router.get('/v1/admin/calibration', auth, async (req: Request, res, next) => {
    try {
      const parsed = CalibrationQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new HttpProblem({
          status: 400,
          title: 'admin/invalid-query',
          detail: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
        });
      }
      // Join question with response counts so the UI can show n + pass-rate.
      const result = await deps.pool.query<{
        id: string;
        format: string;
        status: string;
        difficulty_b: string | null;
        discrimination_a: string | null;
        guessing_c: string | null;
        empirical_pass_rate: string | null;
        n: string;
        body_excerpt: string;
      }>(
        `SELECT q.id,
                q.format,
                q.status,
                q.difficulty_b,
                q.discrimination_a,
                q.guessing_c,
                q.empirical_pass_rate,
                COALESCE(r.n, 0)::text AS n,
                LEFT(q.body_md, 240) AS body_excerpt
           FROM content.questions q
           LEFT JOIN (
             SELECT question_id, COUNT(*) AS n
               FROM content.responses
              WHERE is_reference_panel = TRUE
              GROUP BY question_id
           ) r ON r.question_id = q.id
          WHERE q.status = $1
          ORDER BY n DESC NULLS LAST, q.created_at ASC
          LIMIT $2`,
        [parsed.data.status, parsed.data.limit],
      );
      res.json({ items: result.rows });
    } catch (err) {
      next(err);
    }
  });

  // POST /v1/admin/panel-tokens ───────────────────────────────────
  router.post('/v1/admin/panel-tokens', auth, async (req: Request, res, next) => {
    try {
      const parsed = MintTokenSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new HttpProblem({
          status: 400,
          title: 'admin/invalid-body',
          detail: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
        });
      }
      if (!deps.config.apiKeyPepper) {
        throw new HttpProblem({
          status: 503,
          title: 'admin/pepper-not-configured',
          detail: 'API_KEY_PEPPER is not configured; cannot mint reference-panel tokens.',
        });
      }
      const reviewer = (req as RecruiterRequest).recruiter;

      // Resolve the synthetic reference-panel tenant id (created by
      // migration 0007). Cache once per request to keep the SQL tidy.
      const tenantResult = await deps.pool.query<{ id: string }>(
        `SELECT id FROM app.tenants WHERE slug = 'reference-panel' LIMIT 1`,
      );
      const tenantId = tenantResult.rows[0]?.id;
      if (!tenantId) {
        throw new HttpProblem({
          status: 503,
          title: 'admin/reference-panel-tenant-missing',
          detail: 'Run migration 0007_reference_panel.sql first.',
        });
      }

      // Mint a 32-byte raw token; HMAC-SHA256 against pepper for storage.
      const rawToken = `qrp_${randomBytes(32).toString('base64url')}`;
      const tokenHash = createHmac('sha256', deps.config.apiKeyPepper)
        .update(rawToken, 'utf8')
        .digest();
      const panelistIdHash = Buffer.from(parsed.data.panelist_id_hash_hex, 'hex');
      const expiresAt = new Date(Date.now() + parsed.data.ttl_days * 86_400_000);
      const scopes = parsed.data.scopes ?? ['reference-panel:write'];

      const insert = await deps.pool.query<{ id: string }>(
        `INSERT INTO app.reference_panel_tokens
           (tenant_id, token_hash, panelist_id_hash, scopes, expires_at, metadata)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb)
         RETURNING id`,
        [
          tenantId,
          tokenHash,
          panelistIdHash,
          scopes,
          expiresAt,
          JSON.stringify(parsed.data.metadata ?? {}),
        ],
      );
      const tokenId = insert.rows[0]?.id;

      void recordAuditEvent({
        pool: deps.pool,
        event: {
          actor_type: 'user',
          actor_id: reviewer?.id ?? null,
          tenant_id: reviewer?.tenantId ?? null,
          event_type: 'reference_panel.token.minted',
          entity_type: 'reference_panel_tokens',
          entity_id: tokenId ?? undefined,
          payload: {
            tenant_id: tenantId,
            scopes,
            expires_at: expiresAt.toISOString(),
            panelist_id_hash_hex: parsed.data.panelist_id_hash_hex,
          },
        },
      });

      // Return the raw token ONCE — caller must capture it now; we
      // never store nor return it again.
      res
        .status(201)
        .json({ id: tokenId, token: rawToken, expires_at: expiresAt.toISOString(), scopes });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

export function adminAuthRequired(req: Request): boolean {
  return Boolean((req as RecruiterRequest).recruiter);
}

export function _testHelpers() {
  return { LeakAlertQuerySchema, ReviewLeakAlertSchema, MintTokenSchema };
}
