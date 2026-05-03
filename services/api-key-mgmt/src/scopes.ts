/**
 * Scope catalogue + enforcement helper per
 * `infra/D3-Talpro-Internal-API-Key-Spec.md` §3.
 *
 * Pure logic — the Express middleware in any consumer service can
 * call `enforceScope(req.auth.scopes, 'questions:read')` to gate
 * the route.
 */

export const SCOPES = [
  'questions:read',
  'questions:write',
  'search:read',
  'export:bulk:csv',
  'export:bulk:json',
  'export:stack-vault',
  'responses:write',
  'responses:read',
  'admin:keys',
  'admin:users',
  'admin:billing',
  'audit:read',
  'audit:export',
  'webhooks:write',
  'webhooks:read',
  'sso:configure',
] as const;

export type Scope = (typeof SCOPES)[number];

export function isScope(value: string): value is Scope {
  return (SCOPES as readonly string[]).includes(value);
}

export interface ScopeCheck {
  ok: boolean;
  required: Scope;
  missing: boolean;
}

/**
 * Return whether the granted scopes satisfy the requirement.
 *
 * `wildcardable` lets `admin:*` match all admin scopes, etc. If
 * `granted` includes the literal required scope OR any wildcard
 * prefix that covers it, the check passes.
 */
export function enforceScope(granted: readonly string[], required: Scope): ScopeCheck {
  const grantedSet = new Set(granted);
  if (grantedSet.has(required)) return { ok: true, required, missing: false };
  // Wildcard at the segment boundary (e.g. `admin:*` covers `admin:keys`).
  for (const g of grantedSet) {
    if (!g.endsWith(':*')) continue;
    const prefix = g.slice(0, -2); // drop the `:*`
    if (required === prefix || required.startsWith(`${prefix}:`)) {
      return { ok: true, required, missing: false };
    }
  }
  return { ok: false, required, missing: true };
}

/** v0 default scope bundles per D3 §3. */
export const SCOPE_BUNDLES = {
  talpro_internal: [
    'questions:read',
    'search:read',
    'export:bulk:csv',
    'export:bulk:json',
    'responses:write',
  ],
  readybank_customer: ['questions:read', 'search:read', 'export:bulk:json'],
  readonly: ['questions:read', 'search:read'],
  full_admin: [
    'admin:keys',
    'admin:users',
    'admin:billing',
    'audit:read',
    'audit:export',
    'sso:configure',
    'webhooks:read',
    'webhooks:write',
  ],
} satisfies Record<string, Scope[]>;

export type ScopeBundle = keyof typeof SCOPE_BUNDLES;

export function bundleScopes(bundle: ScopeBundle): Scope[] {
  return [...SCOPE_BUNDLES[bundle]];
}
