/**
 * Sprint 4.5 v0 — Delivery attempt classifier per spec §6.
 *
 * Maps an HTTP outcome (status code or transport-level error) to one of:
 *   - 'success'        — 2xx; mark delivery completed
 *   - 'retryable'      — 5xx, 429, timeout, DNS failure → schedule retry
 *   - 'dead-letter'    — 4xx (except 429) → no retry, mark failed
 *
 * The spec's §6 rule "no retry on timeout alone (circuit breaker)" is
 * applied at a higher layer — this classifier reports timeout as
 * retryable so the queue can decide. The circuit breaker counts
 * consecutive timeouts per subscription and trips after a threshold.
 */

export type AttemptOutcome = 'success' | 'retryable' | 'dead-letter';

export interface AttemptClassification {
  outcome: AttemptOutcome;
  reason: string;
}

export interface AttemptInput {
  /** HTTP status code from the customer endpoint, or null if no response. */
  httpStatus: number | null;
  /** Transport-level error tag, or null when the request returned a status. */
  transportError?: 'timeout' | 'dns' | 'connection-reset' | 'tls' | null | undefined;
}

export function classifyDeliveryAttempt(input: AttemptInput): AttemptClassification {
  if (input.transportError) {
    switch (input.transportError) {
      case 'timeout':
        return { outcome: 'retryable', reason: 'timeout' };
      case 'dns':
        return { outcome: 'retryable', reason: 'dns-failure' };
      case 'connection-reset':
        return { outcome: 'retryable', reason: 'connection-reset' };
      case 'tls':
        // TLS misconfiguration is a customer problem; retrying won't help
        // until they fix it. Spec §9 marks TLS 1.3+ as required.
        return { outcome: 'dead-letter', reason: 'tls-handshake-failed' };
    }
  }
  const code = input.httpStatus;
  if (code === null) {
    return { outcome: 'retryable', reason: 'no-response' };
  }
  if (code >= 200 && code < 300) {
    return { outcome: 'success', reason: 'http-2xx' };
  }
  if (code === 429) {
    return { outcome: 'retryable', reason: 'http-429' };
  }
  if (code >= 400 && code < 500) {
    return { outcome: 'dead-letter', reason: `http-${code}` };
  }
  if (code >= 500 && code < 600) {
    return { outcome: 'retryable', reason: `http-${code}` };
  }
  // Anything else (1xx, 3xx without redirect handling, oddities) → dead-letter
  return { outcome: 'dead-letter', reason: `unexpected-http-${code}` };
}

/** Convenience predicate for callers that only need the boolean. */
export function isRetryable(input: AttemptInput): boolean {
  return classifyDeliveryAttempt(input).outcome === 'retryable';
}
