/**
 * Tenant resolution for the admin UI.
 *
 * v0 admin sessions are scoped to a single QOrium tenant per logged-in
 * SME / operator. Until tenant<>user binding lands, the admin app falls
 * back to an env-configured default tenant id so the dashboards render
 * something meaningful in dev. Real prod resolution will pull the
 * tenant from the JWT issued by the SSO service.
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function resolveAdminTenantId(env: NodeJS.ProcessEnv = process.env): string | null {
  const v = env.ADMIN_DEFAULT_TENANT_ID;
  if (v && UUID_REGEX.test(v)) return v;
  return null;
}

export function isValidTenantId(value: unknown): value is string {
  return typeof value === 'string' && UUID_REGEX.test(value);
}
