import type { Pool } from '@qorium/db';

// BR-billing persistence — targets the LIVE customer-centric billing schema.
//   billing.customers(tenant_id, display_name, email, payment_provider, ...)
//   billing.subscriptions(customer_id, sku, tier, status, unit_amount_cents,
//                         currency, billing_cycle, current_period_start/end, metadata)
// Schema CHECK constraints (enforced live):
//   sku    in {readybank, jd_forge, stack_vault}  -> assessment platform = 'readybank'
//   status in {trial, active, past_due, canceled, paused}
//   billing_cycle in {monthly, quarterly, annual, usage}
// The QOrium plan (free/growth/scale/enterprise) is the `tier`; razorpay sub id
// lives in metadata. usage_records is keyed by customer_id.

const SKU = 'readybank';
const ALLOWED_STATUS = new Set(['trial', 'active', 'past_due', 'canceled', 'paused']);
function normStatus(s: string): string {
  return ALLOWED_STATUS.has(s) ? s : 'active';
}

export interface SubscriptionView {
  tier: string;
  status: string;
  current_period_end: string | null;
  razorpay_subscription_id: string | null;
}

export async function getCustomerIdByTenant(pool: Pool, tenantId: string): Promise<string | null> {
  const r = await pool.query<{ id: string }>(
    `SELECT id::text FROM billing.customers WHERE tenant_id = $1 ORDER BY created_at LIMIT 1`,
    [tenantId],
  );
  return r.rows[0]?.id ?? null;
}

export async function ensureCustomer(
  pool: Pool,
  args: { tenantId: string; email: string; name: string },
): Promise<string> {
  const existing = await getCustomerIdByTenant(pool, args.tenantId);
  if (existing) return existing;
  const r = await pool.query<{ id: string }>(
    `INSERT INTO billing.customers (tenant_id, display_name, email, payment_provider)
     VALUES ($1, $2, $3, 'razorpay')
     RETURNING id::text`,
    [args.tenantId, args.name || args.email, args.email],
  );
  return r.rows[0]!.id;
}

export async function getSubscriptionForTenant(
  pool: Pool,
  tenantId: string,
): Promise<SubscriptionView | null> {
  const r = await pool.query<SubscriptionView>(
    `SELECT s.tier, s.status,
            to_char(s.current_period_end, 'YYYY-MM-DD') AS current_period_end,
            s.metadata->>'razorpay_subscription_id' AS razorpay_subscription_id
       FROM billing.subscriptions s
       JOIN billing.customers c ON c.id = s.customer_id
      WHERE c.tenant_id = $1
      ORDER BY s.updated_at DESC LIMIT 1`,
    [tenantId],
  );
  return r.rows[0] ?? null;
}

export async function findTenantByRazorpaySubscription(
  pool: Pool,
  rzpSubId: string,
): Promise<string | null> {
  const r = await pool.query<{ tenant_id: string }>(
    `SELECT c.tenant_id::text
       FROM billing.subscriptions s
       JOIN billing.customers c ON c.id = s.customer_id
      WHERE s.metadata->>'razorpay_subscription_id' = $1
      ORDER BY s.updated_at DESC LIMIT 1`,
    [rzpSubId],
  );
  return r.rows[0]?.tenant_id ?? null;
}

/** Upsert the single active subscription for a customer (one per customer here). */
export async function upsertSubscription(
  pool: Pool,
  args: {
    customerId: string;
    tier: string;
    status: string;
    unitAmountCents: number;
    razorpaySubscriptionId?: string | null;
    currentPeriodEnd?: Date | null;
  },
): Promise<void> {
  const status = normStatus(args.status);
  const periodEnd = args.currentPeriodEnd ?? null;
  const existing = await pool.query<{ id: string }>(
    `SELECT id::text FROM billing.subscriptions WHERE customer_id = $1 ORDER BY updated_at DESC LIMIT 1`,
    [args.customerId],
  );
  const meta = JSON.stringify(
    args.razorpaySubscriptionId ? { razorpay_subscription_id: args.razorpaySubscriptionId } : {},
  );
  if (existing.rows[0]) {
    await pool.query(
      `UPDATE billing.subscriptions
          SET sku = $7, tier = $2, status = $3, unit_amount_cents = $4,
              billing_cycle = 'monthly',
              current_period_end = COALESCE($5::date, current_period_end),
              metadata = billing.subscriptions.metadata || $6::jsonb,
              updated_at = now()
        WHERE id = $1`,
      [existing.rows[0].id, args.tier, status, args.unitAmountCents, periodEnd, meta, SKU],
    );
  } else {
    await pool.query(
      `INSERT INTO billing.subscriptions
         (customer_id, sku, tier, status, unit_amount_cents, currency, billing_cycle,
          current_period_start, current_period_end, metadata)
       VALUES ($1, $7, $2, $3, $4, 'INR', 'monthly',
               CURRENT_DATE, COALESCE($5::date, CURRENT_DATE + INTERVAL '1 month'), $6::jsonb)`,
      [args.customerId, args.tier, status, args.unitAmountCents, periodEnd, meta, SKU],
    );
  }
}

// ── Usage metering ───────────────────────────────────────────────────────────
export async function incrementUsageByCustomer(
  pool: Pool,
  customerId: string,
  metric: string,
): Promise<void> {
  await pool.query(
    `INSERT INTO billing.usage_records (customer_id, metric, quantity, event_date)
     VALUES ($1, $2, 1, CURRENT_DATE)`,
    [customerId, metric],
  );
}

export async function getUsageForTenant(
  pool: Pool,
  tenantId: string,
): Promise<{ assessments: number; attempts: number; invites: number }> {
  const cid = await getCustomerIdByTenant(pool, tenantId);
  if (!cid) return { assessments: 0, attempts: 0, invites: 0 };
  const r = await pool.query<{ metric: string; total: string }>(
    `SELECT metric, sum(quantity)::text AS total
       FROM billing.usage_records
      WHERE customer_id = $1 AND date_trunc('month', event_date) = date_trunc('month', CURRENT_DATE)
      GROUP BY metric`,
    [cid],
  );
  const m = new Map(r.rows.map((x) => [x.metric, Number(x.total)]));
  return {
    assessments: m.get('assessment.created') ?? 0,
    attempts: m.get('attempt.graded') ?? 0,
    invites: m.get('invitation.created') ?? 0,
  };
}
