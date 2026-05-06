/**
 * Event envelope construction per `infra/Webhooks-Service-v0-Spec.md` §4.
 *
 * Pure logic. The orchestrator wraps publishable domain events into the
 * customer-facing envelope before signing + posting.
 */

export interface EnvelopeInputs {
  id: string; // event uuid (also used as idempotency_key)
  eventType: string;
  tenantId: string;
  aggregateId?: string | undefined;
  data: Record<string, unknown>;
  timestamp?: string | undefined; // ISO string; default = now
  /** Optional clock for tests. */
  now?: () => Date;
}

export interface Envelope {
  id: string;
  event_type: string;
  timestamp: string;
  tenant_id: string;
  aggregate_id: string | null;
  data: Record<string, unknown>;
  idempotency_key: string;
}

export function buildEnvelope(inputs: EnvelopeInputs): Envelope {
  const ts = inputs.timestamp ?? (inputs.now ? inputs.now() : new Date()).toISOString();
  return {
    id: inputs.id,
    event_type: inputs.eventType,
    timestamp: ts,
    tenant_id: inputs.tenantId,
    aggregate_id: inputs.aggregateId ?? null,
    data: inputs.data,
    idempotency_key: inputs.id,
  };
}

/** Canonical event types per spec §3 (taxonomy). */
export const EVENT_TYPES = [
  'question.released',
  'question.updated',
  'question.deprecated',
  'jd_forge.order.created',
  'jd_forge.order.questions_generated',
  'jd_forge.order.exported',
  'jd_forge.order.feedback_received',
  'stack_vault.question.submitted',
  'stack_vault.question.review_started',
  'stack_vault.question.approved',
  'stack_vault.question.released',
  'stack_vault.question.rejected',
  'leak.detected',
  'leak.confirmed',
  'audit.export_requested',
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export function isCanonicalEventType(value: string): value is EventType {
  return (EVENT_TYPES as readonly string[]).includes(value);
}
