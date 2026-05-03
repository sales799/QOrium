import { describe, expect, it } from 'vitest';
import request from 'supertest';
import pino from 'pino';
import { createHmac } from 'node:crypto';
import type { Pool } from '@qorium/db';
import { createServer } from '../src/server';

const silent = pino({ level: 'silent' });
const TENANT_ID = '11111111-2222-3333-4444-555555555555';
const INVOICE_ID = '22222222-3333-4444-5555-666666666666';

const config = {
  nodeEnv: 'test' as const,
  port: 0,
  databaseUrl: undefined,
  defaultGstBps: 1800,
  defaultCurrency: 'INR',
  razorpayWebhookSecret: 'test-secret',
  razorpayKeyId: undefined,
  razorpayKeySecret: undefined,
};

interface FakePool extends Pool {
  state: {
    customers: Map<string, Record<string, unknown>>;
    invoices: Map<string, Record<string, unknown>>;
    payments: Record<string, unknown>[];
    sequence: number;
  };
}

function fixturePool(): FakePool {
  const state = {
    customers: new Map<string, Record<string, unknown>>(),
    invoices: new Map<string, Record<string, unknown>>(),
    payments: [] as Record<string, unknown>[],
    sequence: 0,
  };
  const pool = {
    query: async (sql: string, params?: unknown[]) => {
      if (sql.includes('INSERT INTO billing.customers')) {
        const tenantId = String(params?.[0]);
        const row = {
          id: `cust-${tenantId.slice(0, 8)}`,
          tenant_id: tenantId,
          display_name: params?.[1],
          email: params?.[2],
          country: params?.[3],
          currency: params?.[4],
          tax_id: params?.[5],
          billing_address: params?.[6],
          payment_provider: params?.[7],
          provider_customer_id: params?.[8],
          created_at: new Date('2026-05-01T00:00:00Z'),
          updated_at: new Date('2026-05-01T00:00:00Z'),
        };
        state.customers.set(tenantId, row);
        return { rows: [row], rowCount: 1 };
      }
      if (sql.includes('FROM billing.customers') && sql.includes('tenant_id = $1')) {
        const tenantId = String(params?.[0]);
        const row = state.customers.get(tenantId);
        return { rows: row ? [row] : [] };
      }
      if (sql.includes('FROM billing.customers')) {
        return { rows: Array.from(state.customers.values()) };
      }
      if (sql.includes('FROM billing.invoices') && sql.includes('id = $1')) {
        const id = String(params?.[0]);
        const row = state.invoices.get(id);
        return { rows: row ? [row] : [] };
      }
      if (sql.includes('FROM billing.invoices') && sql.includes('LIKE $1')) {
        return { rows: [{ count: String(state.sequence) }] };
      }
      if (sql.includes('FROM billing.invoices')) {
        return { rows: Array.from(state.invoices.values()) };
      }
      if (sql.includes('INSERT INTO billing.invoices')) {
        const id = `inv-${++state.sequence}`;
        const row = {
          id,
          customer_id: params?.[0],
          invoice_number: params?.[1],
          subtotal_cents: params?.[2],
          tax_cents: params?.[3],
          total_cents: params?.[4],
          currency: params?.[5],
          status: 'open',
          issued_at: new Date(),
          due_date: new Date(),
          paid_at: null,
          pdf_url: null,
          notes: params?.[7],
          metadata: {},
          created_at: new Date(),
          updated_at: new Date(),
        };
        state.invoices.set(id, row);
        return { rows: [row], rowCount: 1 };
      }
      if (sql.includes('INSERT INTO billing.line_items')) {
        return { rows: [], rowCount: 1 };
      }
      if (sql.includes('INSERT INTO billing.payments')) {
        state.payments.push({
          invoice_id: params?.[0],
          payment_provider: params?.[1],
          provider_payment_id: params?.[2],
          provider_order_id: params?.[3],
          amount_cents: params?.[4],
          currency: params?.[5],
          status: params?.[6],
        });
        return {
          rows: [
            {
              id: 'pay-1',
              invoice_id: params?.[0],
              payment_provider: params?.[1],
              provider_payment_id: params?.[2],
              provider_order_id: params?.[3],
              amount_cents: params?.[4],
              currency: params?.[5],
              status: params?.[6],
              error_message: params?.[7],
              attempt_count: 1,
              created_at: new Date(),
            },
          ],
        };
      }
      if (sql.includes('UPDATE billing.invoices')) {
        const id = String(params?.[1]);
        const row = state.invoices.get(id);
        if (row) {
          row.status = 'paid';
          row.paid_at = params?.[0];
          return { rows: [row], rowCount: 1 };
        }
        return { rows: [] };
      }
      return { rows: [] };
    },
    end: async () => {},
    connect: async () => ({
      query: async (sql: string, params?: unknown[]) => pool.query(sql, params),
      release: () => {},
    }),
    state,
  } as unknown as FakePool;
  return pool;
}

