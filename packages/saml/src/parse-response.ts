import { createHash } from 'node:crypto';

import { DOMParser, type Document, type Element, type Node } from '@xmldom/xmldom';
import { SignedXml } from 'xml-crypto';

import type { ParsedSamlAssertion } from './types.js';

const SAML_PROTOCOL_NS = 'urn:oasis:names:tc:SAML:2.0:protocol';
const SAML_ASSERTION_NS = 'urn:oasis:names:tc:SAML:2.0:assertion';
const XMLDSIG_NS = 'http://www.w3.org/2000/09/xmldsig#';
const SUCCESS_STATUS = 'urn:oasis:names:tc:SAML:2.0:status:Success';

interface TrustedCertificate {
  body: string;
  pem: string;
}

export type SamlResponseFailureCode =
  | 'saml/malformed-response'
  | 'saml/signature-missing'
  | 'saml/signature-invalid'
  | 'saml/trusted-cert-missing';

export interface VerifyAndParseSamlResponseInput {
  samlResponse: string;
  trustedCertificates: string[];
}

export interface VerifiedSamlResponse {
  responseId: string;
  assertion: ParsedSamlAssertion;
  signedAssertionId: string;
  trustedCertificateSha256: string;
  responseXml: string;
}

export type VerifyAndParseSamlResponseResult =
  | { ok: true; data: VerifiedSamlResponse }
  | { ok: false; code: SamlResponseFailureCode; message: string };

export function verifyAndParseSamlResponse(
  input: VerifyAndParseSamlResponseInput,
): VerifyAndParseSamlResponseResult {
  const trustedCertificates = input.trustedCertificates
    .map(normalizeTrustedCertificate)
    .filter((certificate): certificate is TrustedCertificate => !!certificate);
  if (trustedCertificates.length === 0) {
    return fail(
      'saml/trusted-cert-missing',
      'At least one trusted IdP signing certificate is required',
    );
  }

  const responseXml = decodeSamlResponse(input.samlResponse);
  if (!responseXml)
    return fail('saml/malformed-response', 'SAMLResponse must be base64-encoded XML');

  const doc = parseXml(responseXml);
  const response = doc.documentElement;
  if (!response)
    return fail('saml/malformed-response', 'SAMLResponse XML did not contain a document element');
  if (!isElementNamed(response, 'Response', SAML_PROTOCOL_NS)) {
    return fail('saml/malformed-response', 'SAMLResponse root must be samlp:Response');
  }

  const responseId = attr(response, 'ID');
  if (!responseId) return fail('saml/malformed-response', 'SAML Response is missing ID');
  const statusCode = firstDescendant(response, 'StatusCode', SAML_PROTOCOL_NS)?.getAttribute(
    'Value',
  );
  if (statusCode !== SUCCESS_STATUS) {
    return fail('saml/malformed-response', 'SAML Response status is not Success');
  }

  const assertions = descendants(response, 'Assertion', SAML_ASSERTION_NS);
  if (assertions.length !== 1) {
    return fail('saml/malformed-response', 'SAML Response must contain exactly one Assertion');
  }

  const assertion = assertions[0];
  if (!assertion) return fail('saml/malformed-response', 'SAML Response assertion is missing');

  const assertionId = attr(assertion, 'ID');
  if (!assertionId) return fail('saml/malformed-response', 'SAML Assertion is missing ID');
  if (countElementsWithId(doc.documentElement, assertionId) !== 1) {
    return fail('saml/malformed-response', 'SAML Assertion ID must be unique in the response');
  }

  const signature = directChild(assertion, 'Signature', XMLDSIG_NS);
  if (!signature)
    return fail('saml/signature-missing', 'SAML Assertion must carry an XMLDSig signature');
  const referenceUri = firstDescendant(signature, 'Reference', XMLDSIG_NS)?.getAttribute('URI');
  if (referenceUri !== `#${assertionId}`) {
    return fail('saml/signature-invalid', 'SAML signature must reference the signed Assertion ID');
  }

  const trustedCertificate = trustedCertificates.find((certificate) =>
    verifySignature(responseXml, signature, certificate),
  );
  if (!trustedCertificate) {
    return fail(
      'saml/signature-invalid',
      'SAML Assertion signature did not verify with trusted IdP certificate',
    );
  }

  const parsedAssertion = parseAssertion(assertion);
  if (!parsedAssertion) {
    return fail(
      'saml/malformed-response',
      'SAML Assertion is missing required subject or condition fields',
    );
  }

  return {
    ok: true,
    data: {
      responseId,
      assertion: parsedAssertion,
      signedAssertionId: assertionId,
      trustedCertificateSha256: certificateSha256(trustedCertificate.body),
      responseXml,
    },
  };
}

