/**
 * Pure-logic helpers for the customer self-service billing view.
 *
 * Backed by `@qorium/billing` invoice + subscription rows pulled via
 * `@qorium/qorium-sdk`. All money in cents, all dates ISO-8601.
 */

export interface InvoiceRow {
  id: string;
  invoiceNumber: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'overdue';
  totalCents: number;
  currency: string;
  dueDate: string;
  paidAt: string | null;
  issuedAt: string;
}

export interface SubscriptionRow {
  id: string;
  productKey: 'readybank_solo' | 'readybank_team' | 'jd_forge' | 'stack_vault' | 'enterprise';
  status: 'trialing' | 'active' | 'past_due' | 'cancelled' | 'paused';
  monthlyAmountCents: number;
  currency: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface BillingSummary {
  totalOutstandingCents: number;
  invoiceCount: number;
  overdueCount: number;
  nextDueDate: string | null;
  activeSubscriptionCount: number;
  monthlyRecurringCents: number;
  /** True iff the customer has any past-due invoices OR a past-due subscription. */
  needsAttention: boolean;
}

/** Compute a one-glance billing summary from raw invoice + subscription rows. */
export function summariseBilling(
  invoices: InvoiceRow[],
  subscriptions: SubscriptionRow[],
  now: number = Date.now(),
): BillingSummary {
  const nowMs = now;
  const open = invoices.filter((i) => i.status === 'open' || i.status === 'overdue');
  const overdue = invoices.filter((i) => {
    if (i.status === 'overdue') return true;
    if (i.status !== 'open') return false;
    return Date.parse(i.dueDate) < nowMs;
  });
  const totalOutstandingCents = open.reduce((sum, i) => sum + i.totalCents, 0);
  const upcoming = [...open]
    .filter((i) => Date.parse(i.dueDate) >= nowMs)
    .sort((a, b) => Date.parse(a.dueDate) - Date.parse(b.dueDate));
  const nextDueDate = upcoming[0]?.dueDate ?? null;
  const activeSubs = subscriptions.filter((s) => s.status === 'active' || s.status === 'trialing');
  const monthlyRecurringCents = activeSubs.reduce((sum, s) => sum + s.monthlyAmountCents, 0);
  const subsNeedingAttention = subscriptions.some((s) => s.status === 'past_due');
  return {
    totalOutstandingCents,
    invoiceCount: invoices.length,
    overdueCount: overdue.length,
    nextDueDate,
    activeSubscriptionCount: activeSubs.length,
    monthlyRecurringCents,
    needsAttention: overdue.length > 0 || subsNeedingAttention,
  };
}

/** Format cents into a localised currency string (e.g. ₹14,900 / $149.00). */
export function formatMoney(cents: number, currency: string): string {
  const code = currency.toUpperCase();
  const major = code === 'INR' ? Math.round(cents / 100) : cents / 100;
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: code,
    maximumFractionDigits: code === 'INR' ? 0 : 2,
  });
  return formatter.format(major);
}

/** Status badge tone (used for CSS class derivation). */
export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'muted';

export function invoiceStatusTone(status: InvoiceRow['status']): BadgeTone {
  switch (status) {
    case 'paid':
      return 'success';
    case 'open':
      return 'info';
    case 'overdue':
      return 'danger';
    case 'draft':
      return 'muted';
    case 'void':
      return 'muted';
  }
}

export function subscriptionStatusTone(status: SubscriptionRow['status']): BadgeTone {
  switch (status) {
    case 'active':
      return 'success';
    case 'trialing':
      return 'info';
    case 'past_due':
      return 'danger';
    case 'cancelled':
      return 'muted';
    case 'paused':
      return 'warning';
  }
}
