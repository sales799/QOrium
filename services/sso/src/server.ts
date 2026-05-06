/**
 * Express service for SSO per spec §4 + §5.
 *
 * Endpoints (v0):
 *   GET  /healthz
 *   GET  /v1/auth/saml/metadata        — SP metadata XML
 *   POST /v1/auth/saml/login           — initiate SAML flow (stub returns IdP URL)
 *   POST /v1/auth/saml/acs             — IdP returns assertion
 *   POST /v1/auth/oidc/login           — initiate OIDC flow (stub)
 *   GET  /v1/auth/oidc/callback        — IdP returns authorization code (stub)
 *   POST /v1/auth/logout               — clear session
 *   GET  /v1/sso/configurations        — read tenant's config (admin)
 *   PUT  /v1/sso/configurations        — upsert tenant's config (admin)
 *
 * Cryptographic SAML signature verification + live IdP wire-up are
 * deferred per `infra/CTO-deltas/CTO-DELTA-sso-idp-credentials-deferred.md`.
 * Until live, the ACS handler accepts a `verifySignature` strategy injected
 * by the caller (tests pass a stub that returns true).
 */

import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import type { Logger } from 'pino';
import { z } from 'zod';
import type { Pool } from '@qorium/db';
import { createAuditEmitter, type AuditEmitter } from '@qorium/audit-emitter';
import type { SsoConfig } from './config.js';
import { generateSpMetadataXml } from './metadata.js';
import { validateSamlAcs, principalFromAssertion } from './saml.js';
import { issueSessionJwt, verifySessionJwt } from './jwt.js';
import {
  buildAuthorizeUrl,
  decodeIdTokenClaims,
  exchangeCode,
  generatePkce,
  generateState,
  inMemoryStateStore,
  type OidcConfig,
  type OidcStateStore,
} from './oidc.js';
import {
  getConfigByTenantId,
  upsertConfig,
  type SsoConfigRow,
  type SsoIdpType,
  type SsoProtocol,
  type SsoStatus,
} from './repositories/configurations.js';

export interface CreateServerOptions {
  config: SsoConfig;
  logger: Logger;
  pool?: Pool;
  /** Pluggable signature verifier — see saml.ts. */
  verifySamlSignature?: (xml: string) => boolean;
  /** Resolves the tenant from the request — adapter-specific in production. */
  resolveTenantId?: (req: Request) => string | null;
  /** OIDC state store. Defaults to in-memory; production wires Redis. */
  oidcStateStore?: OidcStateStore;
  /** Test seam for the OIDC token exchange. */
  oidcFetchImpl?: typeof fetch;
  /** Optional audit emitter; defaults to a stub if omitted. */
  auditEmitter?: AuditEmitter;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const acsSchema = z.object({
  SAMLResponse: z.string().min(1),
  RelayState: z.string().optional(),
  tenant_id: z.string().regex(UUID_REGEX).optional(),
});

const upsertSchema = z.object({
  protocol: z.enum(['saml', 'oidc']),
  idp_type: z.enum([
    'okta',
    'azure_ad',
    'google_workspace',
    'ping',
    'jumpcloud',
    'onelogin',
    'custom',
  ]),
  metadata_url: z.string().url().nullish(),
  entity_id: z.string().nullish(),
  sso_endpoint_url: z.string().url().nullish(),
  slo_endpoint_url: z.string().url().nullish(),
  idp_certificate: z.string().nullish(),
  oidc_issuer: z.string().url().nullish(),
  oidc_client_id: z.string().nullish(),
  oidc_client_secret: z.string().nullish(),
  attribute_mapping: z.record(z.unknown()).optional(),
  status: z.enum(['draft', 'test_mode', 'active', 'disabled']).optional(),
});

export function createServer(opts: CreateServerOptions): express.Express {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(express.urlencoded({ extended: false, limit: '256kb' }));
  app.use(express.json({ limit: '128kb' }));
  app.use(pinoHttp({ logger: opts.logger }));

  const audit = opts.auditEmitter ?? createAuditEmitter({ mode: 'stub' });

  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok', service: 'qorium-sso' });
  });

  app.get('/v1/auth/saml/metadata', (_req, res) => {
    const xml = generateSpMetadataXml({
      entityId: opts.config.spEntityId,
      acsUrl: opts.config.acsUrl,
      sloUrl: opts.config.sloUrl,
      displayName: 'QOrium',
    });
    res.contentType('application/samlmetadata+xml').send(xml);
  });

  app.post('/v1/auth/saml/acs', (req, res) => {
    void handleAcs(opts, audit, req, res);
  });

  app.post('/v1/auth/saml/login', (req, res) => {
    void handleSamlLogin(opts, req, res);
  });

  app.post('/v1/auth/oidc/login', (req, res) => {
    void handleOidcLogin(opts, req, res);
  });

  app.get('/v1/auth/oidc/callback', (req, res) => {
    void handleOidcCallback(opts, req, res);
  });

  app.post('/v1/auth/logout', (req, res) => {
    handleLogout(opts, req, res);
  });

  app.get('/v1/sso/configurations', (req, res) => {
    void handleGetConfig(opts, req, res);
  });

  app.put('/v1/sso/configurations', (req, res) => {
    void handleUpsertConfig(opts, audit, req, res);
  });

  app.use((_req, res) => {
    res.status(404).contentType('application/problem+json').json({
      type: 'about:blank',
      title: 'Not Found',
      status: 404,
    });
  });

  return app;
}

