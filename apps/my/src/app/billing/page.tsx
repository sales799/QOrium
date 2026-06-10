'use client';

// apps/my: src/app/billing/page.tsx — recruiter billing page. Shows current plan +
// this-month usage, lets them upgrade (redirects to Razorpay short_url) or cancel.
// Talks to readybank via the existing cookie-forwarding /api/v1/[...path] proxy.

import { useEffect, useState } from 'react';

type Catalog = {
  id: string;
  name: string;
  priceInr: number;
  custom: boolean;
  limits: { assessmentsPerMonth: number; attemptsPerMonth: number };
};
type Status = {
  plan: string;
  status: string;
  currentPeriodEnd: string | null;
  usage: { assessments: number; attempts: number; invites: number };
  limits: { assessmentsPerMonth: number; attemptsPerMonth: number };
  catalog: Catalog[];
  razorpayConfigured: boolean;
};

const inr = (n: number) => (n === 0 ? '—' : `₹${n.toLocaleString('en-IN')}/mo`);
const lim = (n: number) => (n < 0 ? 'Unlimited' : n.toLocaleString('en-IN'));

export default function BillingPage() {
  const [data, setData] = useState<Status | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = () =>
    fetch('/api/v1/recruiter/billing/status', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`status ${r.status}`))))
      .then(setData)
      .catch((e) => setErr(String(e)));

  useEffect(() => {
    void load();
  }, []);

  async function subscribe(plan: string) {
    setBusy(plan);
    setErr(null);
    try {
      const r = await fetch('/api/v1/recruiter/billing/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ plan }),
      });
      const body = await r.json();
      if (!r.ok) throw new Error(body?.title ?? `status ${r.status}`);
      if (body.checkoutUrl) window.location.href = body.checkoutUrl;
      else await load();
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(null);
    }
  }

  if (err)
    return (
      <main style={{ padding: 32, fontFamily: 'system-ui' }}>
        <p style={{ color: '#b91c1c' }}>{err}</p>
      </main>
    );
  if (!data) return <main style={{ padding: 32, fontFamily: 'system-ui' }}>Loading billing…</main>;

  return (
    <main style={{ maxWidth: 880, margin: '0 auto', padding: 32, fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Billing</h1>
      <section
        style={{ margin: '16px 0', padding: 16, border: '1px solid #e5e7eb', borderRadius: 12 }}
      >
        <strong>Current plan:</strong> {data.plan} ({data.status})
        {data.currentPeriodEnd && (
          <> · renews {new Date(data.currentPeriodEnd).toLocaleDateString()}</>
        )}
        <div style={{ marginTop: 8, color: '#374151' }}>
          This month — assessments {data.usage.assessments}/{lim(data.limits.assessmentsPerMonth)} ·
          attempts {data.usage.attempts}/{lim(data.limits.attemptsPerMonth)} · invites{' '}
          {data.usage.invites}
        </div>
        {!data.razorpayConfigured && (
          <p style={{ marginTop: 8, color: '#b45309' }}>
            Online payments aren’t enabled yet — contact us to upgrade.
          </p>
        )}
      </section>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))',
          gap: 12,
        }}
      >
        {data.catalog.map((p) => {
          const current = p.id === data.plan;
          return (
            <div
              key={p.id}
              style={{
                padding: 16,
                border: current ? '2px solid #4f46e5' : '1px solid #e5e7eb',
                borderRadius: 12,
              }}
            >
              <div style={{ fontWeight: 700 }}>{p.name}</div>
              <div style={{ fontSize: 20, margin: '4px 0' }}>
                {p.custom ? 'Custom' : inr(p.priceInr)}
              </div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>
                {lim(p.limits.assessmentsPerMonth)} assessments · {lim(p.limits.attemptsPerMonth)}{' '}
                attempts
              </div>
              <button
                disabled={current || busy !== null}
                onClick={() => subscribe(p.id)}
                style={{
                  marginTop: 12,
                  width: '100%',
                  padding: '8px 0',
                  borderRadius: 8,
                  border: 'none',
                  cursor: current ? 'default' : 'pointer',
                  background: current ? '#e5e7eb' : '#4f46e5',
                  color: current ? '#374151' : '#fff',
                  fontWeight: 600,
                }}
              >
                {current ? 'Current' : p.custom ? 'Contact sales' : busy === p.id ? '…' : 'Choose'}
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}
