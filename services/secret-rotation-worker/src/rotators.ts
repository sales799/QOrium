/**
 * Per-resource-type rotators per
 * `infra/B6-Secret-Rotation-Calendar.md` §4.
 *
 * Each rotator is interface-complete; the live implementation needs
 * provider credentials (Razorpay account, Anthropic dashboard token,
 * etc.). The Stub default is what runs in dev + tests.
 */

import type { Pool } from '@qorium/db';

export interface RotationContext {
  resourceKey: string;
  resourceType: string;
  metadata: Record<string, unknown>;
  pool: Pool;
}

export interface RotationOutcome {
  ok: boolean;
  newDueDate: Date;
  message: string;
  /** Plaintext value the operator will need to write to the env / secret store. Never logged. */
  newValue?: string;
}

export type Rotator = (ctx: RotationContext) => Promise<RotationOutcome>;

/**
 * Stub rotator — does not contact upstream providers; reschedules the
 * row and returns a fake "rotated" outcome. Used in dev / tests.
 */
export function stubRotator(policyDays: number): Rotator {
  return async (ctx) => ({
    ok: true,
    newDueDate: new Date(Date.now() + policyDays * 86_400_000),
    message: `[stub] rotated ${ctx.resourceKey} (no upstream call)`,
  });
}

/**
 * Webhook subscription rotator. v0 ships interface-complete; the live
 * implementation will call `services/webhooks` with an admin token and
 * regenerate the signing secret.
 */
export function webhookSubscriptionRotator(
  policyDays: number,
  opts: { adminToken?: string } = {},
): Rotator {
  return async (_ctx) => {
    if (!opts.adminToken) {
      return {
        ok: false,
        newDueDate: new Date(Date.now() + 86_400_000),
        message: 'webhook rotator requires WEBHOOKS_ADMIN_TOKEN; deferred',
      };
    }
    return {
      ok: true,
      newDueDate: new Date(Date.now() + policyDays * 86_400_000),
      message: 'webhook rotator wire-up pending live token',
    };
  };
}

/** Default rotator registry. Per resource_type, returns the rotator. */
export interface RotatorRegistry {
  get(resourceType: string): Rotator;
  has(resourceType: string): boolean;
}

export function defaultRotatorRegistry(opts: {
  policyDays: Record<string, number>;
  webhooksAdminToken?: string;
}): RotatorRegistry {
  const map = new Map<string, Rotator>();
  for (const [type, days] of Object.entries(opts.policyDays)) {
    if (type === 'webhook_subscription_secret') {
      const rotatorOpts: { adminToken?: string } = {};
      if (opts.webhooksAdminToken !== undefined) {
        rotatorOpts.adminToken = opts.webhooksAdminToken;
      }
      map.set(type, webhookSubscriptionRotator(days, rotatorOpts));
    } else {
      map.set(type, stubRotator(days));
    }
  }
  return {
    get(type) {
      const r = map.get(type);
      if (!r) throw new Error(`no rotator registered for ${type}`);
      return r;
    },
    has(type) {
      return map.has(type);
    },
  };
}
