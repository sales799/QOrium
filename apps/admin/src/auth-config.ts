/**
 * Auth scaffold logic, separated from NextAuth wiring so it can be unit-tested
 * without bringing in the full Next.js / NextAuth runtime.
 *
 * QOrium architecture §6.1 specifies email + OTP via MSG91 for admin auth.
 * For Sprint 1.2 scaffold we ship a Credentials-provider stub gated by an
 * email allowlist; real MSG91 (and optional Google OAuth) are activated when
 * credentials are provisioned. See infra/CTO-deltas/CTO-DELTA-admin-auth-provider.md.
 */

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

export function parseEmailAllowlist(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0);
}

export function isEmailAllowed(email: string | undefined | null, allowlist: string[]): boolean {
  if (!email || typeof email !== 'string') return false;
  if (allowlist.length === 0) return false;
  const normalised = email.trim().toLowerCase();
  if (!isWellFormedEmail(normalised)) return false;
  return allowlist.includes(normalised);
}

export function isWellFormedEmail(value: string): boolean {
  // Intentionally minimal — full RFC 5322 isn't needed for an internal allowlist
  // and lax regexes invite injection. Reject anything that isn't ascii local
  // + '@' + ascii host + '.' + tld.
  return /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
}

export function buildAdminUser(email: string): AdminUser {
  const trimmed = email.trim().toLowerCase();
  const localPart = trimmed.split('@')[0] ?? trimmed;
  return { id: trimmed, email: trimmed, name: localPart };
}

/** True iff the path requires an authenticated admin session. */
export function isProtectedPath(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

/** Computes the redirect target for an unauthenticated request to a protected path. */
export function buildLoginRedirect(pathname: string, search: string): string {
  const params = new URLSearchParams();
  if (pathname && pathname !== '/login') params.set('from', pathname + (search || ''));
  const qs = params.toString();
  return qs ? `/login?${qs}` : '/login';
}
