/**
 * Express service for billing per spec §3 (Architecture) + §6 (Webhooks).
 *
 * Endpoints (v0):
 *   GET  /healthz
 *   POST /v1/billing/customers              — upsert tenant customer
 *   GET  /v1/billing/customers/me           — read tenant customer
 *   POST /v1/billing/invoices/preview       — pure-logic preview (no DB write)
 *   POST /v1/billing/invoices               — create + open invoice
 *   GET  /v1/billing/invoices/:id           — read single invoice
 *   GET  /v1/billing/invoices               — list invoices for tenant
 *   POST /v1/billing/webhooks/razorpay      — payment lifecycle ingestion
 */

import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import type { Logger } from 'pino';
import { z } from 'zod';
import type { Pool } from '@qorium/db';
import type { BillingConfig } from './config.js';
import { computeInvoice, formatInvoiceNumber } from './invoice-math.js';
import { stubRazorpayClient, isRazorpayEvent, type RazorpayClient } from './razorpay.js';
import {
  getCustomerByTenantId,
  listCustomers,
  upsertCustomer,
  type CustomerRow,
} from './repositories/customers.js';
import {
  createInvoice,
  getInvoice,
  listInvoices,
  markInvoicePaid,
  nextInvoiceSequence,
  type CreateInvoiceLineItem,
} from './repositories/invoices.js';
import { recordPayment } from './repositories/payments.js';

export interface CreateServerOptions {
  config: BillingConfig;
  logger: Logger;
  pool?: Pool;
  razorpay?: RazorpayClient;
  resolveTenantId?: (req: Request) => string | null;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const upsertCustomerSchema = z.object({
  display_name: z.string().min(1).max(255),
  email: z.string().email(),
  country: z.string().length(2).optional(),
  currency: z.string().length(3).optional(),
  tax_id: z.string().nullable().optional(),
  billing_address: z.record(z.unknown()).optional(),
});

const previewInvoiceSchema = z.object({
  line_items: z
    .array(
      z.object({
        description: z.string().min(1),
        quantity: z.number().int().positive(),
        unit_amount_cents: z.number().int().nonnegative(),
        tax_rate_bps: z.number().int().min(0).max(10_000).optional(),
        type: z.enum(['recurring', 'usage', 'overage', 'one_off', 'discount']).optional(),
      }),
    )
    .min(1),
});

const createInvoiceSchema = previewInvoiceSchema.extend({
  due_in_days: z.number().int().min(0).max(365).default(14),
  notes: z.string().max(2000).optional(),
});

export function createServer(opts: CreateServerOptions): express.Express {
  const razorpay = opts.razorpay ?? stubRazorpayClient(opts.config.razorpayWebhookSecret);
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(pinoHttp({ logger: opts.logger }));

  app.post(
    '/v1/billing/webhooks/razorpay',
    express.raw({ type: '*/*', limit: '256kb' }),
    (req, res) => {
      void handleRazorpayWebhook(opts, razorpay, req, res);
    },
  );

  app.use(express.json({ limit: '128kb' }));

  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok', service: 'qorium-billing' });
  });

  app.post('/v1/billing/customers', (req, res) => {
    void handleUpsertCustomer(opts, req, res);
  });
  app.get('/v1/billing/customers/me', (req, res) => {
    void handleGetSelfCustomer(opts, req, res);
  });
  app.get('/v1/billing/customers', (req, res) => {
    void handleListCustomers(opts, req, res);
  });

  app.post('/v1/billing/invoices/preview', (req, res) => {
    handlePreviewInvoice(opts, req, res);
  });
  app.post('/v1/billing/invoices', (req, res) => {
    void handleCreateInvoice(opts, req, res);
  });
  app.get('/v1/billing/invoices/:id', (req, res) => {
    void handleGetInvoice(opts, req, res);
  });
  app.get('/v1/billing/invoices', (req, res) => {
    void handleListInvoices(opts, req, res);
  });

  app.use((_req, res) => {
    res.status(404).contentType('application/problem+json').json({
      type: 'about:blank',
      title: 'Not Found',
      status: 404,
    });
  });

  return app;
}

