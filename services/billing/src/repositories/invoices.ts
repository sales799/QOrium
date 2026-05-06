import type { Pool } from '@qorium/db';

export interface InvoiceRow {
  id: string;
  customerId: string;
  invoiceNumber: string;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
  status: string;
  issuedAt: string | null;
  dueDate: string | null;
  paidAt: string | null;
  pdfUrl: string | null;
  notes: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface RawInvoiceRow {
  id: string;
  customer_id: string;
  invoice_number: string;
  subtotal_cents: string | number;
  tax_cents: string | number;
  total_cents: string | number;
  currency: string;
  status: string;
  issued_at: Date | null;
  due_date: Date | null;
  paid_at: Date | null;
  pdf_url: string | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
}

const SELECT = `
  SELECT id, customer_id, invoice_number, subtotal_cents, tax_cents, total_cents,
         currency, status, issued_at, due_date, paid_at, pdf_url, notes, metadata,
         created_at, updated_at
    FROM billing.invoices
`;

function toRow(r: RawInvoiceRow): InvoiceRow {
  return {
    id: r.id,
    customerId: r.customer_id,
    invoiceNumber: r.invoice_number,
    subtotalCents: Number(r.subtotal_cents),
    taxCents: Number(r.tax_cents),
    totalCents: Number(r.total_cents),
    currency: r.currency,
    status: r.status,
    issuedAt: r.issued_at?.toISOString() ?? null,
    dueDate: r.due_date?.toISOString().slice(0, 10) ?? null,
    paidAt: r.paid_at?.toISOString() ?? null,
    pdfUrl: r.pdf_url,
    notes: r.notes,
    metadata: r.metadata ?? {},
    createdAt: r.created_at.toISOString(),
    updatedAt: r.updated_at.toISOString(),
  };
}

export interface CreateInvoiceLineItem {
  description: string;
  quantity: number;
  unitAmountCents: number;
  taxRateBps: number;
  taxAmountCents: number;
  totalCents: number;
  type: 'recurring' | 'usage' | 'overage' | 'one_off' | 'discount';
}

export interface CreateInvoiceInput {
  customerId: string;
  invoiceNumber: string;
  currency: string;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  dueDate: Date;
  notes?: string | null;
  lineItems: CreateInvoiceLineItem[];
}

export async function createInvoice(pool: Pool, input: CreateInvoiceInput): Promise<InvoiceRow> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const inv = await client.query<RawInvoiceRow>(
      `INSERT INTO billing.invoices
         (customer_id, invoice_number, subtotal_cents, tax_cents, total_cents,
          currency, status, issued_at, due_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, 'open', NOW(), $7, $8)
       RETURNING id, customer_id, invoice_number, subtotal_cents, tax_cents, total_cents,
                 currency, status, issued_at, due_date, paid_at, pdf_url, notes, metadata,
                 created_at, updated_at`,
      [
        input.customerId,
        input.invoiceNumber,
        input.subtotalCents,
        input.taxCents,
        input.totalCents,
        input.currency,
        input.dueDate.toISOString().slice(0, 10),
        input.notes ?? null,
      ],
    );
    const row = inv.rows[0];
    if (!row) throw new Error('createInvoice: invoice insert returned no row');
    for (const li of input.lineItems) {
      await client.query(
        `INSERT INTO billing.line_items
           (invoice_id, type, description, quantity, unit_amount_cents,
            tax_rate_bps, tax_amount_cents, total_cents)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          row.id,
          li.type,
          li.description,
          li.quantity,
          li.unitAmountCents,
          li.taxRateBps,
          li.taxAmountCents,
          li.totalCents,
        ],
      );
    }
    await client.query('COMMIT');
    return toRow(row);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {
      /* swallow secondary error */
    });
    throw err;
  } finally {
    client.release();
  }
}

export async function listInvoices(
  pool: Pool,
  customerId: string,
  opts: { limit?: number } = {},
): Promise<InvoiceRow[]> {
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 200);
  const result = await pool.query<RawInvoiceRow>(
    `${SELECT} WHERE customer_id = $1 ORDER BY created_at DESC LIMIT $2`,
    [customerId, limit],
  );
  return result.rows.map(toRow);
}

export async function getInvoice(pool: Pool, id: string): Promise<InvoiceRow | null> {
  const result = await pool.query<RawInvoiceRow>(`${SELECT} WHERE id = $1 LIMIT 1`, [id]);
  return result.rows[0] ? toRow(result.rows[0]) : null;
}

export async function markInvoicePaid(
  pool: Pool,
  id: string,
  paidAt: Date,
): Promise<InvoiceRow | null> {
  const result = await pool.query<RawInvoiceRow>(
    `UPDATE billing.invoices SET status = 'paid', paid_at = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, customer_id, invoice_number, subtotal_cents, tax_cents, total_cents,
                currency, status, issued_at, due_date, paid_at, pdf_url, notes, metadata,
                created_at, updated_at`,
    [paidAt, id],
  );
  return result.rows[0] ? toRow(result.rows[0]) : null;
}

export async function nextInvoiceSequence(pool: Pool, year: number): Promise<number> {
  const result = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM billing.invoices
      WHERE invoice_number LIKE $1`,
    [`INV-${year}-%`],
  );
  return Number(result.rows[0]?.count ?? 0) + 1;
}
