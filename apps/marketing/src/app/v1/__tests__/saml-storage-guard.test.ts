import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@qorium/db', () => ({ createPool: vi.fn(() => ({ syntheticPool: true })) }));
const variables = [
  'DATABASE_URL',
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DB',
];
beforeEach(() => {
  vi.resetModules();
  for (const key of variables) vi.stubEnv(key, '');
  vi.stubEnv('NODE_ENV', 'production');
});
afterEach(() => vi.unstubAllEnvs());
describe('production SAML durable storage requirement', () => {
  it('refuses missing database configuration', async () => {
    const { getOptionalSamlPool } = await import('../auth/saml/_db');
    expect(() => getOptionalSamlPool()).toThrow('SAML persistence unavailable');
  });
  it('refuses partial database configuration', async () => {
    vi.stubEnv('POSTGRES_HOST', 'synthetic.invalid');
    const { getOptionalSamlPool } = await import('../auth/saml/_db');
    expect(() => getOptionalSamlPool()).toThrow('SAML persistence unavailable');
  });
  it('does not reuse a cached development fallback in production', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const { getOptionalSamlPool } = await import('../auth/saml/_db');
    expect(getOptionalSamlPool()).toBeNull();
    vi.stubEnv('NODE_ENV', 'production');
    expect(() => getOptionalSamlPool()).toThrow('SAML persistence unavailable');
  });
  it('preserves the test-only proof fallback', async () => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('QORIUM_SAML_TEST_DATABASE', '0');
    expect((await import('../auth/saml/_db')).getOptionalSamlPool()).toBeNull();
  });
  it('returns a configured pool without treating that as connectivity proof', async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://synthetic.invalid/test');
    expect((await import('../auth/saml/_db')).getOptionalSamlPool()).toEqual({
      syntheticPool: true,
    });
  });
  it('withholds the login redirect when storage is unconfigured', async () => {
    const { GET } = await import('../auth/saml/login/route');
    const res = await GET(new Request('https://qorium.test/v1/auth/saml/login?tenant=acme'));
    expect(res.status).toBe(503);
    expect(res.headers.get('location')).toBeNull();
    expect(res.headers.get('set-cookie')).toBeNull();
    expect((await res.json()).detail).toBe('SAML persistence unavailable. Try again later.');
  });
  it('withholds ACS processing and cookies when storage is unconfigured', async () => {
    const { POST } = await import('../auth/saml/acs/route');
    const res = await POST(
      new Request('https://qorium.test/v1/auth/saml/acs', {
        method: 'POST',
        body: new URLSearchParams({ SAMLResponse: 'synthetic' }),
      }),
    );
    expect(res.status).toBe(503);
    expect(res.headers.get('set-cookie')).toBeNull();
    expect((await res.json()).detail).toBe('SAML persistence unavailable. Try again later.');
  });
});
