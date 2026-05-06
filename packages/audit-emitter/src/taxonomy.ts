/**
 * Standard event taxonomy for audit emission. Domain services pick from
 * this catalogue rather than free-stringing `action` names so the audit
 * log query surface (filter by `action`) and the SO-9 / SO-21 audit
 * dashboards stay deterministic.
 *
 * Naming convention: `{resource_type}.{verb}` — resource_type uses
 * snake_case singular, verb is past-tense. New entries land here as
 * domain services need them; the union type below auto-tightens.
 */

export const AUDIT_ACTIONS = {
  api_key: ['api_key.created', 'api_key.revoked', 'api_key.rotated', 'api_key.scope_changed'],
  billing: [
    'billing.customer.created',
    'billing.subscription.created',
    'billing.subscription.cancelled',
    'billing.invoice.issued',
    'billing.invoice.paid',
    'billing.invoice.refunded',
    'billing.payment.failed',
  ],
  sso: [
    'sso.config.created',
    'sso.config.updated',
    'sso.config.activated',
    'sso.config.disabled',
    'sso.login.success',
    'sso.login.failure',
  ],
  webhooks: [
    'webhooks.subscription.created',
    'webhooks.subscription.updated',
    'webhooks.subscription.deleted',
    'webhooks.delivery.succeeded',
    'webhooks.delivery.failed',
  ],
  ats: [
    'ats.integration.created',
    'ats.integration.activated',
    'ats.integration.deactivated',
    'ats.sync.started',
    'ats.sync.completed',
    'ats.sync.failed',
  ],
  question: [
    'question.created',
    'question.updated',
    'question.published',
    'question.deprecated',
    'question.rotated',
  ],
  pack: ['pack.created', 'pack.updated', 'pack.exported', 'pack.deleted'],
  session: [
    'session.started',
    'session.completed',
    'session.abandoned',
    'session.flagged_for_review',
  ],
  secret: ['secret.rotation.scheduled', 'secret.rotation.completed', 'secret.rotation.failed'],
} as const;

type ActionsByResource = typeof AUDIT_ACTIONS;
type ResourceKeys = keyof ActionsByResource;

/** Flat union of every well-known action string. */
export type AuditAction = ActionsByResource[ResourceKeys][number];

const FLAT: ReadonlySet<string> = new Set(
  (Object.values(AUDIT_ACTIONS) as ReadonlyArray<ReadonlyArray<string>>).flat(),
);

/**
 * Returns true if `action` is in the canonical taxonomy. Domain services
 * may still emit ad-hoc actions (the audit-log endpoint allows them);
 * this just lets the emitter warn callers when they drift.
 */
export function isKnownAction(action: string): action is AuditAction {
  return FLAT.has(action);
}

/**
 * Returns the resource-type prefix of a canonical action (e.g.
 * `'api_key.created'` → `'api_key'`). Returns null for unknown actions.
 */
export function actionResource(action: string): ResourceKeys | null {
  const dot = action.indexOf('.');
  if (dot < 0) return null;
  const prefix = action.slice(0, dot) as ResourceKeys;
  return prefix in AUDIT_ACTIONS ? prefix : null;
}

/** All known actions for a given resource. Useful for UI dropdowns. */
export function actionsFor<K extends ResourceKeys>(
  resource: K,
): ReadonlyArray<ActionsByResource[K][number]> {
  return AUDIT_ACTIONS[resource];
}
