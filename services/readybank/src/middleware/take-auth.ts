/**
 * Take-flow auth middleware (Sprint 1.3).
 *
 * Candidate hits GET /take/:token, which sets a `qor_take` cookie scoped to
 * the take session. Subsequent /api/* calls read the cookie and look up the
 * session row. Cookie flags: HttpOnly; Secure (prod); SameSite=Strict;
 * Path=/. Strict (not Lax) blocks cross-site POSTs to /api/answer.
 */
import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { Pool } from '@qorium/db';
import { findSessionByToken, type SessionRow } from '../repositories/sessions.js';
import { HttpProblem } from './problem.js';

export const TAKE_COOKIE_NAME = 'qor_take';

export interface TakeRequest extends Request {
  takeSession?: SessionRow;
  takeToken?: string;
}

export interface TakeAuthOptions {
  pool: Pool;
  cookieSecure: boolean;
}

export function issueTakeCookie(
  res: Response,
  token: string,
  opts: { cookieSecure: boolean; expiresAt: Date },
): void {
  const maxAgeMs = Math.max(0, opts.expiresAt.getTime() - Date.now());
  res.cookie(TAKE_COOKIE_NAME, token, {
    httpOnly: true,
    secure: opts.cookieSecure,
    sameSite: 'strict',
    path: '/',
    maxAge: maxAgeMs,
  });
}

export function clearTakeCookie(res: Response, opts: { cookieSecure: boolean }): void {
  res.clearCookie(TAKE_COOKIE_NAME, {
    httpOnly: true,
    secure: opts.cookieSecure,
    sameSite: 'strict',
    path: '/',
  });
}

export function takeAuth(opts: TakeAuthOptions): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const cookies = (req as Request & { cookies?: Record<string, string> }).cookies ?? {};
    const token = cookies[TAKE_COOKIE_NAME];
    if (!token) {
      next(
        new HttpProblem({
          status: 401,
          type: 'https://qorium.io/problems/take/missing-token',
          title: 'Unauthorized',
          detail: 'Open the take URL emailed to you to start the assessment.',
        }),
      );
      return;
    }

    try {
      const session = await findSessionByToken(opts.pool, token);
      if (!session) {
        clearTakeCookie(res, { cookieSecure: opts.cookieSecure });
        next(
          new HttpProblem({
            status: 401,
            type: 'https://qorium.io/problems/take/invalid-token',
            title: 'Unauthorized',
            detail: 'This take link is invalid or has been revoked.',
          }),
        );
        return;
      }

      const now = Date.now();
      if (session.status === 'revoked') {
        next(
          new HttpProblem({
            status: 410,
            type: 'https://qorium.io/problems/take/revoked',
            title: 'Gone',
            detail: 'This assessment has been revoked by the recruiter.',
          }),
        );
        return;
      }
      if (session.expires_at.getTime() <= now || session.status === 'expired') {
        next(
          new HttpProblem({
            status: 410,
            type: 'https://qorium.io/problems/take/expired',
            title: 'Gone',
            detail: 'This take link has expired.',
          }),
        );
        return;
      }

      (req as TakeRequest).takeSession = session;
      (req as TakeRequest).takeToken = token;
      next();
    } catch (err) {
      next(err);
    }
  };
}
