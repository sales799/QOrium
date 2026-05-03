/**
 * Pure-logic invoice math per `infra/Billing-Service-v0-Spec.md` §5.
 *
 * All money values are in the lowest currency unit (paise for INR,
 * cents for USD). The output of `computeInvoice()` is what the
 * service writes to `billing.invoices` + `billing.line_items`; the
 * service never re-derives the totals after this point.
 */

export interface LineItemInput {
  /** Free-form description rendered in the PDF. */
  description: string;
  quantity: number;
  unitAmountCents: number;
  /** Tax rate in basis points (1800 = 18.00%). 0 for non-taxable. */
  taxRateBps: number;
  type?: 'recurring' | 'usage' | 'overage' | 'one_off' | 'discount';
}

export interface ComputedLineItem extends LineItemInput {
  type: NonNullable<LineItemInput['type']>;
  subtotalCents: number;
  taxAmountCents: number;
  totalCents: number;
}

export interface ComputedInvoice {
  lineItems: ComputedLineItem[];
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
}

export function computeLineItem(input: LineItemInput): ComputedLineItem {
  if (!Number.isFinite(input.quantity) || input.quantity < 0) {
    throw new Error(`computeLineItem: invalid quantity ${input.quantity}`);
  }
  if (!Number.isFinite(input.unitAmountCents)) {
    throw new Error(`computeLineItem: invalid unitAmountCents ${input.unitAmountCents}`);
  }
  if (!Number.isFinite(input.taxRateBps) || input.taxRateBps < 0 || input.taxRateBps > 10_000) {
    throw new Error(`computeLineItem: invalid taxRateBps ${input.taxRateBps}`);
  }
  const subtotalCents = Math.round(input.quantity * input.unitAmountCents);
  const taxAmountCents = Math.round((subtotalCents * input.taxRateBps) / 10_000);
  const totalCents = subtotalCents + taxAmountCents;
  return {
    ...input,
    type: input.type ?? 'recurring',
    subtotalCents,
    taxAmountCents,
    totalCents,
  };
}

export function computeInvoice(items: LineItemInput[]): ComputedInvoice {
  const lineItems = items.map(computeLineItem);
  const subtotalCents = lineItems.reduce((acc, l) => acc + l.subtotalCents, 0);
  const taxCents = lineItems.reduce((acc, l) => acc + l.taxAmountCents, 0);
  const totalCents = subtotalCents + taxCents;
  return { lineItems, subtotalCents, taxCents, totalCents };
}

/**
 * Pro-rate a yearly subscription amount across the fraction of the
 * billing cycle actually consumed. Spec §7 rounding rule: round to
 * the nearest paise/cent (banker's rounding via Math.round).
 */
export function prorate(opts: {
  fullPeriodAmountCents: number;
  fullPeriodDays: number;
  consumedDays: number;
}): number {
  if (opts.fullPeriodDays <= 0) return 0;
  const consumed = Math.max(0, Math.min(opts.consumedDays, opts.fullPeriodDays));
  return Math.round((opts.fullPeriodAmountCents * consumed) / opts.fullPeriodDays);
}

export function formatInvoiceNumber(now: Date, sequence: number): string {
  const yyyy = now.getUTCFullYear();
  const seq = String(sequence).padStart(5, '0');
  return `INV-${yyyy}-${seq}`;
}
