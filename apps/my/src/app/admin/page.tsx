'use client';

// apps/my: src/app/admin/page.tsx — recruiter-authed admin console (N8).
// Read-only control-plane view consuming GET /v1/admin/overview and
// /v1/admin/tenants via the cookie-forwarding /api/v1 proxy. No mutations.

import { useEffect, useState } from 'react';

type Overview = {
  generated_at: string;
  loop: {
    assessments: number;
    invitations: number;
    attempts: number;
    responses: number;
    responses_with_attempt: number;
    grade_decisions: number;
  };
  bank: { questions_released: number; questions_calibrated: number };
  billing: { subscriptions_active: number };
  attempts_by_status: Record<string, number>;
  invitations_by_status: Record<string, number>;
};

type Tenant = {
  id: string;
  name: string;
  slug: string;
  type: string;
  plan: string;
  status: string;
  created_at: string;
  assessments: number;
  attempts: number;
};

const C = { teal: '#0d9488', ink: '#0f172a', sub: '#64748b', line: '#e2e8f0', bg: '#f8fafc' };
const n = (x: number) => x.toLocaleString('en-IN');

export default function AdminPage() {
  const [ov, setOv] = useState<Overview | null>(null);
  const [tenants, setTenants] = useState<Tenant[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const get = (p: string) =>
      fetch(p, { credentials: 'include' }).then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(`${p}: status ${r.status}`)),
      );
    Promise.all([get('/api/v1/admin/overview'), get('/api/v1/admin/tenants?limit=200')])
      .then(([o, t]) => {
        setOv(o as Overview);
        setTenants((t as { tenants: Tenant[] }).tenants);
      })
      .catch((e) => setErr(String(e)));
  }, []);

  if (err)
    return (
      <main style={{ padding: 32, fontFamily: 'system-ui' }}>
        <p style={{ color: '#b91c1c' }}>{err}</p>
        <a href="/dashboard" style={{ color: C.teal, fontSize: 13 }}>
          ← Dashboard
        </a>
      </main>
    );
  if (!ov || !tenants)
    return <main style={{ padding: 32, fontFamily: 'system-ui' }}>Loading admin console…</main>;

  const kpis = [
    { label: 'Assessments', value: ov.loop.assessments },
    { label: 'Invitations', value: ov.loop.invitations },
    { label: 'Attempts', value: ov.loop.attempts },
    { label: 'Graded', value: ov.loop.grade_decisions },
    { label: 'Released Qs', value: ov.bank.questions_released },
    { label: 'Calibrated Qs', value: ov.bank.questions_calibrated },
    { label: 'Active subs', value: ov.billing.subscriptions_active },
  ];

  const th = {
    textAlign: 'left',
    padding: '8px 10px',
    color: C.sub,
    fontWeight: 600,
    borderBottom: `1px solid ${C.line}`,
  } as const;
  const td = {
    padding: '8px 10px',
    color: C.ink,
    borderBottom: `1px solid ${C.line}`,
  } as const;

  return (
    <main style={{ minHeight: '100vh', background: C.bg, fontFamily: 'system-ui, sans-serif' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 24px',
          background: '#fff',
          borderBottom: `1px solid ${C.line}`,
        }}
      >
        <strong style={{ color: C.teal }}>QOrium · Admin console</strong>
        <a href="/dashboard" style={{ color: C.teal, fontSize: 13 }}>
          ← Dashboard
        </a>
      </header>

      <section style={{ maxWidth: 980, margin: '24px auto', padding: '0 20px' }}>
        <p style={{ color: C.sub, fontSize: 13 }}>
          Generated {new Date(ov.generated_at).toLocaleString('en-IN')}
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
            gap: 12,
            marginBottom: 28,
          }}
        >
          {kpis.map((k) => (
            <div
              key={k.label}
              style={{
                padding: 16,
                background: '#fff',
                border: `1px solid ${C.line}`,
                borderRadius: 12,
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 700, color: C.ink }}>{n(k.value)}</div>
              <div style={{ fontSize: 13, color: C.sub }}>{k.label}</div>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: 16, color: C.ink }}>Tenants ({tenants.length})</h2>
        <div
          style={{
            overflowX: 'auto',
            background: '#fff',
            border: `1px solid ${C.line}`,
            borderRadius: 12,
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                <th style={th}>Tenant</th>
                <th style={th}>Type</th>
                <th style={th}>Plan</th>
                <th style={th}>Status</th>
                <th style={th}>Assessments</th>
                <th style={th}>Attempts</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id}>
                  <td style={td}>{t.name}</td>
                  <td style={td}>{t.type}</td>
                  <td style={td}>{t.plan}</td>
                  <td style={td}>{t.status}</td>
                  <td style={td}>{n(t.assessments)}</td>
                  <td style={td}>{n(t.attempts)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
