/**
 * JIT (Just-In-Time) provisioning per spec §2.
 *
 * On first SAML login for a tenant where `allow_jit_provisioning=true`:
 *   - Email already exists in app.recruiters → claim (mark auth_source=saml-claim)
 *   - Email new → create (auth_source=saml-jit)
 *
 * NameID conflict resolution per spec §2.4:
 *   - First successful JIT pins the NameID to that recruiter row
 *   - Future logins from a DIFFERENT NameID-but-same-email → 401 jit/id-mismatch
 */

import type { AuthSource, ParsedSamlAssertion, TenantSsoConfig } from './types.js';
import { extractStableEmail } from './validate.js';

export type JitDecision =
  | {
      kind: 'create';
      email: string;
      name?: string;
      roles: string[];
      pinnedNameId: string;
      authSource: 'saml-jit';
    }
  | {
      kind: 'claim';
      email: string;
      name?: string;
      roles: string[];
      pinnedNameId: string;
      authSource: 'saml-claim';
    }
  | {
      kind: 'login';
      email: string;
      authSource: AuthSource;
    }
  | {
      kind: 'reject';
      code: 'saml/jit-disabled' | 'saml/missing-attribute' | 'saml/jit-id-mismatch';
      message: string;
    };

/**
 * Pure decision function. Caller maps to DB writes. Tests run without DB.
 */
export function resolveJit(
  assertion: ParsedSamlAssertion,
  tenant: TenantSsoConfig,
  /** Existing recruiter row in app.recruiters keyed by email (or undefined) */
  existing: { email: string; pinnedNameId: string | null } | undefined,
): JitDecision {
  const email = extractStableEmail(assertion);
  if (!email) {
    return {
      kind: 'reject',
      code: 'saml/missing-attribute',
      message: 'Assertion has no usable email NameID or email attribute',
    };
  }

  const name = assertion.attributes['name']?.[0];
  const roles = assertion.attributes['qorium_roles'] ?? assertion.attributes['roles'] ?? [];

  if (!existing) {
    if (!tenant.allowJitProvisioning) {
      return {
        kind: 'reject',
        code: 'saml/jit-disabled',
        message:
          'JIT provisioning is disabled for this tenant; no recruiter row exists for this email',
      };
    }
    return {
      kind: 'create',
      email,
      ...(name !== undefined && { name }),
      roles,
      pinnedNameId: assertion.nameId,
      authSource: 'saml-jit',
    };
  }

  // Existing row. If pinnedNameId is null, this is a JIT-claim (first SAML
  // login by an email that was created by a different path — e.g. password
  // signup or admin invite).
  if (existing.pinnedNameId === null) {
    if (!tenant.allowJitProvisioning) {
      return {
        kind: 'reject',
        code: 'saml/jit-disabled',
        message: 'JIT claim requires allow_jit_provisioning=true',
      };
    }
    return {
      kind: 'claim',
      email,
      ...(name !== undefined && { name }),
      roles,
      pinnedNameId: assertion.nameId,
      authSource: 'saml-claim',
    };
  }

  // Pin already set — must match. Different NameID with same email is
  // a security event (potentially a hostile IdP federating an existing
  // user).
  if (existing.pinnedNameId !== assertion.nameId) {
    return {
      kind: 'reject',
      code: 'saml/jit-id-mismatch',
      message: `NameID mismatch for ${email}: assertion=${assertion.nameId} pinned=${existing.pinnedNameId}`,
    };
  }

  return {
    kind: 'login',
    email,
    authSource: 'saml-jit', // historical; not changed on subsequent logins
  };
}