async function handleAcs(
  opts: CreateServerOptions,
  audit: AuditEmitter,
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = acsSchema.safeParse(req.body);
  if (!parsed.success) {
    sendProblem(res, 400, 'Bad Request', parsed.error.issues.map((i) => i.message).join('; '));
    return;
  }
  const validation = validateSamlAcs({
    samlResponse: parsed.data.SAMLResponse,
    expectedAudience: opts.config.spEntityId,
    expectedRecipient: opts.config.acsUrl,
    ...(opts.verifySamlSignature ? { verifySignature: opts.verifySamlSignature } : {}),
  });
  if (!validation.ok) {
    await audit.emit({
      tenantId: parsed.data.tenant_id ?? null,
      actorId: null,
      actorType: 'system',
      action: 'sso.login.failure',
      resourceType: 'session',
      payload: { reason: validation.reason, protocol: 'saml' },
    });
    sendProblem(res, 401, 'SAML assertion rejected', validation.reason);
    return;
  }

  const tenantId = parsed.data.tenant_id ?? '';
  let configRow: SsoConfigRow | null = null;
  if (opts.pool && tenantId) {
    configRow = await getConfigByTenantId(opts.pool, tenantId);
  }
  if (!tenantId && configRow == null) {
    sendProblem(res, 400, 'tenant_id required');
    return;
  }

  const mapping = (configRow?.attributeMapping ?? {}) as {
    emailAttr?: string;
    nameAttr?: string;
    groupsAttr?: string;
    groupToRole?: Record<string, string>;
  };
  const principal = principalFromAssertion(validation.assertion, mapping);

  if (!principal.email) {
    sendProblem(res, 401, 'SAML assertion missing email claim');
    return;
  }

  const claims = {
    sub: principal.subject,
    tenant_id: tenantId,
    roles: principal.roles,
    email: principal.email,
    ...(principal.fullName ? { name: principal.fullName } : {}),
  };
  const token = issueSessionJwt({
    claims,
    issuer: opts.config.jwtIssuer,
    audience: opts.config.jwtAudience,
    signingSecret: opts.config.jwtSigningSecret,
    ttlSeconds: opts.config.jwtTtlSeconds,
  });

  await audit.emit({
    tenantId: tenantId || null,
    actorId: principal.subject,
    actorType: 'user',
    action: 'sso.login.success',
    resourceType: 'session',
    payload: {
      protocol: 'saml',
      email: principal.email,
      roles: principal.roles,
    },
  });

  res.status(200).json({
    token_type: 'Bearer',
    access_token: token,
    expires_in: opts.config.jwtTtlSeconds,
    user: {
      sub: claims.sub,
      email: claims.email,
      ...(claims.name ? { name: claims.name } : {}),
      roles: claims.roles,
    },
  });
}

async function handleSamlLogin(
  opts: CreateServerOptions,
  req: Request,
  res: Response,
): Promise<void> {
  const tenantId = readTenantParam(req);
  if (!tenantId) {
    sendProblem(res, 400, 'tenant_id required');
    return;
  }
  if (!opts.pool) {
    sendProblem(res, 503, 'Database unavailable');
    return;
  }
  const cfg = await getConfigByTenantId(opts.pool, tenantId);
  if (!cfg || !cfg.ssoEndpointUrl) {
    sendProblem(res, 404, 'No active SSO configuration for tenant');
    return;
  }
  if (cfg.status !== 'active' && cfg.status !== 'test_mode') {
    sendProblem(res, 403, `SSO configuration is ${cfg.status}`);
    return;
  }
  res.status(200).json({
    redirect_to: cfg.ssoEndpointUrl,
    relay_state: tenantId,
    sp_entity_id: opts.config.spEntityId,
  });
}

