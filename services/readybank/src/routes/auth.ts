import { Router } from 'express';
import { z } from 'zod';
import argon2 from 'argon2';
import type { Pool } from '@qorium/db';
import { recordAuditEvent } from '@qorium/auth';
import type { Config } from '../config.js';
import { HttpProblem } from '../middleware/problem.js';
import {
  clearSessionCookie,
  issueSessionCookie,
  recruiterAuth,
  type RecruiterIdentity,
  type RecruiterRequest,
} from '../middleware/recruiter-auth.js';

const LOGIN_LOCKOUT_THRESHOLD = 5;

// Pre-computed dummy hash used for constant-time response on unknown emails.
// Verifying against this hash with any password always returns false but
// burns the same CPU as a real verify, defeating user-enumeration timing.
const DUMMY_HASH =
  '$argon2id$v=19$m=19456,t=2,p=1$ZHVtbXktZHVtbXktZHVtbXk$ngo3+vhHzCDImX8eFn7n8m9xSU2zE/c11hRyPm8Mfgs';

const LoginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(1024),
});

interface RecruiterRow {
  id: string;
  tenant_id: string;
  email: string;
  name: string;
  password_hash: string;
  failed_login_count: number;
  locked_until: Date | null;
  status: 'active' | 'disabled';
}

const SELECT_RECRUITER_SQL = `
  SELECT id, tenant_id, email, name, password_hash,
         failed_login_count, locked_until, status
    FROM app.recruiters
   WHERE email = $1
   LIMIT 1
`;

const RECORD_FAILURE_SQL = `
  UPDATE app.recruiters
     SET failed_login_count = $2,
         locked_until = $3
   WHERE id = $1
`;

const RECORD_SUCCESS_SQL = `
  UPDATE app.recruiters
     SET failed_login_count = 0,
         locked_until = NULL,
         last_login_at = NOW()
   WHERE id = $1
`;

export interface AuthRouterDeps {
  pool: Pool;
  config: Config;
  /** When true (default), records auth.* audit events. */
  audit?: boolean;
}

export function authRouter(deps: AuthRouterDeps): Router {
  const router = Router();
  const auditEnabled = deps.audit ?? true;
  const cookieOptions = {
    jwtSecret: deps.config.jwtSecret as string,
    cookieSecure: deps.config.cookieSecure,
  };

  function audit(req: RecruiterRequest, event: string, recruiterId?: string): void {
    if (!auditEnabled) return;
    void recordAuditEvent({
      pool: deps.pool,
      event: {
        actor_type: 'user',
        actor_id: recruiterId ?? null,
        event_type: event,
        entity_type: 'recruiter',
        ...(recruiterId ? { entity_id: recruiterId } : {}),
        ip_address: req.ip,
        user_agent: req.get('user-agent') ?? undefined,
      },
      onError: (err: unknown) => req.log?.warn({ err }, 'audit event write failed'),
    });
  }

  router.post('/auth/login', async (req, res, next) => {
    let parsed;
    try {
      parsed = LoginSchema.parse(req.body);
    } catch (err) {
      if (err instanceof z.ZodError) {
        next(
          new HttpProblem({
            status: 400,
            title: 'Bad Request',
            detail: 'Invalid login payload',
            extensions: { violations: err.flatten() },
          }),
        );
        return;
      }
      next(err);
      return;
    }

    try {
      const { rows } = await deps.pool.query<RecruiterRow>(SELECT_RECRUITER_SQL, [parsed.email]);
      const recruiter = rows[0];

      // Constant-time path on unknown email: still run argon2.verify.
      if (!recruiter) {
        await argon2.verify(DUMMY_HASH, parsed.password).catch(() => false);
        audit(req, 'auth.login.failure');
        next(
          new HttpProblem({
            status: 401,
            type: 'https://qorium.io/problems/auth/invalid-credentials',
            title: 'Unauthorized',
            detail: 'Email or password is incorrect.',
          }),
        );
        return;
      }

      if (recruiter.status !== 'active') {
        audit(req, 'auth.login.disabled', recruiter.id);
        next(
          new HttpProblem({
            status: 403,
            type: 'https://qorium.io/problems/auth/account-disabled',
            title: 'Forbidden',
            detail: 'This account is disabled. Contact your administrator.',
          }),
        );
        return;
      }

      const now = Date.now();
      if (recruiter.locked_until && recruiter.locked_until.getTime() > now) {
        audit(req, 'auth.login.locked', recruiter.id);
        next(
          new HttpProblem({
            status: 423,
            type: 'https://qorium.io/problems/auth/locked',
            title: 'Locked',
            detail: 'Too many failed attempts. Try again later.',
            extensions: { locked_until: recruiter.locked_until.toISOString() },
          }),
        );
        return;
      }

      const passwordOk = await argon2.verify(recruiter.password_hash, parsed.password);
      if (!passwordOk) {
        const nextCount = recruiter.failed_login_count + 1;
        if (nextCount >= LOGIN_LOCKOUT_THRESHOLD) {
          const lockedUntil = new Date(now + deps.config.recruiterLockoutMinutes * 60_000);
          await deps.pool.query(RECORD_FAILURE_SQL, [recruiter.id, 0, lockedUntil]);
          audit(req, 'auth.login.locked', recruiter.id);
          next(
            new HttpProblem({
              status: 423,
              type: 'https://qorium.io/problems/auth/locked',
              title: 'Locked',
              detail: 'Too many failed attempts. Account is temporarily locked.',
              extensions: { locked_until: lockedUntil.toISOString() },
            }),
          );
          return;
        }
        await deps.pool.query(RECORD_FAILURE_SQL, [recruiter.id, nextCount, null]);
        audit(req, 'auth.login.failure', recruiter.id);
        next(
          new HttpProblem({
            status: 401,
            type: 'https://qorium.io/problems/auth/invalid-credentials',
            title: 'Unauthorized',
            detail: 'Email or password is incorrect.',
          }),
        );
        return;
      }

      await deps.pool.query(RECORD_SUCCESS_SQL, [recruiter.id]);

      const identity: RecruiterIdentity = {
        id: recruiter.id,
        tenantId: recruiter.tenant_id,
        email: recruiter.email,
        name: recruiter.name,
        role: 'recruiter',
      };
      issueSessionCookie(res, identity, cookieOptions);
      audit(req, 'auth.login.success', recruiter.id);

      res.status(200).json({
        recruiter: {
          id: identity.id,
          email: identity.email,
          name: identity.name,
          tenant_id: identity.tenantId,
          role: identity.role,
        },
      });
    } catch (err) {
      next(err);
    }
  });

  router.post('/auth/logout', (req, res) => {
    const recruiterId = (req as RecruiterRequest).recruiter?.id;
    clearSessionCookie(res, cookieOptions);
    audit(req, 'auth.logout', recruiterId);
    res.status(204).end();
  });

  router.get('/auth/whoami', recruiterAuth(cookieOptions), (req, res) => {
    const identity = (req as RecruiterRequest).recruiter;
    if (!identity) {
      // Guarded by recruiterAuth above; defensive only.
      throw new HttpProblem({ status: 401, title: 'Unauthorized' });
    }
    res.status(200).json({
      recruiter: {
        id: identity.id,
        email: identity.email,
        name: identity.name,
        tenant_id: identity.tenantId,
        role: identity.role,
      },
    });
  });

  return router;
}
