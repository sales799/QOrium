import type {
  AnyTier,
  BuyerProfile,
  InvoiceLine,
  InvoiceTotals,
  Money,
  SellerProfile,
  Sku,
} from './types.js';
import { multiply, sumMoney } from './currency.js';
import { computeGst, type ComputeGstOptions } from './gst.js';
import { findPrice, validateAgainstFloor } from './sku-pricing.js';
import { sacForSku } from './hsn-sac.js';

/** A single line input — the caller specifies SKU/tier/quantity; the
 *  library resolves price, applies GST, and returns the structured line
 *  with totals. */
export interface LineInput {
  sku: Sku;
  tier: AnyTier;
  quantity: number;
  /** Optional explicit unit price override (must be >= floor). Useful
   *  for negotiated enterprise deals. */
  unitPrice?: Money;
  description?: string;
  periodStart?: string;
  periodEnd?: string;
}

export interface BuildInvoiceOptions extends ComputeGstOptions {
  buyer: BuyerProfile;
  seller: SellerProfile;
  lines: LineInput[];
}

export interface BuildInvoiceResult {
  totals: InvoiceTotals;
  warnings: string[];
}

/** Build an invoice structure from a list of (sku, tier, qty) lines.
 *  Pure function — no DB, no PDF, no payment-provider calls. */
export function buildInvoice(options: BuildInvoiceOptions): BuildInvoiceResult {
  if (options.lines.length === 0) {
    throw new Error('buildInvoice: at least one line required');
  }

  const lines: InvoiceLine[] = [];
  const warnings: string[] = [];
  let invoiceCurrency: Money['currency'] | null = null;
  let scheme: InvoiceTotals['scheme'] = 'inter-state';

  for (const input of options.lines) {
    const entry = findPrice(input.sku, input.tier);
    if (!entry) {
      throw new Error(`buildInvoice: unknown ${input.sku}/${input.tier}`);
    }
    const unitPrice = input.unitPrice ?? entry.unitPrice;
    if (input.unitPrice) {
      const floorErr = validateAgainstFloor(unitPrice, entry);
      if (floorErr) warnings.push(floorErr);
    }
    if (invoiceCurrency === null) invoiceCurrency = unitPrice.currency;
    if (unitPrice.currency !== invoiceCurrency) {
      throw new Error(
        `buildInvoice: mixed currencies on a single invoice (${unitPrice.currency} vs ${invoiceCurrency})`,
      );
    }

    const subtotal = multiply(unitPrice, input.quantity);
    const tax = computeGst(subtotal, options.buyer, options.seller, options);
    const total: Money = {
      amount: subtotal.amount + tax.totalTax,
      currency: subtotal.currency,
    };
    scheme = tax.scheme; // converges; all lines on a single invoice share scheme

    const line: InvoiceLine = {
      description: input.description ?? entry.description,
      sku: input.sku,
      tier: input.tier,
      sac: sacForSku(input.sku),
      quantity: input.quantity,
      unitPrice,
      subtotal,
      tax,
      total,
      cycle: entry.cycle,
    };
    if (input.periodStart) line.periodStart = input.periodStart;
    if (input.periodEnd) line.periodEnd = input.periodEnd;
    lines.push(line);
  }

  const subtotalSum = sumMoney(lines.map((l) => l.subtotal));
  const taxTotal = lines.reduce((s, l) => s + l.tax.totalTax, 0n);
  const grandTotal = subtotalSum.amount + taxTotal;

  const totals: InvoiceTotals = {
    currency: invoiceCurrency!,
    subtotal: subtotalSum.amount,
    totalTax: taxTotal,
    grandTotal,
    scheme,
    lines,
  };

  return { totals, warnings };
}

/** Render an invoice as a plain-text breakdown (one line per item +
 *  totals). Used by the admin console preview pane and by tests. */
export function renderInvoicePlain(result: BuildInvoiceResult): string {
  const { totals } = result;
  const out: string[] = [];
  out.push(`Currency: ${totals.currency}`);
  out.push(`GST scheme: ${totals.scheme}`);
  out.push('');
  for (const line of totals.lines) {
    out.push(`${line.description}`);
    out.push(`  SAC ${line.sac.code} · ${line.sac.title}`);
    out.push(`  ${line.quantity} × ${line.unitPrice.amount} = ${line.subtotal.amount}`);
    if (line.tax.totalTax > 0n) {
      const parts: string[] = [];
      if (line.tax.cgst > 0n) parts.push(`CGST ${line.tax.cgst}`);
      if (line.tax.sgst > 0n) parts.push(`SGST ${line.tax.sgst}`);
      if (line.tax.igst > 0n) parts.push(`IGST ${line.tax.igst}`);
      out.push(`  Tax (${(line.tax.totalRate * 100).toFixed(0)}%): ${parts.join(' + ')}`);
    } else {
      out.push(`  Tax: 0 (${line.tax.scheme})`);
    }
    out.push(`  Line total: ${line.total.amount}`);
    out.push('');
  }
  out.push(`Subtotal: ${totals.subtotal}`);
  out.push(`Tax:      ${totals.totalTax}`);
  out.push(`TOTAL:    ${totals.grandTotal} ${totals.currency}`);
  if (result.warnings.length > 0) {
    out.push('');
    out.push('Warnings:');
    for (const w of result.warnings) out.push(`  - ${w}`);
  }
  return out.join('\n');
}
