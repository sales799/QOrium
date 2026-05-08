/**
 * Lexical SAML assertion validator.
 *
 * Implements the post-XMLDSig checks from spec §1.1 + §1.3 + §2.4:
 *   - Issuer matches tenant.idpEntityId
 *   - Audience matches SP entity ID
 *   - Recipient matches SP ACS URL
 *   - NotBefore ≤ now + skew, now ≤ NotOnOrAfter + skew
 *   - Replay: assertion ID not in seenAssertionIds
 *   - SP-init: InResponseTo must match an AuthnRequest the SP recently issued
 *   - IdP-init: assertion has no InResponseTo AND tenant.allowIdpInitiated
 *
 * NOTE: XML parsing + xmldsig signature verification happens upstream
 * (e.g., xml-crypto or saml2-js). This module assumes a correctly parsed
 * + signature-verified ParsedSamlAssertion; it enforces the boundary
 * conditions that fail closed.
 */

import type { ParsedSamlAssertion, ValidationContext, ValidationResult } from './types.js';

export function validateAssertion(
  assertion: ParsedSamlAssertion,
  ctx: ValidationContext,
): ValidationResult {
  const tenant = ctx.tenant;

  // 1. Issuer check: assertion came from THIS tenant's IdP
  if (!tenant.idpEntityId || assertion.issuer !== tenant.idpEntityId) {
    return {
      ok: false,
      code: 'saml/issuer-mismatch',
      message: `Issuer ${assertion.issuer} does not match tenant IdP ${tenant.idpEntityId ?? '<unset>'}`,
    };
  }

  // 2. Audience: SP entity ID for this tenant
  if (assertion.audience !== ctx.spEntityId) {
    return {
      ok: false,
      code: 'saml/audience-mismatch',
      message: `Audience ${assertion.audience} does not match SP entity ID ${ctx.spEntityId}`,
    };
  }

  // 3. Recipient: must be the ACS URL we expect
  if (assertion.recipient !== ctx.spAcsUrl) {
    return {
      ok: false,
      code: 'saml/recipient-mismatch',
      message: `Recipient ${assertion.recipient} does not match SP ACS URL ${ctx.spAcsUrl}`,
    };
  }

  // 4. Clock skew: assertion must be currently valid
  const skewMs = ctx.maxClockSkewSeconds * 1000;
  const nowMs = ctx.now.getTime();
  if (assertion.notBefore.getTime() - nowMs > skewMs) {
    return {
      ok: false,
      code: 'saml/clock-skew',
      message: `NotBefore ${assertion.notBefore.toISOString()} is in the future beyond ${ctx.maxClockSkewSeconds}s skew`,
    };
  }
  if (nowMs - assertion.notOnOrAfter.getTime() > skewMs) {
    return {
      ok: false,
      code: 'saml/clock-skew',
      message: `NotOnOrAfter ${assertion.notOnOrAfter.toISOString()} expired beyond ${ctx.maxClockSkewSeconds}s skew`,
    };
  }

  // 5. Replay guard
  if (ctx.seenAssertionIds.has(assertion.id)) {
    return {
      ok: false,
      code: 'saml/replay-or-stale',
      message: `Assertion ID ${assertion.id} has already been consumed`,
    };
  }

  // 6. Flow type: SP-init vs IdP-init
  const idpInitiated = !assertion.inResponseTo;
  if (idpInitiated) {
    if (!tenant.allowIdpInitiated) {
      return {
        ok: false,
        code: 'saml/idp-init-disabled',
        message: 'IdP-initiated SSO is disabled for this tenant (allow_idp_initiated=false)',
      };
    }
  } else {
    // SP-init: must match an AuthnRequest the SP recently issued
    if (!ctx.knownAuthnRequestIds.has(assertion.inResponseTo!)) {
      return {
        ok: false,
        code: 'saml/in-response-to-unknown',
        message: `InResponseTo ${assertion.inResponseTo} matches no known AuthnRequest (CSRF guard)`,
      };
    }
  }

  return { ok: true, assertion, idpInitiated };
}

/**
 * Helper: extract the email NameID with format-aware fallback.
 * Spec §2.1 requires a stable subject identifier; email is the canonical
 * QOrium choice. If NameID format is `persistent` we still treat the
 * value as opaque and require the `email` attribute to be present.
 */
export function extractStableEmail(assertion: ParsedSamlAssertion): string | undefined {
  if (assertion.nameIdFormat.includes('emailAddress') && assertion.nameId.includes('@')) {
    return assertion.nameId.toLowerCase().trim();
  }
  // Look for explicit `email` attribute
  const emailAttr = assertion.attributes['email']?.[0];
  if (emailAttr && emailAttr.includes('@')) {
    return emailAttr.toLowerCase().trim();
  }
  return undefined;
}
