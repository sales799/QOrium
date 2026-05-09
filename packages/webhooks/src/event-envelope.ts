/**
 * Sprint 4.5 v0 — Webhook event envelope per spec §4.
 *
 *   {
 *     "id": "evt_<uuid>",
 *     "event_type": "question.released",
 *     "timestamp": "2026-05-09T...",
 *     "tenant_id": "...",
 *     "aggregate_id": "...",
 *     "data": {...},
 *     "idempotency_key": "evt_<uuid>"
 *   }
 *
 * `idempotency_key` is intentionally identical to `id` so customers can
 * dedupe with a single-column store. If we ever fan out the same event to
 * the same subscription (e.g., on retry), the ID stays stable.
 */

export interface WebhookEventEnvelope {
  id: string;
  event_type: string;
  timestamp: string;
  tenant_id: string;
  aggregate_id: string | null;
  data: Record<string, unknown>;
  idempotency_key: string;
}

export interface BuildEnvelopeInput {
  /** Event UUID without the `evt_` prefix (the prefix is applied here). */
  id: string;
  event_type: string;
  tenant_id: string;
  aggregate_id?: string | null;
  data: Record<string, unknown>;
  /** Override timestamp (else uses `new Date().toISOString()`). */
  occurred_at?: string;
}

const ID_PREFIX = 'evt_';

export function buildEventEnvelope(input: BuildEnvelopeInput): WebhookEventEnvelope {
  const id = input.id.startsWith(ID_PREFIX) ? input.id : `${ID_PREFIX}${input.id}`;
  return {
    id,
    event_type: input.event_type,
    timestamp: input.occurred_at ?? new Date().toISOString(),
    tenant_id: input.tenant_id,
    aggregate_id: input.aggregate_id ?? null,
    data: input.data,
    idempotency_key: id,
  };
}

/** Catalog from spec §3 — extend as new event sources land. */
export const KNOWN_EVENT_TYPES: readonly string[] = Object.freeze([
  // ReadyBank
  'question.released',
  'question.updated',
  'question.deprecated',
  // JD-Forge
  'jd_forge.order.created',
  'jd_forge.order.questions_generated',
  'jd_forge.order.exported',
  'jd_forge.order.feedback_received',
  // Stack-Vault
  'stack_vault.question.submitted',
  'stack_vault.question.review_started',
  'stack_vault.question.approved',
  'stack_vault.question.released',
  'stack_vault.question.rejected',
  // Security
  'leak.detected',
  'leak.confirmed',
  'audit.export_requested',
]);

const KNOWN_SET = new Set(KNOWN_EVENT_TYPES);
const VALID_PATTERN = /^[a-z0-9_]+(?:\.[a-z0-9_]+)+$/;

/**
 * Whether `eventType` is structurally valid — either a known type from
 * the catalog or a properly-formed `prefix.subject(.detail…)` slug.
 * Lets new events ship without requiring a code release of the catalog.
 */
export function isValidEventType(eventType: string): boolean {
  if (KNOWN_SET.has(eventType)) return true;
  return VALID_PATTERN.test(eventType) && eventType.length <= 64;
}
