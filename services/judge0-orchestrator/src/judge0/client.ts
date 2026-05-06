/**
 * Minimal Judge0 v1.13+ client. POSTs a submission with `wait=false`, polls
 * GET /submissions/{token}?base64_encoded=false until the status reaches a
 * terminal id, returns the final result.
 *
 * Dependency-injected: pass `fetchImpl` in tests with a stub that returns
 * canned `Response`s. In prod the global `fetch` is used.
 */

import {
  TERMINAL_STATUS_IDS,
  type Judge0SubmitRequest,
  type Judge0SubmissionResult,
} from './types.js';

export interface Judge0ClientOptions {
  baseUrl: string;
  /** Optional `X-Auth-Token` for authenticated Judge0 deployments. */
  authToken?: string | undefined;
  fetchImpl?: typeof fetch;
  /** Per-request timeout (ms). Default 30s. */
  requestTimeoutMs?: number;
  /** Polling interval between GET /submissions/{token} probes (ms). */
  pollIntervalMs?: number;
  /** Maximum total wall time waiting for a terminal status (ms). */
  pollTimeoutMs?: number;
}

const DEFAULT_REQUEST_TIMEOUT = 30_000;
const DEFAULT_POLL_INTERVAL = 500;
const DEFAULT_POLL_TIMEOUT = 60_000;

export interface ExecuteOptions {
  /** Cooperative cancel from the orchestrator. */
  signal?: AbortSignal | undefined;
  /** Optional clock for tests. */
  now?: () => number;
  /** Optional sleep override for tests (so polling tests aren't flaky). */
  sleep?: (ms: number) => Promise<void>;
}

export class Judge0Client {
  private readonly baseUrl: string;
  private readonly authToken: string | undefined;
  private readonly fetchImpl: typeof fetch;
  private readonly requestTimeoutMs: number;
  private readonly pollIntervalMs: number;
  private readonly pollTimeoutMs: number;

  constructor(opts: Judge0ClientOptions) {
    if (!opts.baseUrl) throw new Error('Judge0Client requires baseUrl');
    this.baseUrl = opts.baseUrl.replace(/\/+$/, '');
    this.authToken = opts.authToken;
    this.fetchImpl = opts.fetchImpl ?? fetch;
    this.requestTimeoutMs = opts.requestTimeoutMs ?? DEFAULT_REQUEST_TIMEOUT;
    this.pollIntervalMs = opts.pollIntervalMs ?? DEFAULT_POLL_INTERVAL;
    this.pollTimeoutMs = opts.pollTimeoutMs ?? DEFAULT_POLL_TIMEOUT;
  }

  async submit(req: Judge0SubmitRequest, opts: ExecuteOptions = {}): Promise<{ token: string }> {
    const url = `${this.baseUrl}/submissions?base64_encoded=false&wait=false`;
    const init: RequestInit = {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(req),
    };
    if (opts.signal) init.signal = opts.signal;
    const response = await this.requestWithTimeout(url, init, opts);
    if (!response.ok) {
      throw new Error(`judge0 submit ${response.status} ${response.statusText}`);
    }
    const body = (await response.json()) as { token?: string };
    if (typeof body.token !== 'string' || body.token.length === 0) {
      throw new Error('judge0 submit response missing token');
    }
    return { token: body.token };
  }

  async getResult(token: string, opts: ExecuteOptions = {}): Promise<Judge0SubmissionResult> {
    const url = `${this.baseUrl}/submissions/${encodeURIComponent(token)}?base64_encoded=false&fields=*`;
    const init: RequestInit = {
      method: 'GET',
      headers: this.headers(),
    };
    if (opts.signal) init.signal = opts.signal;
    const response = await this.requestWithTimeout(url, init, opts);
    if (!response.ok) {
      throw new Error(`judge0 get ${response.status} ${response.statusText}`);
    }
    return (await response.json()) as Judge0SubmissionResult;
  }

  /** Submit + poll until terminal. Throws on poll-timeout. */
  async execute(
    req: Judge0SubmitRequest,
    opts: ExecuteOptions = {},
  ): Promise<Judge0SubmissionResult> {
    const { token } = await this.submit(req, opts);
    return this.pollUntilTerminal(token, opts);
  }

  async pollUntilTerminal(
    token: string,
    opts: ExecuteOptions = {},
  ): Promise<Judge0SubmissionResult> {
    const now = opts.now ?? (() => Date.now());
    const sleep = opts.sleep ?? defaultSleep;
    const deadline = now() + this.pollTimeoutMs;
    for (;;) {
      if (opts.signal?.aborted) {
        throw new Error('judge0 poll aborted');
      }
      const result = await this.getResult(token, opts);
      if (result.status && TERMINAL_STATUS_IDS.has(result.status.id)) {
        return result;
      }
      if (now() >= deadline) {
        throw new Error(`judge0 poll timeout after ${this.pollTimeoutMs} ms (token=${token})`);
      }
      await sleep(this.pollIntervalMs);
    }
  }

  private headers(): Record<string, string> {
    const headers: Record<string, string> = {
      accept: 'application/json',
      'content-type': 'application/json',
    };
    if (this.authToken) headers['X-Auth-Token'] = this.authToken;
    return headers;
  }

  private async requestWithTimeout(
    url: string,
    init: RequestInit,
    opts: ExecuteOptions,
  ): Promise<Response> {
    const ctrl = new AbortController();
    const timer = setTimeout(
      () => ctrl.abort(new Error('judge0 request timed out')),
      this.requestTimeoutMs,
    );
    const onParentAbort = () => ctrl.abort(opts.signal?.reason);
    if (opts.signal) {
      if (opts.signal.aborted) ctrl.abort(opts.signal.reason);
      else opts.signal.addEventListener('abort', onParentAbort, { once: true });
    }
    try {
      return await this.fetchImpl(url, { ...init, signal: ctrl.signal });
    } finally {
      clearTimeout(timer);
      if (opts.signal) opts.signal.removeEventListener('abort', onParentAbort);
    }
  }
}

function defaultSleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
