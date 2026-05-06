import { createPool, resolveDatabaseUrl, type Pool } from '@qorium/db';
import { loadConfig } from './config.js';
import { buildLogger } from './logger.js';
import { createServer } from './server.js';

export async function start() {
  const config = loadConfig();
  const logger = buildLogger();

  let pool: Pool | undefined;
  try {
    pool = createPool({ connectionString: resolveDatabaseUrl(), max: 8 });
  } catch (err) {
    logger.warn({ err }, 'DATABASE_URL not configured — billing starts in stub mode');
  }

  const serverOpts: Parameters<typeof createServer>[0] = { config, logger };
  if (pool) serverOpts.pool = pool;
  const app = createServer(serverOpts);
  const server = app.listen(config.port, () => {
    logger.info({ port: config.port }, 'qorium-billing listening');
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'shutting down qorium-billing');
    server.close(() => process.exit(0));
    if (pool) await pool.end();
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

// PM2 cluster mode wraps the script, so process.argv[1] points at the
// wrapper, not index.js. Always invoke start(); tests import specific
// helpers, never this entry point.
{
  void start().catch((err) => {
    process.stderr.write(JSON.stringify({ event: 'billing.fatal', error: String(err) }) + '\n');
    process.exit(1);
  });
}

export { createServer } from './server.js';
export { loadConfig } from './config.js';
export { buildLogger } from './logger.js';
export {
  computeInvoice,
  computeLineItem,
  prorate,
  formatInvoiceNumber,
  type LineItemInput,
  type ComputedInvoice,
  type ComputedLineItem,
} from './invoice-math.js';
export {
  evaluateDunning,
  RETRY_SCHEDULE_DAYS,
  CANCEL_AFTER_DAYS,
  type DunningInputs,
  type DunningDecision,
  type InvoiceStatus,
} from './dunning.js';
export {
  stubRazorpayClient,
  realRazorpayClient,
  verifyWebhookSignature,
  isRazorpayEvent,
  type RazorpayClient,
  type RazorpayCredentials,
  type RazorpayWebhookEvent,
} from './razorpay.js';
export {
  upsertCustomer,
  getCustomerByTenantId,
  listCustomers,
  type CustomerRow,
} from './repositories/customers.js';
export {
  createInvoice,
  getInvoice,
  listInvoices,
  markInvoicePaid,
  nextInvoiceSequence,
  type InvoiceRow,
  type CreateInvoiceInput,
  type CreateInvoiceLineItem,
} from './repositories/invoices.js';
export {
  recordPayment,
  type PaymentRow,
  type RecordPaymentInput,
} from './repositories/payments.js';
