import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { pino } from 'pino';
import jwt from 'jsonwebtoken';
import type { Pool } from '@qorium/db';
import { createServer } from '../src/server.js';
import type { Config } from '../src/config.js';
import { renderAuditEventsExport } from '../src/repositories/audit-exports.js';
import type { AuditEventEnvelope } from '../src/types/audit-event.js';
import type { AuditEventRow } from '../src/types/audit-event.js';
import { runAuditExportJob } from '../src/jobs/audit-export-worker.js';

/**
 * Sprint 4.4.2 — Audit Log export endpoint tests.
 *
 * Stub Pool, signed recruiter JWT cookie, supertest. Worker is invoked
 * synchronously via `runAuditExportJob` so tests can assert on the
 * persisted job content without racing setImmediate.
 */

const silent = pino({ level: 'silent' });
const PEPPER = 'test_export_pepper_at_least_thirty_two_chars_long_xxxxx';
const JWT_SECRET = 'test_jwt_secret_at_least_thirty_two_characters_long_xx';

const TENANT_A = 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa';
const TENANT_B = 'bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb';
const RECRUITER_ID = '11111111-1111-1111-1111-111111111111';
const TENANT_B_RECRUITER_ID = '33333333-3333-3333-3333-333333333333';

function testConfig(overrides: Partial<Config> = {}): Config {
  return {
    serviceName: 'qorium-readybank',
    nodeEnv: 'test',
    port: 0,
    logLevel: 'silent',
    version: '0.0.0-test',
    gitSha: 'testsha',
    sentryDsn: undefined,
    apiKeyPepper: PEPPER,
    redisUrl: undefined,
    jwtSecret: JWT_SECRET,
    cookieSecure: false,
    recruiterLockoutMinutes: 15,
    mailerDriver: 'mock',
    mailerFromAddress: 'no-reply@qorium.test',
    mailerReplyToAddress: undefined,
    recruiterPortalUrl: 'http://localhost:5101',
    sesRegion: undefined,
    sesAccessKeyId: undefined,
    sesSecretAccessKey: undefined,
    sendgridApiKey: undefined,
    ...overrides,
  };
}

interface JobRow {
  id: string;
  tenant_id: string | null;
  actor_id: string | null;
  format: 'csv' | 'json';
  filters_json: Record<string, unknown>;
  start_date: Date | null;
  end_date: Date | null;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'expired';
  error_message: string | null;
  row_count: number | null;
  content_type: string | null;
  content: Buffer | null;
  created_at: Date;
  completed_at: Date | null;
  expires_at: Date;
}

interface StubPool {
  pool: Pool;
  jobs: Map<string, JobRow>;
  events: AuditEventRow[];
}

function buildEvent(over: Partial<AuditEventRow> & Pick<AuditEventRow, 'id'>): AuditEventRow {
  return {
    actor_id: RECRUITER_ID,
    actor_type: 'user',
    tenant_id: TENANT_A,
    event_type: 'leak.dismissed',
    entity_type: 'leak_alerts',
    entity_id: 'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    changes: null,
    payload: { question_id: 'q-1' },
    ip_address: '203.0.113.10',
    user_agent: 'vitest/1.0',
    hash_current: null,
    hash_previous: null,
    occurred_at: new Date('2026-05-08T10:00:00Z'),
    ...over,
  };
}

function matchesScope(
  row: { tenant_id: string | null; actor_id: string | null },
  tenantId: string,
  actorId: string,
): boolean {
  if (row.tenant_id === tenantId) return true;
  if (row.tenant_id === null && row.actor_id === actorId) return true;
  return false;
}

