import { getOptionalSamlPool, hmacSamlIdentifier } from './_db';

interface AuthnRequestState {
  tenantSlug: string;
  tenantId: string;
  relayState: string;
  expiresAt: number;
}

const authnRequests = new Map<string, AuthnRequestState>();
const seenAssertions = new Map<string, number>();

export async function rememberSamlAuthnRequest(
  id: string,
  state: Omit<AuthnRequestState, 'expiresAt'>,
  now = Date.now(),
): Promise<void> {
  const pool = getOptionalSamlPool();
  if (pool) {
    await pool.query(
      `
        INSERT INTO app.saml_authn_request_state (
          request_id_hash,
          tenant_id,
          relay_state,
          expires_at
        )
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (request_id_hash) DO NOTHING
      `,
      [
        hmacSamlIdentifier('authn_request', state.tenantId, id),
        state.tenantId,
        state.relayState,
        new Date(now + 5 * 60 * 1000),
      ],
    );
    return;
  }

  purgeExpired(now);
  authnRequests.set(key(id, state.tenantId), { ...state, expiresAt: now + 5 * 60 * 1000 });
}

export async function getSamlAuthnRequestState(
  id: string,
  tenantSlug: string,
  tenantId: string,
  now = Date.now(),
): Promise<AuthnRequestState | null> {
  const pool = getOptionalSamlPool();
  if (pool) {
    const result = await pool.query<{ relay_state: string; expires_at: Date }>(
      `
        SELECT relay_state, expires_at
          FROM app.saml_authn_request_state
         WHERE request_id_hash = $1
           AND tenant_id = $2
           AND consumed_at IS NULL
           AND expires_at > NOW()
         LIMIT 1
      `,
      [hmacSamlIdentifier('authn_request', tenantId, id), tenantId],
    );
    const row = result.rows[0];
    return row
      ? {
          tenantSlug,
          tenantId,
          relayState: row.relay_state,
          expiresAt: row.expires_at.getTime(),
        }
      : null;
  }

  purgeExpired(now);
  const state = authnRequests.get(key(id, tenantId));
  return state?.tenantSlug === tenantSlug ? state : null;
}

export async function consumeSamlAuthnRequest(
  id: string,
  tenantSlug: string,
  tenantId: string,
  now = Date.now(),
): Promise<AuthnRequestState | null> {
  const pool = getOptionalSamlPool();
  if (pool) {
    const result = await pool.query<{ relay_state: string; expires_at: Date }>(
      `
        UPDATE app.saml_authn_request_state
           SET consumed_at = NOW()
         WHERE request_id_hash = $1
           AND tenant_id = $2
           AND consumed_at IS NULL
           AND expires_at > NOW()
        RETURNING relay_state, expires_at
      `,
      [hmacSamlIdentifier('authn_request', tenantId, id), tenantId],
    );
    const row = result.rows[0];
    return row
      ? {
          tenantSlug,
          tenantId,
          relayState: row.relay_state,
          expiresAt: row.expires_at.getTime(),
        }
      : null;
  }

  purgeExpired(now);
  const requestKey = key(id, tenantId);
  const state = authnRequests.get(requestKey);
  if (!state || state.tenantSlug !== tenantSlug) return null;
  authnRequests.delete(requestKey);
  return state;
}

export async function hasSeenSamlAssertion(
  id: string,
  tenantId: string,
  now = Date.now(),
): Promise<boolean> {
  const pool = getOptionalSamlPool();
  if (pool) {
    const result = await pool.query<{ found: number }>(
      `
        SELECT 1 AS found
          FROM app.saml_assertions_seen
         WHERE assertion_id_hash = $1
           AND tenant_id = $2
           AND kind = 'assertion'
           AND expires_at > NOW()
         LIMIT 1
      `,
      [hmacSamlIdentifier('assertion', tenantId, id), tenantId],
    );
    return result.rows.length > 0;
  }

  purgeExpired(now);
  return seenAssertions.has(key(id, tenantId));
}

export async function rememberSamlAssertion(
  id: string,
  tenantId: string,
  expiresAt: Date,
  now = Date.now(),
): Promise<boolean> {
  const pool = getOptionalSamlPool();
  if (pool) {
    const result = await pool.query<{ assertion_id_hash: Buffer }>(
      `
        INSERT INTO app.saml_assertions_seen (
          assertion_id_hash,
          tenant_id,
          kind,
          expires_at
        )
        VALUES ($1, $2, 'assertion', $3)
        ON CONFLICT (assertion_id_hash) DO NOTHING
        RETURNING assertion_id_hash
      `,
      [hmacSamlIdentifier('assertion', tenantId, id), tenantId, expiresAt],
    );
    return result.rows.length === 1;
  }

  purgeExpired(now);
  const assertionKey = key(id, tenantId);
  if (seenAssertions.has(assertionKey)) return false;
  seenAssertions.set(assertionKey, expiresAt.getTime());
  return true;
}

export function resetSamlProofStateForTests(): void {
  authnRequests.clear();
  seenAssertions.clear();
}

function key(id: string, tenantId: string): string {
  return `${tenantId}:${id}`;
}

function purgeExpired(now: number): void {
  for (const [id, state] of authnRequests.entries()) {
    if (state.expiresAt <= now) authnRequests.delete(id);
  }
  for (const [id, expiresAt] of seenAssertions.entries()) {
    if (expiresAt <= now) seenAssertions.delete(id);
  }
}
