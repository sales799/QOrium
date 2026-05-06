/**
 * Pure-logic event emitter — given a domain event, fans it out into
 * the (event, subscription) cross product and produces the rows the
 * caller persists into `webhooks.events` + `webhooks.deliveries`.
 *
 * Subscription matching per `infra/Webhooks-Service-v0-Spec.md` §3:
 *   - exact `event_type` match
 *   - wildcard `*` matches everything
 *   - prefix-style wildcards (e.g. `jd_forge.*`) match any sub-event
 */

import type { EventType } from '@qorium/webhooks';

export interface SubscriptionMatch {
  id: string;
  tenantId: string;
  eventType: string;
  endpointUrl: string;
  isActive: boolean;
}

export interface DomainEvent {
  /** Tenant scope for the event. */
  tenantId: string;
  eventType: EventType | string;
  aggregateId?: string;
  payload: Record<string, unknown>;
}

export interface PreparedEvent {
  event: DomainEvent;
  matches: SubscriptionMatch[];
}

export function matchSubscriptions(
  event: DomainEvent,
  subscriptions: SubscriptionMatch[],
): SubscriptionMatch[] {
  return subscriptions.filter((sub) => {
    if (!sub.isActive) return false;
    if (sub.tenantId !== event.tenantId) return false;
    return matchEventType(sub.eventType, event.eventType);
  });
}

export function matchEventType(pattern: string, eventType: string): boolean {
  if (pattern === '*') return true;
  if (pattern === eventType) return true;
  if (pattern.endsWith('.*')) {
    const prefix = pattern.slice(0, -2);
    if (eventType === prefix) return true;
    return eventType.startsWith(`${prefix}.`);
  }
  return false;
}

export function prepareEvent(
  event: DomainEvent,
  subscriptions: SubscriptionMatch[],
): PreparedEvent {
  return {
    event,
    matches: matchSubscriptions(event, subscriptions),
  };
}
