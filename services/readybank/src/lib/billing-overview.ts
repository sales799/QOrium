// Pure presenter for the admin billing overview (N8 admin console). Takes the
// raw grouped subscription rows + the active payment-provider name and folds
// them into a stable, 0-filled report the admin UI can render without any
// further normalisation. No DB access here (that lives in
// repositories/billing-overview.ts) and no PII -- only aggregate subscription
// counts over the readybank SKU.
//
// status is constrained live to {trial, active, past_due, canceled, paused};
// we always emit all five keys (0-filled) so the UI never has to guard for a
// missing bucket. live_subscriptions = trial + active (the revenue-bearing or
// soon-to-bill set). tier and provider breakdowns are dynamic maps.
//
// by_currency is a dynamic count map over every subscription's currency code.
// estimated_mrr_cents is a per-currency monthly-normalised recurring-revenue
// estimate computed ONLY over live (trial+active) subscriptions: each row's
// unit_amount_cents is divided down to a monthly figure by its billing_cycle
// (monthly=1, quarterly=3, annual=12; usage rows carry no committed recurring
// amount and are excluded). Currencies are never summed together -- the map is
// keyed by currency code so the UI can render each line in its own unit.

export const BILLING_STATUSES = ['trial', 'active', 'past_due', 'canceled', 'paused'] as const;
export type BillingStatus = (typeof BILLING_STATUSES)[number];

// Divisor that turns a per-cycle committed amount into a monthly-equivalent
// amount. usage has no fixed committed recurring amount, so it is excluded from
// the MRR estimate entirely (see computeBillingOverview).
const CYCLE_MONTHS: Record<string, number> = {
  monthly: 1,
  quarterly: 3,
  annual: 12,
};

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
export interface CurrencyCountRow {
  currency: string;
  count: number;
}
// One live (trial/active) subscription's committed-amount contribution. Grouped
// upstream by (currency, billing_cycle) so the presenter stays O(distinct
// cycle/currency pairs) rather than O(subscriptions).
export interface LiveAmountRow {
  currency: string;
  billing_cycle: string;
  unit_amount_cents: number;
  count: number;
}

export interface BillingOverviewReport {
  active_provider: string;
  total: number;
  by_status: Record<BillingStatus, number>;
  by_tier: Record<string, number>;
  by_provider: Record<string, number>;
  by_currency: Record<string, number>;
  // Per-currency monthly-normalised recurring revenue estimate, in minor units
  // (cents/paise). Live subscriptions only; usage-cycle rows excluded.
  estimated_mrr_cents: Record<string, number>;
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
  currencyRows: CurrencyCountRow[] = [],
  liveAmountRows: LiveAmountRow[] = [],
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

  const by_currency: Record<string, number> = {};
  for (const r of currencyRows) {
    const currency = (r.currency || 'unknown').toUpperCase();
    by_currency[currency] = (by_currency[currency] ?? 0) + r.count;
  }

  const estimated_mrr_cents: Record<string, number> = {};
  for (const r of liveAmountRows) {
    const months = CYCLE_MONTHS[r.billing_cycle];
    // Skip usage and any unknown cycle: no fixed committed recurring amount.
    if (!months) continue;
    const currency = (r.currency || 'unknown').toUpperCase();
    const monthly = Math.round((r.unit_amount_cents * r.count) / months);
    estimated_mrr_cents[currency] = (estimated_mrr_cents[currency] ?? 0) + monthly;
  }

  const total = BILLING_STATUSES.reduce((sum, s) => sum + by_status[s], 0);
  const live_subscriptions = by_status.trial + by_status.active;

  return {
    active_provider: activeProvider,
    total,
    by_status,
    by_tier,
    by_provider,
    by_currency,
    estimated_mrr_cents,
    live_subscriptions,
  };
}
