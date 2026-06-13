// Read-only billing overview for the admin console (N8). Three small grouped
// round-trips over the LIVE customer-centric billing schema
// (billing.subscriptions JOIN billing.customers), scoped to the readybank SKU,
// plus the active payment-provider name from the runtime env selector. Counts
// are pulled in separate grouped queries (by status, by tier, by provider)
// rather than one multi-GROUP query so each breakdown stays a clean 1-D count
// with no cross-dimension fan-out. No tenant identity, no PII, no question
// content — only aggregate subscription counts. The folding into the stable
// 0-filled report shape lives in lib/billing-overview.ts.

import type { Pool } from '@qorium/db';
import { activeProviderName } from '../lib/payment-provider.js';
import {
  computeBillingOverview,
  type BillingOverviewReport,
  type StatusCountRow,
  type TierCountRow,
  type ProviderCountRow,
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

  return computeBillingOverview(activeProviderName(), statusRows, tierRows, providerRows);
}