function parseAssertion(assertion: Element): ParsedSamlAssertion | null {
  const id = attr(assertion, 'ID');
  const issuer = directChildText(assertion, 'Issuer', SAML_ASSERTION_NS);
  const nameId = firstDescendantText(assertion, 'NameID', SAML_ASSERTION_NS);
  const nameIdFormat = firstDescendant(assertion, 'NameID', SAML_ASSERTION_NS)?.getAttribute(
    'Format',
  );
  const audience = firstDescendantText(assertion, 'Audience', SAML_ASSERTION_NS);
  const confirmation = firstDescendant(assertion, 'SubjectConfirmationData', SAML_ASSERTION_NS);
  const conditions = firstDescendant(assertion, 'Conditions', SAML_ASSERTION_NS);
  const recipient = confirmation?.getAttribute('Recipient');
  const notBefore = conditions?.getAttribute('NotBefore');
  const notOnOrAfter =
    conditions?.getAttribute('NotOnOrAfter') ?? confirmation?.getAttribute('NotOnOrAfter');

  if (
    !id ||
    !issuer ||
    !nameId ||
    !nameIdFormat ||
    !audience ||
    !recipient ||
    !notBefore ||
    !notOnOrAfter
  ) {
    return null;
  }

  const parsedNotBefore = parseSamlDate(notBefore);
  const parsedNotOnOrAfter = parseSamlDate(notOnOrAfter);
  if (!parsedNotBefore || !parsedNotOnOrAfter) return null;

  const parsed: ParsedSamlAssertion = {
    id,
    issuer,
    nameId,
    nameIdFormat,
    audience,
    notBefore: parsedNotBefore,
    notOnOrAfter: parsedNotOnOrAfter,
    recipient,
    attributes: parseAttributes(assertion),
  };
  const inResponseTo = confirmation?.getAttribute('InResponseTo');
  if (inResponseTo) parsed.inResponseTo = inResponseTo;
  return parsed;
}

function parseAttributes(assertion: Element): Record<string, string[]> {
  const attributes: Record<string, string[]> = {};
  for (const attribute of descendants(assertion, 'Attribute', SAML_ASSERTION_NS)) {
    const name = attribute.getAttribute('Name');
    if (!name) continue;
    attributes[name] = directChildren(attribute, 'AttributeValue', SAML_ASSERTION_NS)
      .map((value) => text(value))
      .filter((value) => value.length > 0);
  }
  return attributes;
}

function verifySignature(
  xml: string,
  signature: Element,
  certificate: TrustedCertificate,
): boolean {
  try {
    const verifier = new SignedXml({ publicCert: certificate.pem, getCertFromKeyInfo: () => null });
    verifier.loadSignature(signature);
    return verifier.checkSignature(xml);
  } catch {
    return false;
  }
}

function parseXml(xml: string): Document {
  return new DOMParser().parseFromString(xml, 'text/xml');
}

function decodeSamlResponse(value: string): string | null {
  try {
    const xml = Buffer.from(value, 'base64').toString('utf8').trim();
    return xml.startsWith('<') ? xml : null;
  } catch {
    return null;
  }
}

function normalizeTrustedCertificate(value: string): TrustedCertificate | null {
  const body = value
    .replace(/-----BEGIN CERTIFICATE-----/g, '')
    .replace(/-----END CERTIFICATE-----/g, '')
    .replace(/-----BEGIN PUBLIC KEY-----/g, '')
    .replace(/-----END PUBLIC KEY-----/g, '')
    .replace(/\s+/g, '');
  if (!body) return null;
  const pem = value.includes('BEGIN PUBLIC KEY')
    ? `-----BEGIN PUBLIC KEY-----\n${body}\n-----END PUBLIC KEY-----`
    : `-----BEGIN CERTIFICATE-----\n${body}\n-----END CERTIFICATE-----`;
  return { body, pem };
}

function fail(code: SamlResponseFailureCode, message: string): VerifyAndParseSamlResponseResult {
  return { ok: false, code, message };
}

function descendants(element: Element, localName: string, namespaceUri: string): Element[] {
  const elements: Element[] = [];
  const nodes = element.getElementsByTagNameNS(namespaceUri, localName);
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes.item(index);
    if (node && node.nodeType === 1) elements.push(node as Element);
  }
  return elements;
}

function directChildren(element: Element, localName: string, namespaceUri: string): Element[] {
  const children: Element[] = [];
  for (let index = 0; index < element.childNodes.length; index += 1) {
    const node = element.childNodes.item(index);
    if (node && node.nodeType === 1 && isElementNamed(node as Element, localName, namespaceUri))
      children.push(node as Element);
  }
  return children;
}

function directChild(
  element: Element,
  localName: string,
  namespaceUri: string,
): Element | undefined {
  return directChildren(element, localName, namespaceUri)[0];
}

function firstDescendant(
  element: Element,
  localName: string,
  namespaceUri: string,
): Element | undefined {
  return descendants(element, localName, namespaceUri)[0];
}

function directChildText(
  element: Element,
  localName: string,
  namespaceUri: string,
): string | undefined {
  const value = directChild(element, localName, namespaceUri);
  return value ? text(value) : undefined;
}

function firstDescendantText(
  element: Element,
  localName: string,
  namespaceUri: string,
): string | undefined {
  const value = firstDescendant(element, localName, namespaceUri);
  return value ? text(value) : undefined;
}

function text(element: Element): string {
  return (element.textContent ?? '').trim();
}

function isElementNamed(element: Element, localName: string, namespaceUri: string): boolean {
  return element.localName === localName && element.namespaceURI === namespaceUri;
}

function attr(element: Element, name: string): string | null {
  return element.getAttribute(name);
}

function countElementsWithId(node: Node, id: string): number {
  let count = node.nodeType === 1 && (node as Element).getAttribute('ID') === id ? 1 : 0;
  for (let index = 0; index < node.childNodes.length; index += 1) {
    const child = node.childNodes.item(index);
    if (child) count += countElementsWithId(child, id);
  }
  return count;
}

function parseSamlDate(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function certificateSha256(body: string): string {
  return createHash('sha256').update(body).digest('hex');
}
