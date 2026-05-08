import { describe, expect, it } from 'vitest';
import { classifyDeliveryAttempt, isRetryable } from '../src/attempt-classifier.js';

describe('classifyDeliveryAttempt', () => {
  it('classifies 2xx as success', () => {
    expect(classifyDeliveryAttempt({ httpStatus: 200 }).outcome).toBe('success');
    expect(classifyDeliveryAttempt({ httpStatus: 204 }).outcome).toBe('success');
    expect(classifyDeliveryAttempt({ httpStatus: 299 }).outcome).toBe('success');
  });

  it('classifies 4xx (except 429) as dead-letter', () => {
    expect(classifyDeliveryAttempt({ httpStatus: 400 }).outcome).toBe('dead-letter');
    expect(classifyDeliveryAttempt({ httpStatus: 404 }).outcome).toBe('dead-letter');
    expect(classifyDeliveryAttempt({ httpStatus: 410 }).outcome).toBe('dead-letter');
  });

  it('classifies 429 as retryable', () => {
    expect(classifyDeliveryAttempt({ httpStatus: 429 }).outcome).toBe('retryable');
  });

  it('classifies 5xx as retryable', () => {
    expect(classifyDeliveryAttempt({ httpStatus: 500 }).outcome).toBe('retryable');
    expect(classifyDeliveryAttempt({ httpStatus: 502 }).outcome).toBe('retryable');
    expect(classifyDeliveryAttempt({ httpStatus: 503 }).outcome).toBe('retryable');
  });

  it('classifies timeout as retryable', () => {
    expect(classifyDeliveryAttempt({ httpStatus: null, transportError: 'timeout' }).outcome).toBe(
      'retryable',
    );
  });

  it('classifies DNS failure as retryable', () => {
    expect(classifyDeliveryAttempt({ httpStatus: null, transportError: 'dns' }).outcome).toBe(
      'retryable',
    );
  });

  it('classifies connection-reset as retryable', () => {
    expect(
      classifyDeliveryAttempt({ httpStatus: null, transportError: 'connection-reset' }).outcome,
    ).toBe('retryable');
  });

  it('classifies TLS handshake failure as dead-letter (customer config)', () => {
    expect(classifyDeliveryAttempt({ httpStatus: null, transportError: 'tls' }).outcome).toBe(
      'dead-letter',
    );
  });

  it('classifies no-response (no transport error, no status) as retryable', () => {
    expect(classifyDeliveryAttempt({ httpStatus: null }).outcome).toBe('retryable');
  });

  it('reports a stable reason tag for each outcome', () => {
    expect(classifyDeliveryAttempt({ httpStatus: 200 }).reason).toBe('http-2xx');
    expect(classifyDeliveryAttempt({ httpStatus: 502 }).reason).toBe('http-502');
    expect(classifyDeliveryAttempt({ httpStatus: 404 }).reason).toBe('http-404');
    expect(classifyDeliveryAttempt({ httpStatus: 429 }).reason).toBe('http-429');
  });
});

describe('isRetryable', () => {
  it('agrees with the classifier', () => {
    expect(isRetryable({ httpStatus: 503 })).toBe(true);
    expect(isRetryable({ httpStatus: 200 })).toBe(false);
    expect(isRetryable({ httpStatus: 400 })).toBe(false);
  });
});
