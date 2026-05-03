import type { Pool } from '@qorium/db';

export interface RecordPaymentInput {
  invoiceId: string;
  paymentProvider: 'razorpay' | 'stripe' | 'manual';
  providerPaymentId?: string | null;
  providerOrderId?: string | null;
  amountCents: number;
  currency: string;
  status: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';
  errorMessage?: string | null;
  rawEvent?: unknown;
}

export interface PaymentRow {
  id: string;
  invoiceId: string;
  paymentProvider: string;
  providerPaymentId: string | null;
  providerOrderId: string | null;
  amountCents: number;
  currency: string;
  status: string;
  errorMessage: string | null;
  attemptCount: number;
  createdAt: string;
}

interface RawPaymentRow {
  id: string;
  invoice_id: string;
  payment_provider: string;
  provider_payment_id: string | null;
  provider_order_id: string | null;
  amount_cents: string | number;
  currency: string;
  status: string;
  error_message: string | null;
  attempt_count: number;
  created_at: Date;
}

function toRow(r: RawPaymentRow): PaymentRow {
  return {
    id: r.id,
    invoiceId: r.invoice_id,
    paymentProvider: r.payment_provider,
    providerPaymentId: r.provider_payment_id,
    providerOrderId: r.provider_order_id,
    amountCents: Number(r.amount_cents),
    currency: r.currency,
    status: r.status,
    errorMessage: r.error_message,
    attemptCount: r.attempt_count,
    createdAt: r.created_at.toISOString(),
  };
}

export async function recordPayment(pool: Pool, input: RecordPaymentInput): Promise<PaymentRow> {
  const result = await pool.query<RawPaymentRow>(
    `INSERT INTO billing.payments
       (invoice_id, payment_provider, provider_payment_id, provider_order_id,
        amount_cents, currency, status, error_message, attempt_count, raw_event)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1, $9)
     RETURNING id, invoice_id, payment_provider, provider_payment_id, provider_order_id,
               amount_cents, currency, status, error_message, attempt_count, created_at`,
    [
      input.invoiceId,
      input.paymentProvider,
      input.providerPaymentId ?? null,
      input.providerOrderId ?? null,
      input.amountCents,
      input.currency,
      input.status,
      input.errorMessage ?? null,
      input.rawEvent ? JSON.stringify(input.rawEvent) : null,
    ],
  );
  const row = result.rows[0];
  if (!row) throw new Error('recordPayment: insert returned no row');
  return toRow(row);
}
