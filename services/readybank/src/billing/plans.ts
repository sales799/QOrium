// BR-billing — plan catalog (CEO-ratified pricing 2026-06-03).
// Razorpay plan_ids are NOT hard-coded: create the plans once in the Razorpay
// dashboard and put the returned plan_id into the env var named in razorpayPlanEnv.

export type PlanId = 'free' | 'growth' | 'scale' | 'enterprise';

export interface Plan {
  id: PlanId;
  name: string;
  priceInr: number; // monthly INR; 0 = free or custom
  razorpayPlanEnv?: string;
  limits: { assessmentsPerMonth: number; attemptsPerMonth: number }; // -1 = unlimited
  custom?: boolean;
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Customer Zero (Free)',
    priceInr: 0,
    limits: { assessmentsPerMonth: 5, attemptsPerMonth: 50 },
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    priceInr: 4999,
    razorpayPlanEnv: 'RAZORPAY_PLAN_GROWTH',
    limits: { assessmentsPerMonth: 50, attemptsPerMonth: 1000 },
  },
  scale: {
    id: 'scale',
    name: 'Scale',
    priceInr: 19999,
    razorpayPlanEnv: 'RAZORPAY_PLAN_SCALE',
    limits: { assessmentsPerMonth: 500, attemptsPerMonth: 20000 },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    priceInr: 0,
    custom: true,
    limits: { assessmentsPerMonth: -1, attemptsPerMonth: -1 },
  },
};

export function isPlanId(v: unknown): v is PlanId {
  return v === 'free' || v === 'growth' || v === 'scale' || v === 'enterprise';
}

export function planUnitAmountCents(id: PlanId): number {
  return PLANS[id].priceInr * 100;
}
