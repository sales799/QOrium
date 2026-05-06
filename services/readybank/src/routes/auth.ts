import { Router } from 'express';
import { createHash, randomBytes } from 'node:crypto';
import { z } from 'zod';
import argon2 from 'argon2';
import type { Pool, PoolClient } from '@qorium/db';
import { recordAuditEvent } from '@qorium/auth';
import type { AuthenticatedRequest } from '@qorium/auth';
import type { Config } from '../config.js';
import { HttpProblem } from '../middleware/problem.js';
import {
  clearSessionCookie,
  issueSessionCookie,
  recruiterAuth,
  type RecruiterIdentity,
  type RecruiterRequest,
} from '../middleware/recruiter-auth.js';
import type { Mailer } from '../mailer/index.js';
import { renderInvitationEmail } from '../mailer/index.js';

const LOGIN_LOCKOUT_THRESHOLD = 5;
const INVITATION_TTL_DAYS = 7;
const INVITATION_TOKEN_BYTES = 32;

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
  password_hash: string | null;
  failed_login_count: number;
  locked_until: Date | null;
  status: 'active' | 'disabled' | 'pending';
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

      if (recruiter.status === 'pending' || !recruiter.password_hash) {
        audit(req, 'auth.login.pending', recruiter.id);
        next(
          new HttpProblem({
            status: 403,
            type: 'https://qorium.io/problems/auth/invitation-pending',
            title: 'Forbidden',
            detail: 'Accept your invitation email to set a password before signing in.',
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

  // ===========================================================================
  // POST /v1/auth/accept — redeem an invitation token (public; token-gated).
  // ===========================================================================
  // The mailed link points at /accept-invite.html?token=...; the page POSTs
  // here with { token, password }. Single-use: on success the invitation row
  // is marked accepted and the recruiter row flips to 'active'.

  router.post('/auth/accept', async (req, res, next) => {
    let parsed;
    try {
      parsed = AcceptInvitationSchema.parse(req.body);
    } catch (err) {
      if (err instanceof z.ZodError) {
        next(
          new HttpProblem({
            status: 400,
            title: 'Bad Request',
            detail: 'Invalid invitation payload',
            extensions: { violations: err.flatten() },
          }),
        );
        return;
      }
      next(err);
      return;
    }

    const tokenHash = sha256Hex(parsed.token);

    const client: PoolClient = await deps.pool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query<InvitationLookupRow>(SELECT_OUTSTANDING_INVITATION_SQL, [
        tokenHash,
      ]);
      const invite = rows[0];
      if (!invite) {
        await client.query('ROLLBACK');
        next(
          new HttpProblem({
            status: 404,
            type: 'https://qorium.io/problems/auth/invitation-not-found',
            title: 'Not Found',
            detail: 'This invitation link is invalid, already used, or revoked.',
          }),
        );
        return;
      }
      if (invite.expires_at.getTime() <= Date.now()) {
        await client.query('ROLLBACK');
        next(
          new HttpProblem({
            status: 410,
            type: 'https://qorium.io/problems/auth/invitation-expired',
            title: 'Gone',
            detail: 'This invitation has expired. Ask for a new one.',
          }),
        );
        return;
      }

      const passwordHash = await argon2.hash(parsed.password, {
        type: argon2.argon2id,
        memoryCost: 19_456,
        timeCost: 2,
        parallelism: 1,
      });

      await client.query(MARK_INVITATION_ACCEPTED_SQL, [invite.id]);
      await client.query(ACTIVATE_RECRUITER_SQL, [invite.recruiter_id, passwordHash]);
      await client.query('COMMIT');

      audit(req, 'auth.invitation.accepted', invite.recruiter_id);
      res.status(204).end();
    } catch (err) {
      try {
        await client.query('ROLLBACK');
      } catch {
        /* ignore rollback failure */
      }
      next(err);
    } finally {
      client.release();
    }
  });

  return router;
}

// =============================================================================
// Admin auth router — gated by API key. Mounted after the apiKeyAuth gate.
// Exposes POST /v1/auth/invite for recruiter ops to invite new recruiters.
// =============================================================================

export interface AdminAuthRouterDeps {
  pool: Pool;
  config: Config;
  mailer: Mailer;
  /** When true (default), records auth.* audit events. */
  audit?: boolean;
}

export function adminAuthRouter(deps: AdminAuthRouterDeps): Router {
  const router = Router();
  const auditEnabled = deps.audit ?? true;

  router.post('/auth/invite', async (req, res, next) => {
    const apiKeyAuth = (req as AuthenticatedRequest).auth;
    if (!apiKeyAuth) {
      next(
        new HttpProblem({
          status: 401,
          title: 'Unauthorized',
          detail: 'API key required to invite recruiters.',
        }),
      );
      return;
    }

    let parsed;
    try {
      parsed = InviteSchema.parse(req.body);
    } catch (err) {
      if (err instanceof z.ZodError) {
        next(
          new HttpProblem({
            status: 400,
            title: 'Bad Request',
            detail: 'Invalid invitation payload',
            extensions: { violations: err.flatten() },
          }),
        );
        return;
      }
      next(err);
      return;
    }

    const token = randomBytes(INVITATION_TOKEN_BYTES).toString('base64url');
    const tokenHash = sha256Hex(token);
    const expiresAt = new Date(Date.now() + INVITATION_TTL_DAYS * 86_400_000);

    const client: PoolClient = await deps.pool.connect();
    try {
      await client.query('BEGIN');

      // Idempotent invite: if a recruiter row already exists for this email
      // and is pending, reuse it; if active, refuse (already onboarded).
      const { rows: existing } = await client.query<{ id: string; status: string }>(
        'SELECT id, status FROM app.recruiters WHERE email = $1 LIMIT 1',
        [parsed.email],
      );
      let recruiterId: string;
      const existingRow = existing[0];
      if (existingRow) {
        if (existingRow.status !== 'pending') {
          await client.query('ROLLBACK');
          next(
            new HttpProblem({
              status: 409,
              type: 'https://qorium.io/problems/auth/already-onboarded',
              title: 'Conflict',
              detail: 'A recruiter with this email is already active or disabled.',
            }),
          );
          return;
        }
        recruiterId = existingRow.id;
      } else {
        const { rows: created } = await client.query<{ id: string }>(INSERT_PENDING_RECRUITER_SQL, [
          parsed.tenant_id,
          parsed.email,
          parsed.name,
        ]);
        const createdRow = created[0];
        if (!createdRow) {
          throw new Error('Insert returned no row');
        }
        recruiterId = createdRow.id;
      }

      const message = renderInvitationEmail({
        to: parsed.email,
        token,
        portalUrl: deps.config.recruiterPortalUrl,
        from: deps.config.mailerFromAddress,
        ...(deps.config.mailerReplyToAddress ? { replyTo: deps.config.mailerReplyToAddress } : {}),
        ...(parsed.name ? { recipientName: parsed.name } : {}),
      });

      const sent = await deps.mailer.send(message);

      await client.query(INSERT_INVITATION_SQL, [
        recruiterId,
        tokenHash,
        parsed.email,
        sent.driver,
        sent.messageId,
        expiresAt,
      ]);
      await client.query('COMMIT');

      if (auditEnabled) {
        void recordAuditEvent({
          pool: deps.pool,
          event: {
            actor_type: 'api_key',
            actor_id: apiKeyAuth.apiKeyId,
            event_type: 'auth.invitation.sent',
            entity_type: 'recruiter',
            entity_id: recruiterId,
            payload: { email: parsed.email, mailer_driver: sent.driver },
            ip_address: req.ip ?? undefined,
            user_agent: req.get('user-agent') ?? undefined,
          },
          onError: (err) => req.log?.warn({ err }, 'audit event write failed'),
        });
      }

      res.status(201).json({
        recruiter_id: recruiterId,
        email: parsed.email,
        expires_at: expiresAt.toISOString(),
        mailer: { driver: sent.driver, message_id: sent.messageId },
      });
    } catch (err) {
      try {
        await client.query('ROLLBACK');
      } catch {
        /* ignore rollback failure */
      }
      next(err);
    } finally {
      client.release();
    }
  });

  return router;
}

// =============================================================================
// Schemas + SQL used by invite/accept handlers.
// =============================================================================

const InviteSchema = z.object({
  email: z.string().email().max(254),
  name: z.string().min(1).max(200),
  tenant_id: z.string().uuid(),
});

const AcceptInvitationSchema = z.object({
  token: z.string().min(16).max(512),
  password: z.string().min(12).max(1024),
});

interface InvitationLookupRow {
  id: string;
  recruiter_id: string;
  expires_at: Date;
}

const SELECT_OUTSTANDING_INVITATION_SQL = `
  SELECT id, recruiter_id, expires_at
    FROM app.recruiter_invitations
   WHERE token_hash = $1
     AND accepted_at IS NULL
     AND revoked_at IS NULL
   LIMIT 1
`;

const MARK_INVITATION_ACCEPTED_SQL = `
  UPDATE app.recruiter_invitations
     SET accepted_at = NOW()
   WHERE id = $1
`;

const ACTIVATE_RECRUITER_SQL = `
  UPDATE app.recruiters
     SET password_hash = $2,
         status = 'active',
         failed_login_count = 0,
         locked_until = NULL
   WHERE id = $1
`;

const INSERT_PENDING_RECRUITER_SQL = `
  INSERT INTO app.recruiters (tenant_id, email, name, status)
  VALUES ($1, $2, $3, 'pending')
  RETURNING id
`;

const INSERT_INVITATION_SQL = `
  INSERT INTO app.recruiter_invitations
    (recruiter_id, token_hash, email, mailer_driver, mailer_message_id, expires_at)
  VALUES ($1, $2, $3, $4, $5, $6)
`;

function sha256Hex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}
