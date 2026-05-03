/**
 * Core HTTP client for the QOrium SDK.
 *
 * Auth modes (per `infra/API-Documentation-v0.md` §2):
 *   - Bearer API key (default; HMAC-SHA256 signing optional)
 *   - JWT (issued by /v1/auth)
 *
 * Idempotency (§11): mutating methods accept an `idempotencyKey` that
 * is forwarded as `Idempotency-Key`. Replays of the same key on POST/
 * PUT/DELETE return the original response without re-execution.
 */

import type { ErrorBody } from './types.js';

export interface ClientOptions {
  /** Base URL, e.g. `https://api.qorium.io/v1`. */
  baseUrl: string;
  /** Bearer token (API key or JWT). */
  apiKey?: string;
  /** Tenant scoping header. Some endpoints require it. */
  tenantId?: string;
  /** Per-request timeout (ms). Default 10_000. */
  timeoutMs?: number;
  /** Inject a custom fetch (tests). */
  fetchImpl?: typeof fetch;
  /** Default request headers, merged into every call. */
  defaultHeaders?: Record<string, string>;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  /** Replay-safe key. Required by some endpoints (orders, payment intents). */
  idempotencyKey?: string;
  /** Override base tenant id for one call. */
  tenantId?: string;
  /** Per-request timeout override. */
  timeoutMs?: number;
}

export class QoriumApiError extends Error {
  readonly status: number;
  readonly body: ErrorBody | null;
  constructor(status: number, message: string, body: ErrorBody | null) {
    super(message);
    this.name = 'QoriumApiError';
    this.status = status;
    this.body = body;
  }
}

export class QoriumClient {
  private readonly opts: Required<Pick<ClientOptions, 'baseUrl' | 'timeoutMs'>> & ClientOptions;
  private readonly fetchImpl: typeof fetch;

  constructor(options: ClientOptions) {
    this.opts = {
      ...options,
      baseUrl: options.baseUrl.replace(/\/+$/, ''),
      timeoutMs: options.timeoutMs ?? 10_000,
    };
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
    const ctrl = new AbortController();
    const timeout = opts.timeoutMs ?? this.opts.timeoutMs;
    const timer = setTimeout(() => ctrl.abort(new Error('timeout')), timeout);
    try {
      const headers: Record<string, string> = {
        'content-type': 'application/json',
        accept: 'application/json',
        ...(this.opts.defaultHeaders ?? {}),
        ...(opts.headers ?? {}),
      };
      if (this.opts.apiKey) headers.authorization = `Bearer ${this.opts.apiKey}`;
      const tenantId = opts.tenantId ?? this.opts.tenantId;
      if (tenantId) headers['x-tenant-id'] = tenantId;
      if (opts.idempotencyKey) headers['idempotency-key'] = opts.idempotencyKey;

      const init: RequestInit = {
        method: opts.method ?? 'GET',
        headers,
        signal: ctrl.signal,
      };
      if (opts.body !== undefined) init.body = JSON.stringify(opts.body);

      const url = path.startsWith('http') ? path : `${this.opts.baseUrl}${path}`;
      const res = await this.fetchImpl(url, init);
      const text = await res.text();
      let parsed: unknown = null;
      try {
        parsed = text.length > 0 ? JSON.parse(text) : null;
      } catch {
        parsed = text;
      }
      if (!res.ok) {
        const errBody = isErrorBody(parsed) ? parsed : null;
        const message = errBody?.title ?? `${res.status} ${res.statusText} from ${path}`;
        throw new QoriumApiError(res.status, message, errBody);
      }
      return parsed as T;
    } finally {
      clearTimeout(timer);
    }
  }

  get<T>(path: string, opts: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(path, { ...opts, method: 'GET' });
  }

  post<T>(
    path: string,
    body: unknown,
    opts: Omit<RequestOptions, 'method' | 'body'> = {},
  ): Promise<T> {
    return this.request<T>(path, { ...opts, method: 'POST', body });
  }

  patch<T>(
    path: string,
    body: unknown,
    opts: Omit<RequestOptions, 'method' | 'body'> = {},
  ): Promise<T> {
    return this.request<T>(path, { ...opts, method: 'PATCH', body });
  }

  put<T>(
    path: string,
    body: unknown,
    opts: Omit<RequestOptions, 'method' | 'body'> = {},
  ): Promise<T> {
    return this.request<T>(path, { ...opts, method: 'PUT', body });
  }

  delete<T>(path: string, opts: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(path, { ...opts, method: 'DELETE' });
  }
}

function isErrorBody(value: unknown): value is ErrorBody {
  return (
    typeof value === 'object' &&
    value !== null &&
    'title' in value &&
    typeof (value as { title: unknown }).title === 'string'
  );
}
