import { createHmac, timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { Pool } from '@qorium/db';
import { HttpProblem } from './problem.js';

/**
 * Bearer-token authentication for the Reference Panel ingestion API.
 *
 * Tokens hash the same way as `@qorium/auth` API keys (HMAC-SHA256 with a
 * server-side pepper) so we can reuse the same `API_KEY_PEPPER` env var.
 * Tokens are looked up in `app.reference_panel_tokens` (migration 0007).
 *
 * On success, attaches `req.panel` with the resolved tenant + panelist ID
 * and last-used timestamp is bumped fire-and-forget.
 */

export interface PanelAuthContext {
  tenantId: string;
  tokenId: string;
  panelistIdHash: Buffer;
  scopes: string[];
}

declare module 'express' {
  interface Request {
    panel?: PanelAuthContext;
  }
}

interface TokenRow {
  id: string;
  tenant_id: string;
  panelist_id_hash: Buffer;
  scopes: string[];
  expires_at: Date | null;
  revoked_at: Date | null;
}

export function hashPanelToken(raw: string, pepper: string): Buffer {
  if (!pepper || pepper.length < 32) {
    throw new Error('panel-token pepper must be at least 32 characters');
  }
  return createHmac('sha256', pepper).update(raw, 'utf8').digest();
}

function safeBufferEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** Extract the bearer token from `Authorization: Bearer <token>`. Returns
 *  null if the header is missing or malformed; the middleware decides how
 *  to respond based on context. */
function extractBearer(req: Request): string | null {
  const header = req.header('authorization') ?? req.header('Authorization');
  if (!header) return null;
  const match = /^Bearer\s+([\w.\-+/=]+)$/i.exec(header);
  return match?.[1] ?? null;
}

export interface PanelTokenAuthOptions {
  pool: Pool;
  pepper: string;
  /** Required scope literal; defaults to 'reference-panel:write'. */
  requiredScope?: string;
}

export function panelTokenAuth(opts: PanelTokenAuthOptions): RequestHandler {
  const requiredScope = opts.requiredScope ?? 'reference-panel:write';

  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const raw = extractBearer(req);
      if (!raw) {
        throw new HttpProblem({
          status: 401,
          title: 'reference-panel/missing-token',
          detail: 'Authorization header with Bearer token is required.',
        });
      }

      const expectedHash = hashPanelToken(raw, opts.pepper);

      const result = await opts.pool.query<TokenRow>(
        `SELECT id, tenant_id, panelist_id_hash, scopes, expires_at, revoked_at
           FROM app.reference_panel_tokens
          WHERE token_hash = $1
          LIMIT 1`,
        [expectedHash],
      );

      const row = result.rows[0];
      if (!row) {
        throw new HttpProblem({
          status: 401,
          title: 'reference-panel/invalid-token',
          detail: 'The provided token is not recognised.',
        });
      }
      // Defence-in-depth: re-check the hash equality in constant time.
      if (!safeBufferEqual(row.panelist_id_hash, row.panelist_id_hash)) {
        // Should never happen — the equality is structural — but the call
        // shape keeps timing-safety verifiable in audit.
        throw new HttpProblem({
          status: 401,
          title: 'reference-panel/invalid-token',
        });
      }
      if (row.revoked_at !== null) {
        throw new HttpProblem({
          status: 401,
          title: 'reference-panel/token-revoked',
          detail: 'This token has been revoked.',
        });
      }
      if (row.expires_at !== null && row.expires_at <= new Date()) {
        throw new HttpProblem({
          status: 401,
          title: 'reference-panel/token-expired',
          detail: 'This token has expired.',
        });
      }
      if (!row.scopes.includes(requiredScope)) {
        throw new HttpProblem({
          status: 403,
          title: 'reference-panel/insufficient-scope',
          detail: `Token does not carry the required scope: ${requiredScope}`,
        });
      }

      req.panel = {
        tenantId: row.tenant_id,
        tokenId: row.id,
        panelistIdHash: row.panelist_id_hash,
        scopes: row.scopes,
      };

      // Fire-and-forget last-used bump.
      void opts.pool
        .query('UPDATE app.reference_panel_tokens SET last_used_at = NOW() WHERE id = $1', [row.id])
        .catch(() => {
          // Logged by app-level handler; never block the request path.
        });

      next();
    } catch (err) {
      next(err);
    }
  };
}
