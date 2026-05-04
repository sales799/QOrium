/**
 * OIDC Authorization Code + PKCE flow per `infra/SSO-SAML-Enterprise-
 * Spec-v0.md` §2 (OpenID Connect Secondary).
 *
 * Pure logic + an in-memory state store (production swaps for Redis).
 * The Express handler builds the IdP authorize URL, persists the
 * `state` + `code_verifier`, redirects the browser, then on callback
 * exchanges the code for tokens and validates the id_token.
 */

import { createHash, randomBytes, type BinaryToTextEncoding } from 'node:crypto';

export interface OidcConfig {
  /** IdP issuer (e.g. https://example.okta.com/oauth2/default). */
  issuer: string;
  /** OIDC client_id. */
  clientId: string;
  /** OIDC client_secret (used at token exchange). */
  clientSecret: string;
  /** ACS callback URL — must be allowlisted in the IdP. */
  redirectUri: string;
  /** Scopes (default: openid profile email). */
  scopes?: string[];
  /** Authorize endpoint. Discovered from /.well-known by the live impl; static in v0. */
  authorizeEndpoint: string;
  /** Token endpoint. */
  tokenEndpoint: string;
  /** JWKS endpoint (for id_token verification — v0 stub trusts the response). */
  jwksUri?: string;
}

export interface PkcePair {
  codeVerifier: string;
  codeChallenge: string;
  /** Always 'S256' per OIDC best practice. */
  codeChallengeMethod: 'S256';
}

export interface AuthorizeUrlInputs {
  config: OidcConfig;
  state: string;
  pkce: PkcePair;
  /** RelayState equivalent for OIDC: caller can encode where to redirect after callback. */
  loginHint?: string;
}

export interface OidcStateRecord {
  state: string;
  codeVerifier: string;
  tenantId: string;
  createdAtMs: number;
  /** TTL ms; default 5 minutes per spec §7.4. */
  ttlMs?: number;
}

export interface OidcStateStore {
  put(record: OidcStateRecord): void;
  consume(state: string): OidcStateRecord | null;
}

const DEFAULT_TTL_MS = 5 * 60_000;

export function inMemoryStateStore(): OidcStateStore {
  const map = new Map<string, OidcStateRecord>();
  return {
    put(record) {
      map.set(record.state, record);
    },
    consume(state) {
      const record = map.get(state) ?? null;
      if (!record) return null;
      map.delete(state);
      const ttl = record.ttlMs ?? DEFAULT_TTL_MS;
      if (Date.now() - record.createdAtMs > ttl) return null;
      return record;
    },
  };
}

export function generateState(): string {
  return base64url(randomBytes(32));
}

export function generatePkce(): PkcePair {
  const codeVerifier = base64url(randomBytes(32));
  const codeChallenge = base64url(createHash('sha256').update(codeVerifier).digest());
  return { codeVerifier, codeChallenge, codeChallengeMethod: 'S256' };
}

export function buildAuthorizeUrl(inputs: AuthorizeUrlInputs): string {
  const params = new URLSearchParams();
  params.set('response_type', 'code');
  params.set('client_id', inputs.config.clientId);
  params.set('redirect_uri', inputs.config.redirectUri);
  params.set('scope', (inputs.config.scopes ?? ['openid', 'profile', 'email']).join(' '));
  params.set('state', inputs.state);
  params.set('code_challenge', inputs.pkce.codeChallenge);
  params.set('code_challenge_method', inputs.pkce.codeChallengeMethod);
  if (inputs.loginHint) params.set('login_hint', inputs.loginHint);
  return `${inputs.config.authorizeEndpoint}?${params.toString()}`;
}

export interface ExchangeCodeInputs {
  config: OidcConfig;
  code: string;
  codeVerifier: string;
  fetchImpl?: typeof fetch;
}

export interface OidcTokenResponse {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
}

export interface OidcExchangeResult {
  ok: boolean;
  tokens?: OidcTokenResponse;
  error?: string;
}

export async function exchangeCode(inputs: ExchangeCodeInputs): Promise<OidcExchangeResult> {
  const fetchImpl = inputs.fetchImpl ?? fetch;
  const body = new URLSearchParams();
  body.set('grant_type', 'authorization_code');
  body.set('code', inputs.code);
  body.set('redirect_uri', inputs.config.redirectUri);
  body.set('client_id', inputs.config.clientId);
  body.set('code_verifier', inputs.codeVerifier);
  body.set('client_secret', inputs.config.clientSecret);
  try {
    const res = await fetchImpl(inputs.config.tokenEndpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    const text = await res.text();
    if (!res.ok) {
      return {
        ok: false,
        error: `token exchange failed: HTTP ${res.status} ${text.slice(0, 200)}`,
      };
    }
    let parsed: OidcTokenResponse;
    try {
      parsed = JSON.parse(text) as OidcTokenResponse;
    } catch {
      return { ok: false, error: 'token endpoint returned non-JSON body' };
    }
    if (!parsed.id_token || !parsed.access_token) {
      return { ok: false, error: 'token response missing id_token or access_token' };
    }
    return { ok: true, tokens: parsed };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Decode an OIDC id_token without signature verification. v0
 * trust-on-first-issue: the token came from the IdP we just exchanged
 * with; full signature verification needs the IdP JWKS keyset and
 * lands when SSO live wire-up does (CTO-DELTA #21).
 */
export function decodeIdTokenClaims(idToken: string): Record<string, unknown> | null {
  const parts = idToken.split('.');
  if (parts.length !== 3) return null;
  try {
    const seg = parts[1] ?? '';
    const padded = seg.replace(/-/g, '+').replace(/_/g, '/') + padBase64(seg);
    const txt = Buffer.from(padded, 'base64').toString('utf8');
    return JSON.parse(txt) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function base64url(buf: Buffer, encoding: BinaryToTextEncoding = 'base64'): string {
  return buf.toString(encoding).replace(/=+$/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function padBase64(seg: string): string {
  const m = seg.length % 4;
  return m === 0 ? '' : '='.repeat(4 - m);
}
