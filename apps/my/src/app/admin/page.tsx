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

type GradeDecision = {
  id: string;
  tenant_id: string;
  tenant_name: string | null;
  response_id: string;
  question_id: string;
  model: string;
  prompt_version: string;
  grader_source: string;
  score: number;
  confidence: number;
  reasoning_excerpt: string;
  reasoning_hash: string;
  created_at: string;
};

type BankStats = {
  questions_total: number;
  questions_released: number;
  questions_calibrated: number;
  calibration_pct: number;
  by_status: Record<string, number>;
  by_sku: Record<string, number>;
  skills_total: number;
  families_total: number;
  families_with_released: number;
  generated_at: string;
};

type FamilyCoverage = {
  family: string;
  family_name: string;
  released: number;
  with_irt_params: number;
  with_empirical_data: number;
  refit_ready: number;
  irt_params_pct: number;
  empirical_pct: number;
  refit_ready_pct: number;
};

type CalibrationCoverage = {
  families: FamilyCoverage[];
  totals: {
    released: number;
    with_irt_params: number;
    with_empirical_data: number;
    refit_ready: number;
    irt_params_pct: number;
    empirical_pct: number;
    refit_ready_pct: number;
  };
  generated_at: string;
};

type FamilyBacklog = {
  family: string;
  family_name: string;
  released: number;
  calibratable: number;
  seeded: number;
  cold_backlog: number;
  cold_pct: number;
};

