import { describe, expect, it } from 'vitest';
import { bundleScopes, enforceScope, isScope, SCOPE_BUNDLES, SCOPES } from '../src/scopes';

describe('SCOPES catalogue', () => {
  it('contains the core D3-required scopes', () => {
    const set = new Set<string>(SCOPES);
    expect(set.has('questions:read')).toBe(true);
    expect(set.has('export:bulk:csv')).toBe(true);
    expect(set.has('export:bulk:json')).toBe(true);
    expect(set.has('responses:write')).toBe(true);
  });
  it('isScope is exhaustive over the catalogue', () => {
    for (const s of SCOPES) expect(isScope(s)).toBe(true);
    expect(isScope('made.up.scope')).toBe(false);
  });
});

describe('enforceScope', () => {
  it('passes when the literal scope is granted', () => {
    expect(enforceScope(['questions:read'], 'questions:read').ok).toBe(true);
  });
  it('fails when the scope is missing', () => {
    expect(enforceScope(['questions:read'], 'admin:keys').ok).toBe(false);
  });
  it('passes via wildcard prefix', () => {
    expect(enforceScope(['admin:*'], 'admin:keys').ok).toBe(true);
    expect(enforceScope(['export:*'], 'export:bulk:csv').ok).toBe(true);
  });
  it('does not over-match other prefixes', () => {
    expect(enforceScope(['export:*'], 'admin:keys').ok).toBe(false);
  });
});

describe('SCOPE_BUNDLES', () => {
  it('talpro_internal matches D3 §3 verbatim', () => {
    const bundle = bundleScopes('talpro_internal');
    expect(bundle).toEqual([
      'questions:read',
      'search:read',
      'export:bulk:csv',
      'export:bulk:json',
      'responses:write',
    ]);
  });
  it('full_admin includes admin scopes', () => {
    expect(bundleScopes('full_admin')).toContain('admin:keys');
  });
  it('readonly grants only read scopes', () => {
    const bundle = bundleScopes('readonly');
    for (const s of bundle) expect(s.endsWith(':read')).toBe(true);
  });
  it('SCOPE_BUNDLES catalogue is non-empty', () => {
    expect(Object.keys(SCOPE_BUNDLES)).toContain('talpro_internal');
    expect(Object.keys(SCOPE_BUNDLES)).toContain('readybank_customer');
  });
});
