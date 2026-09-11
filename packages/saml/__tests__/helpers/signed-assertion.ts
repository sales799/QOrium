import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { SignedXml } from 'xml-crypto';
/** Synthetic ephemeral test identity only. Nothing is written to production configuration. */
export function syntheticIdp() {
  const directory = mkdtempSync(join(tmpdir(), 'qorium-saml-fixture-'));
  let privateKey: string, certificate: string;
  try {
    execFileSync(
      'openssl',
      [
        'req',
        '-x509',
        '-newkey',
        'rsa:2048',
        '-nodes',
        '-keyout',
        join(directory, 'key.pem'),
        '-out',
        join(directory, 'cert.pem'),
        '-days',
        '1',
        '-subj',
        '/CN=Qorium Synthetic Test Only',
      ],
      { stdio: 'ignore' },
    );
    privateKey = readFileSync(join(directory, 'key.pem'), 'utf8');
    certificate = readFileSync(join(directory, 'cert.pem'), 'utf8');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
  return {
    certificate,
    sign(input: { requestId: string; issuer: string; audience: string; recipient: string }) {
      const now = new Date().toISOString(),
        before = new Date(Date.now() - 30000).toISOString(),
        after = new Date(Date.now() + 60000).toISOString();
      const escape = (value: string) =>
        value
          .replaceAll('&', '&amp;')
          .replaceAll('"', '&quot;')
          .replaceAll('<', '&lt;')
          .replaceAll('>', '&gt;');
      const xml = `<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="_${randomUUID()}" Version="2.0" IssueInstant="${now}"><saml:Issuer>${escape(input.issuer)}</saml:Issuer><samlp:Status><samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/></samlp:Status><saml:Assertion ID="_${randomUUID()}" Version="2.0" IssueInstant="${now}"><saml:Issuer>${escape(input.issuer)}</saml:Issuer><saml:Subject><saml:NameID Format="urn:oasis:names:tc:SAML:2.0:nameid-format:persistent">synthetic-subject</saml:NameID><saml:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer"><saml:SubjectConfirmationData InResponseTo="${escape(input.requestId)}" Recipient="${escape(input.recipient)}" NotOnOrAfter="${after}"/></saml:SubjectConfirmation></saml:Subject><saml:Conditions NotBefore="${before}" NotOnOrAfter="${after}"><saml:AudienceRestriction><saml:Audience>${escape(input.audience)}</saml:Audience></saml:AudienceRestriction></saml:Conditions><saml:AttributeStatement><saml:Attribute Name="email"><saml:AttributeValue>synthetic@example.test</saml:AttributeValue></saml:Attribute><saml:Attribute Name="roles"><saml:AttributeValue>admin</saml:AttributeValue></saml:Attribute></saml:AttributeStatement></saml:Assertion></samlp:Response>`;
      const signature = new SignedXml({
        privateKey,
        publicCert: certificate,
        signatureAlgorithm: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256',
        canonicalizationAlgorithm: 'http://www.w3.org/2001/10/xml-exc-c14n#',
      });
      signature.addReference({
        xpath: "//*[local-name(.)='Assertion']",
        digestAlgorithm: 'http://www.w3.org/2001/04/xmlenc#sha256',
        transforms: [
          'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
          'http://www.w3.org/2001/10/xml-exc-c14n#',
        ],
      });
      signature.computeSignature(xml, {
        location: {
          reference: "//*[local-name(.)='Assertion']/*[local-name(.)='Issuer']",
          action: 'after',
        },
      });
      return signature.getSignedXml();
    },
  };
}
