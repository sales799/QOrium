'use client';

// apps/my: src/app/admin/page.tsx — recruiter-authed admin console (N8).
// Read-only control-plane view consuming GET /v1/admin/overview, /tenants,
// /assessments, /attempts and /audit-events via the cookie-forwarding /api/v1
// proxy. No mutations. Tabs lazy-fetch their endpoint on first open.
// Client-side filter/search controls (search box, status filter, flagged-only)
// operate on the already-fetched rows — no new endpoints, no DB change.

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

type Assessment = {
  id: string;
  tenant_id: string;
  tenant_name: string | null;
  title: string;
  status: string;
  total_questions: number;
  created_at: string;
  invitations: number;
  attempts: number;
};

type Integrity = {
  total: number;
  by_type: Record<string, number>;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high';
  flagged: boolean;
};

type Attempt = {
  id: string;
  tenant_id: string;
  tenant_name: string | null;
  assessment_id: string;
  assessment_title: string | null;
  candidate_id: string;
  status: string;
  total_score: number | null;
  max_score: number | null;
  started_at: string;
  submitted_at: string | null;
  graded_at: string | null;
  integrity: Integrity;
};

type AuditEvent = {
  id: string;
  event_type: string;
  actor_type: string | null;
  actor_id: string | null;
  entity_type: string | null;
  entity_id: string | null;
  tenant_id: string | null;
  tenant_name: string | null;
  occurred_at: string;
};

const C = { teal: '#0d9488', ink: '#0f172a', sub: '#64748b', line: '#e2e8f0', bg: '#f8fafc' };
const n = (x: number) => x.toLocaleString('en-IN');
const dt = (s: string | null) => (s ? new Date(s).toLocaleString('en-IN') : '—');
const shortId = (s: string | null) => (s ? s.slice(0, 8) : '—');

const RISK_COLOR: Record<Integrity['risk_level'], string> = {
  low: '#16a34a',
  medium: '#d97706',
  high: '#b91c1c',
};

const TABS = ['Overview', 'Assessments', 'Attempts', 'Audit'] as const;
type Tab = (typeof TABS)[number];

const th = {
  textAlign: 'left',
  padding: '8px 10px',
  color: C.sub,
  fontWeight: 600,
  borderBottom: `1px solid ${C.line}`,
  whiteSpace: 'nowrap',
} as const;
const td = {
  padding: '8px 10px',
  color: C.ink,
  borderBottom: `1px solid ${C.line}`,
  whiteSpace: 'nowrap',
} as const;
const fld = {
  padding: '7px 10px',
  fontSize: 13,
  border: `1px solid ${C.line}`,
  borderRadius: 8,
  color: C.ink,
  background: '#fff',
} as const;

function getJson<T>(path: string): Promise<T> {
  return fetch(path, { credentials: 'include' }).then((r) =>
    r.ok ? (r.json() as Promise<T>) : Promise.reject(new Error(`${path}: status ${r.status}`)),
  );
}

function uniqSorted(values: (string | null | undefined)[]): string[] {
  return Array.from(new Set(values.filter((v): v is string => !!v))).sort();
}

// Pure date sort — returns a new array (no mutation); invalid/missing dates sort last.
function sortByDate<T>(rows: T[], getDate: (r: T) => string | null, dir: 'desc' | 'asc'): T[] {
  const ts = (v: string | null) => {
    const t = v ? Date.parse(v) : NaN;
    return Number.isNaN(t) ? 0 : t;
  };
  return [...rows].sort((a, b) =>
    dir === 'desc' ? ts(getDate(b)) - ts(getDate(a)) : ts(getDate(a)) - ts(getDate(b)),
  );
}

// Pure CSV builder — RFC-4180 escaping (quote fields containing comma/quote/newline).
function toCsv(headers: string[], rows: (string | number | null)[][]): string {
  const esc = (v: string | number | null) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers, ...rows].map((r) => r.map(esc).join(',')).join('\r\n');
}

// Client-side CSV download (Blob + object URL) — no server round-trip, no endpoint.
function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const today = () => new Date().toISOString().slice(0, 10);

function ExportButton({ onClick, count }: { onClick: () => void; count: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={count === 0}
      style={{
        padding: '7px 12px',
        fontSize: 13,
        borderRadius: 8,
        border: `1px solid ${C.line}`,
        background: count === 0 ? '#f1f5f9' : '#fff',
        color: count === 0 ? C.sub : C.teal,
        cursor: count === 0 ? 'default' : 'pointer',
        fontWeight: 600,
      }}
    >
      Export CSV ({count})
    </button>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        overflowX: 'auto',
        background: '#fff',
        border: `1px solid ${C.line}`,
        borderRadius: 12,
      }}
    >
      {children}
    </div>
  );
}

