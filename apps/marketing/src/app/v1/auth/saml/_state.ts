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
  purgeExpired(now);
  authnRequests.set(key(id, state.tenantId), { ...state, expiresAt: now + 5 * 60 * 1000 });
}

export async function getSamlAuthnRequestState(
  id: string,
  tenantSlug: string,
  tenantId: string,
  now = Date.now(),
): Promise<AuthnRequestState | null> {
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
  purgeExpired(now);
  return seenAssertions.has(key(id, tenantId));
}

export async function rememberSamlAssertion(
  id: string,
  tenantId: string,
  expiresAt: Date,
  now = Date.now(),
): Promise<boolean> {
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
