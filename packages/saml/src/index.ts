/**
 * @qorium/saml
 *
 * SAML 2.0 + SCIM 2.0 + OIDC primitives. Sprint 3.3 implementation per
 * `infra/SSO-SAML-Enterprise-Spec-v1.md`.
 *
 * Includes lexical validation, AuthnRequest generation, and signed SAMLResponse
 * parsing with XMLDSig verification. Live IdP integration tests halt on
 * cred-drop per spec §9.
 */

export * from './types.js';
export * from './validate.js';
export * from './authn-request.js';
export * from './parse-response.js';
export * from './jit.js';
export * from './scim-token.js';
export * from './replay-guard.js';
