/**
 * Internal-only types for the Sentry scaffold (`./sentry.ts`).
 *
 * Mirrors the subset of @sentry/types we use, so we don't pull the
 * package as a runtime dep until DSN is provisioned (per SO-15
 * env-driven config + TD-007 deferred installation).
 */

export type Severity = 'fatal' | 'error' | 'warning' | 'info' | 'debug';
