// Read-only billing overview for the admin console (N8). Small grouped
// round-trips over the LIVE customer-centric billing schema
// (billing.subscriptions JOIN billing.customers), scoped to the readybank SKU,
// plus the active payment-provider name from the runtime env selector. Counts
// are pulled in separate grouped queries (by status, by tier, by provider, by
// currency) rather than one multi-GROUP query so each breakdown stays a clean
// 1-D count with no cross-dimension fan-out. The live-amount query groups the
// revenue-bearing (trial+active) rows by (currency, billing_cycle) and sums
// unit_amount_cents so the presenter can fold a per-currency monthly MRR
// estimate without scanning individual rows. No tenant identity, no PII, no
// question content -- only aggregate subscription counts and committed amounts.
// The folding into the stable 0-filled report shape lives in
// lib/billing-overview.ts.

import type { Pool } from '@qorium/db';
import { activeProviderName } from '../lib/payment-provider.js';
import {
  computeBillingOverview,
  type BillingOverviewReport,
  type StatusCountRow,
  type TierCountRow,
  type ProviderCountRow,
  type CurrencyCountRow,
  type LiveAmountRow,
} from '../lib/billing-overview.js';

const SKU = 'readybank';

export async function getBillingOverview(pool: Pool): Promise<BillingOverviewReport> {
  const num = (v: string | null | undefined): number => (v != null ? Number(v) : 0);

  const status = await pool.query<{ status: string | null; count: string | null }>(
    `SELECT s.status AS status, count(*) AS count
       FROM billing.subscriptions s
      WHERE s.sku = $1
      GROUP BY s.status`,
    [SKU],
  );

  const tier = await pool.query<{ tier: string | null; count: string | null }>(
    `SELECT s.tier AS tier, count(*) AS count
       FROM billing.subscriptions s
      WHERE s.sku = $1
      GROUP BY s.tier`,
    [SKU],
  );

  const provider = await pool.query<{ provider: string | null; count: string | null }>(
    `SELECT c.payment_provider AS provider, count(*) AS count
       FROM billing.subscriptions s
       JOIN billing.customers c ON c.id = s.customer_id
      WHERE s.sku = $1
      GROUP BY c.payment_provider`,
    [SKU],
  );

  const currency = await pool.query<{ currency: string | null; count: string | null }>(
    `SELECT s.currency AS currency, count(*) AS count
       FROM billing.subscriptions s
      WHERE s.sku = $1
      GROUP BY s.currency`,
    [SKU],
  );

  // Committed recurring amounts for the live (revenue-bearing) set only. Grouped
  // by (currency, billing_cycle) with summed unit_amount_cents so the presenter
  // can normalise each cycle to a monthly figure. Rows with a NULL amount fold
  // to 0 via coalesce and contribute nothing.
  const liveAmounts = await pool.query<{
    currency: string | null;
    billing_cycle: string | null;
    amount_cents: string | null;
    count: string | null;
  }>(
    `SELECT s.currency AS currency,
            s.billing_cycle AS billing_cycle,
            coalesce(sum(s.unit_amount_cents), 0) AS amount_cents,
            count(*) AS count
       FROM billing.subscriptions s
      WHERE s.sku = $1
        AND s.status IN ('trial', 'active')
      GROUP BY s.currency, s.billing_cycle`,
    [SKU],
  );

  const statusRows: StatusCountRow[] = status.rows.map((r) => ({
    status: r.status ?? '',
    count: num(r.count),
  }));
  const tierRows: TierCountRow[] = tier.rows.map((r) => ({
    tier: r.tier ?? '',
    count: num(r.count),
  }));
  const providerRows: ProviderCountRow[] = provider.rows.map((r) => ({
    provider: r.provider ?? '',
    count: num(r.count),
  }));
  const currencyRows: CurrencyCountRow[] = currency.rows.map((r) => ({
    currency: r.currency ?? '',
    count: num(r.count),
  }));
  // The grouped sum already aggregates per (currency, cycle); pass each group as
  // a single LiveAmountRow with unit_amount_cents = the group sum and count = 1
  // (the presenter multiplies amount * count, so the pre-summed amount with a
  // count of 1 yields exactly the group total).
  const liveAmountRows: LiveAmountRow[] = liveAmounts.rows.map((r) => ({
    currency: r.currency ?? '',
    billing_cycle: r.billing_cycle ?? '',
    unit_amount_cents: num(r.amount_cents),
    count: 1,
  }));

  return computeBillingOverview(
    activeProviderName(),
    statusRows,
    tierRows,
    providerRows,
    currencyRows,
    liveAmountRows,
  );
}
