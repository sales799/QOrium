import type { Pool } from '@qorium/db';

export interface CustomerRow {
  id: string;
  tenantId: string;
  displayName: string;
  email: string;
  country: string;
  currency: string;
  taxId: string | null;
  billingAddress: Record<string, unknown>;
  paymentProvider: string | null;
  providerCustomerId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface RawRow {
  id: string;
  tenant_id: string;
  display_name: string;
  email: string;
  country: string;
  currency: string;
  tax_id: string | null;
  billing_address: Record<string, unknown> | null;
  payment_provider: string | null;
  provider_customer_id: string | null;
  created_at: Date;
  updated_at: Date;
}

const SELECT = `
  SELECT id, tenant_id, display_name, email, country, currency, tax_id,
         billing_address, payment_provider, provider_customer_id,
         created_at, updated_at
    FROM billing.customers
`;

function toRow(r: RawRow): CustomerRow {
  return {
    id: r.id,
    tenantId: r.tenant_id,
    displayName: r.display_name,
    email: r.email,
    country: r.country,
    currency: r.currency,
    taxId: r.tax_id,
    billingAddress: r.billing_address ?? {},
    paymentProvider: r.payment_provider,
    providerCustomerId: r.provider_customer_id,
    createdAt: r.created_at.toISOString(),
    updatedAt: r.updated_at.toISOString(),
  };
}

export interface UpsertCustomerInput {
  tenantId: string;
  displayName: string;
  email: string;
  country?: string;
  currency?: string;
  taxId?: string | null;
  billingAddress?: Record<string, unknown>;
  paymentProvider?: string | null;
  providerCustomerId?: string | null;
}

export async function upsertCustomer(pool: Pool, input: UpsertCustomerInput): Promise<CustomerRow> {
  const result = await pool.query<RawRow>(
    `INSERT INTO billing.customers
       (tenant_id, display_name, email, country, currency, tax_id, billing_address,
        payment_provider, provider_customer_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (tenant_id) DO UPDATE SET
       display_name = EXCLUDED.display_name,
       email = EXCLUDED.email,
       country = EXCLUDED.country,
       currency = EXCLUDED.currency,
       tax_id = COALESCE(EXCLUDED.tax_id, billing.customers.tax_id),
       billing_address = EXCLUDED.billing_address,
       payment_provider = COALESCE(EXCLUDED.payment_provider, billing.customers.payment_provider),
       provider_customer_id = COALESCE(EXCLUDED.provider_customer_id, billing.customers.provider_customer_id),
       updated_at = NOW()
     RETURNING id, tenant_id, display_name, email, country, currency, tax_id,
               billing_address, payment_provider, provider_customer_id,
               created_at, updated_at`,
    [
      input.tenantId,
      input.displayName,
      input.email,
      input.country ?? 'IN',
      input.currency ?? 'INR',
      input.taxId ?? null,
      input.billingAddress ?? {},
      input.paymentProvider ?? null,
      input.providerCustomerId ?? null,
    ],
  );
  const row = result.rows[0];
  if (!row) throw new Error('upsertCustomer: insert returned no row');
  return toRow(row);
}

export async function getCustomerByTenantId(
  pool: Pool,
  tenantId: string,
): Promise<CustomerRow | null> {
  const result = await pool.query<RawRow>(`${SELECT} WHERE tenant_id = $1 LIMIT 1`, [tenantId]);
  return result.rows[0] ? toRow(result.rows[0]) : null;
}

export async function listCustomers(
  pool: Pool,
  opts: { limit?: number } = {},
): Promise<CustomerRow[]> {
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 200);
  const result = await pool.query<RawRow>(`${SELECT} ORDER BY created_at DESC LIMIT $1`, [limit]);
  return result.rows.map(toRow);
}
