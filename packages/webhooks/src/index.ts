/**
 * @qorium/webhooks — Sprint 4.5 v0 alpha.
 *
 * Pure-TypeScript primitives for the future webhooks-service per
 * `infra/Webhooks-Service-v0-Spec.md`. The PM2 service + Redis-backed
 * delivery worker lands in Sprint 4.5.1; this package ships the
 * surface that both the service and any in-process emitter (e.g.,
 * the Audit Log API's webhook hook from Sprint 4.4.2) will share.
 */

export {
  WEBHOOK_SIGNATURE_HEADER,
  WEBHOOK_TIMESTAMP_HEADER,
  WEBHOOK_DELIVERY_HEADER,
  WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS,
  signWebhookPayload,
  verifyWebhookSignature,
  buildWebhookHeaders,
} from './signature.js';
export type { WebhookSignatureInput, WebhookHeaders } from './signature.js';

export {
  RETRY_SCHEDULE_SECONDS,
  MAX_DELIVERY_AGE_SECONDS,
  MAX_ATTEMPTS,
  computeNextRetryAt,
  isWithinRetryWindow,
} from './retry.js';

export { classifyDeliveryAttempt, isRetryable } from './attempt-classifier.js';
export type { AttemptOutcome, AttemptClassification } from './attempt-classifier.js';

export { buildEventEnvelope, isValidEventType, KNOWN_EVENT_TYPES } from './event-envelope.js';
export type { WebhookEventEnvelope, BuildEnvelopeInput } from './event-envelope.js';
