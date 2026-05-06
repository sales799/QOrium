/**
 * Sentry shim. The build agent does not depend on `@sentry/node`
 * directly so the workspace stays buildable in dev. The Real impl
 * is wired by the deployment by passing `import * as Sentry from
 * '@sentry/node'` as the SDK argument.
 */

export interface SentryBreadcrumb {
  category?: string;
  message: string;
  level?: 'debug' | 'info' | 'warning' | 'error' | 'fatal';
  data?: Record<string, unknown>;
  timestamp?: number;
}

export interface SentryClient {
  captureException(err: unknown, context?: Record<string, unknown>): string | null;
  captureMessage(msg: string, level?: SentryBreadcrumb['level']): string | null;
  addBreadcrumb(crumb: SentryBreadcrumb): void;
  setTag(key: string, value: string): void;
  flush(timeoutMs?: number): Promise<boolean>;
}

export interface SentryAdapterOptions {
  /** Resolved Sentry DSN. Empty string = stub mode. */
  dsn: string;
  release?: string;
  environment?: string;
  /** Inject the real `@sentry/node` module here. Optional. */
  sdk?: {
    init: (opts: Record<string, unknown>) => void;
    captureException: (err: unknown, context?: Record<string, unknown>) => string;
    captureMessage: (msg: string, level?: string) => string;
    addBreadcrumb: (crumb: SentryBreadcrumb) => void;
    setTag: (key: string, value: string) => void;
    flush: (timeoutMs?: number) => Promise<boolean>;
  };
}

export function createSentryClient(opts: SentryAdapterOptions): SentryClient {
  if (!opts.dsn || !opts.sdk) {
    return stubClient(opts);
  }
  opts.sdk.init({
    dsn: opts.dsn,
    release: opts.release,
    environment: opts.environment ?? 'development',
    tracesSampleRate: 0.1,
  });
  const sdk = opts.sdk;
  return {
    captureException(err, context) {
      return sdk.captureException(err, context) ?? null;
    },
    captureMessage(msg, level) {
      return sdk.captureMessage(msg, level) ?? null;
    },
    addBreadcrumb(crumb) {
      sdk.addBreadcrumb(crumb);
    },
    setTag(key, value) {
      sdk.setTag(key, value);
    },
    flush(timeoutMs) {
      return sdk.flush(timeoutMs);
    },
  };
}

function stubClient(_opts: SentryAdapterOptions): SentryClient {
  const breadcrumbs: SentryBreadcrumb[] = [];
  const tags = new Map<string, string>();
  return {
    captureException() {
      return null;
    },
    captureMessage() {
      return null;
    },
    addBreadcrumb(crumb) {
      breadcrumbs.push(crumb);
      if (breadcrumbs.length > 100) breadcrumbs.shift();
    },
    setTag(key, value) {
      tags.set(key, value);
    },
    async flush() {
      return true;
    },
  };
}

/** Test helper: returns the client + an inspector for the breadcrumb buffer. */
export function createInspectableStub(): {
  client: SentryClient;
  state: { breadcrumbs: SentryBreadcrumb[]; tags: Map<string, string> };
} {
  const breadcrumbs: SentryBreadcrumb[] = [];
  const tags = new Map<string, string>();
  const client: SentryClient = {
    captureException: () => null,
    captureMessage: () => null,
    addBreadcrumb(crumb) {
      breadcrumbs.push(crumb);
    },
    setTag(key, value) {
      tags.set(key, value);
    },
    flush: async () => true,
  };
  return { client, state: { breadcrumbs, tags } };
}
