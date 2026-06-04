import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import type { Pool } from '@qorium/db';
import { recordAuditEvent, type AuthenticatedRequest } from '@qorium/auth';
import { HttpProblem } from '../middleware/problem.js';

type ScaleWedgeModule =
  | 'cognitive'
  | 'job-simulation'
  | 'video-response'
  | 'scheduling'
  | 'live-room'
  | 'reference-check';

interface ModuleDefinition {
  module: ScaleWedgeModule;
  title: string;
  m_code: 'M3' | 'M8' | 'M9' | 'M10' | null;
  status: 'live_on_demand';
  claim_safe: false;
  guardrail: string;
  runtime_path: string;
}

interface ScaleWedgeSessionRow {
  id: string;
  tenant_id: string;
  api_key_id: string | null;
  module: ScaleWedgeModule;
  candidate_email: string;
  status: string;
  runtime: unknown;
  events: unknown[];
  created_at: Date;
  updated_at: Date;
}

interface RuntimeInput {
  id: string;
  module: ScaleWedgeModule;
  candidateEmail: string;
  body: z.infer<typeof CreateSessionBodySchema>;
}

const MODULES: ModuleDefinition[] = [
  {
    module: 'cognitive',
    title: 'Cognitive Runtime',
    m_code: null,
    status: 'live_on_demand',
    claim_safe: false,
    guardrail: 'General aptitude signal only; not a standalone hiring decision.',
    runtime_path: '/v1/scale-wedges/cognitive/sessions',
  },
  {
    module: 'job-simulation',
    title: 'Job Simulation Runtime',
    m_code: 'M3',
    status: 'live_on_demand',
    claim_safe: false,
    guardrail: 'Rubrics are evidence prompts; final judgement stays recruiter-owned.',
    runtime_path: '/v1/scale-wedges/job-simulation/sessions',
  },
  {
    module: 'scheduling',
    title: 'Scheduling Runtime',
    m_code: 'M8',
    status: 'live_on_demand',
    claim_safe: false,
    guardrail: 'Scheduling output is a candidate-facing convenience, not availability proof.',
    runtime_path: '/v1/scale-wedges/scheduling/sessions',
  },
  {
    module: 'live-room',
    title: 'Live Room Runtime',
    m_code: 'M9',
    status: 'live_on_demand',
    claim_safe: false,
    guardrail: 'Room events are audit artifacts; interviewer decisions are external.',
    runtime_path: '/v1/scale-wedges/live-room/sessions',
  },
  {
    module: 'reference-check',
    title: 'Reference Runtime',
    m_code: 'M10',
    status: 'live_on_demand',
    claim_safe: false,
    guardrail: 'Reference checks collect attestations; employment verification is customer-owned.',
    runtime_path: '/v1/scale-wedges/reference-check/sessions',
  },
  {
    module: 'video-response',
    title: 'Video Response Runtime',
    m_code: null,
    status: 'live_on_demand',
    claim_safe: false,
    guardrail: 'Video prompts capture structured responses; do not infer protected traits.',
    runtime_path: '/v1/scale-wedges/video-response/sessions',
  },
];

const MODULE_SET = new Set<ScaleWedgeModule>(MODULES.map((m) => m.module));

const CreateSessionBodySchema = z.object({
  candidate_email: z.string().email(),
  role: z.string().min(1).max(160).optional(),
  locale: z
    .string()
    .regex(/^[a-z]{2}(-[A-Z]{2})?$/)
    .default('en-IN'),
  timezone: z.string().min(1).max(80).default('Asia/Kolkata'),
  starts_at: z.string().datetime().optional(),
  duration_minutes: z.number().int().min(10).max(240).default(45),
  panelists: z.array(z.string().email()).max(12).default([]),
  references: z.array(z.string().email()).max(12).default([]),
  metadata: z.record(z.unknown()).default({}),
});

const EventBodySchema = z.object({
  type: z.string().min(1).max(80),
  actor: z.enum(['candidate', 'recruiter', 'system']).default('system'),
  payload: z.record(z.unknown()).default({}),
});

export interface ScaleWedgesRouterDeps {
  pool: Pool;
  audit?: boolean;
}