function buildStub(): StubPool {
  const jobs = new Map<string, JobRow>();
  const events: AuditEventRow[] = [
    buildEvent({
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
      occurred_at: new Date('2026-05-08T10:00:00Z'),
      event_type: 'leak.dismissed',
    }),
    buildEvent({
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
      occurred_at: new Date('2026-05-08T08:30:00Z'),
      event_type: 'reference_panel.token.minted',
    }),
    // cross-tenant — must NOT appear in tenant A's exports
    buildEvent({
      id: 'ffffffff-ffff-ffff-ffff-fffffffffff1',
      tenant_id: TENANT_B,
      actor_id: TENANT_B_RECRUITER_ID,
      event_type: 'leak.dismissed',
    }),
  ];

  let counter = 0;
  function newJobId(): string {
    counter += 1;
    const seg = counter.toString(16).padStart(8, '0');
    return `${seg}-1111-1111-1111-111111111111`;
  }

  const pool = {
    async query(sql: string, params: unknown[] = []) {
      const text = sql.replace(/\s+/g, ' ').trim();

      // INSERT INTO app.audit_export_jobs ... RETURNING ...
      if (text.startsWith('INSERT INTO app.audit_export_jobs')) {
        const tenant_id = (params[0] as string | null) ?? null;
        const actor_id = (params[1] as string | null) ?? null;
        const format = params[2] as 'csv' | 'json';
        const filters_json = JSON.parse(params[3] as string);
        const start_date = (params[4] as Date | null) ?? null;
        const end_date = (params[5] as Date | null) ?? null;
        const id = newJobId();
        const now = new Date();
        const row: JobRow = {
          id,
          tenant_id,
          actor_id,
          format,
          filters_json,
          start_date,
          end_date,
          status: 'queued',
          error_message: null,
          row_count: null,
          content_type: null,
          content: null,
          created_at: now,
          completed_at: null,
          expires_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        };
        jobs.set(id, row);
        return { rows: [{ ...row }], rowCount: 1 };
      }

      // SELECT ... FROM app.audit_export_jobs WHERE id = $3 AND scope ...
      if (
        text.startsWith('SELECT') &&
        text.includes('FROM app.audit_export_jobs') &&
        text.includes('WHERE id = $3')
      ) {
        const tenantId = params[0] as string;
        const actorId = params[1] as string;
        const id = params[2] as string;
        const job = jobs.get(id);
        if (!job || !matchesScope(job, tenantId, actorId)) {
          return { rows: [], rowCount: 0 };
        }
        // download path additionally checks status='completed' AND not expired
        if (text.includes("status = 'completed'")) {
          if (job.status !== 'completed' || job.expires_at.getTime() <= Date.now()) {
            return { rows: [], rowCount: 0 };
          }
          return {
            rows: [{ content: job.content, content_type: job.content_type }],
            rowCount: 1,
          };
        }
        return { rows: [{ ...job }], rowCount: 1 };
      }

      // SELECT COUNT(*) ... WHERE status IN ('queued','processing')
      if (
        text.startsWith('SELECT COUNT(*)::text AS n FROM app.audit_export_jobs') &&
        text.includes("status IN ('queued', 'processing')")
      ) {
        const tenantId = params[0] as string;
        const actorId = params[1] as string;
        let n = 0;
        for (const j of jobs.values()) {
          if (j.status !== 'queued' && j.status !== 'processing') continue;
          if (matchesScope(j, tenantId, actorId)) n += 1;
        }
        return { rows: [{ n: String(n) }], rowCount: 1 };
      }

      // UPDATE app.audit_export_jobs SET status='completed' ...
      if (text.startsWith("UPDATE app.audit_export_jobs SET status = 'completed'")) {
        const id = params[0] as string;
        const rowCount = params[1] as number;
        const contentType = params[2] as string;
        const content = params[3] as Buffer;
        const job = jobs.get(id);
        if (job) {
          job.status = 'completed';
          job.row_count = rowCount;
          job.content_type = contentType;
          job.content = content;
          job.completed_at = new Date();
        }
        return { rows: [], rowCount: job ? 1 : 0 };
      }

      // UPDATE ... SET status='failed' ...
      if (text.startsWith("UPDATE app.audit_export_jobs SET status = 'failed'")) {
        const id = params[0] as string;
        const errorMessage = params[1] as string;
        const job = jobs.get(id);
        if (job) {
          job.status = 'failed';
          job.error_message = errorMessage;
          job.completed_at = new Date();
        }
        return { rows: [], rowCount: job ? 1 : 0 };
      }

      // listAuditEvents query (for the worker). Mirror the audit.test.ts stub.
      if (
        text.startsWith('SELECT') &&
        text.includes('FROM audit.events') &&
        text.includes('ORDER BY occurred_at DESC')
      ) {
        const tenantId = params[0] as string;
        const actorId = params[1] as string;
        let pIdx = 2;
        let eventTypeFilter: string | undefined;
        let entityTypeFilter: string | undefined;
        let startDate: Date | undefined;
        let endDate: Date | undefined;
        if (text.includes('event_type = $')) {
          eventTypeFilter = params[pIdx] as string;
          pIdx += 1;
        }
        if (text.includes('entity_type = $')) {
          entityTypeFilter = params[pIdx] as string;
          pIdx += 1;
        }
        if (text.includes('occurred_at >= $')) {
          startDate = params[pIdx] as Date;
          pIdx += 1;
        }
        if (text.includes('occurred_at <= $')) {
          endDate = params[pIdx] as Date;
          pIdx += 1;
        }
        const limitPlus = params[pIdx] as number;
        let filtered = events.filter((e) => matchesScope(e, tenantId, actorId));
        if (eventTypeFilter) filtered = filtered.filter((e) => e.event_type === eventTypeFilter);
        if (entityTypeFilter) filtered = filtered.filter((e) => e.entity_type === entityTypeFilter);
        if (startDate) filtered = filtered.filter((e) => e.occurred_at >= startDate!);
        if (endDate) filtered = filtered.filter((e) => e.occurred_at <= endDate!);
        filtered.sort((a, b) => {
          const cmp = b.occurred_at.getTime() - a.occurred_at.getTime();
          return cmp !== 0 ? cmp : b.id.localeCompare(a.id);
        });
        return { rows: filtered.slice(0, limitPlus), rowCount: filtered.length };
      }

      return { rows: [], rowCount: 0 };
    },
  } as unknown as Pool;

  return { pool, jobs, events };
}

