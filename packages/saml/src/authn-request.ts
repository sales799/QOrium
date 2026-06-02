import { randomUUID } from 'node:crypto';
import { deflateRawSync } from 'node:zlib';

import type { TenantSsoConfig } from './types.js';

const SAML_PROTOCOL_NS = 'urn:oasis:names:tc:SAML:2.0:protocol';
const SAML_ASSERTION_NS = 'urn:oasis:names:tc:SAML:2.0:assertion';

export interface CreateSamlAuthnRequestInput {
  tenant: TenantSsoConfig;
  spEntityId: string;
  spAcsUrl: string;
  relayState?: string;
  forceAuthn?: boolean;
  now?: Date;
  id?: string;
}

export interface SamlAuthnRequest {
  id: string;
  requestXml: string;
  samlRequest: string;
  redirectUrl: string;
}

export function createSamlAuthnRequest(input: CreateSamlAuthnRequestInput): SamlAuthnRequest {
  if (input.tenant.protocol !== 'saml') throw new Error('tenant protocol must be saml');
  if (!input.tenant.idpSsoUrl) throw new Error('tenant idpSsoUrl is required');
  assertHttps(input.tenant.idpSsoUrl, 'tenant idpSsoUrl');
  assertHttps(input.spEntityId, 'spEntityId');
  assertHttps(input.spAcsUrl, 'spAcsUrl');

  const id = input.id ?? `_${randomUUID()}`;
  const issueInstant = (input.now ?? new Date()).toISOString();
  const forceAuthn = input.forceAuthn ? ' ForceAuthn="true"' : '';
  const requestXml = [
    `<samlp:AuthnRequest xmlns:samlp="${SAML_PROTOCOL_NS}" xmlns:saml="${SAML_ASSERTION_NS}"`,
    ` ID="${escapeXml(id)}" Version="2.0" IssueInstant="${escapeXml(issueInstant)}"`,
    ` Destination="${escapeXml(input.tenant.idpSsoUrl)}" AssertionConsumerServiceURL="${escapeXml(input.spAcsUrl)}"${forceAuthn}>`,
    `<saml:Issuer>${escapeXml(input.spEntityId)}</saml:Issuer>`,
    '<samlp:NameIDPolicy Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress" AllowCreate="true"/>',
    '</samlp:AuthnRequest>',
  ].join('');
  const samlRequest = deflateRawSync(Buffer.from(requestXml, 'utf8')).toString('base64');
  const redirect = new URL(input.tenant.idpSsoUrl);
  redirect.searchParams.set('SAMLRequest', samlRequest);
  if (input.relayState) redirect.searchParams.set('RelayState', input.relayState);
  return { id, requestXml, samlRequest, redirectUrl: redirect.toString() };
}

export interface BuildSamlServiceProviderMetadataInput {
  spEntityId: string;
  spAcsUrl: string;
  spSloUrl?: string;
  signingCerts?: string[];
}

export function buildSamlServiceProviderMetadata(
  input: BuildSamlServiceProviderMetadataInput,
): string {
  assertHttps(input.spEntityId, 'spEntityId');
  assertHttps(input.spAcsUrl, 'spAcsUrl');
  if (input.spSloUrl) assertHttps(input.spSloUrl, 'spSloUrl');

  const signingCerts = input.signingCerts ?? [];
  const keyDescriptors = signingCerts
    .map(
      (cert) =>
        `<md:KeyDescriptor use="signing"><ds:KeyInfo><ds:X509Data><ds:X509Certificate>${escapeXml(
          normalizeCertificateBody(cert),
        )}</ds:X509Certificate></ds:X509Data></ds:KeyInfo></md:KeyDescriptor>`,
    )
    .join('');
  const slo = input.spSloUrl
    ? `<md:SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="${escapeXml(
        input.spSloUrl,
      )}"/>`
    : '';

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" entityID="${escapeXml(
      input.spEntityId,
    )}">`,
    `<md:SPSSODescriptor AuthnRequestsSigned="${String(
      signingCerts.length > 0,
    )}" WantAssertionsSigned="true" protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">`,
    keyDescriptors,
    slo,
    `<md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="${escapeXml(
      input.spAcsUrl,
    )}" index="0" isDefault="true"/>`,
    '</md:SPSSODescriptor>',
    '</md:EntityDescriptor>',
  ].join('');
}

function assertHttps(value: string, label: string): void {
  if (!value.startsWith('https://')) throw new Error(`${label} must use https://`);
}

function normalizeCertificateBody(value: string): string {
  return value
    .replace(/-----BEGIN CERTIFICATE-----/g, '')
    .replace(/-----END CERTIFICATE-----/g, '')
    .replace(/\s+/g, '');
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