function handleLogout(opts: CreateServerOptions, req: Request, res: Response): void {
  const auth = req.headers.authorization;
  if (typeof auth !== 'string' || !auth.startsWith('Bearer ')) {
    sendProblem(res, 401, 'Authorization required');
    return;
  }
  const result = verifySessionJwt({
    token: auth.slice('Bearer '.length),
    signingSecret: opts.config.jwtSigningSecret,
    issuer: opts.config.jwtIssuer,
    audience: opts.config.jwtAudience,
  });
  if (!result.ok) {
    sendProblem(res, 401, 'Invalid session token', result.reason);
    return;
  }
  // Stateless: client must drop the cookie. v0 keeps no server-side session.
  res.status(200).json({ status: 'logged_out', sub: result.claims.sub });
}

async function handleGetConfig(
  opts: CreateServerOptions,
  req: Request,
  res: Response,
): Promise<void> {
  const tenantId = (opts.resolveTenantId ?? defaultResolveTenant)(req);
  if (!tenantId) {
    sendProblem(res, 401, 'Unauthorized');
    return;
  }
  if (!opts.pool) {
    sendProblem(res, 503, 'Database unavailable');
    return;
  }
  const row = await getConfigByTenantId(opts.pool, tenantId);
  if (!row) {
    sendProblem(res, 404, 'No SSO configuration for tenant');
    return;
  }
  res.json(row);
}

async function handleUpsertConfig(
  opts: CreateServerOptions,
  audit: AuditEmitter,
  req: Request,
  res: Response,
): Promise<void> {
  const tenantId = (opts.resolveTenantId ?? defaultResolveTenant)(req);
  if (!tenantId) {
    sendProblem(res, 401, 'Unauthorized');
    return;
  }
  if (!opts.pool) {
    sendProblem(res, 503, 'Database unavailable');
    return;
  }
  const parsed = upsertSchema.safeParse(req.body);
  if (!parsed.success) {
    sendProblem(res, 400, 'Bad Request', parsed.error.issues.map((i) => i.message).join('; '));
    return;
  }
  const input: Parameters<typeof upsertConfig>[1] = {
    tenantId,
    protocol: parsed.data.protocol as SsoProtocol,
    idpType: parsed.data.idp_type as SsoIdpType,
  };
  if (parsed.data.metadata_url !== undefined) input.metadataUrl = parsed.data.metadata_url ?? null;
  if (parsed.data.entity_id !== undefined) input.entityId = parsed.data.entity_id ?? null;
  if (parsed.data.sso_endpoint_url !== undefined)
    input.ssoEndpointUrl = parsed.data.sso_endpoint_url ?? null;
  if (parsed.data.slo_endpoint_url !== undefined)
    input.sloEndpointUrl = parsed.data.slo_endpoint_url ?? null;
  if (parsed.data.idp_certificate !== undefined)
    input.idpCertificate = parsed.data.idp_certificate ?? null;
  if (parsed.data.oidc_issuer !== undefined) input.oidcIssuer = parsed.data.oidc_issuer ?? null;
  if (parsed.data.oidc_client_id !== undefined)
    input.oidcClientId = parsed.data.oidc_client_id ?? null;
  if (parsed.data.oidc_client_secret !== undefined)
    input.oidcClientSecret = parsed.data.oidc_client_secret ?? null;
  if (parsed.data.attribute_mapping !== undefined)
    input.attributeMapping = parsed.data.attribute_mapping;
  if (parsed.data.status !== undefined) input.status = parsed.data.status as SsoStatus;
  const row = await upsertConfig(opts.pool, input);
  await audit.emit({
    tenantId,
    actorId: null,
    actorType: 'admin',
    action: row.status === 'active' ? 'sso.config.activated' : 'sso.config.updated',
    resourceType: 'sso_configuration',
    resourceId: row.id,
    payload: {
      protocol: row.protocol,
      idp_type: row.idpType,
      status: row.status,
    },
  });
  res.status(200).json(row);
}

const oidcStateStores = new WeakMap<CreateServerOptions, OidcStateStore>();
function resolveStore(opts: CreateServerOptions): OidcStateStore {
  if (opts.oidcStateStore) return opts.oidcStateStore;
  let store = oidcStateStores.get(opts);
  if (!store) {
    store = inMemoryStateStore();
    oidcStateStores.set(opts, store);
  }
  return store;
}

function buildOidcConfig(row: SsoConfigRow, redirectUri: string): OidcConfig | null {
  if (!row.oidcIssuer || !row.oidcClientId) return null;
  return {
    issuer: row.oidcIssuer,
    clientId: row.oidcClientId,
    // The client secret is encrypted at rest. v0 uses the raw value; the
    // KMS decoder lands when the secret store does (CTO-DELTA #21).
    clientSecret: row.oidcClientId,
    redirectUri,
    authorizeEndpoint: `${row.oidcIssuer.replace(/\/$/, '')}/v1/authorize`,
    tokenEndpoint: `${row.oidcIssuer.replace(/\/$/, '')}/v1/token`,
  };
}

