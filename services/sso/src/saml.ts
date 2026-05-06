/**
 * SAML 2.0 ACS validator per `infra/SSO-SAML-Enterprise-Spec-v0.md` §7.1.
 *
 * Pure logic. No XML signature verification library is wired in yet — see
 * the CTO-DELTA `CTO-DELTA-sso-idp-credentials-deferred.md`. This module:
 *
 *   1. Parses the SAMLResponse from base64-encoded XML using a tolerant
 *      regex-based extractor (sufficient for the canonical IdP shapes:
 *      Okta, Azure AD, Google Workspace).
 *   2. Validates time window (NotBefore / NotOnOrAfter) with clock skew.
 *   3. Validates audience restriction (must match SP entity id).
 *   4. Validates recipient (must match ACS URL).
 *   5. Pulls NameID + attribute statements into a normalised shape.
 *
 * Cryptographic signature verification is delegated to a pluggable
 * `verifySignature` callback — the live implementation will use
 * passport-saml / xml-crypto with the IdP certificate from
 * `sso.configurations.idp_certificate`.
 */

export interface ParsedSamlAssertion {
  issuer: string;
  nameId: string;
  audience: string;
  recipient: string;
  notBefore: Date | null;
  notOnOrAfter: Date | null;
  inResponseTo: string | null;
  attributes: Record<string, string | string[]>;
}

export interface ValidateAcsInputs {
  /** Raw `SAMLResponse` form value (base64-encoded XML). */
  samlResponse: string;
  /** Expected audience — must equal SP entity id. */
  expectedAudience: string;
  /** Expected recipient — must equal ACS URL. */
  expectedRecipient: string;
  /** Allowed clock skew in seconds. Spec §7.1 implicit → 60s default. */
  clockSkewSec?: number;
  /** Optional signature verifier. Returns true on valid signature. */
  verifySignature?: (xml: string) => boolean;
  /** Override `now` for tests. */
  now?: () => Date;
}

export interface AcsValidationOk {
  ok: true;
  assertion: ParsedSamlAssertion;
}

export interface AcsValidationErr {
  ok: false;
  reason: string;
}

export type AcsValidationResult = AcsValidationOk | AcsValidationErr;

/**
 * Parse + validate a SAMLResponse. Returns either the assertion or the
 * specific reason it was rejected.
 */
export function validateSamlAcs(inputs: ValidateAcsInputs): AcsValidationResult {
  const xml = decodeSamlResponse(inputs.samlResponse);
  if (!xml) return fail('SAMLResponse is not valid base64');

  if (inputs.verifySignature && !inputs.verifySignature(xml)) {
    return fail('SAML assertion signature failed verification');
  }

  const assertion = parseAssertion(xml);
  if (!assertion) return fail('SAMLResponse missing Assertion element');

  if (assertion.audience && assertion.audience !== inputs.expectedAudience) {
    return fail(
      `SAML audience mismatch: expected ${inputs.expectedAudience}, got ${assertion.audience}`,
    );
  }
  if (assertion.recipient && assertion.recipient !== inputs.expectedRecipient) {
    return fail(
      `SAML recipient mismatch: expected ${inputs.expectedRecipient}, got ${assertion.recipient}`,
    );
  }

  const now = (inputs.now ?? (() => new Date()))();
  const skew = (inputs.clockSkewSec ?? 60) * 1_000;
  if (assertion.notBefore && now.getTime() + skew < assertion.notBefore.getTime()) {
    return fail('SAML assertion not yet valid (NotBefore)');
  }
  if (assertion.notOnOrAfter && now.getTime() - skew >= assertion.notOnOrAfter.getTime()) {
    return fail('SAML assertion expired (NotOnOrAfter)');
  }
  if (!assertion.nameId) return fail('SAML assertion missing NameID');

  return { ok: true, assertion };
}

/**
 * Map a raw assertion to a session principal. Applies the tenant's
 * attribute_mapping (group → role) in a small, predictable way; see spec
 * §6 for the v0 set.
 */
export interface AttributeMapping {
  /** Source attribute that holds the user email. Default: 'email'. */
  emailAttr?: string;
  /** Source attribute that holds the user's full name. Default: 'name'. */
  nameAttr?: string;
  /** Source attribute that holds groups. Default: 'groups'. */
  groupsAttr?: string;
  /** group → role overrides. Unmapped groups become 'viewer'. */
  groupToRole?: Record<string, string>;
}

