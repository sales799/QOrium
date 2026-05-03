import { describe, expect, it } from 'vitest';
import {
  ALL_FRAGMENTS,
  AUDIT_OPENAPI,
  isValidFragment,
  READYBANK_OPENAPI,
  SSO_OPENAPI,
  WEBHOOKS_OPENAPI,
} from '../src/lib/openapi';

describe('openapi fragments', () => {
  it('every fragment passes isValidFragment', () => {
    for (const f of ALL_FRAGMENTS) {
      expect(isValidFragment(f)).toBe(true);
    }
  });

  it('readybank fragment lists /questions and /questions/{id}', () => {
    const paths = (READYBANK_OPENAPI.spec as { paths: Record<string, unknown> }).paths;
    expect(paths['/questions']).toBeDefined();
    expect(paths['/questions/{id}']).toBeDefined();
  });

  it('webhooks fragment lists subscription endpoints', () => {
    const paths = (WEBHOOKS_OPENAPI.spec as { paths: Record<string, unknown> }).paths;
    expect(paths['/v1/webhooks/subscriptions']).toBeDefined();
    expect(paths['/v1/webhooks/subscriptions/{id}']).toBeDefined();
  });

  it('sso fragment lists metadata + acs + configurations', () => {
    const paths = (SSO_OPENAPI.spec as { paths: Record<string, unknown> }).paths;
    expect(paths['/v1/auth/saml/metadata']).toBeDefined();
    expect(paths['/v1/auth/saml/acs']).toBeDefined();
    expect(paths['/v1/sso/configurations']).toBeDefined();
  });

  it('audit fragment lists events + summary', () => {
    const paths = (AUDIT_OPENAPI.spec as { paths: Record<string, unknown> }).paths;
    expect(paths['/v1/audit/events']).toBeDefined();
    expect(paths['/v1/audit/events/{id}']).toBeDefined();
    expect(paths['/v1/audit/summary']).toBeDefined();
  });

  it('rejects garbage fragments', () => {
    expect(isValidFragment({ service: 'x', spec: {} })).toBe(false);
    expect(isValidFragment({ service: 'x', spec: { openapi: '2.0' } as never })).toBe(false);
  });
});