function recruiterCookie(opts: { sub?: string; tenantId?: string } = {}): string {
  const token = jwt.sign(
    {
      sub: opts.sub ?? RECRUITER_ID,
      tenant_id: opts.tenantId ?? TENANT_A,
      email: 'recruiter@qorium.test',
      name: 'Test Recruiter',
    },
    JWT_SECRET,
    {
      algorithm: 'HS256',
      issuer: 'qorium-readybank',
      audience: 'qorium-recruiter',
      expiresIn: '8h',
    },
  );
  return `qor_session=${token}`;
}

describe('POST /v1/audit/events/export', () => {
  it('rejects without a session cookie (401)', async () => {
    const stub = buildStub();
    const { app } = createServer({ config: testConfig(), pool: stub.pool, logger: silent });
    const res = await request(app).post('/v1/audit/events/export').send({ format: 'csv' });
    expect(res.status).toBe(401);
  });

  it('creates a job and returns 202 + job_id (csv)', async () => {
    const stub = buildStub();
    const { app } = createServer({ config: testConfig(), pool: stub.pool, logger: silent });
    const res = await request(app)
      .post('/v1/audit/events/export')
      .set('Cookie', recruiterCookie())
      .send({ format: 'csv' });
    expect(res.status).toBe(202);
    expect(typeof res.body.job_id).toBe('string');
    expect(res.body.format).toBe('csv');
    expect(['queued', 'processing', 'completed']).toContain(res.body.status);
    expect(stub.jobs.size).toBe(1);
  });

  it('rejects an invalid format (400)', async () => {
    const stub = buildStub();
    const { app } = createServer({ config: testConfig(), pool: stub.pool, logger: silent });
    const res = await request(app)
      .post('/v1/audit/events/export')
      .set('Cookie', recruiterCookie())
      .send({ format: 'parquet' });
    expect(res.status).toBe(400);
    expect(res.body.title).toBe('audit/invalid-body');
  });

  it('rejects start_date > end_date (400)', async () => {
    const stub = buildStub();
    const { app } = createServer({ config: testConfig(), pool: stub.pool, logger: silent });
    const res = await request(app)
      .post('/v1/audit/events/export')
      .set('Cookie', recruiterCookie())
      .send({ format: 'csv', start_date: '2026-05-08', end_date: '2026-05-01' });
    expect(res.status).toBe(400);
  });

  it('rejects a date range > 366 days (400)', async () => {
    const stub = buildStub();
    const { app } = createServer({ config: testConfig(), pool: stub.pool, logger: silent });
    const res = await request(app)
      .post('/v1/audit/events/export')
      .set('Cookie', recruiterCookie())
      .send({ format: 'csv', start_date: '2024-01-01', end_date: '2026-01-01' });
    expect(res.status).toBe(400);
    expect(res.body.title).toBe('audit/range-too-large');
  });

  it('rejects when ≥5 active jobs already exist (429)', async () => {
    const stub = buildStub();
    // Pre-seed 5 active jobs for tenant A.
    for (let i = 0; i < 5; i++) {
      stub.jobs.set(`ffffff${i}f-1111-1111-1111-111111111111`, {
        id: `ffffff${i}f-1111-1111-1111-111111111111`,
        tenant_id: TENANT_A,
        actor_id: RECRUITER_ID,
        format: 'csv',
        filters_json: {},
        start_date: null,
        end_date: null,
        status: 'queued',
        error_message: null,
        row_count: null,
        content_type: null,
        content: null,
        created_at: new Date(),
        completed_at: null,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    }
    const { app } = createServer({ config: testConfig(), pool: stub.pool, logger: silent });
    const res = await request(app)
      .post('/v1/audit/events/export')
      .set('Cookie', recruiterCookie())
      .send({ format: 'csv' });
    expect(res.status).toBe(429);
    expect(res.body.title).toBe('audit/too-many-active-exports');
  });
});

describe('GET /v1/audit/exports/:id', () => {
  it('rejects without a session cookie (401)', async () => {
    const stub = buildStub();
    const { app } = createServer({ config: testConfig(), pool: stub.pool, logger: silent });
    const res = await request(app).get('/v1/audit/exports/00000001-1111-1111-1111-111111111111');
    expect(res.status).toBe(401);
  });

  it('returns 404 for a non-existent job', async () => {
    const stub = buildStub();
    const { app } = createServer({ config: testConfig(), pool: stub.pool, logger: silent });
    const res = await request(app)
      .get('/v1/audit/exports/00000099-1111-1111-1111-111111111111')
      .set('Cookie', recruiterCookie());
    expect(res.status).toBe(404);
  });

  it('returns the job status envelope after creation', async () => {
    const stub = buildStub();
    const { app } = createServer({ config: testConfig(), pool: stub.pool, logger: silent });
    const created = await request(app)
      .post('/v1/audit/events/export')
      .set('Cookie', recruiterCookie())
      .send({ format: 'json' });
    const jobId = created.body.job_id as string;
    // Run the worker synchronously to mark complete
    await runAuditExportJob({
      pool: stub.pool,
      jobId,
      tenantId: TENANT_A,
      actorId: RECRUITER_ID,
      format: 'json',
      startDate: null,
      endDate: null,
    });
    const res = await request(app)
      .get(`/v1/audit/exports/${jobId}`)
      .set('Cookie', recruiterCookie());
    expect(res.status).toBe(200);
    expect(res.body.job_id).toBe(jobId);
    expect(res.body.status).toBe('completed');
    expect(res.body.row_count).toBeGreaterThanOrEqual(0);
    expect(res.body.download_url).toBe(`/v1/audit/exports/${jobId}/download`);
  });

  it('isolates jobs across tenants (tenant B cannot read tenant A job)', async () => {
    const stub = buildStub();
    const { app } = createServer({ config: testConfig(), pool: stub.pool, logger: silent });
    const created = await request(app)
      .post('/v1/audit/events/export')
      .set('Cookie', recruiterCookie())
      .send({ format: 'csv' });
    const jobId = created.body.job_id as string;
    const res = await request(app)
      .get(`/v1/audit/exports/${jobId}`)
      .set('Cookie', recruiterCookie({ sub: TENANT_B_RECRUITER_ID, tenantId: TENANT_B }));
    expect(res.status).toBe(404);
  });
});

describe('GET /v1/audit/exports/:id/download', () => {
  it('streams the rendered bytes after completion (csv)', async () => {
    const stub = buildStub();
    const { app } = createServer({ config: testConfig(), pool: stub.pool, logger: silent });
    const created = await request(app)
      .post('/v1/audit/events/export')
      .set('Cookie', recruiterCookie())
      .send({ format: 'csv' });
    const jobId = created.body.job_id as string;
    await runAuditExportJob({
      pool: stub.pool,
      jobId,
      tenantId: TENANT_A,
      actorId: RECRUITER_ID,
      format: 'csv',
      startDate: null,
      endDate: null,
    });
    const res = await request(app)
      .get(`/v1/audit/exports/${jobId}/download`)
      .set('Cookie', recruiterCookie());
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.headers['content-disposition']).toContain(`qorium-audit-${jobId}.csv`);
    // CSV header row + 2 data rows for tenant A (cross-tenant excluded)
    const text = res.text;
    expect(text.split('\r\n').filter((l) => l.length > 0)).toHaveLength(3);
    expect(text).not.toContain('TENANT_B');
  });

  it('returns 409 when status is not yet completed', async () => {
    const stub = buildStub();
    // Insert a queued job directly to bypass the setImmediate worker race.
    const jobId = '00000099-1111-1111-1111-111111111111';
    const now = new Date();
    stub.jobs.set(jobId, {
      id: jobId,
      tenant_id: TENANT_A,
      actor_id: RECRUITER_ID,
      format: 'csv',
      filters_json: {},
      start_date: null,
      end_date: null,
      status: 'queued',
      error_message: null,
      row_count: null,
      content_type: null,
      content: null,
      created_at: now,
      completed_at: null,
      expires_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    });
    const { app } = createServer({ config: testConfig(), pool: stub.pool, logger: silent });
    const res = await request(app)
      .get(`/v1/audit/exports/${jobId}/download`)
      .set('Cookie', recruiterCookie());
    expect(res.status).toBe(409);
    expect(res.body.title).toBe('audit/export-not-ready');
  });

  it('returns 410 when expires_at is in the past', async () => {
    const stub = buildStub();
    const { app } = createServer({ config: testConfig(), pool: stub.pool, logger: silent });
    const created = await request(app)
      .post('/v1/audit/events/export')
      .set('Cookie', recruiterCookie())
      .send({ format: 'csv' });
    const jobId = created.body.job_id as string;
    await runAuditExportJob({
      pool: stub.pool,
      jobId,
      tenantId: TENANT_A,
      actorId: RECRUITER_ID,
      format: 'csv',
      startDate: null,
      endDate: null,
    });
    // Manually expire the job (mirror what the periodic sweep would do).
    const job = stub.jobs.get(jobId);
    if (job) job.expires_at = new Date(Date.now() - 1000);
    const res = await request(app)
      .get(`/v1/audit/exports/${jobId}/download`)
      .set('Cookie', recruiterCookie());
    expect(res.status).toBe(410);
  });

  it('isolates download across tenants (tenant B cannot fetch tenant A bytes)', async () => {
    const stub = buildStub();
    const { app } = createServer({ config: testConfig(), pool: stub.pool, logger: silent });
    const created = await request(app)
      .post('/v1/audit/events/export')
      .set('Cookie', recruiterCookie())
      .send({ format: 'csv' });
    const jobId = created.body.job_id as string;
    await runAuditExportJob({
      pool: stub.pool,
      jobId,
      tenantId: TENANT_A,
      actorId: RECRUITER_ID,
      format: 'csv',
      startDate: null,
      endDate: null,
    });
    const res = await request(app)
      .get(`/v1/audit/exports/${jobId}/download`)
      .set('Cookie', recruiterCookie({ sub: TENANT_B_RECRUITER_ID, tenantId: TENANT_B }));
    expect(res.status).toBe(404);
  });
});

describe('renderAuditEventsExport (formatter)', () => {
  const sampleEnv: AuditEventEnvelope = {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    timestamp: '2026-05-08T10:00:00.000Z',
    action: 'leak.dismissed',
    actor_id: RECRUITER_ID,
    actor_type: 'user',
    tenant_id: TENANT_A,
    resource_type: 'leak_alerts',
    resource_id: 'r-1',
    old_values: { status: 'detected' },
    new_values: { status: 'dismissed' },
    details: { question_id: 'q,with,comma' },
    ip_address: '203.0.113.10',
    user_agent: 'vitest/1.0',
  };

  it('renders JSON with shape { events: [...] }', () => {
    const { content, contentType } = renderAuditEventsExport([sampleEnv], 'json');
    expect(contentType).toContain('application/json');
    const parsed = JSON.parse(content.toString('utf8')) as { events: AuditEventEnvelope[] };
    expect(parsed.events).toHaveLength(1);
    expect(parsed.events[0]?.id).toBe(sampleEnv.id);
  });

  it('renders CSV with RFC 4180 escaping for embedded commas', () => {
    const { content, contentType } = renderAuditEventsExport([sampleEnv], 'csv');
    expect(contentType).toContain('text/csv');
    const text = content.toString('utf8');
    // Header + 1 data row + trailing CRLF
    const lines = text.split('\r\n');
    expect(lines[0]).toContain('action');
    expect(lines[0]).toContain('details');
    // The details cell carries `{"question_id":"q,with,comma"}` and must be quoted.
    expect(text).toContain('"{""question_id"":""q,with,comma""}"');
  });

  it('renders an empty CSV (header-only) for no events', () => {
    const { content } = renderAuditEventsExport([], 'csv');
    const text = content.toString('utf8');
    expect(text.split('\r\n').filter((l) => l.length > 0)).toHaveLength(1);
  });
});
