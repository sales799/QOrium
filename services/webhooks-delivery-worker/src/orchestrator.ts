/**
 * Pure-logic delivery orchestrator: given a pending delivery + the
 * subscription's secret + the event payload, build the request,
 * post it, and emit the next state transition (delivered / retry /
 * abandoned). Tests inject the poster + clock; production wires the
 * real `realHttpPoster` + `Date.now`.
 */

import { buildDeliveryHeaders, classifyHttpStatus, nextAttempt } from '@qorium/webhooks';
import type { HttpPoster, PostOutcome } from './poster.js';

export interface PendingDelivery {
  id: string;
  eventId: string;
  subscriptionId: string;
  attemptCount: number;
  /** When the delivery row was first created (unix ms). */
  firstAttemptAt: number;
  /** Endpoint URL captured from the matching subscription. */
  endpointUrl: string;
  /** Subscription's signing secret (cleartext; never logged). */
  signingSecret: string;
  /** Event envelope (final shape per webhooks-service spec §4). */
  envelopeBody: string;
  /** event_type (used for the X-QOrium-Event header + signing). */
  eventType: string;
}

export type NextState =
  | { kind: 'delivered'; httpStatus: number }
  | { kind: 'retry'; httpStatus: number; retryAt: number; reason: string }
  | { kind: 'abandoned'; httpStatus: number; reason: string };

export interface DeliverInputs {
  delivery: PendingDelivery;
  poster: HttpPoster;
  now?: () => number;
}

export interface DeliverResult {
  delivery: PendingDelivery;
  outcome: PostOutcome;
  nextState: NextState;
}

export async function deliverOne(inputs: DeliverInputs): Promise<DeliverResult> {
  const now = inputs.now ?? (() => Date.now());
  const timestamp = Math.floor(now() / 1000);
  const headers = buildDeliveryHeaders({
    secret: inputs.delivery.signingSecret,
    eventType: inputs.delivery.eventType,
    body: inputs.delivery.envelopeBody,
    timestamp,
    deliveryId: inputs.delivery.id,
  });

  const outcome = await inputs.poster.post({
    url: inputs.delivery.endpointUrl,
    body: inputs.delivery.envelopeBody,
    headers: {
      ...headers,
      'content-type': 'application/json',
      accept: 'application/json',
      'x-qorium-event': inputs.delivery.eventType,
      'x-qorium-event-id': inputs.delivery.eventId,
    },
  });

  const classification = classifyHttpStatus(outcome.status);
  if (classification === 'success') {
    return {
      delivery: inputs.delivery,
      outcome,
      nextState: { kind: 'delivered', httpStatus: outcome.status },
    };
  }
  if (classification === 'permanent') {
    return {
      delivery: inputs.delivery,
      outcome,
      nextState: {
        kind: 'abandoned',
        httpStatus: outcome.status,
        reason: outcome.error ?? `HTTP ${outcome.status} (permanent)`,
      },
    };
  }
  // retry — consult the spec backoff curve
  const decision = nextAttempt({
    attemptCount: inputs.delivery.attemptCount + 1,
    firstAttemptAt: inputs.delivery.firstAttemptAt,
    now: () => now(),
  });
  if (decision.kind === 'abandon') {
    return {
      delivery: inputs.delivery,
      outcome,
      nextState: {
        kind: 'abandoned',
        httpStatus: outcome.status,
        reason: decision.reason ?? `HTTP ${outcome.status} (abandoned by retry policy)`,
      },
    };
  }
  return {
    delivery: inputs.delivery,
    outcome,
    nextState: {
      kind: 'retry',
      httpStatus: outcome.status,
      retryAt: decision.retryAt ?? now(),
      reason: outcome.error ?? `HTTP ${outcome.status} (retry)`,
    },
  };
}
