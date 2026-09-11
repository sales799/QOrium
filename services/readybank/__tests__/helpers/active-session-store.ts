import type { SessionKey } from '../../src/auth/session-store.js';
/** Authenticated-session fixture for existing route tests, not revocation tests.
 * Signature/claim validation remains real. Storage boundaries are tested separately
 * against PostgreSQL; these tests exercise business-route behavior after authentication.
 */
export function activeSessionStore(email = 'rec@example.com') {
  const row = async (key: SessionKey) => ({
    id: key.recruiterId,
    tenant_id: key.tenantId,
    email,
    name: 'Test Recruiter',
    expires_at: new Date(Date.now() + 28800000),
  });
  return { create: row, renew: row, revoke: async () => undefined };
}