describe('billing express server', () => {
  it('GET /healthz returns ok', async () => {
    const app = createServer({ config, logger: silent });
    const r = await request(app).get('/healthz');
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ status: 'ok', service: 'qorium-billing' });
  });

  it('POST /v1/billing/invoices/preview computes totals without DB', async () => {
    const app = createServer({ config, logger: silent });
    const r = await request(app)
      .post('/v1/billing/invoices/preview')
      .set('content-type', 'application/json')
      .send({
        line_items: [
          { description: 'ReadyBank Tier 2', quantity: 1, unit_amount_cents: 10_000_000 },
        ],
      });
    expect(r.status).toBe(200);
    expect(r.body.subtotal_cents).toBe(10_000_000);
    expect(r.body.tax_cents).toBe(1_800_000);
    expect(r.body.total_cents).toBe(11_800_000);
  });

  it('POST /v1/billing/customers upserts a tenant customer', async () => {
    const pool = fixturePool();
    const app = createServer({ config, logger: silent, pool });
    const r = await request(app)
      .post('/v1/billing/customers')
      .set('x-tenant-id', TENANT_ID)
      .send({ display_name: 'Acme Inc', email: 'billing@acme.com' });
    expect(r.status).toBe(200);
    expect(r.body.tenantId).toBe(TENANT_ID);
    expect(r.body.email).toBe('billing@acme.com');
  });

  it('POST /v1/billing/invoices creates an invoice for the tenant', async () => {
    const pool = fixturePool();
    const app = createServer({ config, logger: silent, pool });
    await request(app)
      .post('/v1/billing/customers')
      .set('x-tenant-id', TENANT_ID)
      .send({ display_name: 'Acme', email: 'b@a.com' });
    const r = await request(app)
      .post('/v1/billing/invoices')
      .set('x-tenant-id', TENANT_ID)
      .send({
        line_items: [{ description: 'JD Forge × 10', quantity: 10, unit_amount_cents: 14_900 }],
        due_in_days: 14,
      });
    expect(r.status).toBe(201);
    expect(r.body.invoiceNumber).toMatch(/^INV-\d{4}-\d{5}$/);
    expect(r.body.totalCents).toBe(149_000 + Math.round((149_000 * 1800) / 10_000));
  });

  it('returns 404 when creating an invoice with no billing customer', async () => {
    const pool = fixturePool();
    const app = createServer({ config, logger: silent, pool });
    const r = await request(app)
      .post('/v1/billing/invoices')
      .set('x-tenant-id', TENANT_ID)
      .send({
        line_items: [{ description: 'JD', quantity: 1, unit_amount_cents: 1000 }],
      });
    expect(r.status).toBe(404);
  });

  it('returns 401 with no tenant header', async () => {
    const pool = fixturePool();
    const app = createServer({ config, logger: silent, pool });
    const r = await request(app).post('/v1/billing/invoices').send({ line_items: [] });
    expect(r.status).toBe(401);
  });

  it('GET /v1/billing/invoices/:id 400 on bad id', async () => {
    const pool = fixturePool();
    const app = createServer({ config, logger: silent, pool });
    const r = await request(app).get('/v1/billing/invoices/not-a-uuid');
    expect(r.status).toBe(400);
  });

  it('GET /v1/billing/invoices/:id 404 when missing', async () => {
    const pool = fixturePool();
    const app = createServer({ config, logger: silent, pool });
    const r = await request(app).get(`/v1/billing/invoices/${INVOICE_ID}`);
    expect(r.status).toBe(404);
  });

  it('Razorpay webhook rejects bad signature', async () => {
    const app = createServer({ config, logger: silent });
    const body = JSON.stringify({
      event: 'payment.captured',
      payload: { payment: { entity: {} } },
    });
    const r = await request(app)
      .post('/v1/billing/webhooks/razorpay')
      .set('content-type', 'application/json')
      .set('x-razorpay-signature', 'a'.repeat(64))
      .send(body);
    expect(r.status).toBe(401);
  });

  it('Razorpay webhook accepts a valid signature on a recognised event', async () => {
    const pool = fixturePool();
    const app = createServer({ config, logger: silent, pool });
    const body = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_test_1',
            amount: 11_800_000,
            currency: 'INR',
            status: 'captured',
            order_id: 'order_test_1',
          },
        },
        order: { entity: { id: 'order_test_1', receipt: INVOICE_ID } },
      },
    });
    const sig = createHmac('sha256', config.razorpayWebhookSecret).update(body).digest('hex');
    const r = await request(app)
      .post('/v1/billing/webhooks/razorpay')
      .set('content-type', 'application/json')
      .set('x-razorpay-signature', sig)
      .send(body);
    expect(r.status).toBe(202);
    expect(r.body.invoice_id).toBe(INVOICE_ID);
  });
});
