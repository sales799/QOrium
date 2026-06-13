// Pure presenter for the admin billing overview (N8 admin console). Takes the
// raw grouped subscription rows + the active payment-provider name and folds
// them into a stable, 0-filled report the admin UI can render without any
// further normalisation. No DB access here (that lives in
// repositories/billing-overview.ts) and no PII — only aggregate subscription
// counts over the readybank SKU.
//
// status is constrained live to {trial, active, past_due, canceled, paused};
// we always emit all five keys (0-filled) so the UI never has to guard for a
// missing bucket. live_subscriptions = trial + active (the revenue-bearing or
// soon-to-bill set). tier and provider breakdowns are dynamic maps.

export const BILLING_STATUSES = ['trial', 'active', 'past_due', 'canceled', 'paused'] as const;
export type BillingStatus = (typeof BILLING_STATUSES)[number];

export interface StatusCountRow {
  status: string;
  count: number;
}
export interface TierCountRow {
  tier: string;
  count: number;
}
export interface ProviderCountRow {
  provider: string;
  count: number;
}

export interface BillingOverviewReport {
  active_provider: string;
  total: number;
  by_status: Record<BillingStatus, number>;
  by_tier: Record<string, number>;
  by_provider: Record<string, number>;
  live_subscriptions: number;
}

function zeroFilledStatus(): Record<BillingStatus, number> {
  return BILLING_STATUSES.reduce(
    (acc, s) => {
      acc[s] = 0;
      return acc;
    },
    {} as Record<BillingStatus, number>,
  );
}

export function computeBillingOverview(
  activeProvider: string,
  statusRows: StatusCountRow[],
  tierRows: TierCountRow[],
  providerRows: ProviderCountRow[],
): BillingOverviewReport {
  const by_status = zeroFilledStatus();
  for (const r of statusRows) {
    const s = r.status as BillingStatus;
    if (s in by_status) by_status[s] += r.count;
  }

  const by_tier: Record<string, number> = {};
  for (const r of tierRows) {
    const tier = r.tier || 'unknown';
    by_tier[tier] = (by_tier[tier] ?? 0) + r.count;
  }

  const by_provider: Record<string, number> = {};
  for (const r of providerRows) {
    const provider = r.provider || 'unknown';
    by_provider[provider] = (by_provider[provider] ?? 0) + r.count;
  }

  const total = BILLING_STATUSES.reduce((sum, s) => sum + by_status[s], 0);
  const live_subscriptions = by_status.trial + by_status.active;

  return {
    active_provider: activeProvider,
    total,
    by_status,
    by_tier,
    by_provider,
    live_subscriptions,
  };
}
