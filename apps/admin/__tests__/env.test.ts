import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { assertProdEnv, loadAdminEnv } from '../src/env';

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe('loadAdminEnv', () => {
  it('falls back to a dev stub when AUTH_SECRET is unset', () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = 'development';
    delete process.env.AUTH_SECRET;
    const env = loadAdminEnv();
    expect(env.authSecret).toBe('qorium_dev_auth_secret_replace_in_prod');
    expect(env.nodeEnv).toBe('development');
  });

  it('honours AUTH_SECRET when explicitly set', () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = 'development';
    process.env.AUTH_SECRET = 'override-secret';
    expect(loadAdminEnv().authSecret).toBe('override-secret');
  });

  it('does NOT throw at module load even in production (build-time tolerance)', () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
    delete process.env.AUTH_SECRET;
    expect(() => loadAdminEnv()).not.toThrow();
  });

  it('returns ADMIN_EMAIL_ALLOWLIST raw value when set, undefined when missing', () => {
    process.env.ADMIN_EMAIL_ALLOWLIST = 'alice@talpro.in,bob@talpro.in';
    expect(loadAdminEnv().emailAllowlistRaw).toBe('alice@talpro.in,bob@talpro.in');

    delete process.env.ADMIN_EMAIL_ALLOWLIST;
    expect(loadAdminEnv().emailAllowlistRaw).toBeUndefined();
  });
});

describe('assertProdEnv', () => {
  it('throws in production when AUTH_SECRET is the dev fallback', () => {
    expect(() =>
      assertProdEnv({
        authSecret: 'qorium_dev_auth_secret_replace_in_prod',
        emailAllowlistRaw: undefined,
        nodeEnv: 'production',
      }),
    ).toThrow(/AUTH_SECRET/);
  });

  it('does not throw in production when a real AUTH_SECRET is set', () => {
    expect(() =>
      assertProdEnv({
        authSecret: 'a-real-32-char-secret-from-openssl-rand',
        emailAllowlistRaw: undefined,
        nodeEnv: 'production',
      }),
    ).not.toThrow();
  });

  it('does not throw in development even with the dev fallback', () => {
    expect(() =>
      assertProdEnv({
        authSecret: 'qorium_dev_auth_secret_replace_in_prod',
        emailAllowlistRaw: undefined,
        nodeEnv: 'development',
      }),
    ).not.toThrow();
  });
});