export function scaleWedgesRouter(deps: ScaleWedgesRouterDeps): Router {
  const router = Router();
  const auditEnabled = deps.audit ?? true;

  router.get('/scale-wedges', (_req, res) => {
    res.status(200).json({
      status: 'live_on_demand',
      modules: MODULES,
    });
  });

  router.post('/scale-wedges/:module/sessions', async (req, res, next) => {
    const auth = (req as AuthenticatedRequest).auth;
    if (!auth) {
      next(new HttpProblem({ status: 401, title: 'Unauthorized', detail: 'API key required' }));
      return;
    }

    const module = parseModule(req.params.module);
    if (!module) {
      next(
        new HttpProblem({
          status: 404,
          title: 'Not Found',
          detail: `Scale wedge module ${req.params.module ?? ''} is not available`,
        }),
      );
      return;
    }

    let body: z.infer<typeof CreateSessionBodySchema>;
    try {
      body = CreateSessionBodySchema.parse(req.body);
    } catch (err) {
      next(
        new HttpProblem({
          status: 400,
          title: 'Bad Request',
          detail: err instanceof z.ZodError ? 'Invalid scale-wedge session body' : 'Bad request',
          ...(err instanceof z.ZodError ? { extensions: { violations: err.flatten() } } : {}),
        }),
      );
      return;
    }

    const id = randomUUID();
    const runtime = buildRuntime({ id, module, candidateEmail: body.candidate_email, body });

    try {
      const inserted = await deps.pool.query<ScaleWedgeSessionRow>(
        `INSERT INTO app.scale_wedge_sessions
           (id, tenant_id, api_key_id, module, candidate_email, status, runtime, events)
         VALUES ($1, $2, $3, $4, $5, 'live_on_demand', $6::jsonb, '[]'::jsonb)
         RETURNING id, tenant_id, api_key_id, module, candidate_email, status, runtime,
                   events, created_at, updated_at`,
        [id, auth.tenantId, auth.apiKeyId, module, body.candidate_email, JSON.stringify(runtime)],
      );
      const row = inserted.rows[0];
      if (!row) {
        throw new Error('scale_wedge_session_insert_returned_no_row');
      }

      if (auditEnabled) {
        void recordAuditEvent({
          pool: deps.pool,
          event: {
            actor_type: 'api_key',
            actor_id: auth.apiKeyId,
            tenant_id: auth.tenantId,
            event_type: 'scale_wedge.session.created',
            entity_type: 'scale_wedge_session',
            entity_id: row.id,
            payload: {
              module,
              candidate_email_hash_hint: maskEmail(body.candidate_email),
              status: row.status,
            },
          },
        });
      }

      res.status(201).json(toSessionEnvelope(row));
    } catch (err) {
      next(err);
    }
  });

  router.get('/scale-wedges/sessions/:id', async (req, res, next) => {
    const auth = (req as AuthenticatedRequest).auth;
    if (!auth) {
      next(new HttpProblem({ status: 401, title: 'Unauthorized', detail: 'API key required' }));
      return;
    }

    const id = req.params.id;
    if (!isUuid(id)) {
      next(
        new HttpProblem({ status: 400, title: 'Bad Request', detail: 'Session id must be a UUID' }),
      );
      return;
    }

    try {
      const result = await deps.pool.query<ScaleWedgeSessionRow>(
        `SELECT id, tenant_id, api_key_id, module, candidate_email, status, runtime,
                events, created_at, updated_at
           FROM app.scale_wedge_sessions
          WHERE id = $1 AND tenant_id = $2`,
        [id, auth.tenantId],
      );
      const row = result.rows[0];
      if (!row) {
        next(new HttpProblem({ status: 404, title: 'Not Found', detail: 'Session not found' }));
        return;
      }
      res.status(200).json(toSessionEnvelope(row));
    } catch (err) {
      next(err);
    }
  });

  router.post('/live-rooms/:sessionId/events', async (req, res, next) => {
    const auth = (req as AuthenticatedRequest).auth;
    if (!auth) {
      next(new HttpProblem({ status: 401, title: 'Unauthorized', detail: 'API key required' }));
      return;
    }

    const sessionId = req.params.sessionId;
    if (!isUuid(sessionId)) {
      next(
        new HttpProblem({ status: 400, title: 'Bad Request', detail: 'Session id must be a UUID' }),
      );
      return;
    }

    let body: z.infer<typeof EventBodySchema>;
    try {
      body = EventBodySchema.parse(req.body);
    } catch (err) {
      next(
        new HttpProblem({
          status: 400,
          title: 'Bad Request',
          detail: err instanceof z.ZodError ? 'Invalid live-room event body' : 'Bad request',
          ...(err instanceof z.ZodError ? { extensions: { violations: err.flatten() } } : {}),
        }),
      );
      return;
    }

    const event = {
      id: randomUUID(),
      type: body.type,
      actor: body.actor,
      payload: body.payload,
      occurred_at: new Date().toISOString(),
    };

    try {
      const result = await deps.pool.query<ScaleWedgeSessionRow>(
        `UPDATE app.scale_wedge_sessions
            SET events = events || $3::jsonb,
                updated_at = NOW()
          WHERE id = $1
            AND tenant_id = $2
            AND module = 'live-room'
          RETURNING id, tenant_id, api_key_id, module, candidate_email, status, runtime,
                    events, created_at, updated_at`,
        [sessionId, auth.tenantId, JSON.stringify([event])],
      );
      const row = result.rows[0];
      if (!row) {
        next(
          new HttpProblem({
            status: 404,
            title: 'Not Found',
            detail: 'Live-room session not found',
          }),
        );
        return;
      }

      if (auditEnabled) {
        void recordAuditEvent({
          pool: deps.pool,
          event: {
            actor_type: 'api_key',
            actor_id: auth.apiKeyId,
            tenant_id: auth.tenantId,
            event_type: 'scale_wedge.live_room.event_recorded',
            entity_type: 'scale_wedge_session',
            entity_id: row.id,
            payload: { event_type: event.type, actor: event.actor },
          },
        });
      }

      res.status(201).json({
        session: toSessionEnvelope(row),
        event,
        event_count: Array.isArray(row.events) ? row.events.length : 0,
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

function parseModule(value: string | undefined): ScaleWedgeModule | null {
  if (!value) return null;
  return MODULE_SET.has(value as ScaleWedgeModule) ? (value as ScaleWedgeModule) : null;
}

function buildRuntime(input: RuntimeInput): Record<string, unknown> {
  const base = {
    session_id: input.id,
    module: input.module,
    candidate_email: input.candidateEmail,
    status: 'live_on_demand',
    locale: input.body.locale,
    timezone: input.body.timezone,
  };

  switch (input.module) {
    case 'cognitive':
      return {
        ...base,
        engine: 'adaptive_cognitive',
        sections: ['numerical_reasoning', 'logical_reasoning', 'abstract_reasoning', 'sjt'],
        scoring: { mode: 'irt_seeded', report: 'banded_signal' },
      };
    case 'job-simulation':
      return {
        ...base,
        engine: 'job_simulation',
        scenario: input.body.role ?? 'Role-specific work sample',
        steps: [
          { id: 'triage', prompt: 'Review the customer context and identify the top issue.' },
          { id: 'action', prompt: 'Choose the next action and explain trade-offs.' },
          { id: 'handoff', prompt: 'Write the handoff note for the hiring team.' },
        ],
        rubric: ['job_relevance', 'prioritisation', 'communication', 'risk_awareness'],
      };
    case 'video-response':
      return {
        ...base,
        engine: 'video_response',
        provider: 'browser_upload',
        max_duration_seconds: 180,
        transcription: { status: 'queued', pii_redaction: true },
        prompts: [
          'Tell us about a recent situation where you learned a new system quickly.',
          'Walk through how you would handle a conflicting stakeholder request.',
        ],
        storage: { residency: 'customer_configured', signed_upload_required: true },
      };
    case 'scheduling':
      return {
        ...base,
        engine: 'scheduler',
        starts_at: input.body.starts_at ?? null,
        duration_minutes: input.body.duration_minutes,
        panelists: input.body.panelists,
        ics: buildIcs(input),
      };
    case 'live-room':
      return {
        ...base,
        engine: 'live_room',
        ws_path: `/v1/live-rooms/${input.id}/events`,
        controls: ['join', 'presence', 'event_log', 'candidate_notes'],
        recording: { enabled: false, reason: 'explicit_customer_policy_required' },
      };
    case 'reference-check':
      return {
        ...base,
        engine: 'reference_check',
        references: input.body.references.map((email) => ({
          email,
          status: 'pending_invite',
        })),
        report: {
          status: 'collecting',
          minimum_completed: Math.min(2, input.body.references.length),
        },
      };
  }
}

function buildIcs(input: RuntimeInput): string {
  const start = input.body.starts_at ? new Date(input.body.starts_at) : new Date();
  const end = new Date(start.getTime() + input.body.duration_minutes * 60_000);
  const stamp = formatIcsDate(new Date());
  const summary = `QOrium interview - ${input.body.role ?? 'candidate screen'}`;
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//QOrium//Scale Wedges//EN',
    'BEGIN:VEVENT',
    `UID:${input.id}@qorium.online`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:${escapeIcs(summary)}`,
    `DESCRIPTION:${escapeIcs(`Candidate: ${input.candidateEmail}`)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

function formatIcsDate(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
}

function escapeIcs(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n');
}

function isUuid(value: string | undefined): value is string {
  return (
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
  );
}

function toSessionEnvelope(row: ScaleWedgeSessionRow): Record<string, unknown> {
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    module: row.module,
    candidate_email: row.candidate_email,
    status: row.status,
    runtime: row.runtime,
    events: row.events,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  return `${local?.slice(0, 2) ?? ''}***@${domain ?? 'unknown'}`;
}