async function handleOidcLogin(
  opts: CreateServerOptions,
  req: Request,
  res: Response,
): Promise<void> {
  const tenantId = readTenantParam(req);
  if (!tenantId) {
    sendProblem(res, 400, 'tenant_id required');
    return;
  }
  if (!opts.pool) {
    sendProblem(res, 503, 'Database unavailable');
    return;
  }
  const cfgRow = await getConfigByTenantId(opts.pool, tenantId);
  if (!cfgRow || cfgRow.protocol !== 'oidc') {
    sendProblem(res, 404, 'No OIDC configuration for tenant');
    return;
  }
  const oidcCfg = buildOidcConfig(cfgRow, `${opts.config.spEntityId}/v1/auth/oidc/callback`);
  if (!oidcCfg) {
    sendProblem(res, 422, 'OIDC configuration incomplete (oidc_issuer + oidc_client_id required)');
    return;
  }
  const state = generateState();
  const pkce = generatePkce();
  resolveStore(opts).put({
    state,
    codeVerifier: pkce.codeVerifier,
    tenantId,
    createdAtMs: Date.now(),
  });
  const url = buildAuthorizeUrl({ config: oidcCfg, state, pkce });
  res.status(200).json({
    redirect_to: url,
    state,
    expires_in: 300,
  });
}

async function handleOidcCallback(
  opts: CreateServerOptions,
  req: Request,
  res: Response,
): Promise<void> {
  const code = String(req.query.code ?? '');
  const state = String(req.query.state ?? '');
  if (!code || !state) {
    sendProblem(res, 400, 'code + state are required');
    return;
  }
  const stored = resolveStore(opts).consume(state);
  if (!stored) {
    sendProblem(res, 401, 'State not found or expired');
    return;
  }
  if (!opts.pool) {
    sendProblem(res, 503, 'Database unavailable');
    return;
  }
  const cfgRow = await getConfigByTenantId(opts.pool, stored.tenantId);
  if (!cfgRow) {
    sendProblem(res, 404, 'No SSO configuration for tenant');
    return;
  }
  const oidcCfg = buildOidcConfig(cfgRow, `${opts.config.spEntityId}/v1/auth/oidc/callback`);
  if (!oidcCfg) {
    sendProblem(res, 422, 'OIDC configuration incomplete');
    return;
  }
  const exchangeOpts: Parameters<typeof exchangeCode>[0] = {
    config: oidcCfg,
    code,
    codeVerifier: stored.codeVerifier,
  };
  if (opts.oidcFetchImpl) exchangeOpts.fetchImpl = opts.oidcFetchImpl;
  const result = await exchangeCode(exchangeOpts);
  if (!result.ok || !result.tokens) {
    sendProblem(res, 401, 'OIDC token exchange failed', result.error);
    return;
  }
  const claims = decodeIdTokenClaims(result.tokens.id_token);
  if (!claims || typeof claims.email !== 'string') {
    sendProblem(res, 401, 'OIDC id_token missing email claim');
    return;
  }
  const sessionClaims = {
    sub: typeof claims.sub === 'string' ? claims.sub : claims.email,
    tenant_id: stored.tenantId,
    roles: ['viewer'],
    email: claims.email,
    ...(typeof claims.name === 'string' ? { name: claims.name } : {}),
  };
  const token = issueSessionJwt({
    claims: sessionClaims,
    issuer: opts.config.jwtIssuer,
    audience: opts.config.jwtAudience,
    signingSecret: opts.config.jwtSigningSecret,
    ttlSeconds: opts.config.jwtTtlSeconds,
  });
  res.status(200).json({
    token_type: 'Bearer',
    access_token: token,
    expires_in: opts.config.jwtTtlSeconds,
    user: { sub: sessionClaims.sub, email: sessionClaims.email, roles: sessionClaims.roles },
  });
}

function defaultResolveTenant(req: Request): string | null {
  const auth = (req as Request & { auth?: { tenantId?: string } }).auth;
  if (auth?.tenantId) return auth.tenantId;
  const header = req.headers['x-tenant-id'];
  return typeof header === 'string' && UUID_REGEX.test(header) ? header : null;
}

function readTenantParam(req: Request): string | null {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const fromBody = typeof body.tenant_id === 'string' ? body.tenant_id : null;
  if (fromBody && UUID_REGEX.test(fromBody)) return fromBody;
  const fromQuery = typeof req.query.tenant_id === 'string' ? req.query.tenant_id : null;
  if (fromQuery && UUID_REGEX.test(fromQuery)) return fromQuery;
  return null;
}

function sendProblem(res: Response, status: number, title: string, detail?: string): void {
  const body: Record<string, unknown> = { type: 'about:blank', title, status };
  if (detail !== undefined) body.detail = detail;
  res.status(status).contentType('application/problem+json').json(body);
}
