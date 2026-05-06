/**
 * Pure-logic helpers for the API-key surfacing UI.
 *
 * The actual issuance HTTP call uses `@qorium/qorium-sdk`'s
 * api-key-mgmt resource. This file is the view-model layer only.
 */

export interface ApiKeyRow {
  id: string;
  prefix: string;
  name: string | null;
  scopes: ReadonlyArray<string>;
  rateLimitPerMin: number;
  rotationDueAt: string;
  lastRotatedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

export interface ApiKeyDisplayState {
  id: string;
  label: string;
  /** Masked form, e.g. `qor_live_xxxxxxxx...0a3f`. */
  maskedKey: string;
  status: 'active' | 'expiring' | 'expired' | 'revoked' | 'rotation_due';
  scopeCount: number;
  rateBadge: string;
  dueInDays: number | null;
}

const ROTATION_WARN_DAYS = 14;

/** Map a stored key row into a display state for the React table. */
export function toDisplayState(row: ApiKeyRow, now: number = Date.now()): ApiKeyDisplayState {
  const status = computeStatus(row, now);
  const dueInDays = row.rotationDueAt ? daysBetween(now, Date.parse(row.rotationDueAt)) : null;
  return {
    id: row.id,
    label: row.name ?? row.prefix,
    maskedKey: maskKey(row.prefix),
    status,
    scopeCount: row.scopes.length,
    rateBadge: `${row.rateLimitPerMin}/min`,
    dueInDays,
  };
}

function computeStatus(row: ApiKeyRow, now: number): ApiKeyDisplayState['status'] {
  if (row.revokedAt) return 'revoked';
  if (row.expiresAt && Date.parse(row.expiresAt) < now) return 'expired';
  const dueInDays = row.rotationDueAt ? daysBetween(now, Date.parse(row.rotationDueAt)) : Infinity;
  if (dueInDays !== null && dueInDays <= 0) return 'rotation_due';
  if (dueInDays !== null && dueInDays <= ROTATION_WARN_DAYS) return 'expiring';
  return 'active';
}

function daysBetween(fromMs: number, toMs: number): number {
  return Math.floor((toMs - fromMs) / 86_400_000);
}

/** Mask a key prefix into a display-friendly token. */
export function maskKey(prefix: string): string {
  if (prefix.length <= 8) return prefix + '…';
  return prefix.slice(0, 8) + '…' + prefix.slice(-4);
}

/**
 * Aggregate a portfolio summary across many keys. Used by the dashboard
 * tile.
 */
export interface ApiKeyPortfolio {
  active: number;
  rotationDue: number;
  expiring: number;
  expired: number;
  revoked: number;
  /** Soonest upcoming rotation; null if every key is revoked/expired. */
  nextRotationDate: string | null;
}

export function aggregatePortfolio(
  rows: ReadonlyArray<ApiKeyRow>,
  now: number = Date.now(),
): ApiKeyPortfolio {
  const counters = { active: 0, rotationDue: 0, expiring: 0, expired: 0, revoked: 0 };
  let nextRotationMs: number | null = null;
  for (const row of rows) {
    const status = computeStatus(row, now);
    switch (status) {
      case 'active':
        counters.active++;
        break;
      case 'rotation_due':
        counters.rotationDue++;
        break;
      case 'expiring':
        counters.expiring++;
        break;
      case 'expired':
        counters.expired++;
        break;
      case 'revoked':
        counters.revoked++;
        break;
    }
    if (status !== 'revoked' && status !== 'expired' && row.rotationDueAt) {
      const ms = Date.parse(row.rotationDueAt);
      if (nextRotationMs === null || ms < nextRotationMs) nextRotationMs = ms;
    }
  }
  return {
    ...counters,
    nextRotationDate: nextRotationMs ? new Date(nextRotationMs).toISOString() : null,
  };
}
