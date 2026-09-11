import { createHmac } from 'node:crypto';
import type { Request, RequestHandler, Response } from 'express';
import type { Pool } from '@qorium/db';
import { durableSessions, InvalidRecruiterSession } from '../auth/durable-session.js';
import { createSessionStore, SessionStoreUnavailable } from '../auth/session-store.js';
import { SESSION_COOKIE_NAME } from '../auth/session-constants.js';
import { HttpProblem } from './problem.js';
import { jsonSessionWriteProblem } from './json-session-write.js';
export {
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  JWT_ISSUER,
  JWT_AUDIENCE,
} from '../auth/session-constants.js';
export interface RecruiterIdentity {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: 'recruiter';
}
export interface RecruiterRequest extends Request {
  recruiter?: RecruiterIdentity;
}
export interface RecruiterAuthOptions {
  jwtSecret: string;
  cookieSecure: boolean;
  /** Required for live authentication. Omission fails closed. */
  pool?: Pool;
}
function sessions(options: RecruiterAuthOptions) {
  if (!options.pool || !options.jwtSecret || Buffer.byteLength(options.jwtSecret, 'utf8') < 32)
    throw new SessionStoreUnavailable();
  const store = createSessionStore(options.pool, (tenant, sid) =>
    createHmac('sha256', options.jwtSecret).update(`password-session:${tenant}:${sid}`).digest(),
  );
  return durableSessions(store, options.jwtSecret);
}
type Issued = Awaited<ReturnType<ReturnType<typeof durableSessions>['start']>>;
function writeCookie(
  res: Response,
  session: Issued,
  options: RecruiterAuthOptions,
): RecruiterIdentity {
  res.cookie(SESSION_COOKIE_NAME, session.token, {
    httpOnly: true,
    secure: options.cookieSecure,
    sameSite: 'lax',
    path: '/',
    expires: session.expiresAt,
  });
  return {
    id: session.recruiter.id,
    tenantId: session.recruiter.tenant_id,
    email: session.recruiter.email,
    name: session.recruiter.name,
    role: 'recruiter',
  };
}
export function sessionProblem(error: unknown): HttpProblem {
  if (error instanceof InvalidRecruiterSession)
    return new HttpProblem({
      status: 401,
      title: 'Unauthorized',
      detail: 'Session is invalid or expired. Sign in again.',
    });
  return new HttpProblem({
    status: 503,
    title: 'Service Unavailable',
    detail: 'Session service unavailable. Try again later.',
  });
}
/** Persist before issuance; the browser deadline is the signed database deadline. */
export async function issueSessionCookie(
  res: Response,
  identity: RecruiterIdentity,
  options: RecruiterAuthOptions,
): Promise<RecruiterIdentity> {
  try {
    return writeCookie(res, await sessions(options).start(identity.tenantId, identity.id), options);
  } catch (error) {
    throw sessionProblem(error);
  }
}
export function clearSessionCookie(res: Response, options: RecruiterAuthOptions): void {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: options.cookieSecure,
    sameSite: 'lax',
    path: '/',
  });
}
export async function revokeSessionCookie(
  req: Request,
  res: Response,
  options: RecruiterAuthOptions,
): Promise<void> {
  const token = (req as Request & { cookies?: Record<string, string> }).cookies?.[
    SESSION_COOKIE_NAME
  ];
  if (token) {
    try {
      await sessions(options).revoke(token);
    } catch (error) {
      // Invalid/legacy cookies cannot identify a durable session. Clear them idempotently.
      if (!(error instanceof InvalidRecruiterSession)) throw sessionProblem(error);
    }
  }
  clearSessionCookie(res, options);
}
export function recruiterAuth(options: RecruiterAuthOptions): RequestHandler {
  return async (req, res, next) => {
    const token = (req as Request & { cookies?: Record<string, string> }).cookies?.[
      SESSION_COOKIE_NAME
    ];
    if (!token) {
      next(
        new HttpProblem({
          status: 401,
          title: 'Unauthorized',
          detail: 'Session cookie missing. Sign in again.',
        }),
      );
      return;
    }
    const writeProblem = jsonSessionWriteProblem(req);
    if (writeProblem) {
      next(writeProblem);
      return;
    }
    try {
      const session = await sessions(options).renew(token);
      (req as RecruiterRequest).recruiter = writeCookie(res, session, options);
      next();
    } catch (error) {
      if (error instanceof InvalidRecruiterSession) clearSessionCookie(res, options);
      next(sessionProblem(error));
    }
  };
}
