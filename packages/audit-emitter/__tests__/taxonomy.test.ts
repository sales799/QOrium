import { describe, expect, it } from 'vitest';
import { AUDIT_ACTIONS, actionResource, actionsFor, isKnownAction } from '../src/taxonomy';

describe('AUDIT_ACTIONS catalogue', () => {
  it('exposes the nine resource buckets we intentionally ship', () => {
    const keys = Object.keys(AUDIT_ACTIONS).sort();
    expect(keys).toEqual(
      [
        'api_key',
        'ats',
        'billing',
        'pack',
        'question',
        'secret',
        'session',
        'sso',
        'webhooks',
      ].sort(),
    );
  });

  it('every action follows the resource.verb naming convention', () => {
    for (const [resource, actions] of Object.entries(AUDIT_ACTIONS)) {
      for (const action of actions) {
        expect(action.startsWith(`${resource}.`)).toBe(true);
        expect(action.split('.').length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('catalogue has no duplicate action names', () => {
    const all = Object.values(AUDIT_ACTIONS).flat();
    expect(new Set(all).size).toBe(all.length);
  });
});

describe('isKnownAction', () => {
  it('returns true for canonical actions', () => {
    expect(isKnownAction('api_key.created')).toBe(true);
    expect(isKnownAction('billing.invoice.paid')).toBe(true);
  });

  it('returns false for ad-hoc actions', () => {
    expect(isKnownAction('foo.bar')).toBe(false);
    expect(isKnownAction('')).toBe(false);
  });
});

describe('actionResource', () => {
  it('returns the resource prefix for canonical actions', () => {
    expect(actionResource('api_key.created')).toBe('api_key');
    expect(actionResource('billing.invoice.paid')).toBe('billing');
  });

  it('returns null for unknown prefixes', () => {
    expect(actionResource('foo.bar')).toBe(null);
    expect(actionResource('no-dot')).toBe(null);
  });
});

describe('actionsFor', () => {
  it('returns the readonly list per resource', () => {
    const apiKeyActions = actionsFor('api_key');
    expect(apiKeyActions).toContain('api_key.created');
    expect(apiKeyActions).toContain('api_key.rotated');
  });
});
