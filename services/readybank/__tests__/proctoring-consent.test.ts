import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import { toCandidateConsentView, resolveProctoringPolicy } from '../src/lib/proctoring-policy.js';
import { candidateAttemptRouter } from '../src/routes/attempts.js';

// Pure projection: the candidate-facing view must carry ONLY the three consent
// fields and must NEVER leak the tenant plan id or the internal reason.
describe('toCandidateConsentView', () => {
  it('strips plan and reason, keeps only the consent fields (inert policy)', () => {
    const view = toCandidateConsentView(
      resolveProctoringPolicy({ globalEnabled: false, plan: 'enterprise' }),
    );
    expect(view).toEqual({
      proctoring_enabled: false,
      features: [],
      consent_required: false,
    });
    expect(Object.keys(view).sort()).toEqual([
      'consent_required',
      'features',
      'proctoring_enabled',
    ]);
    expect('plan' in view).toBe(false);
    expect('reason' in view).toBe(false);
  });

  it('passes through active features + consent flag without leaking plan/reason', () => {
    const view = toCandidateConsentView(
      resolveProctoringPolicy({ globalEnabled: true, plan: 'scale' }),
    );
    expect(view.proctoring_enabled).toBe(true);
    expect(view.features).toContain('webcam_snapshots');
    expect(view.consent_required).toBe(true);
    expect('plan' in view).toBe(false);
    expect('reason' in view).toBe(false);
  });

  it('returns a fresh features array (no shared reference into the policy)', () => {
    const policy = resolveProctoringPolicy({ globalEnabled: true, plan: 'growth' });
    const view = toCandidateConsentView(policy);
    expect(view.features).toEqual(policy.features);
    expect(view.features).not.toBe(policy.features);
  });
});

function appWith(stub: {
  query: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>;
}) {
  const app = express();
  app.use(express.json());
  app.use(candidateAttemptRouter({ pool: stub as never }));
  app.use(
    (
      err: { status?: number; title?: string },
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      res.status(err.status ?? 500).json({ title: err.title ?? 'Error' });
    },
  );
  return app;
}

function invitationRow(over: Record<string, unknown> = {}) {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    assessment_id: '22222222-2222-2222-2222-222222222222',
    tenant_id: '33333333-3333-3333-3333-333333333333',
    candidate_email: 'c@example.com',
    candidate_name: 'Candidate Zero',
    token: 'tok_abcdefghijklmnop',
    status: 'sent',
    expires_at: new Date(Date.now() + 3600_000),
    assessment_title: 'Sample',
    total_questions: 5,
    time_limit_sec: 1800,
    pass_score: 50,
    assessment_status: 'released',
    ...over,
  };
}

describe('GET /v1/invitations/:token/proctoring', () => {
  it('200 inert (proctoring_enabled:false) by default and leaks no plan/reason', async () => {
    delete process.env.PROCTORING_ENABLED;
    const stub = {
      query: async (sql: string) => {
        if (sql.includes('FROM content.invitations')) return { rows: [invitationRow()] };
        if (sql.includes('FROM billing.subscriptions')) return { rows: [] };
        return { rows: [] };
      },
    };
    const res = await request(appWith(stub)).get('/v1/invitations/tok_abcdefghijklmnop/proctoring');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      proctoring_enabled: false,
      features: [],
      consent_required: false,
    });
    expect(res.body).not.toHaveProperty('plan');
    expect(res.body).not.toHaveProperty('reason');
  });

  it('200 with features when flag on + scale plan; never exposes plan/reason', async () => {
    process.env.PROCTORING_ENABLED = '1';
    const stub = {
      query: async (sql: string) => {
        if (sql.includes('FROM content.invitations')) return { rows: [invitationRow()] };
        if (sql.includes('FROM billing.subscriptions'))
          return { rows: [{ tier: 'scale', status: 'active' }] };
        return { rows: [] };
      },
    };
    const res = await request(appWith(stub)).get('/v1/invitations/tok_abcdefghijklmnop/proctoring');
    delete process.env.PROCTORING_ENABLED;
    expect(res.status).toBe(200);
    expect(res.body.proctoring_enabled).toBe(true);
    expect(res.body.features).toContain('webcam_snapshots');
    expect(res.body.consent_required).toBe(true);
    expect(res.body).not.toHaveProperty('plan');
    expect(res.body).not.toHaveProperty('reason');
  });

  it('404 when the invitation token is unknown', async () => {
    const stub = { query: async () => ({ rows: [] }) };
    const res = await request(appWith(stub)).get('/v1/invitations/tok_unknownunknown1/proctoring');
    expect(res.status).toBe(404);
  });

  it('410 when the invitation has expired', async () => {
    const stub = {
      query: async (sql: string) => {
        if (sql.includes('FROM content.invitations'))
          return { rows: [invitationRow({ expires_at: new Date(Date.now() - 1000) })] };
        return { rows: [] };
      },
    };
    const res = await request(appWith(stub)).get('/v1/invitations/tok_abcdefghijklmnop/proctoring');
    expect(res.status).toBe(410);
  });
});
