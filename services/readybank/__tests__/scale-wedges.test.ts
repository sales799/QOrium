import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { pino } from 'pino';
import type { RequestHandler } from 'express';
import type { Pool } from '@qorium/db';
import type { AuthenticatedRequest } from '@qorium/auth';
import { createServer } from '../src/server.js';
import type { Config } from '../src/config.js';

const TENANT_ID = '22222222-2222-4222-8222-222222222222';
const API_KEY_ID = '11111111-1111-4111-8111-111111111111';
const silentLogger = pino({ level: 'silent' });

function testConfig(overrides: Partial<Config> = {}): Config {
  return {
    serviceName: 'qorium-readybank',
    nodeEnv: 'test',
    port: 0,
    logLevel: 'silent',
    version: '0.0.0-test',
    gitSha: 'testsha',
    sentryDsn: undefined,
    apiKeyPepper: 'test_api_key_pepper_at_least_thirty_two_chars_x',
    redisUrl: undefined,
    jwtSecret: 'test_jwt_secret_at_least_thirty_two_characters_long_xx',
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

function buildStubPool(): Pool {
  const sessions = new Map<string, Record<string, unknown>>();

  const pool = {
    async query(sql: string, params: unknown[] = []) {
      if (sql.includes('INSERT INTO app.scale_wedge_sessions')) {
        const runtime = JSON.parse(String(params[5]));
        const row = {
          id: params[0],
          tenant_id: params[1],
          api_key_id: params[2],
          module: params[3],
          candidate_email: params[4],
          status: 'live_on_demand',
          runtime,
          events: [],
          created_at: new Date('2026-06-04T00:00:00.000Z'),
          updated_at: new Date('2026-06-04T00:00:00.000Z'),
        };
        sessions.set(String(params[0]), row);
        return { rows: [row], rowCount: 1 };
      }

      if (sql.includes('FROM app.scale_wedge_sessions') && sql.includes('WHERE id = $1')) {
        const row = sessions.get(String(params[0]));
        return { rows: row ? [row] : [], rowCount: row ? 1 : 0 };
      }

      if (sql.includes('UPDATE app.scale_wedge_sessions')) {
        const row = sessions.get(String(params[0]));
        if (!row || row.module !== 'live-room') return { rows: [], rowCount: 0 };
        const nextEvents = [...(row.events as unknown[]), ...JSON.parse(String(params[2]))];
        const nextRow = {
          ...row,
          events: nextEvents,
          updated_at: new Date('2026-06-04T00:01:00.000Z'),
        };
        sessions.set(String(params[0]), nextRow);
        return { rows: [nextRow], rowCount: 1 };
      }

      if (sql.includes('INSERT INTO audit.events')) {
        return { rows: [], rowCount: 1 };
      }

      return { rows: [], rowCount: 0 };
    },
  } as unknown as Pool;

  return pool;
}

function buildApp() {
  const authMiddleware: RequestHandler = (req, _res, next) => {
    const authedReq = req as AuthenticatedRequest;
    authedReq.auth = {
      apiKeyId: API_KEY_ID,
      tenantId: TENANT_ID,
      prefix: 'qor_test',
      scopes: ['*'],
      name: 'phase-f-test-key',
    };
    next();
  };

  return createServer({
    config: testConfig(),
    pool: buildStubPool(),
    logger: silentLogger,
    authMiddleware,
  }).app;
}

describe('Phase F scale wedges', () => {
  it('lists full-breadth on-demand modules', async () => {
    const res = await request(buildApp()).get('/v1/scale-wedges');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('live_on_demand');
    expect(res.body.modules.map((m: { module: string }) => m.module)).toEqual([
      'cognitive',
      'job-simulation',
      'scheduling',
      'live-room',
      'reference-check',
      'video-response',
    ]);
    expect(res.body.modules.every((m: { claim_safe: boolean }) => m.claim_safe === false)).toBe(
      true,
    );
  });

  it('creates cognitive and video sessions with live runtime payloads', async () => {
    const app = buildApp();

    const cognitive = await request(app).post('/v1/scale-wedges/cognitive/sessions').send({
      candidate_email: 'candidate@example.com',
      role: 'Support analyst',
    });

    expect(cognitive.status).toBe(201);
    expect(cognitive.body).toMatchObject({
      tenant_id: TENANT_ID,
      module: 'cognitive',
      status: 'live_on_demand',
      runtime: {
        engine: 'adaptive_cognitive',
        sections: ['numerical_reasoning', 'logical_reasoning', 'abstract_reasoning', 'sjt'],
      },
    });

    const video = await request(app).post('/v1/scale-wedges/video-response/sessions').send({
      candidate_email: 'candidate@example.com',
      role: 'Support analyst',
    });

    expect(video.status).toBe(201);
    expect(video.body.runtime).toMatchObject({
      engine: 'video_response',
      provider: 'browser_upload',
      transcription: { status: 'queued', pii_redaction: true },
      storage: { residency: 'customer_configured', signed_upload_required: true },
    });
  });

  it('creates M3/M8/M9/M10 runtime payloads and records live-room events', async () => {
    const app = buildApp();

    const simulation = await request(app).post('/v1/scale-wedges/job-simulation/sessions').send({
      candidate_email: 'candidate@example.com',
      role: 'Customer support analyst',
    });
    expect(simulation.status).toBe(201);
    expect(simulation.body.runtime).toMatchObject({
      engine: 'job_simulation',
      rubric: ['job_relevance', 'prioritisation', 'communication', 'risk_awareness'],
    });

    const schedule = await request(app)
      .post('/v1/scale-wedges/scheduling/sessions')
      .send({
        candidate_email: 'candidate@example.com',
        starts_at: '2026-06-04T09:00:00.000Z',
        duration_minutes: 30,
        panelists: ['recruiter@example.com'],
      });
    expect(schedule.status).toBe(201);
    expect(schedule.body.runtime.ics).toContain('BEGIN:VCALENDAR');

    const reference = await request(app)
      .post('/v1/scale-wedges/reference-check/sessions')
      .send({
        candidate_email: 'candidate@example.com',
        references: ['manager@example.com', 'peer@example.com'],
      });
    expect(reference.status).toBe(201);
    expect(reference.body.runtime).toMatchObject({
      engine: 'reference_check',
      report: { status: 'collecting', minimum_completed: 2 },
    });

    const liveRoom = await request(app).post('/v1/scale-wedges/live-room/sessions').send({
      candidate_email: 'candidate@example.com',
    });
    expect(liveRoom.status).toBe(201);
    expect(liveRoom.body.runtime.ws_path).toContain('/v1/live-rooms/');

    const event = await request(app)
      .post(`/v1/live-rooms/${liveRoom.body.id}/events`)
      .send({
        type: 'candidate_joined',
        actor: 'candidate',
        payload: { device_check: 'pass' },
      });

    expect(event.status).toBe(201);
    expect(event.body.event_count).toBe(1);
    expect(event.body.event).toMatchObject({
      type: 'candidate_joined',
      actor: 'candidate',
      payload: { device_check: 'pass' },
    });
  });

  it('rejects unknown modules with RFC 7807 problem details', async () => {
    const res = await request(buildApp()).post('/v1/scale-wedges/unknown/sessions').send({
      candidate_email: 'candidate@example.com',
    });

    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.title).toBe('Not Found');
  });
});