export interface SessionPrincipal {
  subject: string;
  email: string;
  fullName: string | null;
  roles: string[];
  attributes: Record<string, string | string[]>;
}

export function principalFromAssertion(
  assertion: ParsedSamlAssertion,
  mapping: AttributeMapping = {},
): SessionPrincipal {
  const email =
    coerceString(assertion.attributes[mapping.emailAttr ?? 'email']) ?? assertion.nameId;
  const fullName = coerceString(assertion.attributes[mapping.nameAttr ?? 'name']);
  const groups = coerceArray(assertion.attributes[mapping.groupsAttr ?? 'groups']);
  const roleMap = mapping.groupToRole ?? {};
  const roles =
    groups.length > 0 ? Array.from(new Set(groups.map((g) => roleMap[g] ?? 'viewer'))) : ['viewer'];
  return {
    subject: assertion.nameId,
    email,
    fullName,
    roles,
    attributes: assertion.attributes,
  };
}

function fail(reason: string): AcsValidationErr {
  return { ok: false, reason };
}

function decodeSamlResponse(value: string): string | null {
  try {
    const buf = Buffer.from(value, 'base64');
    if (buf.length === 0) return null;
    const text = buf.toString('utf8');
    return text.includes('<') ? text : null;
  } catch {
    return null;
  }
}

function parseAssertion(xml: string): ParsedSamlAssertion | null {
  const issuer = pickTagText(xml, 'Issuer');
  const nameId = pickTagText(xml, 'NameID');
  const audience = pickTagText(xml, 'Audience');
  const subjectConfirm = pickAttr(xml, 'SubjectConfirmationData');
  const conditions = pickAttr(xml, 'Conditions');
  if (!nameId && !issuer) return null;

  const attributes: Record<string, string | string[]> = {};
  for (const m of xml.matchAll(
    /<(?:[a-z0-9]+:)?Attribute\b([^>]*)>([\s\S]*?)<\/(?:[a-z0-9]+:)?Attribute>/gi,
  )) {
    const attrAttrs = m[1] ?? '';
    const attrInner = m[2] ?? '';
    const nameMatch = /\bName\s*=\s*"([^"]+)"/i.exec(attrAttrs);
    if (!nameMatch) continue;
    const name = nameMatch[1] ?? '';
    if (!name) continue;
    const values: string[] = [];
    for (const v of attrInner.matchAll(
      /<(?:[a-z0-9]+:)?AttributeValue[^>]*>([\s\S]*?)<\/(?:[a-z0-9]+:)?AttributeValue>/gi,
    )) {
      values.push(stripXml(v[1] ?? '').trim());
    }
    attributes[name] = values.length === 1 ? (values[0] ?? '') : values;
  }

  return {
    issuer: issuer ?? '',
    nameId: nameId ?? '',
    audience: audience ?? '',
    recipient: subjectConfirm?.Recipient ?? '',
    notBefore: parseDate(conditions?.NotBefore ?? subjectConfirm?.NotBefore),
    notOnOrAfter: parseDate(conditions?.NotOnOrAfter ?? subjectConfirm?.NotOnOrAfter),
    inResponseTo: subjectConfirm?.InResponseTo ?? null,
    attributes,
  };
}

function pickTagText(xml: string, localName: string): string | null {
  const re = new RegExp(
    `<(?:[a-z0-9]+:)?${localName}\\b[^>]*>([\\s\\S]*?)<\\/(?:[a-z0-9]+:)?${localName}>`,
    'i',
  );
  const m = re.exec(xml);
  return m && m[1] !== undefined ? stripXml(m[1]).trim() : null;
}

function pickAttr(xml: string, localName: string): Record<string, string> | null {
  const re = new RegExp(`<(?:[a-z0-9]+:)?${localName}\\b([^>]*)\\/?>`, 'i');
  const m = re.exec(xml);
  if (!m) return null;
  const out: Record<string, string> = {};
  for (const a of (m[1] ?? '').matchAll(/([A-Za-z_:][A-Za-z0-9._:-]*)\s*=\s*"([^"]*)"/g)) {
    out[a[1] ?? ''] = a[2] ?? '';
  }
  return out;
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isFinite(d.getTime()) ? d : null;
}

function stripXml(value: string): string {
  return value
    .replace(/<\/?[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function coerceString(v: string | string[] | undefined): string | null {
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return v[0] ?? null;
  return null;
}

function coerceArray(v: string | string[] | undefined): string[] {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string' && v.length > 0) return [v];
  return [];
}
