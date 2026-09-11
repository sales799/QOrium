/**
 * Stack-Vault tenant-isolation middleware.
 *
 * Layered on top of @qorium/auth `apiKeyAuth`: by the time this middleware
 * runs, `req.auth` is set from the verified API key (AuthContext shape
 * from packages/auth/src/types.ts: apiKeyId, tenantId, prefix, scopes,
 * name). We look up the caller's vault config and attach it to
 * `req.vault`, halting if the vault is not active.
 *
 * Cross-tenant reads return 404 (not 403) deliberately, per spec — a 403
 * leaks the existence of a question id; 404 reveals nothing.
 *
 * SO-10 enforcement: if the API key carries the `export:stack-vault`
 * scope (which Constitution forbids in production), we reject 403.
 * That scope is reserved for internal-only T0 admin keys.
 */

import type { NextFunction, Response } from 'express';
import type { Pool } from '@qorium/db';
import type { AuthenticatedRequest } from '@qorium/auth';
import { HttpProblem } from './problem.js';

export interface VaultContext {
  tenantId: string;
  tier: 'bronze' | 'silver' | 'gold';
  annualFloorPaise: bigint;
  contractExpiresAt: Date;
  /** Decrypted per-vault pepper. */
  watermarkPepper: string;
}

export interface VaultedRequest extends AuthenticatedRequest {
  vault?: VaultContext;
}

interface VaultRow {
  tenant_id: string;
  tier: 'bronze' | 'silver' | 'gold';
  annual_floor_paise: string;
  contract_expires_at: Date;
  status: string;
  watermark_pepper_enc: string | null;
}

export interface TenantIsolationDeps {
  pool: Pool;
  /** Explicit service environment; unknown/unset values fail closed. */
  nodeEnv?: string;
  /**
   * Decrypts watermark_pepper_enc using the verified storage format.
   * Required outside explicit development/test; no production identity fallback.
   */
  decryptVaultPepper?: (encrypted: string) => string;
  /** Inject `now()` for deterministic tests. */
  now?: () => Date;
}

const DEFAULT_DECRYPT = (s: string): string => s;

/**
 * Returns 401 if no auth, 403 if forbidden export scope, 404 if no
 * active vault, 503 if vault has no pepper configured.
 */
export function requireActiveVault(deps: TenantIsolationDeps) {
  const environment = deps.nodeEnv ?? process.env.NODE_ENV;
  const allowPlaintext = environment === 'development' || environment === 'test';
  const decrypt = deps.decryptVaultPepper ?? (allowPlaintext ? DEFAULT_DECRYPT : undefined);
  const now = deps.now ?? ((): Date => new Date());

  return async function vaultMiddleware(
    req: VaultedRequest,
    _res: Response,
    next: NextFunction,
  ): Promise<void> {
    const auth = req.auth;
    if (!auth) {
      next(
        new HttpProblem({
          status: 401,
          title: 'Unauthorized',
          detail: 'Missing authentication context — Stack-Vault routes require an API key',
        }),
      );
      return;
    }

    // SO-10: export scope forbidden on Stack-Vault (Constitution + D3 spec).
    if (auth.scopes.includes('export:stack-vault')) {
      next(
        new HttpProblem({
          status: 403,
          title: 'Forbidden',
          detail:
            'export:stack-vault scope is reserved per SO-10 and cannot be used on this endpoint',
        }),
      );
      return;
    }

    if (!decrypt) {
      next(
        new HttpProblem({
          status: 503,
          title: 'Service Unavailable',
          detail: 'Vault watermark decryption is not configured',
        }),
      );
      return;
    }

    let row: VaultRow | undefined;
    try {
      const result = await deps.pool.query<VaultRow>(
        `SELECT tenant_id, tier, annual_floor_paise, contract_expires_at, status, watermark_pepper_enc
           FROM app.tenant_stack_vaults
           WHERE tenant_id = $1
           LIMIT 1`,
        [auth.tenantId],
      );
      row = result.rows[0];
    } catch (err) {
      next(err);
      return;
    }

    if (!row || row.status !== 'active' || row.contract_expires_at <= now()) {
      // 404 — never reveal whether vault exists vs is lapsed.
      next(
        new HttpProblem({
          status: 404,
          title: 'Not Found',
          detail: 'No active Stack-Vault for this tenant',
        }),
      );
      return;
    }

    if (!row.watermark_pepper_enc) {
      next(
        new HttpProblem({
          status: 503,
          title: 'Service Unavailable',
          detail: 'Vault watermark pepper not configured; admin must seed it before reads',
        }),
      );
      return;
    }

    let watermarkPepper: string;
    try {
      watermarkPepper = decrypt(row.watermark_pepper_enc);
      if (typeof watermarkPepper !== 'string' || !watermarkPepper.trim()) {
        throw new Error('Invalid decrypted pepper');
      }
    } catch {
      // Provider errors can contain ciphertext, key material or secret paths.
      next(
        new HttpProblem({
          status: 503,
          title: 'Service Unavailable',
          detail: 'Vault watermark decryption unavailable',
        }),
      );
      return;
    }

    req.vault = {
      tenantId: row.tenant_id,
      tier: row.tier,
      annualFloorPaise: BigInt(row.annual_floor_paise),
      contractExpiresAt: row.contract_expires_at,
      watermarkPepper,
    };
    next();
  };
}
