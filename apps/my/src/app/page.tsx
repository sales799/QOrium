import {
  summariseBilling,
  formatMoney,
  type InvoiceRow,
  type SubscriptionRow,
} from '@/lib/billing-summary';
import { aggregatePortfolio, type ApiKeyRow } from '@/lib/api-keys';

// Server component: this page is the my.qorium.online dashboard. In v0
// we render placeholder fixture data so the static export validates and
// reviewers can preview the UX without a live customer account.
//
// In v1 (Phase 1+), `loadCustomerView()` becomes an authenticated SDK
// call: `await sdk.customers.dashboard()` returns invoices + subs + keys
// for the signed-in tenant.

interface CustomerView {
  customerName: string;
  invoices: InvoiceRow[];
  subscriptions: SubscriptionRow[];
  apiKeys: ApiKeyRow[];
}

function loadCustomerView(): CustomerView {
  // v0 placeholder. Real implementation pulls from the qorium SDK using the
  // signed-in tenant's bearer token (NEXTAUTH session) once SSO is wired.
  return {
    customerName: 'Acme Inc',
    invoices: [],
    subscriptions: [],
    apiKeys: [],
  };
}

export default function CustomerPortalHome() {
  const view = loadCustomerView();
  const billingSummary = summariseBilling(view.invoices, view.subscriptions);
  const keyPortfolio = aggregatePortfolio(view.apiKeys);
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Welcome, {view.customerName}</h1>
      <p style={{ color: '#475569', marginBottom: 32 }}>
        Manage your QOrium subscription, invoices, and API keys.
      </p>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <Tile
          label="Outstanding"
          value={formatMoney(billingSummary.totalOutstandingCents, 'INR')}
          tone={billingSummary.needsAttention ? 'danger' : 'info'}
        />
        <Tile
          label="Active subscriptions"
          value={String(billingSummary.activeSubscriptionCount)}
          tone="info"
        />
        <Tile
          label="Active API keys"
          value={String(keyPortfolio.active + keyPortfolio.expiring)}
          tone={keyPortfolio.rotationDue > 0 ? 'warning' : 'success'}
        />
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Recent invoices</h2>
        {view.invoices.length === 0 ? (
          <p style={{ color: '#475569' }}>
            No invoices yet — your first invoice arrives at the end of your billing cycle.
          </p>
        ) : (
          <p>{view.invoices.length} invoices on file.</p>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>API keys</h2>
        {view.apiKeys.length === 0 ? (
          <p style={{ color: '#475569' }}>
            No API keys yet — issue one from your account settings.
          </p>
        ) : (
          <p>
            {keyPortfolio.active} active · {keyPortfolio.rotationDue} due for rotation ·{' '}
            {keyPortfolio.expired} expired
          </p>
        )}
      </section>
    </div>
  );
}

function Tile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'success' | 'warning' | 'danger' | 'info';
}) {
  const accent =
    tone === 'success'
      ? '#16a34a'
      : tone === 'warning'
        ? '#ca8a04'
        : tone === 'danger'
          ? '#dc2626'
          : '#0ea5e9';
  return (
    <div
      style={{
        background: '#fff',
        padding: 16,
        borderRadius: 10,
        border: '1px solid #e2e8f0',
        borderLeft: `4px solid ${accent}`,
      }}
    >
      <div
        style={{ color: '#64748b', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.4 }}
      >
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 600, marginTop: 4 }}>{value}</div>
    </div>
  );
}
