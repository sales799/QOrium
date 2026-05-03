/**
 * Service URL resolution for the admin app.
 *
 * Each upstream v0 service exposes a stable internal HTTP API. The admin
 * Next.js process consumes them via these env-resolved URLs. Defaults
 * point at localhost ports per `infra/B10-ecosystem.config.js`.
 */

export interface ServiceUrls {
  sso: string;
  webhooks: string;
  auditLog: string;
  atsBridge: string;
  apiKeyMgmt: string;
  billing: string;
  uptime: string;
}

export function resolveServiceUrls(env: NodeJS.ProcessEnv = process.env): ServiceUrls {
  return {
    sso: env.SSO_URL ?? 'http://localhost:5107',
    webhooks: env.WEBHOOKS_URL ?? 'http://localhost:5106',
    auditLog: env.AUDIT_LOG_URL ?? 'http://localhost:5111',
    atsBridge: env.ATS_BRIDGE_URL ?? 'http://localhost:5105',
    apiKeyMgmt: env.API_KEY_MGMT_URL ?? 'http://localhost:5113',
    billing: env.BILLING_URL ?? 'http://localhost:5112',
    uptime: env.UPTIME_URL ?? 'http://localhost:5114',
  };
}

export interface FetchOptions {
  method?: string;
  body?: unknown;
  tenantId?: string;
  headers?: Record<string, string>;
  /** Per-request timeout (ms). Default 5000. */
  timeoutMs?: number;
  /** Allow tests to inject a custom fetch impl. */
  fetchImpl?: typeof fetch;
}

export interface FetchResult<T> {
  ok: boolean;
  status: number;
  body: T | null;
  error: string | null;
}

/**
 * Tiny fetch wrapper that returns a tagged result rather than throwing.
 * The dashboards prefer to render errors inline ("service unreachable")
 * instead of crashing the page.
 */
export async function callService<T>(
  baseUrl: string,
  path: string,
  opts: FetchOptions = {},
): Promise<FetchResult<T>> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const ctrl = new AbortController();
  const timeout = opts.timeoutMs ?? 5_000;
  const timer = setTimeout(() => ctrl.abort(new Error('timeout')), timeout);
  try {
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      accept: 'application/json',
      ...(opts.headers ?? {}),
    };
    if (opts.tenantId) headers['x-tenant-id'] = opts.tenantId;
    const init: RequestInit = {
      method: opts.method ?? 'GET',
      headers,
      signal: ctrl.signal,
    };
    if (opts.body !== undefined) init.body = JSON.stringify(opts.body);
    const res = await fetchImpl(`${baseUrl}${path}`, init);
    const status = res.status;
    const text = await res.text();
    let parsed: unknown = null;
    try {
      parsed = text.length > 0 ? JSON.parse(text) : null;
    } catch {
      parsed = text;
    }
    if (!res.ok) {
      return {
        ok: false,
        status,
        body: null,
        error:
          typeof parsed === 'object' && parsed !== null && 'title' in parsed
            ? String((parsed as { title: unknown }).title)
            : `${status} from ${path}`,
      };
    }
    return { ok: true, status, body: parsed as T, error: null };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      body: null,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    clearTimeout(timer);
  }
}