type CalibrationBacklog = {
  families: FamilyBacklog[];
  totals: {
    released: number;
    calibratable: number;
    seeded: number;
    cold_backlog: number;
    cold_pct: number;
  };
  generated_at: string;
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

const TABS = [
  'Overview',
  'Assessments',
  'Attempts',
  'Grades',
  'Audit',
  'Calibration',
  'Bank',
] as const;
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
  risk,
  onRisk,
  risks,
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
  risk?: string;
  onRisk?: (v: string) => void;
  risks?: string[];
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
      {onRisk && (
        <select style={fld} value={risk ?? ''} onChange={(e) => onRisk(e.target.value)}>
          <option value="">All risk levels</option>
          {(risks ?? ['high', 'medium', 'low']).map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

// Cold-backlog colour ramp: hotter cold_pct = redder (worst-first seeding target).
function coldColor(pct: number): string {
  if (pct >= 67) return '#b91c1c';
  if (pct >= 34) return '#d97706';
  return '#16a34a';
}

function CalibrationPanel({
  coverage,
  backlog,
}: {
  coverage: CalibrationCoverage | null;
  backlog: CalibrationBacklog | null;
}) {
  if (!coverage || !backlog)
    return <p style={{ color: C.sub, fontSize: 13 }}>Loading calibration health…</p>;

  const ct = coverage.totals;
  const bt = backlog.totals;
  const kpis = [
    { label: 'Released items', value: ct.released },
    { label: 'With IRT params', value: ct.with_irt_params },
    { label: 'With empirical data', value: ct.with_empirical_data },
    { label: 'Refit-ready (n≥30)', value: ct.refit_ready },
    { label: 'Calibratable', value: bt.calibratable },
    { label: 'Cold backlog', value: bt.cold_backlog },
  ];

  return (
    <>
      <p style={{ color: C.sub, fontSize: 13 }}>
        Coverage generated {new Date(coverage.generated_at).toLocaleString('en-IN')} · backlog{' '}
        {new Date(backlog.generated_at).toLocaleString('en-IN')}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
          gap: 12,
          marginBottom: 20,
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

      <div
        style={{
          padding: 16,
          background: '#fff',
          border: `1px solid ${C.line}`,
          borderRadius: 12,
          marginBottom: 28,
        }}
      >
        <div style={{ fontSize: 13, color: C.sub, marginBottom: 6 }}>
          Empirical coverage (released items carrying any empirical response data)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 10, background: C.line, borderRadius: 999 }}>
            <div
              style={{
                width: `${Math.min(ct.empirical_pct, 100)}%`,
                height: 10,
                background: C.teal,
                borderRadius: 999,
              }}
            />
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>{ct.empirical_pct}%</div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <h2 style={{ fontSize: 16, color: C.ink, margin: 0 }}>
          Cold backlog by family (worst-first) — seed responses here
        </h2>
        <ExportButton
          count={backlog.families.length}
          onClick={() =>
            downloadCsv(
              `qorium-calibration-backlog-${today()}.csv`,
              toCsv(
                ['Family', 'Released', 'Calibratable', 'Seeded', 'ColdBacklog', 'ColdPct'],
                backlog.families.map((f) => [
                  f.family_name,
                  f.released,
                  f.calibratable,
                  f.seeded,
                  f.cold_backlog,
                  f.cold_pct,
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
              <th style={th}>Family</th>
              <th style={th}>Released</th>
              <th style={th}>Calibratable</th>
              <th style={th}>Seeded</th>
              <th style={th}>Cold backlog</th>
              <th style={th}>Cold %</th>
            </tr>
          </thead>
          <tbody>
            {backlog.families.map((f) => (
              <tr key={f.family}>
                <td style={td}>{f.family_name}</td>
                <td style={td}>{n(f.released)}</td>
                <td style={td}>{n(f.calibratable)}</td>
                <td style={td}>{n(f.seeded)}</td>
                <td style={{ ...td, fontWeight: 600, color: coldColor(f.cold_pct) }}>
                  {n(f.cold_backlog)}
                </td>
                <td style={{ ...td, fontWeight: 600, color: coldColor(f.cold_pct) }}>
                  {f.cold_pct}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
          marginTop: 28,
        }}
      >
        <h2 style={{ fontSize: 16, color: C.ink, margin: 0 }}>Calibration coverage by family</h2>
        <ExportButton
          count={coverage.families.length}
          onClick={() =>
            downloadCsv(
              `qorium-calibration-coverage-${today()}.csv`,
              toCsv(
                [
                  'Family',
                  'Released',
                  'WithIrtParams',
                  'WithEmpiricalData',
                  'RefitReady',
                  'IrtParamsPct',
                  'EmpiricalPct',
                  'RefitReadyPct',
                ],
                coverage.families.map((f) => [
                  f.family_name,
                  f.released,
                  f.with_irt_params,
                  f.with_empirical_data,
                  f.refit_ready,
                  f.irt_params_pct,
                  f.empirical_pct,
                  f.refit_ready_pct,
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
              <th style={th}>Family</th>
              <th style={th}>Released</th>
              <th style={th}>IRT params</th>
              <th style={th}>Empirical</th>
              <th style={th}>Refit-ready</th>
              <th style={th}>Empirical %</th>
            </tr>
          </thead>
          <tbody>
            {coverage.families.map((f) => (
              <tr key={f.family}>
                <td style={td}>{f.family_name}</td>
                <td style={td}>{n(f.released)}</td>
                <td style={td}>
                  {n(f.with_irt_params)} ({f.irt_params_pct}%)
                </td>
                <td style={td}>{n(f.with_empirical_data)}</td>
                <td style={td}>{n(f.refit_ready)}</td>
                <td style={td}>{f.empirical_pct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

function BankPanel({ stats }: { stats: BankStats | null }) {
  if (!stats) return <p style={{ color: C.sub, fontSize: 13 }}>Loading bank health…</p>;
  const kpis = [
    { label: 'Questions total', value: stats.questions_total },
    { label: 'Released', value: stats.questions_released },
    { label: 'Calibrated (n≥30)', value: stats.questions_calibrated },
    { label: 'Skills', value: stats.skills_total },
    { label: 'Families with released', value: stats.families_with_released },
    { label: 'Families total', value: stats.families_total },
  ];
  const statusRows = Object.entries(stats.by_status).sort((a, b) => b[1] - a[1]);
  const skuRows = Object.entries(stats.by_sku).sort((a, b) => b[1] - a[1]);
  return (
    <>
      <p style={{ color: C.sub, fontSize: 13 }}>
        Generated {new Date(stats.generated_at).toLocaleString('en-IN')}
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
          gap: 12,
          marginBottom: 20,
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

      <div
        style={{
          padding: 16,
          background: '#fff',
          border: `1px solid ${C.line}`,
          borderRadius: 12,
          marginBottom: 28,
        }}
      >
        <div style={{ fontSize: 13, color: C.sub, marginBottom: 6 }}>
          Calibration coverage (released items with IRT-defensible n≥30)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 10, background: C.line, borderRadius: 999 }}>
            <div
              style={{
                width: `${Math.min(stats.calibration_pct, 100)}%`,
                height: 10,
                background: C.teal,
                borderRadius: 999,
              }}
            />
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>
            {stats.calibration_pct}%
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: 16, color: C.ink }}>By status</h2>
      <Card>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={th}>Status</th>
              <th style={th}>Questions</th>
            </tr>
          </thead>
          <tbody>
            {statusRows.map(([k, v]) => (
              <tr key={k}>
                <td style={td}>{k}</td>
                <td style={td}>{n(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <h2 style={{ fontSize: 16, color: C.ink, marginTop: 24 }}>By SKU</h2>
      <Card>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={th}>SKU</th>
              <th style={th}>Questions</th>
            </tr>
          </thead>
          <tbody>
            {skuRows.map(([k, v]) => (
              <tr key={k}>
                <td style={td}>{k}</td>
                <td style={td}>{n(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('Overview');
  const [ov, setOv] = useState<Overview | null>(null);
  const [tenants, setTenants] = useState<Tenant[] | null>(null);
  const [assessments, setAssessments] = useState<Assessment[] | null>(null);
  const [attempts, setAttempts] = useState<Attempt[] | null>(null);
  const [events, setEvents] = useState<AuditEvent[] | null>(null);
  const [gradeDecisions, setGradeDecisions] = useState<GradeDecision[] | null>(null);
  const [bankStats, setBankStats] = useState<BankStats | null>(null);
  const [calCoverage, setCalCoverage] = useState<CalibrationCoverage | null>(null);
  const [calBacklog, setCalBacklog] = useState<CalibrationBacklog | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Client-side filter state (per tab).
  const [aSearch, setASearch] = useState('');
  const [aStatus, setAStatus] = useState('');
  const [tSearch, setTSearch] = useState('');
  const [tStatus, setTStatus] = useState('');
  const [tFlagged, setTFlagged] = useState(false);
  const [tRisk, setTRisk] = useState('');
  const [evSearch, setEvSearch] = useState('');
  const [evType, setEvType] = useState('');
  const [aSort, setASort] = useState<'desc' | 'asc'>('desc');
  const [tSort, setTSort] = useState<'desc' | 'asc'>('desc');
  const [evSort, setEvSort] = useState<'desc' | 'asc'>('desc');
  const [gdSearch, setGdSearch] = useState('');
  const [gdSource, setGdSource] = useState('');
  const [gdSort, setGdSort] = useState<'desc' | 'asc'>('desc');

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
    if (tab === 'Grades' && gradeDecisions === null) {
      getJson<{ grade_decisions: GradeDecision[] }>('/api/v1/admin/grade-decisions?limit=200')
        .then((d) => setGradeDecisions(d.grade_decisions))
        .catch((e) => setErr(String(e)));
    }
    if (tab === 'Calibration' && calCoverage === null) {
      Promise.all([
        getJson<CalibrationCoverage>('/api/v1/admin/calibration-coverage'),
        getJson<CalibrationBacklog>('/api/v1/admin/calibration-backlog'),
      ])
        .then(([cov, bk]) => {
          setCalCoverage(cov);
          setCalBacklog(bk);
        })
        .catch((e) => setErr(String(e)));
    }
    if (tab === 'Bank' && bankStats === null) {
      getJson<BankStats>('/api/v1/admin/bank-stats')
        .then((d) => setBankStats(d))
        .catch((e) => setErr(String(e)));
    }
  }, [tab, assessments, attempts, events, gradeDecisions, bankStats, calCoverage]);

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
      (tRisk === '' || a.integrity.risk_level === tRisk) &&
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
  const gradeList = gradeDecisions ?? [];
  const gdFiltered = gradeList.filter(
    (g) =>
      (gdSource === '' || g.grader_source === gdSource) &&
      (gdSearch === '' ||
        q(`${g.tenant_name ?? ''} ${g.model} ${g.grader_source} ${g.question_id}`).includes(
          q(gdSearch),
        )),
  );
  const gdSorted = sortByDate(gdFiltered, (g) => g.created_at, gdSort);

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
                  risk={tRisk}
                  onRisk={setTRisk}
                  risks={['high', 'medium', 'low']}
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

        {tab === 'Grades' && (
          <>
            <h2 style={{ fontSize: 16, color: C.ink }}>
              Grade decisions{' '}
              {gradeDecisions ? `(${gdFiltered.length}/${gradeDecisions.length})` : ''}
            </h2>
            {gradeDecisions === null ? (
              <p style={{ color: C.sub, fontSize: 13 }}>Loading…</p>
            ) : (
              <>
                <FilterBar
                  search={gdSearch}
                  onSearch={setGdSearch}
                  placeholder="Search tenant, model, source or question…"
                  status={gdSource}
                  onStatus={setGdSource}
                  statuses={uniqSorted(gradeList.map((g) => g.grader_source))}
                  statusLabel="All grader sources"
                  sort={gdSort}
                  onSort={setGdSort}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                  <ExportButton
                    count={gdSorted.length}
                    onClick={() =>
                      downloadCsv(
                        `qorium-grade-decisions-${today()}.csv`,
                        toCsv(
                          [
                            'Tenant',
                            'Source',
                            'Model',
                            'PromptVersion',
                            'Score',
                            'Confidence',
                            'QuestionId',
                            'ReasoningHash',
                            'When',
                          ],
                          gdSorted.map((g) => [
                            g.tenant_name ?? g.tenant_id,
                            g.grader_source,
                            g.model,
                            g.prompt_version,
                            g.score,
                            g.confidence,
                            g.question_id,
                            g.reasoning_hash,
                            g.created_at,
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
                        <th style={th}>Tenant</th>
                        <th style={th}>Source</th>
                        <th style={th}>Model</th>
                        <th style={th}>Score</th>
                        <th style={th}>Conf.</th>
                        <th style={th}>Reasoning (excerpt)</th>
                        <th style={th}>Hash</th>
                        <th style={th}>When</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gdSorted.map((g) => (
                        <tr key={g.id}>
                          <td style={td}>{g.tenant_name ?? shortId(g.tenant_id)}</td>
                          <td style={td}>{g.grader_source}</td>
                          <td style={td}>{g.model}</td>
                          <td style={td}>{g.score.toFixed(3)}</td>
                          <td style={td}>{g.confidence.toFixed(2)}</td>
                          <td style={{ ...td, whiteSpace: 'normal', maxWidth: 360, color: C.sub }}>
                            {g.reasoning_excerpt || '—'}
                          </td>
                          <td style={{ ...td, fontFamily: 'monospace' }} title={g.reasoning_hash}>
                            {shortId(g.reasoning_hash)}
                          </td>
                          <td style={td}>{dt(g.created_at)}</td>
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

        {tab === 'Calibration' && <CalibrationPanel coverage={calCoverage} backlog={calBacklog} />}

        {tab === 'Bank' && <BankPanel stats={bankStats} />}
      </section>
    </main>
  );
}
