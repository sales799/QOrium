import { describe, expect, it } from 'vitest';
import { isValidTenantId, resolveAdminTenantId } from '../src/lib/tenant';

describe('isValidTenantId', () => {
  it('accepts a canonical UUID v4', () => {
    expect(isValidTenantId('11111111-2222-3333-4444-555555555555')).toBe(true);
  });
  it('rejects non-UUIDs', () => {
    expect(isValidTenantId('not-a-uuid')).toBe(false);
    expect(isValidTenantId('')).toBe(false);
    expect(isValidTenantId(null)).toBe(false);
    expect(isValidTenantId(undefined)).toBe(false);
    expect(isValidTenantId(123)).toBe(false);
  });
});

describe('resolveAdminTenantId', () => {
  it('returns the env var when valid', () => {
    expect(
      resolveAdminTenantId({
        ADMIN_DEFAULT_TENANT_ID: '11111111-2222-3333-4444-555555555555',
      } as unknown as NodeJS.ProcessEnv),
    ).toBe('11111111-2222-3333-4444-555555555555');
  });
  it('returns null when the env var is missing', () => {
    expect(resolveAdminTenantId({} as unknown as NodeJS.ProcessEnv)).toBe(null);
  });
  it('returns null for a malformed value', () => {
    expect(
      resolveAdminTenantId({ ADMIN_DEFAULT_TENANT_ID: 'bad' } as unknown as NodeJS.ProcessEnv),
    ).toBe(null);
  });
});