async function handleUpsertCustomer(
  opts: CreateServerOptions,
  req: Request,
  res: Response,
): Promise<void> {
  const ctx = ensureContext(opts, req, res);
  if (!ctx) return;
  const parsed = upsertCustomerSchema.safeParse(req.body);
  if (!parsed.success) {
    sendProblem(res, 400, 'Bad Request', parsed.error.issues.map((i) => i.message).join('; '));
    return;
  }
  const input: Parameters<typeof upsertCustomer>[1] = {
    tenantId: ctx.tenantId,
    displayName: parsed.data.display_name,
    email: parsed.data.email,
  };
  if (parsed.data.country !== undefined) input.country = parsed.data.country;
  if (parsed.data.currency !== undefined) input.currency = parsed.data.currency;
  if (parsed.data.tax_id !== undefined) input.taxId = parsed.data.tax_id;
  if (parsed.data.billing_address !== undefined) input.billingAddress = parsed.data.billing_address;
  const row = await upsertCustomer(ctx.pool, input);
  res.status(200).json(row);
}

async function handleGetSelfCustomer(
  opts: CreateServerOptions,
  req: Request,
  res: Response,
): Promise<void> {
  const ctx = ensureContext(opts, req, res);
  if (!ctx) return;
  const row = await getCustomerByTenantId(ctx.pool, ctx.tenantId);
  if (!row) {
    sendProblem(res, 404, 'No billing customer for this tenant');
    return;
  }
  res.json(row);
}

async function handleListCustomers(
  opts: CreateServerOptions,
  req: Request,
  res: Response,
): Promise<void> {
  if (!opts.pool) {
    sendProblem(res, 503, 'Database unavailable');
    return;
  }
  const limit = Number.parseInt(String(req.query.limit ?? '50'), 10) || 50;
  const rows = await listCustomers(opts.pool, { limit });
  res.json({ count: rows.length, customers: rows });
}

function handlePreviewInvoice(opts: CreateServerOptions, req: Request, res: Response): void {
  const parsed = previewInvoiceSchema.safeParse(req.body);
  if (!parsed.success) {
    sendProblem(res, 400, 'Bad Request', parsed.error.issues.map((i) => i.message).join('; '));
    return;
  }
  const computed = computeInvoice(
    parsed.data.line_items.map((l) => ({
      description: l.description,
      quantity: l.quantity,
      unitAmountCents: l.unit_amount_cents,
      taxRateBps: l.tax_rate_bps ?? opts.config.defaultGstBps,
      ...(l.type !== undefined ? { type: l.type } : {}),
    })),
  );
  res.json({
    subtotal_cents: computed.subtotalCents,
    tax_cents: computed.taxCents,
    total_cents: computed.totalCents,
    currency: opts.config.defaultCurrency,
    line_items: computed.lineItems,
  });
}

async function handleCreateInvoice(
  opts: CreateServerOptions,
  req: Request,
  res: Response,
): Promise<void> {
  const ctx = ensureContext(opts, req, res);
  if (!ctx) return;
  const customer = await getCustomerByTenantId(ctx.pool, ctx.tenantId);
  if (!customer) {
    sendProblem(res, 404, 'Tenant has no billing customer; create one first');
    return;
  }
  const parsed = createInvoiceSchema.safeParse(req.body);
  if (!parsed.success) {
    sendProblem(res, 400, 'Bad Request', parsed.error.issues.map((i) => i.message).join('; '));
    return;
  }
  const computed = computeInvoice(
    parsed.data.line_items.map((l) => ({
      description: l.description,
      quantity: l.quantity,
      unitAmountCents: l.unit_amount_cents,
      taxRateBps: l.tax_rate_bps ?? opts.config.defaultGstBps,
      ...(l.type !== undefined ? { type: l.type } : {}),
    })),
  );
  const now = new Date();
  const sequence = await nextInvoiceSequence(ctx.pool, now.getUTCFullYear());
  const invoiceNumber = formatInvoiceNumber(now, sequence);
  const dueDate = new Date(now.getTime() + parsed.data.due_in_days * 86_400_000);
  const lineItems: CreateInvoiceLineItem[] = computed.lineItems.map((l) => ({
    description: l.description,
    quantity: l.quantity,
    unitAmountCents: l.unitAmountCents,
    taxRateBps: l.taxRateBps,
    taxAmountCents: l.taxAmountCents,
    totalCents: l.totalCents,
    type: l.type,
  }));
  const inv = await createInvoice(ctx.pool, {
    customerId: customer.id,
    invoiceNumber,
    currency: customer.currency,
    subtotalCents: computed.subtotalCents,
    taxCents: computed.taxCents,
    totalCents: computed.totalCents,
    dueDate,
    notes: parsed.data.notes ?? null,
    lineItems,
  });
  res.status(201).json(inv);
}

