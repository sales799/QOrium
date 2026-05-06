/**
 * HTTP poster — Stub-vs-Real wrapper around `fetch`. The Stub records
 * every attempt to an in-memory log so dev environments can preview
 * delivery behaviour without exposing real customer endpoints; the
 * Real impl is a thin `fetch` with timeout.
 */

export interface PostInputs {
  url: string;
  body: string;
  headers: Record<string, string>;
  /** Per-request timeout (ms). Default 10_000 per spec §9. */
  timeoutMs?: number;
}

export interface PostOutcome {
  status: number;
  /** Truncated response body for debugging (max 4KB). */
  responseSnippet: string;
  /** When the response cannot be received (timeout, DNS, etc.). */
  error?: string;
}

export interface HttpPoster {
  post(inputs: PostInputs): Promise<PostOutcome>;
}

const RESPONSE_SNIPPET_MAX = 4 * 1024;

/** Real poster — wraps native fetch with abort-based timeout. */
export function realHttpPoster(opts: { fetchImpl?: typeof fetch } = {}): HttpPoster {
  const fetchImpl = opts.fetchImpl ?? fetch;
  return {
    async post(inputs) {
      const ctrl = new AbortController();
      const timeout = inputs.timeoutMs ?? 10_000;
      const timer = setTimeout(() => ctrl.abort(new Error('timeout')), timeout);
      try {
        const res = await fetchImpl(inputs.url, {
          method: 'POST',
          body: inputs.body,
          headers: inputs.headers,
          signal: ctrl.signal,
        });
        const text = await res.text().catch(() => '');
        return {
          status: res.status,
          responseSnippet: text.slice(0, RESPONSE_SNIPPET_MAX),
        };
      } catch (err) {
        return {
          status: 0,
          responseSnippet: '',
          error: err instanceof Error ? err.message : String(err),
        };
      } finally {
        clearTimeout(timer);
      }
    },
  };
}

/**
 * Stub poster — never makes a network call. Records attempts to an
 * inspectable buffer + returns a deterministic 202.
 */
export interface StubPosterState {
  attempts: PostInputs[];
  /** Inject the next response. Defaults to 202. */
  nextStatus: number;
  nextError?: string;
}

export function stubHttpPoster(
  state: StubPosterState = { attempts: [], nextStatus: 202 },
): HttpPoster {
  return {
    async post(inputs) {
      state.attempts.push(inputs);
      const out: PostOutcome = {
        status: state.nextStatus,
        responseSnippet: '[stub poster] no network call',
      };
      if (state.nextError !== undefined) out.error = state.nextError;
      return out;
    },
  };
}
