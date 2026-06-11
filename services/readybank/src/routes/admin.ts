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

// ─── GET /v1/admin/tenants ──────────────────────────────────
const TenantsQuerySchema = z.object({
  status: z.enum(['active', 'paused', 'churned']).optional(),
  type: z
    .enum(['internal', 'customer-platform', 'customer-enterprise', 'customer-recruiter'])
    .optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

// GET /v1/admin/assessments — cross-tenant read-only list
const AdminAssessmentsQuerySchema = z.object({
  status: z.enum(['draft', 'active', 'archived']).optional(),
  tenant_id: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

// GET /v1/admin/attempts — cross-tenant read-only list (sanitized: no question_order)
const AdminAttemptsQuerySchema = z.object({
  status: z.enum(['in_progress', 'submitted', 'graded', 'abandoned']).optional(),
  tenant_id: z.string().uuid().optional(),
  assessment_id: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

// GET /v1/admin/audit-events — cross-tenant read-only audit trail
// (sanitized: omits payload/changes/ip_address/user_agent — metadata only)
const AdminAuditEventsQuerySchema = z.object({
  event_type: z.string().min(1).max(128).optional(),
  tenant_id: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
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

  // GET /v1/admin/overview ────────────────────────────────────────────
  // Platform-wide assessment-loop keystone metrics for the engineering
  // dashboard. Read-only (no audit row — no state change). Answers the
  // question "is the product loop warm?" by surfacing the funnel
  // assessments → invitations → attempts → responses → grade_decisions
  // alongside bank calibration coverage and active billing subscriptions
  // in one place. Mounted (with the rest of this router) at /v1.
  router.get('/v1/admin/overview', auth, async (_req: Request, res, next) => {
    try {
      const [totals, attemptsByStatus, invitationsByStatus] = await Promise.all([
        deps.pool.query<{
          assessments: string;
          invitations: string;
          attempts: string;
          responses: string;
          responses_with_attempt: string;
          grade_decisions: string;
          questions_released: string;
          questions_calibrated: string;
          subscriptions_active: string;
        }>(
          `SELECT
             (SELECT COUNT(*) FROM content.assessments)::text AS assessments,
             (SELECT COUNT(*) FROM content.invitations)::text AS invitations,
             (SELECT COUNT(*) FROM content.attempts)::text AS attempts,
             (SELECT COUNT(*) FROM content.responses)::text AS responses,
             (SELECT COUNT(*) FROM content.responses WHERE attempt_id IS NOT NULL)::text AS responses_with_attempt,
             (SELECT COUNT(*) FROM content.grade_decisions)::text AS grade_decisions,
             (SELECT COUNT(*) FROM content.questions WHERE status = 'released')::text AS questions_released,
             (SELECT COUNT(*) FROM content.questions WHERE calibration_n > 0)::text AS questions_calibrated,
             (SELECT COUNT(*) FROM billing.subscriptions WHERE status = 'active')::text AS subscriptions_active`,
        ),
        deps.pool.query<{ status: string; n: string }>(
          `SELECT status, COUNT(*)::text AS n FROM content.attempts GROUP BY status`,
        ),
        deps.pool.query<{ status: string; n: string }>(
          `SELECT status, COUNT(*)::text AS n FROM content.invitations GROUP BY status`,
        ),
      ]);

      const toMap = (rows: { status: string; n: string }[]): Record<string, number> =>
        rows.reduce<Record<string, number>>((acc, r) => {
          acc[r.status] = Number(r.n);
          return acc;
        }, {});

      const t = totals.rows[0];
      if (!t) {
        throw new HttpProblem({
          status: 500,
          title: 'admin/overview-failed',
          detail: 'overview aggregation returned no row',
        });
      }
      res.json({
        generated_at: new Date().toISOString(),
        loop: {
          assessments: Number(t.assessments),
          invitations: Number(t.invitations),
          attempts: Number(t.attempts),
          responses: Number(t.responses),
          responses_with_attempt: Number(t.responses_with_attempt),
          grade_decisions: Number(t.grade_decisions),
        },
        bank: {
          questions_released: Number(t.questions_released),
          questions_calibrated: Number(t.questions_calibrated),
        },
        billing: {
          subscriptions_active: Number(t.subscriptions_active),
        },
        attempts_by_status: toMap(attemptsByStatus.rows),
        invitations_by_status: toMap(invitationsByStatus.rows),
      });
    } catch (err) {
      next(err);
    }
  });

  // GET /v1/admin/tenants ────────────────────────────
  // Multi-tenant control-plane view for the admin console (N8). Lists
  // tenant (customer) records with per-tenant loop rollups: how many
  // assessments and attempts each tenant owns. Read-only — no audit row
  // (no state change), consistent with /v1/admin/overview. Plan/type/
  // status come straight off app.tenants so this works with or without
  // the billing tables populated. Mounted at /v1.
  router.get('/v1/admin/tenants', auth, async (req: Request, res, next) => {
    try {
      const parsed = TenantsQuerySchema.safeParse(req.query);
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
        conditions.push(`t.status = $${params.length + 1}`);
        params.push(q.status);
      }
      if (q.type) {
        conditions.push(`t.type = $${params.length + 1}`);
        params.push(q.type);
      }
      const whereSql = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      params.push(q.limit);
      const result = await deps.pool.query<{
        id: string;
        name: string;
        slug: string;
        type: string;
        plan: string;
        status: string;
        created_at: Date;
        assessments: string;
        attempts: string;
      }>(
        `SELECT t.id,
                t.name,
                t.slug,
                t.type,
                t.plan,
                t.status,
                t.created_at,
                COALESCE(a.n, 0)::text AS assessments,
                COALESCE(at.n, 0)::text AS attempts
           FROM app.tenants t
           LEFT JOIN (
             SELECT tenant_id, COUNT(*) AS n
               FROM content.assessments
              GROUP BY tenant_id
           ) a ON a.tenant_id = t.id
           LEFT JOIN (
             SELECT tenant_id, COUNT(*) AS n
               FROM content.attempts
              GROUP BY tenant_id
           ) at ON at.tenant_id = t.id
           ${whereSql}
          ORDER BY t.created_at ASC
          LIMIT $${params.length}`,
        params,
      );
      res.json({
        tenants: result.rows.map((r) => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          type: r.type,
          plan: r.plan,
          status: r.status,
          created_at: r.created_at,
          assessments: Number(r.assessments),
          attempts: Number(r.attempts),
        })),
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/v1/admin/assessments', auth, async (req: Request, res, next) => {
    try {
      const parsed = AdminAssessmentsQuerySchema.safeParse(req.query);
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
        conditions.push(`a.status = $${params.length + 1}`);
        params.push(q.status);
      }
      if (q.tenant_id) {
        conditions.push(`a.tenant_id = $${params.length + 1}`);
        params.push(q.tenant_id);
      }
      const whereSql = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      params.push(q.limit);
      const result = await deps.pool.query<{
        id: string;
        tenant_id: string;
        tenant_name: string | null;
        title: string;
        status: string;
        total_questions: number;
        created_at: Date;
        invitations: string;
        attempts: string;
      }>(
        `SELECT a.id, a.tenant_id, t.name AS tenant_name, a.title, a.status, a.total_questions, a.created_at, COALESCE(inv.n, 0)::text AS invitations, COALESCE(att.n, 0)::text AS attempts FROM content.assessments a LEFT JOIN app.tenants t ON t.id = a.tenant_id LEFT JOIN (SELECT assessment_id, COUNT(*) AS n FROM content.invitations GROUP BY assessment_id) inv ON inv.assessment_id = a.id LEFT JOIN (SELECT i.assessment_id, COUNT(*) AS n FROM content.attempts at2 JOIN content.invitations i ON i.id = at2.invitation_id GROUP BY i.assessment_id) att ON att.assessment_id = a.id ${whereSql} ORDER BY a.created_at DESC LIMIT $${params.length}`,
        params,
      );
      res.json({
        assessments: result.rows.map((r) => ({
          id: r.id,
          tenant_id: r.tenant_id,
          tenant_name: r.tenant_name,
          title: r.title,
          status: r.status,
          total_questions: Number(r.total_questions),
          created_at: r.created_at,
          invitations: Number(r.invitations),
          attempts: Number(r.attempts),
        })),
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/v1/admin/attempts', auth, async (req: Request, res, next) => {
    try {
      const parsed = AdminAttemptsQuerySchema.safeParse(req.query);
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
        conditions.push(`at.status = $${params.length + 1}`);
        params.push(q.status);
      }
      if (q.tenant_id) {
        conditions.push(`at.tenant_id = $${params.length + 1}`);
        params.push(q.tenant_id);
      }
      if (q.assessment_id) {
        conditions.push(`at.assessment_id = $${params.length + 1}`);
        params.push(q.assessment_id);
      }
      const whereSql = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      params.push(q.limit);
      const result = await deps.pool.query<{
        id: string;
        tenant_id: string;
        tenant_name: string | null;
        assessment_id: string;
        assessment_title: string | null;
        candidate_id: string;
        status: string;
        total_score: string | null;
        max_score: string | null;
        started_at: Date;
        submitted_at: Date | null;
        graded_at: Date | null;
      }>(
        `SELECT at.id, at.tenant_id, t.name AS tenant_name, at.assessment_id, a.title AS assessment_title, at.candidate_id, at.status, at.total_score::text AS total_score, at.max_score::text AS max_score, at.started_at, at.submitted_at, at.graded_at FROM content.attempts at LEFT JOIN app.tenants t ON t.id = at.tenant_id LEFT JOIN content.assessments a ON a.id = at.assessment_id ${whereSql} ORDER BY at.started_at DESC LIMIT $${params.length}`,
        params,
      );
      res.json({
        attempts: result.rows.map((r) => ({
          id: r.id,
          tenant_id: r.tenant_id,
          tenant_name: r.tenant_name,
          assessment_id: r.assessment_id,
          assessment_title: r.assessment_title,
          candidate_id: r.candidate_id,
          status: r.status,
          total_score: r.total_score === null ? null : Number(r.total_score),
          max_score: r.max_score === null ? null : Number(r.max_score),
          started_at: r.started_at,
          submitted_at: r.submitted_at,
          graded_at: r.graded_at,
        })),
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/v1/admin/audit-events', auth, async (req: Request, res, next) => {
    try {
      const parsed = AdminAuditEventsQuerySchema.safeParse(req.query);
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
      if (q.event_type) {
        conditions.push(`e.event_type = $${params.length + 1}`);
        params.push(q.event_type);
      }
      if (q.tenant_id) {
        conditions.push(`e.tenant_id = $${params.length + 1}`);
        params.push(q.tenant_id);
      }
      const whereSql = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      params.push(q.limit);
      const result = await deps.pool.query<{
        id: string;
        event_type: string;
        actor_type: string | null;
        actor_id: string | null;
        entity_type: string | null;
        entity_id: string | null;
        tenant_id: string | null;
        tenant_name: string | null;
        occurred_at: Date;
      }>(
        `SELECT e.id, e.event_type, e.actor_type, e.actor_id, e.entity_type, e.entity_id, e.tenant_id, t.name AS tenant_name, e.occurred_at FROM audit.events e LEFT JOIN app.tenants t ON t.id = e.tenant_id ${whereSql} ORDER BY e.occurred_at DESC LIMIT $${params.length}`,
        params,
      );
      res.json({
        events: result.rows.map((r) => ({
          id: r.id,
          event_type: r.event_type,
          actor_type: r.actor_type,
          actor_id: r.actor_id,
          entity_type: r.entity_type,
          entity_id: r.entity_id,
          tenant_id: r.tenant_id,
          tenant_name: r.tenant_name,
          occurred_at: r.occurred_at,
        })),
      });
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
  return {
    LeakAlertQuerySchema,
    ReviewLeakAlertSchema,
    MintTokenSchema,
    TenantsQuerySchema,
    AdminAssessmentsQuerySchema,
    AdminAttemptsQuerySchema,
    AdminAuditEventsQuerySchema,
  };
}
