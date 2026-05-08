/**
 * SAML 2.0 + SCIM 2.0 types.
 *
 * Models the spec at infra/SSO-SAML-Enterprise-Spec-v1.md. Values flowing
 * across the boundary (raw assertion XML, network IO, IdP metadata) live
 * outside; this module is the typed interior.
 */

export type SsoProtocol = 'saml' | 'oidc' | 'none';
export type SamlAssertionKind = 'authn_request' | 'assertion';
export type AuthSource = 'password' | 'saml-jit' | 'saml-claim' | 'scim' | 'admin';

export interface TenantSsoConfig {
  tenantId: string;
  protocol: SsoProtocol;

  // SAML
  idpEntityId?: string;
  idpSsoUrl?: string;
  idpSloUrl?: string;
  idpSigningCert?: string; // PEM
  idpSigningCertNext?: string; // PEM (rotation overlap)
  idpMetadataUrl?: string;

  // OIDC
  oidcIssuer?: string;
  oidcClientId?: string;
  oidcClientSecretEnc?: string;

  // SCIM
  scimTokenHash?: Buffer;
  scimTokenExpiresAt?: Date;

  // Behaviour
  defaultRedirectPath: string;
  allowJitProvisioning: boolean;
  allowIdpInitiated: boolean;
  deleteUsersAllowed: boolean;
  encryptionRequired: boolean;
}

/**
 * Subset of a SAML Assertion that the SP needs after XML parsing + sig check.
 * Raw XML and signature validation live in the consumer (a real validator
 * uses xmldsig + xml-crypto). This shape is what flows into JIT logic.
 */
export interface ParsedSamlAssertion {
  /** Assertion ID (used for replay guard) */
  id: string;
  /** Issuer EntityID — must match tenant_sso_config.idp_entity_id */
  issuer: string;
  /** NameID value (typically email) */
  nameId: string;
  /** NameID format: EmailAddress, persistent, transient, etc. */
  nameIdFormat: string;
  /** Audience restriction — must match SP entity ID for this tenant */
  audience: string;
  /** NotBefore (ISO timestamp) — assertion not valid before this time */
  notBefore: Date;
  /** NotOnOrAfter (ISO timestamp) — assertion expires at this time */
  notOnOrAfter: Date;
  /** Optional InResponseTo (SP-init only) — must match a known AuthnRequest ID */
  inResponseTo?: string;
  /** Subject confirmation Recipient — must match SP ACS URL */
  recipient: string;
  /** Attribute statements (e.g., email, name, qorium_roles) */
  attributes: Record<string, string[]>;
}

export interface ValidationContext {
  /** SP entity ID for this tenant */
  spEntityId: string;
  /** SP ACS URL (HTTPS) */
  spAcsUrl: string;
  /** Allowed clock-skew tolerance (default 5 min per spec §1.1) */
  maxClockSkewSeconds: number;
  /** Current time (Date.now() typically; injectable for tests) */
  now: Date;
  /** Tenant config (already loaded from DB) */
  tenant: TenantSsoConfig;
  /** AuthnRequest IDs the SP issued recently (for InResponseTo check) */
  knownAuthnRequestIds: ReadonlySet<string>;
  /** Assertion IDs already seen (replay guard) */
  seenAssertionIds: ReadonlySet<string>;
}

export type ValidationFailureCode =
  | 'saml/issuer-mismatch'
  | 'saml/audience-mismatch'
  | 'saml/recipient-mismatch'
  | 'saml/replay-or-stale'
  | 'saml/clock-skew'
  | 'saml/idp-init-disabled'
  | 'saml/in-response-to-unknown'
  | 'saml/jit-disabled'
  | 'saml/missing-attribute';

export interface ValidationFailure {
  ok: false;
  code: ValidationFailureCode;
  message: string;
}

export interface ValidationSuccess {
  ok: true;
  assertion: ParsedSamlAssertion;
  /** Did this assertion arrive without InResponseTo (IdP-init flow)? */
  idpInitiated: boolean;
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

/**
 * SCIM 2.0 User resource subset (per RFC 7643 §4.1).
 * QOrium maps `userName` → recruiters.email, `name.formatted` → name,
 * roles → qorium_roles.
 */
export interface ScimUserResource {
  schemas: string[];
  id?: string;
  externalId?: string;
  userName: string;
  name?: { formatted?: string; givenName?: string; familyName?: string };
  emails?: Array<{ value: string; primary?: boolean; type?: string }>;
  active?: boolean;
  roles?: Array<{ value: string }>;
  meta?: { resourceType: 'User'; created?: string; lastModified?: string };
}

export interface ScimListResponse<T> {
  schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'];
  totalResults: number;
  itemsPerPage: number;
  startIndex: number;
  Resources: T[];
}

export interface ScimError {
  schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'];
  status: string;
  scimType?: string;
  detail: string;
}
