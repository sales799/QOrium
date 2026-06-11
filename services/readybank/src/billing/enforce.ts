import type { Pool } from '@qorium/db';
import { HttpProblem } from '../middleware/problem.js';
import { PLANS, isPlanId, type PlanId } from './plans.js';
import {
  getSubscriptionForTenant,
  getUsageForTenant,
  getCustomerIdByTenant,
  incrementUsageByCustomer,
} from '../repositories/billing.js';

export type LimitMetric = 'assessment' | 'attempt';

async function currentPlan(pool: Pool, tenantId: string): Promise<PlanId> {
  const sub = await getSubscriptionForTenant(pool, tenantId);
  if (sub && isPlanId(sub.tier) && (sub.status === 'active' || sub.status === 'trial')) {
    return sub.tier;
  }
  return 'free';
}

// Recruiter / API-facing guard. Throws 402 + upgrade CTA when the tenant has hit
// its monthly plan cap. NEVER called on candidate-facing paths (no candidate 402).
export async function assertWithinLimit(
  pool: Pool,
  tenantId: string,
  metric: LimitMetric,
): Promise<void> {
  const plan = await currentPlan(pool, tenantId);
  const limits = PLANS[plan].limits;
  const cap = metric === 'assessment' ? limits.assessmentsPerMonth : limits.attemptsPerMonth;
  if (cap === -1) return; // unlimited
  const usage = await getUsageForTenant(pool, tenantId);
  const used = metric === 'assessment' ? usage.assessments : usage.invites;
  if (used >= cap) {
    throw new HttpProblem({
      status: 402,
      title: 'Payment Required',
      detail: `Monthly ${metric} limit reached for the ${PLANS[plan].name} plan (${cap}/month). Upgrade to continue.`,
      extensions: { plan, metric, used, limit: cap, upgrade_url: 'https://qorium.online/pricing' },
    });
  }
}

// Fire-and-safe usage recorder. No-op when the tenant has no billing customer yet.
export async function recordUsage(pool: Pool, tenantId: string, metricKey: string): Promise<void> {
  const cid = await getCustomerIdByTenant(pool, tenantId);
  if (cid) await incrementUsageByCustomer(pool, cid, metricKey);
}
