import { describe, expect, it } from 'vitest';
import { principalFromAssertion, validateSamlAcs } from '../src/saml.js';

const ACS_URL = 'https://api.qorium.online/v1/auth/saml/acs';
const ENTITY_ID = 'https://api.qorium.online';

function fixtureXml(
  opts: {
    notBefore?: string;
    notOnOrAfter?: string;
    audience?: string;
    recipient?: string;
    email?: string;
    groups?: string[];
    name?: string;
  } = {},
): string {
  const notBefore = opts.notBefore ?? '2026-05-01T12:00:00Z';
  const notOnOrAfter = opts.notOnOrAfter ?? '2026-05-01T13:00:00Z';
  const audience = opts.audience ?? ENTITY_ID;
  const recipient = opts.recipient ?? ACS_URL;
  const email = opts.email ?? 'alice@acme.com';
  const groups = opts.groups ?? ['acme_admins'];
  const name = opts.name ?? 'Alice Acme';
  const groupValues = groups.map((g) => `<saml:AttributeValue>${g}</saml:AttributeValue>`).join('');
  return `<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">
  <saml:Assertion>
    <saml:Issuer>https://idp.acme.com/saml</saml:Issuer>
    <saml:Subject>
      <saml:NameID>${email}</saml:NameID>
      <saml:SubjectConfirmation>
        <saml:SubjectConfirmationData NotBefore="${notBefore}" NotOnOrAfter="${notOnOrAfter}" Recipient="${recipient}" InResponseTo="req-1"/>
      </saml:SubjectConfirmation>
    </saml:Subject>
    <saml:Conditions NotBefore="${notBefore}" NotOnOrAfter="${notOnOrAfter}">
      <saml:AudienceRestriction>
        <saml:Audience>${audience}</saml:Audience>
      </saml:AudienceRestriction>
    </saml:Conditions>
    <saml:AttributeStatement>
      <saml:Attribute Name="email"><saml:AttributeValue>${email}</saml:AttributeValue></saml:Attribute>
      <saml:Attribute Name="name"><saml:AttributeValue>${name}</saml:AttributeValue></saml:Attribute>
      <saml:Attribute Name="groups">${groupValues}</saml:Attribute>
    </saml:AttributeStatement>
  </saml:Assertion>
</samlp:Response>`;
}

const fixtureAt = new Date('2026-05-01T12:30:00Z');

describe('validateSamlAcs', () => {
  it('accepts a well-formed assertion in the time window', () => {
    const xml = fixtureXml({ groups: ['acme_admins', 'acme_reviewers'] });
    const samlResponse = Buffer.from(xml).toString('base64');
    const result = validateSamlAcs({
      samlResponse,
      expectedAudience: ENTITY_ID,
      expectedRecipient: ACS_URL,
      now: () => fixtureAt,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.assertion.nameId).toBe('alice@acme.com');
      expect(result.assertion.audience).toBe(ENTITY_ID);
      expect(result.assertion.recipient).toBe(ACS_URL);
      expect(result.assertion.attributes.email).toBe('alice@acme.com');
      expect(result.assertion.attributes.groups).toEqual(['acme_admins', 'acme_reviewers']);
    }
  });

  it('rejects when audience does not match SP entity id', () => {
    const xml = fixtureXml({ audience: 'https://attacker.example.com' });
    const samlResponse = Buffer.from(xml).toString('base64');
    const result = validateSamlAcs({
      samlResponse,
      expectedAudience: ENTITY_ID,
      expectedRecipient: ACS_URL,
      now: () => fixtureAt,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/audience mismatch/);
  });

  it('rejects when recipient does not match ACS URL', () => {
    const xml = fixtureXml({ recipient: 'https://api.qorium.online/wrong' });
    const samlResponse = Buffer.from(xml).toString('base64');
    const result = validateSamlAcs({
      samlResponse,
      expectedAudience: ENTITY_ID,
      expectedRecipient: ACS_URL,
      now: () => fixtureAt,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/recipient mismatch/);
  });

  it('rejects an expired assertion', () => {
    const xml = fixtureXml({
      notBefore: '2026-05-01T10:00:00Z',
      notOnOrAfter: '2026-05-01T11:00:00Z',
    });
    const samlResponse = Buffer.from(xml).toString('base64');
    const result = validateSamlAcs({
      samlResponse,
      expectedAudience: ENTITY_ID,
      expectedRecipient: ACS_URL,
      now: () => fixtureAt,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/expired/);
  });

  it('rejects a not-yet-valid assertion', () => {
    const xml = fixtureXml({
      notBefore: '2026-05-01T14:00:00Z',
      notOnOrAfter: '2026-05-01T15:00:00Z',
    });
    const samlResponse = Buffer.from(xml).toString('base64');
    const result = validateSamlAcs({
      samlResponse,
      expectedAudience: ENTITY_ID,
      expectedRecipient: ACS_URL,
      now: () => fixtureAt,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/not yet valid/);
  });

  it('runs the injected signature verifier and rejects on failure', () => {
    const xml = fixtureXml();
    const samlResponse = Buffer.from(xml).toString('base64');
    const result = validateSamlAcs({
      samlResponse,
      expectedAudience: ENTITY_ID,
      expectedRecipient: ACS_URL,
      verifySignature: () => false,
      now: () => fixtureAt,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/signature/);
  });

  it('rejects garbage base64', () => {
    const result = validateSamlAcs({
      samlResponse: '@@@not-base64@@@',
      expectedAudience: ENTITY_ID,
      expectedRecipient: ACS_URL,
      now: () => fixtureAt,
    });
    expect(result.ok).toBe(false);
  });
});

describe('principalFromAssertion', () => {
  it('maps groups to roles when a mapping is provided', () => {
    const xml = fixtureXml({ groups: ['acme_admins', 'acme_reviewers', 'unknown'] });
    const samlResponse = Buffer.from(xml).toString('base64');
    const result = validateSamlAcs({
      samlResponse,
      expectedAudience: ENTITY_ID,
      expectedRecipient: ACS_URL,
      now: () => fixtureAt,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const principal = principalFromAssertion(result.assertion, {
      groupToRole: { acme_admins: 'admin', acme_reviewers: 'reviewer' },
    });
    expect(principal.email).toBe('alice@acme.com');
    expect(principal.fullName).toBe('Alice Acme');
    expect(principal.roles.sort()).toEqual(['admin', 'reviewer', 'viewer']);
  });

  it('defaults to viewer when no groups are present', () => {
    const xml = fixtureXml({ groups: [] });
    const samlResponse = Buffer.from(xml).toString('base64');
    const result = validateSamlAcs({
      samlResponse,
      expectedAudience: ENTITY_ID,
      expectedRecipient: ACS_URL,
      now: () => fixtureAt,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const p = principalFromAssertion(result.assertion);
    expect(p.roles).toEqual(['viewer']);
  });
});
