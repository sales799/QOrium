import { describe, expect, it } from 'vitest';
import {
  buildAuthorizeUrl,
  decodeIdTokenClaims,
  exchangeCode,
  generatePkce,
  generateState,
  inMemoryStateStore,
  type OidcConfig,
} from '../src/oidc';
import { createHash } from 'node:crypto';

const CONFIG: OidcConfig = {
  issuer: 'https://example.okta.com/oauth2/default',
  clientId: 'client-1',
  clientSecret: 'secret-1',
  redirectUri: 'https://api.qorium.online/v1/auth/oidc/callback',
  authorizeEndpoint: 'https://example.okta.com/oauth2/default/v1/authorize',
  tokenEndpoint: 'https://example.okta.com/oauth2/default/v1/token',
};

describe('generateState', () => {
  it('produces a base64url string', () => {
    const s = generateState();
    expect(s).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(s.length).toBeGreaterThan(20);
  });
  it('returns different values across calls', () => {
    expect(generateState()).not.toBe(generateState());
  });
});

describe('generatePkce', () => {
  it('produces an S256 code_challenge derived from the verifier', () => {
    const pair = generatePkce();
    expect(pair.codeChallengeMethod).toBe('S256');
    const expected = Buffer.from(createHash('sha256').update(pair.codeVerifier).digest())
      .toString('base64')
      .replace(/=+$/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    expect(pair.codeChallenge).toBe(expected);
  });
});

describe('buildAuthorizeUrl', () => {
  it('builds the IdP authorize URL with required OIDC params', () => {
    const pkce = generatePkce();
    const state = generateState();
    const url = buildAuthorizeUrl({ config: CONFIG, state, pkce });
    expect(url).toContain('response_type=code');
    expect(url).toContain('client_id=client-1');
    expect(url).toContain(`state=${state}`);
    expect(url).toContain('code_challenge_method=S256');
    expect(url).toContain('scope=openid+profile+email');
  });

  it('includes login_hint when provided', () => {
    const url = buildAuthorizeUrl({
      config: CONFIG,
      state: 's',
      pkce: generatePkce(),
      loginHint: 'alice@acme.com',
    });
    expect(url).toContain('login_hint=alice%40acme.com');
  });
});

describe('inMemoryStateStore', () => {
  it('round-trips state once + then evicts', () => {
    const store = inMemoryStateStore();
    store.put({
      state: 's1',
      codeVerifier: 'v1',
      tenantId: '11111111-2222-3333-4444-555555555555',
      createdAtMs: Date.now(),
    });
    const first = store.consume('s1');
    expect(first?.state).toBe('s1');
    expect(store.consume('s1')).toBe(null);
  });

  it('returns null after TTL expiry', () => {
    const store = inMemoryStateStore();
    store.put({
      state: 's2',
      codeVerifier: 'v2',
      tenantId: '11111111-2222-3333-4444-555555555555',
      createdAtMs: Date.now() - 10 * 60_000,
      ttlMs: 60_000,
    });
    expect(store.consume('s2')).toBe(null);
  });

  it('returns null for unknown state', () => {
    expect(inMemoryStateStore().consume('nope')).toBe(null);
  });
});

describe('exchangeCode', () => {
  it('POSTs the code + verifier to the token endpoint', async () => {
    let captured: { url: string; body: string } | null = null;
    const fetchImpl: typeof fetch = async (url, init) => {
      captured = { url: String(url), body: String(init?.body ?? '') };
      return new Response(
        JSON.stringify({
          access_token: 'a',
          id_token: 'i.j.k',
          token_type: 'Bearer',
          expires_in: 3600,
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    };
    const result = await exchangeCode({
      config: CONFIG,
      code: 'auth-code',
      codeVerifier: 'verifier',
      fetchImpl,
    });
    expect(result.ok).toBe(true);
    expect(result.tokens?.id_token).toBe('i.j.k');
    expect(captured?.url).toBe(CONFIG.tokenEndpoint);
    expect(captured?.body).toContain('grant_type=authorization_code');
    expect(captured?.body).toContain('code=auth-code');
    expect(captured?.body).toContain('code_verifier=verifier');
  });

  it('returns ok=false on token endpoint error', async () => {
    const fetchImpl: typeof fetch = async () =>
      new Response('{"error":"invalid_grant"}', { status: 400 });
    const result = await exchangeCode({
      config: CONFIG,
      code: 'bad-code',
      codeVerifier: 'verifier',
      fetchImpl,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/HTTP 400/);
  });

  it('returns ok=false on network error', async () => {
    const fetchImpl: typeof fetch = async () => {
      throw new Error('connection refused');
    };
    const result = await exchangeCode({
      config: CONFIG,
      code: 'x',
      codeVerifier: 'v',
      fetchImpl,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('connection refused');
  });

  it('returns ok=false when token response is missing id_token', async () => {
    const fetchImpl: typeof fetch = async () =>
      new Response(JSON.stringify({ access_token: 'a' }), { status: 200 });
    const result = await exchangeCode({
      config: CONFIG,
      code: 'x',
      codeVerifier: 'v',
      fetchImpl,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/missing id_token/);
  });
});

describe('decodeIdTokenClaims', () => {
  it('returns the JSON payload of the JWT', () => {
    const payload = { sub: 'user-1', email: 'alice@acme.com' };
    const seg = Buffer.from(JSON.stringify(payload))
      .toString('base64')
      .replace(/=+$/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    const token = `header.${seg}.sig`;
    expect(decodeIdTokenClaims(token)).toEqual(payload);
  });
  it('returns null on malformed token', () => {
    expect(decodeIdTokenClaims('not-a-jwt')).toBe(null);
  });
});
