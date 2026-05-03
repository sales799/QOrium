/**
 * SP metadata generator per `infra/SSO-SAML-Enterprise-Spec-v0.md` §5.
 *
 * Produces a SAML 2.0 SP metadata XML document the tenant uploads to
 * their IdP. Pure logic; no IO. Tests pin the XML contents so any drift
 * is caught.
 */

export interface SpMetadataInputs {
  /** Public-facing entity id, e.g. https://api.qorium.io */
  entityId: string;
  /** ACS endpoint URL */
  acsUrl: string;
  /** SLO endpoint URL (optional) */
  sloUrl?: string;
  /** Display name shown in IdP catalog */
  displayName?: string;
  /** PEM-encoded SP signing certificate (optional). */
  signingCertPem?: string;
  /** Whether to require signed AuthnRequests. Default true. */
  authnRequestsSigned?: boolean;
  /** Whether to require signed assertions. Default true. */
  wantAssertionsSigned?: boolean;
}

export function generateSpMetadataXml(inputs: SpMetadataInputs): string {
  const authnSigned = inputs.authnRequestsSigned !== false;
  const wantSigned = inputs.wantAssertionsSigned !== false;
  const certElement = inputs.signingCertPem
    ? `\n    <KeyDescriptor use="signing">\n      <KeyInfo xmlns="http://www.w3.org/2000/09/xmldsig#">\n        <X509Data><X509Certificate>${stripPem(inputs.signingCertPem)}</X509Certificate></X509Data>\n      </KeyInfo>\n    </KeyDescriptor>`
    : '';
  const sloElement = inputs.sloUrl
    ? `\n    <SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="${escapeXml(inputs.sloUrl)}"/>`
    : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<EntityDescriptor xmlns="urn:oasis:names:tc:SAML:2.0:metadata" entityID="${escapeXml(inputs.entityId)}">
  <SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol" AuthnRequestsSigned="${authnSigned}" WantAssertionsSigned="${wantSigned}">${certElement}
    <NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</NameIDFormat>
    <AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="${escapeXml(inputs.acsUrl)}" index="0" isDefault="true"/>${sloElement}
  </SPSSODescriptor>
${inputs.displayName ? `  <Organization>\n    <OrganizationName xml:lang="en">${escapeXml(inputs.displayName)}</OrganizationName>\n    <OrganizationDisplayName xml:lang="en">${escapeXml(inputs.displayName)}</OrganizationDisplayName>\n    <OrganizationURL xml:lang="en">${escapeXml(inputs.entityId)}</OrganizationURL>\n  </Organization>\n` : ''}</EntityDescriptor>
`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function stripPem(pem: string): string {
  return pem
    .replace(/-----BEGIN [^-]+-----/g, '')
    .replace(/-----END [^-]+-----/g, '')
    .replace(/\s+/g, '');
}
