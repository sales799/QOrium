/**
 * Replay-attack guard for SAML assertions + AuthnRequests.
 *
 * Stored as HMAC-SHA256(pepper, ID || tenant_id) for index size + tenant
 * binding. Caller persists the hash row in app.saml_assertions_seen with
 * expires_at = assertion's NotOnOrAfter, then a daily cron purges
 * expired rows.
 */

import { createHmac } from 'node:crypto';

export function hashAssertionKey(args: { id: string; tenantId: string; pepper: string }): Buffer {
  if (!args.pepper || args.pepper.length < 16) {
    throw new Error('replay-guard pepper must be >= 16 chars');
  }
  if (!args.id) throw new Error('id is required');
  if (!args.tenantId) throw new Error('tenantId is required');
  return createHmac('sha256', args.pepper)
    .update(args.id)
    .update('|')
    .update(args.tenantId)
    .digest();
}

/**
 * Convenience: format hash as hex for logs / tests; never log the raw ID.
 */
export function hashAssertionKeyHex(args: {
  id: string;
  tenantId: string;
  pepper: string;
}): string {
  return hashAssertionKey(args).toString('hex');
}
