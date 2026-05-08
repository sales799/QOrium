/**
 * @qorium/saml
 *
 * SAML 2.0 + SCIM 2.0 + OIDC primitives. Sprint 3.3 implementation per
 * `infra/SSO-SAML-Enterprise-Spec-v1.md`.
 *
 * Lexical-only validation — XML parsing + xmldsig signature verification
 * happen upstream in the consumer (xml-crypto / saml2-js). Live IdP
 * integration tests halt on cred-drop per spec §9.
 */

export * from './types.js';
export * from './validate.js';
export * from './jit.js';
export * from './scim-token.js';
export * from './replay-guard.js';