function FilterBar({
  search,
  onSearch,
  placeholder,
  status,
  onStatus,
  statuses,
  statusLabel = 'All statuses',
  flaggedOnly,
  onFlagged,
  sort,
  onSort,
}: {
  search: string;
  onSearch: (v: string) => void;
  placeholder: string;
  status: string;
  onStatus: (v: string) => void;
  statuses: string[];
  statusLabel?: string;
  flaggedOnly?: boolean;
  onFlagged?: (v: boolean) => void;
  sort?: 'desc' | 'asc';
  onSort?: (v: 'desc' | 'asc') => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        flexWrap: 'wrap',
        alignItems: 'center',
        margin: '10px 0 14px',
      }}
    >
      <input
        style={{ ...fld, minWidth: 220, flex: '1 1 220px' }}
        placeholder={placeholder}
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />
      <select style={fld} value={status} onChange={(e) => onStatus(e.target.value)}>
        <option value="">{statusLabel}</option>
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {onFlagged && (
        <label
          style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, color: C.sub }}
        >
          <input
            type="checkbox"
            checked={!!flaggedOnly}
            onChange={(e) => onFlagged(e.target.checked)}
          />
          Flagged only
        </label>
      )}
      {onSort && (
        <select
          style={fld}
          value={sort ?? 'desc'}
          onChange={(e) => onSort(e.target.value as 'desc' | 'asc')}
        >
          <option value="desc">Newest first</option>
          <option value="asc">Oldest first</option>
        </select>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('Overview');
  const [ov, setOv] = useState<Overview | null>(null);
  const [tenants, setTenants] = useState<Tenant[] | null>(null);
  const [assessments, setAssessments] = useState<Assessment[] | null>(null);
  const [attempts, setAttempts] = useState<Attempt[] | null>(null);
  const [events, setEvents] = useState<AuditEvent[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Client-side filter state (per tab).
  const [aSearch, setASearch] = useState('');
  const [aStatus, setAStatus] = useState('');
  const [tSearch, setTSearch] = useState('');
  const [tStatus, setTStatus] = useState('');
  const [tFlagged, setTFlagged] = useState(false);
  const [evSearch, setEvSearch] = useState('');
  const [evType, setEvType] = useState('');
  const [aSort, setASort] = useState<'desc' | 'asc'>('desc');
  const [tSort, setTSort] = useState<'desc' | 'asc'>('desc');
  const [evSort, setEvSort] = useState<'desc' | 'asc'>('desc');

  useEffect(() => {
    Promise.all([
      getJson<Overview>('/api/v1/admin/overview'),
      getJson<{ tenants: Tenant[] }>('/api/v1/admin/tenants?limit=200'),
    ])
      .then(([o, t]) => {
        setOv(o);
        setTenants(t.tenants);
      })
      .catch((e) => setErr(String(e)));
  }, []);

  // Lazy-load each tab's data on first open.
  useEffect(() => {
    if (tab === 'Assessments' && assessments === null) {
      getJson<{ assessments: Assessment[] }>('/api/v1/admin/assessments?limit=200')
        .then((d) => setAssessments(d.assessments))
        .catch((e) => setErr(String(e)));
    }
    if (tab === 'Attempts' && attempts === null) {
      getJson<{ attempts: Attempt[] }>('/api/v1/admin/attempts?limit=200')
        .then((d) => setAttempts(d.attempts))
        .catch((e) => setErr(String(e)));
    }
    if (tab === 'Audit' && events === null) {
      getJson<{ events: AuditEvent[] }>('/api/v1/admin/audit-events?limit=200')
        .then((d) => setEvents(d.events))
        .catch((e) => setErr(String(e)));
    }
  }, [tab, assessments, attempts, events]);

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

  const q = (s: string) => s.toLowerCase();
  const assessmentList = assessments ?? [];
  const aFiltered = assessmentList.filter(
    (a) =>
      (aStatus === '' || a.status === aStatus) &&
      (aSearch === '' || q(`${a.title} ${a.tenant_name ?? ''}`).includes(q(aSearch))),
  );
  const attemptList = attempts ?? [];
  const tFiltered = attemptList.filter(
    (a) =>
      (tStatus === '' || a.status === tStatus) &&
      (!tFlagged || a.integrity.flagged) &&
      (tSearch === '' ||
        q(`${a.assessment_title ?? ''} ${a.tenant_name ?? ''} ${a.candidate_id}`).includes(
          q(tSearch),
        )),
  );
  const eventList = events ?? [];
  const evFiltered = eventList.filter(
    (e) =>
      (evType === '' || e.event_type === evType) &&
      (evSearch === '' ||
        q(
          `${e.event_type} ${e.actor_type ?? ''} ${e.entity_type ?? ''} ${e.tenant_name ?? ''}`,
        ).includes(q(evSearch))),
  );
  const aSorted = sortByDate(aFiltered, (a) => a.created_at, aSort);
  const tSorted = sortByDate(tFiltered, (a) => a.started_at, tSort);
  const evSorted = sortByDate(evFiltered, (e) => e.occurred_at, evSort);

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

      <nav
        style={{
          display: 'flex',
          gap: 4,
          padding: '0 24px',
          background: '#fff',
          borderBottom: `1px solid ${C.line}`,
        }}
      >
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '10px 14px',
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: tab === t ? C.teal : C.sub,
              borderBottom: tab === t ? `2px solid ${C.teal}` : '2px solid transparent',
            }}
          >
            {t}
          </button>
        ))}
      </nav>

      <section style={{ maxWidth: 1040, margin: '24px auto', padding: '0 20px' }}>
        {tab === 'Overview' && (
          <>
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
            <Card>
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
            </Card>
          </>
        )}

        {tab === 'Assessments' && (
          <>
            <h2 style={{ fontSize: 16, color: C.ink }}>
              Assessments {assessments ? `(${aFiltered.length}/${assessments.length})` : ''}
            </h2>
            {assessments === null ? (
              <p style={{ color: C.sub, fontSize: 13 }}>Loading…</p>
            ) : (
              <>
                <FilterBar
                  search={aSearch}
                  onSearch={setASearch}
                  placeholder="Search title or tenant…"
                  status={aStatus}
                  onStatus={setAStatus}
                  statuses={uniqSorted(assessmentList.map((a) => a.status))}
                  sort={aSort}
                  onSort={setASort}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                  <ExportButton
                    count={aSorted.length}
                    onClick={() =>
                      downloadCsv(
                        `qorium-assessments-${today()}.csv`,
                        toCsv(
                          [
                            'Title',
                            'Tenant',
                            'Status',
                            'Questions',
                            'Invites',
                            'Attempts',
                            'Created',
                          ],
                          aSorted.map((a) => [
                            a.title,
                            a.tenant_name ?? a.tenant_id,
                            a.status,
                            a.total_questions,
                            a.invitations,
                            a.attempts,
                            a.created_at,
                          ]),
                        ),
                      )
                    }
                  />
                </div>
                <Card>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr>
                        <th style={th}>Title</th>
                        <th style={th}>Tenant</th>
                        <th style={th}>Status</th>
                        <th style={th}>Qs</th>
                        <th style={th}>Invites</th>
                        <th style={th}>Attempts</th>
                        <th style={th}>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aSorted.map((a) => (
                        <tr key={a.id}>
                          <td style={td}>{a.title}</td>
                          <td style={td}>{a.tenant_name ?? shortId(a.tenant_id)}</td>
                          <td style={td}>{a.status}</td>
                          <td style={td}>{n(a.total_questions)}</td>
                          <td style={td}>{n(a.invitations)}</td>
                          <td style={td}>{n(a.attempts)}</td>
                          <td style={td}>{dt(a.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </>
            )}
          </>
        )}

        {tab === 'Attempts' && (
          <>
            <h2 style={{ fontSize: 16, color: C.ink }}>
              Attempts {attempts ? `(${tFiltered.length}/${attempts.length})` : ''}
            </h2>
            {attempts === null ? (
              <p style={{ color: C.sub, fontSize: 13 }}>Loading…</p>
            ) : (
              <>
                <FilterBar
                  search={tSearch}
                  onSearch={setTSearch}
                  placeholder="Search assessment, tenant or candidate…"
                  status={tStatus}
                  onStatus={setTStatus}
                  statuses={uniqSorted(attemptList.map((a) => a.status))}
                  flaggedOnly={tFlagged}
                  onFlagged={setTFlagged}
                  sort={tSort}
                  onSort={setTSort}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                  <ExportButton
                    count={tSorted.length}
                    onClick={() =>
                      downloadCsv(
                        `qorium-attempts-${today()}.csv`,
                        toCsv(
                          [
                            'Assessment',
                            'Tenant',
                            'Candidate',
                            'Status',
                            'Score',
                            'MaxScore',
                            'IntegrityLevel',
                            'IntegrityScore',
                            'Flagged',
                            'Started',
                          ],
                          tSorted.map((a) => [
                            a.assessment_title ?? a.assessment_id,
                            a.tenant_name ?? a.tenant_id,
                            a.candidate_id,
                            a.status,
                            a.total_score,
                            a.max_score,
                            a.integrity.risk_level,
                            a.integrity.risk_score,
                            a.integrity.flagged ? 'yes' : 'no',
                            a.started_at,
                          ]),
                        ),
                      )
                    }
                  />
                </div>
                <Card>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr>
                        <th style={th}>Assessment</th>
                        <th style={th}>Tenant</th>
                        <th style={th}>Candidate</th>
                        <th style={th}>Status</th>
                        <th style={th}>Score</th>
                        <th style={th}>Integrity</th>
                        <th style={th}>Started</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tSorted.map((a) => (
                        <tr key={a.id}>
                          <td style={td}>{a.assessment_title ?? shortId(a.assessment_id)}</td>
                          <td style={td}>{a.tenant_name ?? shortId(a.tenant_id)}</td>
                          <td style={td}>{shortId(a.candidate_id)}</td>
                          <td style={td}>{a.status}</td>
                          <td style={td}>
                            {a.total_score === null
                              ? '—'
                              : `${n(a.total_score)}${a.max_score !== null ? ` / ${n(a.max_score)}` : ''}`}
                          </td>
                          <td
                            style={{
                              ...td,
                              color: RISK_COLOR[a.integrity.risk_level],
                              fontWeight: 600,
                            }}
                          >
                            {a.integrity.flagged ? '⚑ ' : ''}
                            {a.integrity.risk_level} ({a.integrity.risk_score})
                          </td>
                          <td style={td}>{dt(a.started_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </>
            )}
          </>
        )}

        {tab === 'Audit' && (
          <>
            <h2 style={{ fontSize: 16, color: C.ink }}>
              Audit events {events ? `(${evFiltered.length}/${events.length})` : ''}
            </h2>
            {events === null ? (
              <p style={{ color: C.sub, fontSize: 13 }}>Loading…</p>
            ) : (
              <>
                <FilterBar
                  search={evSearch}
                  onSearch={setEvSearch}
                  placeholder="Search event, actor, entity or tenant…"
                  status={evType}
                  onStatus={setEvType}
                  statuses={uniqSorted(eventList.map((e) => e.event_type))}
                  statusLabel="All event types"
                  sort={evSort}
                  onSort={setEvSort}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                  <ExportButton
                    count={evSorted.length}
                    onClick={() =>
                      downloadCsv(
                        `qorium-audit-events-${today()}.csv`,
                        toCsv(
                          [
                            'Event',
                            'ActorType',
                            'ActorId',
                            'EntityType',
                            'EntityId',
                            'Tenant',
                            'When',
                          ],
                          evSorted.map((e) => [
                            e.event_type,
                            e.actor_type,
                            e.actor_id,
                            e.entity_type,
                            e.entity_id,
                            e.tenant_name ?? e.tenant_id,
                            e.occurred_at,
                          ]),
                        ),
                      )
                    }
                  />
                </div>
                <Card>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr>
                        <th style={th}>Event</th>
                        <th style={th}>Actor</th>
                        <th style={th}>Entity</th>
                        <th style={th}>Tenant</th>
                        <th style={th}>When</th>
                      </tr>
                    </thead>
                    <tbody>
                      {evSorted.map((e) => (
                        <tr key={e.id}>
                          <td style={td}>{e.event_type}</td>
                          <td style={td}>
                            {e.actor_type ?? '—'}
                            {e.actor_id ? ` · ${shortId(e.actor_id)}` : ''}
                          </td>
                          <td style={td}>
                            {e.entity_type ?? '—'}
                            {e.entity_id ? ` · ${shortId(e.entity_id)}` : ''}
                          </td>
                          <td style={td}>{e.tenant_name ?? shortId(e.tenant_id)}</td>
                          <td style={td}>{dt(e.occurred_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </>
            )}
          </>
        )}
      </section>
    </main>
  );
}
