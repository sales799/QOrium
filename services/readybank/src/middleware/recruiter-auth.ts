import type { Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { JwtPayload, SignOptions } from 'jsonwebtoken';
import { HttpProblem } from './problem.js';

export const SESSION_COOKIE_NAME = 'qor_session';
export const SESSION_TTL_SECONDS = 8 * 60 * 60; // 8h sliding window
export const JWT_ISSUER = 'qorium-readybank';
export const JWT_AUDIENCE = 'qorium-recruiter';

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

interface RecruiterSessionClaims extends JwtPayload {
  sub: string;
  tenant_id: string;
  email: string;
  name: string;
  role: 'recruiter';
}

export interface RecruiterAuthOptions {
  jwtSecret: string;
  cookieSecure: boolean;
}

/**
 * Sign a recruiter session JWT and write it to an HttpOnly cookie. Used at
 * login and on every authenticated request to slide the 8h expiry forward.
 */
export function issueSessionCookie(
  res: Response,
  identity: RecruiterIdentity,
  options: RecruiterAuthOptions,
): void {
  const signOptions: SignOptions = {
    algorithm: 'HS256',
    expiresIn: SESSION_TTL_SECONDS,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    subject: identity.id,
  };
  const token = jwt.sign(
    {
      tenant_id: identity.tenantId,
      email: identity.email,
      name: identity.name,
      role: identity.role,
    },
    options.jwtSecret,
    signOptions,
  );
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: options.cookieSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS * 1000,
  });
}

export function clearSessionCookie(res: Response, options: RecruiterAuthOptions): void {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: options.cookieSecure,
    sameSite: 'lax',
    path: '/',
  });
}

/**
 * Cookie-based recruiter session gate. Verifies the JWT in `qor_session`,
 * attaches `req.recruiter`, and re-issues the cookie with a fresh 8h Max-Age
 * (sliding window). Reject with RFC 7807 401 on missing / invalid / expired.
 */
export function recruiterAuth(options: RecruiterAuthOptions): RequestHandler {
  return (req, res, next) => {
    const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
    const token = cookies?.[SESSION_COOKIE_NAME];
    if (!token) {
      next(
        new HttpProblem({
          status: 401,
          type: 'https://qorium.io/problems/auth/missing-session',
          title: 'Unauthorized',
          detail: 'Session cookie missing. Sign in at /login.html.',
        }),
      );
      return;
    }

    let claims: RecruiterSessionClaims;
    try {
      claims = jwt.verify(token, options.jwtSecret, {
        algorithms: ['HS256'],
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      }) as RecruiterSessionClaims;
    } catch {
      clearSessionCookie(res, options);
      next(
        new HttpProblem({
          status: 401,
          type: 'https://qorium.io/problems/auth/invalid-session',
          title: 'Unauthorized',
          detail: 'Session is invalid or expired. Sign in again.',
        }),
      );
      return;
    }

    const identity: RecruiterIdentity = {
      id: claims.sub,
      tenantId: claims.tenant_id,
      email: claims.email,
      name: claims.name,
      role: 'recruiter',
    };
    (req as RecruiterRequest).recruiter = identity;

    // Slide the expiry: re-issue the cookie with a fresh 8h Max-Age on every
    // authed request. The token is also re-signed so its `exp` matches.
    issueSessionCookie(res, identity, options);
    next();
  };
}