async function handleGetInvoice(
  opts: CreateServerOptions,
  req: Request,
  res: Response,
): Promise<void> {
  if (!opts.pool) {
    sendProblem(res, 503, 'Database unavailable');
    return;
  }
  const id = String(req.params.id ?? '');
  if (!UUID_REGEX.test(id)) {
    sendProblem(res, 400, 'Invalid invoice id');
    return;
  }
  const inv = await getInvoice(opts.pool, id);
  if (!inv) {
    sendProblem(res, 404, 'Invoice not found');
    return;
  }
  res.json(inv);
}

async function handleListInvoices(
  opts: CreateServerOptions,
  req: Request,
  res: Response,
): Promise<void> {
  const ctx = ensureContext(opts, req, res);
  if (!ctx) return;
  const customer = await getCustomerByTenantId(ctx.pool, ctx.tenantId);
  if (!customer) {
    res.json({ count: 0, invoices: [] });
    return;
  }
  const limit = Number.parseInt(String(req.query.limit ?? '50'), 10) || 50;
  const rows = await listInvoices(ctx.pool, customer.id, { limit });
  res.json({ count: rows.length, invoices: rows });
}

async function handleRazorpayWebhook(
  opts: CreateServerOptions,
  razorpay: RazorpayClient,
  req: Request,
  res: Response,
): Promise<void> {
  const rawBody = Buffer.isBuffer(req.body)
    ? req.body.toString('utf8')
    : typeof req.body === 'string'
      ? req.body
      : '';
  const signature = req.headers['x-razorpay-signature'];
  const sig = typeof signature === 'string' ? signature : '';
  if (!razorpay.verifyWebhook(rawBody, sig)) {
    sendProblem(res, 401, 'Invalid Razorpay signature');
    return;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    sendProblem(res, 400, 'Webhook body is not valid JSON');
    return;
  }
  if (!isRazorpayEvent(parsed)) {
    sendProblem(res, 400, 'Webhook body is not a recognised Razorpay event');
    return;
  }
  const payment = parsed.payload.payment?.entity;
  if (!payment) {
    res.status(202).json({ status: 'ignored', reason: 'no payment entity' });
    return;
  }
  if (!opts.pool) {
    res.status(202).json({ status: 'ignored', reason: 'no DB' });
    return;
  }

  // Order receipt is the QOrium invoice id
  const order = parsed.payload.order?.entity;
  const invoiceId = order?.receipt ?? null;
  if (!invoiceId || !UUID_REGEX.test(invoiceId)) {
    res.status(202).json({ status: 'ignored', reason: 'no matching invoice id' });
    return;
  }
  const status =
    parsed.event === 'payment.captured' || parsed.event === 'order.paid'
      ? 'captured'
      : parsed.event === 'payment.failed'
        ? 'failed'
        : 'authorized';

  const recordInput: Parameters<typeof recordPayment>[1] = {
    invoiceId,
    paymentProvider: 'razorpay',
    providerPaymentId: payment.id,
    providerOrderId: payment.order_id,
    amountCents: payment.amount,
    currency: payment.currency,
    status,
    rawEvent: parsed,
  };
  if (payment.error_description !== undefined) {
    recordInput.errorMessage = payment.error_description;
  }
  await recordPayment(opts.pool, recordInput);

  if (status === 'captured') {
    await markInvoicePaid(opts.pool, invoiceId, new Date());
  }
  res.status(202).json({ status: 'accepted', event: parsed.event, invoice_id: invoiceId });
}

interface RequestContext {
  pool: Pool;
  tenantId: string;
}

function ensureContext(
  opts: CreateServerOptions,
  req: Request,
  res: Response,
): RequestContext | null {
  if (!opts.pool) {
    sendProblem(res, 503, 'Database unavailable');
    return null;
  }
  const tenantId = (opts.resolveTenantId ?? defaultResolveTenant)(req);
  if (!tenantId) {
    sendProblem(res, 401, 'Unauthorized');
    return null;
  }
  return { pool: opts.pool, tenantId };
}

function defaultResolveTenant(req: Request): string | null {
  const auth = (req as Request & { auth?: { tenantId?: string } }).auth;
  if (auth?.tenantId) return auth.tenantId;
  const header = req.headers['x-tenant-id'];
  return typeof header === 'string' && UUID_REGEX.test(header) ? header : null;
}

function sendProblem(res: Response, status: number, title: string, detail?: string): void {
  const body: Record<string, unknown> = { type: 'about:blank', title, status };
  if (detail !== undefined) body.detail = detail;
  res.status(status).contentType('application/problem+json').json(body);
}

// Re-export to avoid an unused-import lint flag.
export type { CustomerRow };
