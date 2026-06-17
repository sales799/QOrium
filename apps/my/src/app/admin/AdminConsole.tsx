'use client';

// apps/my: src/app/admin/AdminConsole.tsx — recruiter-authed admin console (N8).
// Control-plane view consuming /v1/admin endpoints through the cookie-forwarding
// /api/v1 proxy. The route itself is server-gated by GET /v1/admin/overview.
// Client-side filter/search controls operate on already-fetched rows. Approved
// mutations stay narrowly scoped to audited /v1/admin write endpoints.

import { useCallback, useEffect, useState } from 'react';
import { loginUrl } from '@/lib/auth-navigation';
import { buildPanelTokenRequest } from '@/lib/admin-console';

export type Overview = {
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

type LeakAlert = {
  id: string;
  question_id: string;
  source_url: string;
  source_type: string | null;
  detected_at: string;
  similarity_score: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'detected' | 'under_review' | 'rotated' | 'dismissed' | 'false_positive';
  rotated_to_question_id: string | null;
  reviewed_by: string | null;
  review_notes: string | null;
};

type CalibrationItem = {
  id: string;
  format: string;
  status: string;
  difficulty_b: string | null;
  discrimination_a: string | null;
  guessing_c: string | null;
  empirical_pass_rate: string | null;
  n: string | number;
  body_excerpt: string;
};

type ReviewDecision = 'dismissed' | 'false_positive' | 'under_review';

type ReviewDraft = {
  decision: ReviewDecision;
  notes: string;
};

type RowActionState = {
  pending?: boolean;
  ok?: string;
  error?: string;
};

type PanelTokenResult = {
  id: string;
  token: string;
  expires_at: string;
  scopes: string[];
};

type ShellIssue =
  | { kind: 'unauthorised'; message: string }
  | { kind: 'forbidden'; message: string }
  | { kind: 'degraded'; message: string };

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
  'Leak Alerts',
  'Calibration',
  'Assessments',
  'Attempts',
  'Grades',
  'Audit',
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

class ApiError extends Error {
  constructor(
    readonly path: string,
    readonly status: number,
    readonly detail?: string,
  ) {
    super(detail ? `${path}: ${detail}` : `${path}: status ${status}`);
  }
}

async function readProblemDetail(res: Response): Promise<string | undefined> {
  const contentType = res.headers.get('content-type') ?? '';
  try {
    if (contentType.includes('application/json')) {
      const body = (await res.json()) as { title?: string; detail?: string; status?: number };
      return body.detail ?? body.title ?? (body.status ? `status ${body.status}` : undefined);
    }
    const text = await res.text();
    return text.slice(0, 220) || undefined;
  } catch {
    return undefined;
  }
}

async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: HeadersInit = {
    ...(init.body ? { 'content-type': 'application/json' } : {}),
    ...(init.headers ?? {}),
  };
  const res = await fetch(path, { credentials: 'include', ...init, headers });
  if (!res.ok) throw new ApiError(path, res.status, await readProblemDetail(res));
  return res.json() as Promise<T>;
}

function getJson<T>(path: string): Promise<T> {
  return requestJson<T>(path);
}

function postJson<T>(path: string, body: unknown): Promise<T> {
  return requestJson<T>(path, { method: 'POST', body: JSON.stringify(body) });
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

function ShellState({
  title,
  body,
  tone = 'neutral',
  children,
}: {
  title: string;
  body: string;
  tone?: 'neutral' | 'danger' | 'warning';
  children?: React.ReactNode;
}) {
  const accent = tone === 'danger' ? '#b91c1c' : tone === 'warning' ? '#b45309' : C.teal;
  return (
    <main style={{ minHeight: '100vh', background: C.bg, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ maxWidth: 680, margin: '0 auto', padding: '72px 20px' }}>
        <div
          style={{
            background: '#fff',
            border: `1px solid ${C.line}`,
            borderLeft: `4px solid ${accent}`,
            borderRadius: 12,
            padding: 24,
          }}
        >
          <p style={{ color: accent, fontSize: 13, fontWeight: 700, margin: '0 0 8px' }}>
            Admin console
          </p>
          <h1 style={{ color: C.ink, fontSize: 24, margin: '0 0 8px' }}>{title}</h1>
          <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.6, margin: '0 0 18px' }}>
            {body}
          </p>
          {children ?? (
            <a href="/dashboard" style={{ color: C.teal, fontSize: 13, fontWeight: 700 }}>
              Back to dashboard
            </a>
          )}
        </div>
      </section>
    </main>
  );
}

function InlineState({
  title,
  body,
  tone = 'neutral',
}: {
  title: string;
  body: string;
  tone?: 'neutral' | 'danger' | 'warning';
}) {
  const accent = tone === 'danger' ? '#b91c1c' : tone === 'warning' ? '#b45309' : C.teal;
  return (
    <div
      style={{
        padding: 16,
        background: '#fff',
        border: `1px solid ${C.line}`,
        borderLeft: `4px solid ${accent}`,
        borderRadius: 12,
        color: C.ink,
      }}
    >
      <strong style={{ display: 'block', fontSize: 14, marginBottom: 4 }}>{title}</strong>
      <span style={{ color: C.sub, fontSize: 13 }}>{body}</span>
    </div>
  );
}

function TableEmpty({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        style={{
          ...td,
          color: C.sub,
          textAlign: 'center',
          padding: 24,
          whiteSpace: 'normal',
        }}
      >
        {children}
      </td>
    </tr>
  );
}

function sourceHost(value: string): string {
  try {
    return new URL(value).host;
  } catch {
    return value;
  }
}

function issueFromError(error: unknown): ShellIssue {
  if (error instanceof ApiError && error.status === 401) {
    return {
      kind: 'unauthorised',
      message: 'The admin session expired or was not accepted. Sign in again to continue.',
    };
  }
  if (error instanceof ApiError && error.status === 403) {
    return {
      kind: 'forbidden',
      message: 'The admin API refused this account because it is not an active internal tenant.',
    };
  }
  return {
    kind: 'degraded',
    message: error instanceof Error ? error.message : 'The admin request failed.',
  };
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

function BankPanel({ stats }: { stats: BankStats | null }) {
  if (!stats)
    return <InlineState title="Loading bank health" body="Fetching question-bank totals..." />;
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
            {statusRows.length === 0 ? (
              <TableEmpty colSpan={2}>No question statuses returned by the admin API.</TableEmpty>
            ) : (
              statusRows.map(([k, v]) => (
                <tr key={k}>
                  <td style={td}>{k}</td>
                  <td style={td}>{n(v)}</td>
                </tr>
              ))
            )}
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
            {skuRows.length === 0 ? (
              <TableEmpty colSpan={2}>No SKU rows returned by the admin API.</TableEmpty>
            ) : (
              skuRows.map(([k, v]) => (
                <tr key={k}>
                  <td style={td}>{k}</td>
                  <td style={td}>{n(v)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
}

export default function AdminConsole({ initialOverview }: { initialOverview: Overview }) {
  const [tab, setTab] = useState<Tab>('Overview');
  const [ov] = useState<Overview>(initialOverview);
  const [tenants, setTenants] = useState<Tenant[] | null>(null);
  const [assessments, setAssessments] = useState<Assessment[] | null>(null);
  const [attempts, setAttempts] = useState<Attempt[] | null>(null);
  const [events, setEvents] = useState<AuditEvent[] | null>(null);
  const [gradeDecisions, setGradeDecisions] = useState<GradeDecision[] | null>(null);
  const [bankStats, setBankStats] = useState<BankStats | null>(null);
  const [leakAlerts, setLeakAlerts] = useState<LeakAlert[] | null>(null);
  const [calibrationItems, setCalibrationItems] = useState<CalibrationItem[] | null>(null);
  const [shellIssue, setShellIssue] = useState<ShellIssue | null>(null);

  // Client-side filter state (per tab).
  const [leakSearch, setLeakSearch] = useState('');
  const [leakStatus, setLeakStatus] = useState('');
  const [leakSeverity, setLeakSeverity] = useState('');
  const [leakSort, setLeakSort] = useState<'desc' | 'asc'>('desc');
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
  const [calSearch, setCalSearch] = useState('');
  const [calStatus, setCalStatus] = useState('');

  // Approved write-action state.
  const [reviewDrafts, setReviewDrafts] = useState<Record<string, ReviewDraft>>({});
  const [reviewActions, setReviewActions] = useState<Record<string, RowActionState>>({});
  const [panelistHash, setPanelistHash] = useState('');
  const [tokenTtlDays, setTokenTtlDays] = useState('90');
  const [tokenMetadataJson, setTokenMetadataJson] = useState('{"cohort":"reference-panel"}');
  const [tokenScopesText, setTokenScopesText] = useState('reference-panel:write');
  const [tokenPending, setTokenPending] = useState(false);
  const [tokenMessage, setTokenMessage] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [panelToken, setPanelToken] = useState<PanelTokenResult | null>(null);

  const handleApiError = useCallback((e: unknown) => {
    setShellIssue(issueFromError(e));
  }, []);

  useEffect(() => {
    getJson<{ tenants: Tenant[] }>('/api/v1/admin/tenants?limit=200')
      .then((t) => setTenants(t.tenants))
      .catch(handleApiError);
  }, [handleApiError]);

  const loadLeakAlerts = useCallback(() => {
    return getJson<{ alerts: LeakAlert[] }>('/api/v1/admin/leak-alerts?limit=200')
      .then((d) => setLeakAlerts(d.alerts))
      .catch(handleApiError);
  }, [handleApiError]);

  const loadCalibrationItems = useCallback(() => {
    return getJson<{ items: CalibrationItem[] }>('/api/v1/admin/calibration?limit=200')
      .then((d) => setCalibrationItems(d.items))
      .catch(handleApiError);
  }, [handleApiError]);

  // Lazy-load each tab's data on first open.
  useEffect(() => {
    if (tab === 'Leak Alerts' && leakAlerts === null) {
      void loadLeakAlerts();
    }
    if (tab === 'Calibration' && calibrationItems === null) {
      void loadCalibrationItems();
    }
    if (tab === 'Assessments' && assessments === null) {
      getJson<{ assessments: Assessment[] }>('/api/v1/admin/assessments?limit=200')
        .then((d) => setAssessments(d.assessments))
        .catch(handleApiError);
    }
    if (tab === 'Attempts' && attempts === null) {
      getJson<{ attempts: Attempt[] }>('/api/v1/admin/attempts?limit=200')
        .then((d) => setAttempts(d.attempts))
        .catch(handleApiError);
    }
    if (tab === 'Audit' && events === null) {
      getJson<{ events: AuditEvent[] }>('/api/v1/admin/audit-events?limit=200')
        .then((d) => setEvents(d.events))
        .catch(handleApiError);
    }
    if (tab === 'Grades' && gradeDecisions === null) {
      getJson<{ grade_decisions: GradeDecision[] }>('/api/v1/admin/grade-decisions?limit=200')
        .then((d) => setGradeDecisions(d.grade_decisions))
        .catch(handleApiError);
    }
    if (tab === 'Bank' && bankStats === null) {
      getJson<BankStats>('/api/v1/admin/bank-stats')
        .then((d) => setBankStats(d))
        .catch(handleApiError);
    }
  }, [
    tab,
    leakAlerts,
    calibrationItems,
    assessments,
    attempts,
    events,
    gradeDecisions,
    bankStats,
    loadLeakAlerts,
    loadCalibrationItems,
    handleApiError,
  ]);

  if (shellIssue?.kind === 'unauthorised') {
    return (
      <ShellState title="Session expired" body={shellIssue.message} tone="warning">
        <a href={loginUrl('/admin')} style={{ color: C.teal, fontSize: 13, fontWeight: 700 }}>
          Sign in again
        </a>
      </ShellState>
    );
  }

  if (shellIssue?.kind === 'forbidden') {
    return (
      <ShellState title="Forbidden" body={shellIssue.message} tone="danger">
        <a href="/dashboard" style={{ color: C.teal, fontSize: 13, fontWeight: 700 }}>
          Back to dashboard
        </a>
      </ShellState>
    );
  }

  if (shellIssue?.kind === 'degraded') {
    return (
      <ShellState
        title="Admin data fetch failed"
        body={`The route access check passed, but a console data request failed. ${shellIssue.message}`}
        tone="warning"
      />
    );
  }

  if (!tenants) {
    return (
      <ShellState
        title="Loading admin console"
        body="The server-side gate passed. Loading tenant and control-plane data now..."
      />
    );
  }

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
  const leakList = leakAlerts ?? [];
  const leakFiltered = leakList.filter(
    (alert) =>
      (leakStatus === '' || alert.status === leakStatus) &&
      (leakSeverity === '' || alert.severity === leakSeverity) &&
      (leakSearch === '' ||
        q(
          `${alert.source_url} ${alert.source_type ?? ''} ${alert.question_id} ${alert.status}`,
        ).includes(q(leakSearch))),
  );
  const leakSorted = sortByDate(leakFiltered, (alert) => alert.detected_at, leakSort);
  const calibrationList = calibrationItems ?? [];
  const calFiltered = calibrationList.filter(
    (item) =>
      (calStatus === '' || item.status === calStatus) &&
      (calSearch === '' ||
        q(`${item.id} ${item.format} ${item.status} ${item.body_excerpt}`).includes(q(calSearch))),
  );

  const updateReviewDraft = (id: string, patch: Partial<ReviewDraft>) => {
    setReviewDrafts((prev) => ({
      ...prev,
      [id]: {
        decision: prev[id]?.decision ?? 'under_review',
        notes: prev[id]?.notes ?? '',
        ...patch,
      },
    }));
  };

  const reviewLeakAlert = async (alert: LeakAlert) => {
    const draft = reviewDrafts[alert.id] ?? { decision: 'under_review', notes: '' };
    setReviewActions((prev) => ({
      ...prev,
      [alert.id]: { pending: true },
    }));
    try {
      await postJson<{ id: string; decision: ReviewDecision; reviewed_by: string | null }>(
        `/api/v1/admin/leak-alerts/${alert.id}/review`,
        {
          decision: draft.decision,
          ...(draft.notes.trim() ? { notes: draft.notes.trim() } : {}),
        },
      );
      await loadLeakAlerts();
      setReviewActions((prev) => ({
        ...prev,
        [alert.id]: { ok: `Review saved as ${draft.decision}.` },
      }));
    } catch (error) {
      const issue = issueFromError(error);
      if (issue.kind !== 'degraded') {
        setShellIssue(issue);
        return;
      }
      setReviewActions((prev) => ({
        ...prev,
        [alert.id]: { error: issue.message },
      }));
    }
  };

  const mintPanelToken = async () => {
    setTokenPending(true);
    setTokenError(null);
    setTokenMessage(null);
    setPanelToken(null);

    const parsed = buildPanelTokenRequest({
      panelistHash,
      ttlDays: tokenTtlDays,
      metadataJson: tokenMetadataJson,
      scopesText: tokenScopesText,
    });

    if (!parsed.ok) {
      setTokenPending(false);
      setTokenError(parsed.error);
      return;
    }

    try {
      const result = await postJson<PanelTokenResult>('/api/v1/admin/panel-tokens', parsed.request);
      setPanelToken(result);
      setTokenMessage('Token minted. Copy it now; the backend returns it only once.');
    } catch (error) {
      const issue = issueFromError(error);
      if (issue.kind !== 'degraded') {
        setShellIssue(issue);
        return;
      }
      setTokenError(issue.message);
    } finally {
      setTokenPending(false);
    }
  };

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
          overflowX: 'auto',
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

      <section style={{ maxWidth: 1200, margin: '24px auto', padding: '0 20px' }}>
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
                  {tenants.length === 0 ? (
                    <TableEmpty colSpan={6}>
                      The admin API is healthy, but no tenants matched the current query.
                    </TableEmpty>
                  ) : (
                    tenants.map((t) => (
                      <tr key={t.id}>
                        <td style={td}>{t.name}</td>
                        <td style={td}>{t.type}</td>
                        <td style={td}>{t.plan}</td>
                        <td style={td}>{t.status}</td>
                        <td style={td}>{n(t.assessments)}</td>
                        <td style={td}>{n(t.attempts)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Card>
          </>
        )}

        {tab === 'Leak Alerts' && (
          <>
            <h2 style={{ fontSize: 16, color: C.ink }}>
              Leak alerts {leakAlerts ? `(${leakFiltered.length}/${leakAlerts.length})` : ''}
            </h2>
            {leakAlerts === null ? (
              <InlineState
                title="Loading leak alerts"
                body="Fetching anti-leak detections from the admin API..."
              />
            ) : (
              <>
                <FilterBar
                  search={leakSearch}
                  onSearch={setLeakSearch}
                  placeholder="Search source, type, question or status..."
                  status={leakStatus}
                  onStatus={setLeakStatus}
                  statuses={uniqSorted(leakList.map((alert) => alert.status))}
                  statusLabel="All alert statuses"
                  sort={leakSort}
                  onSort={setLeakSort}
                  risk={leakSeverity}
                  onRisk={setLeakSeverity}
                  risks={['critical', 'high', 'medium', 'low']}
                />
                <Card>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr>
                        <th style={th}>Source</th>
                        <th style={th}>Question</th>
                        <th style={th}>Severity</th>
                        <th style={th}>Status</th>
                        <th style={th}>Similarity</th>
                        <th style={th}>Detected</th>
                        <th style={th}>Review</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leakSorted.length === 0 ? (
                        <TableEmpty colSpan={7}>
                          {leakList.length === 0
                            ? 'The anti-leak inbox is healthy and currently empty.'
                            : 'No leak alerts match the active filters.'}
                        </TableEmpty>
                      ) : (
                        leakSorted.map((alert) => {
                          const draft = reviewDrafts[alert.id] ?? {
                            decision: 'under_review' as ReviewDecision,
                            notes: '',
                          };
                          const action = reviewActions[alert.id] ?? {};
                          return (
                            <tr key={alert.id}>
                              <td style={{ ...td, whiteSpace: 'normal', minWidth: 180 }}>
                                <a
                                  href={alert.source_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ color: C.teal, fontWeight: 700 }}
                                >
                                  {sourceHost(alert.source_url)}
                                </a>
                                <div style={{ color: C.sub, fontSize: 12 }}>
                                  {alert.source_type ?? 'source'}
                                </div>
                              </td>
                              <td style={{ ...td, fontFamily: 'monospace' }}>
                                {shortId(alert.question_id)}
                              </td>
                              <td
                                style={{
                                  ...td,
                                  color: alert.severity === 'critical' ? '#991b1b' : C.ink,
                                  fontWeight: 700,
                                }}
                              >
                                {alert.severity}
                              </td>
                              <td style={td}>{alert.status}</td>
                              <td style={td}>{Math.round(alert.similarity_score * 100)}%</td>
                              <td style={td}>{dt(alert.detected_at)}</td>
                              <td style={{ ...td, whiteSpace: 'normal', minWidth: 320 }}>
                                <div style={{ display: 'grid', gap: 8 }}>
                                  <select
                                    style={fld}
                                    value={draft.decision}
                                    onChange={(e) =>
                                      updateReviewDraft(alert.id, {
                                        decision: e.target.value as ReviewDecision,
                                      })
                                    }
                                    aria-label={`Review decision for ${shortId(alert.id)}`}
                                  >
                                    <option value="under_review">under_review</option>
                                    <option value="dismissed">dismissed</option>
                                    <option value="false_positive">false_positive</option>
                                  </select>
                                  <textarea
                                    style={{ ...fld, minHeight: 58, resize: 'vertical' }}
                                    maxLength={2000}
                                    placeholder="Optional review notes"
                                    value={draft.notes}
                                    onChange={(e) =>
                                      updateReviewDraft(alert.id, { notes: e.target.value })
                                    }
                                  />
                                  <button
                                    type="button"
                                    onClick={() => void reviewLeakAlert(alert)}
                                    disabled={!!action.pending}
                                    style={{
                                      ...fld,
                                      color: '#fff',
                                      background: action.pending ? '#94a3b8' : C.teal,
                                      borderColor: action.pending ? '#94a3b8' : C.teal,
                                      cursor: action.pending ? 'default' : 'pointer',
                                      fontWeight: 700,
                                    }}
                                  >
                                    {action.pending ? 'Saving...' : 'Save review'}
                                  </button>
                                  {action.ok && (
                                    <span style={{ color: '#15803d', fontSize: 12 }}>
                                      {action.ok}
                                    </span>
                                  )}
                                  {action.error && (
                                    <span style={{ color: '#b91c1c', fontSize: 12 }}>
                                      {action.error}
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </Card>
              </>
            )}
          </>
        )}

        {tab === 'Calibration' && (
          <>
            <h2 style={{ fontSize: 16, color: C.ink }}>Calibration and panel tokens</h2>
            <div
              style={{
                background: '#fff',
                border: `1px solid ${C.line}`,
                borderRadius: 12,
                padding: 16,
                marginBottom: 18,
              }}
            >
              <h3 style={{ margin: '0 0 10px', color: C.ink, fontSize: 15 }}>
                Mint reference-panel token
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
                  gap: 10,
                }}
              >
                <label style={{ display: 'grid', gap: 5, color: C.sub, fontSize: 12 }}>
                  Panelist hash hex
                  <input
                    style={fld}
                    value={panelistHash}
                    onChange={(e) => setPanelistHash(e.target.value)}
                    placeholder="32-128 hex chars, no PII"
                    spellCheck={false}
                  />
                </label>
                <label style={{ display: 'grid', gap: 5, color: C.sub, fontSize: 12 }}>
                  TTL days
                  <input
                    style={fld}
                    value={tokenTtlDays}
                    onChange={(e) => setTokenTtlDays(e.target.value)}
                    inputMode="numeric"
                  />
                </label>
                <label style={{ display: 'grid', gap: 5, color: C.sub, fontSize: 12 }}>
                  Scopes
                  <input
                    style={fld}
                    value={tokenScopesText}
                    onChange={(e) => setTokenScopesText(e.target.value)}
                    placeholder="reference-panel:write"
                  />
                </label>
              </div>
              <label
                style={{
                  display: 'grid',
                  gap: 5,
                  color: C.sub,
                  fontSize: 12,
                  marginTop: 10,
                }}
              >
                Metadata JSON
                <textarea
                  style={{ ...fld, minHeight: 70, resize: 'vertical' }}
                  value={tokenMetadataJson}
                  onChange={(e) => setTokenMetadataJson(e.target.value)}
                  spellCheck={false}
                />
              </label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => void mintPanelToken()}
                  disabled={tokenPending}
                  style={{
                    ...fld,
                    color: '#fff',
                    background: tokenPending ? '#94a3b8' : C.teal,
                    borderColor: tokenPending ? '#94a3b8' : C.teal,
                    cursor: tokenPending ? 'default' : 'pointer',
                    fontWeight: 700,
                  }}
                >
                  {tokenPending ? 'Minting...' : 'Mint token'}
                </button>
                {tokenMessage && (
                  <span style={{ color: '#15803d', fontSize: 13 }}>{tokenMessage}</span>
                )}
                {tokenError && <span style={{ color: '#b91c1c', fontSize: 13 }}>{tokenError}</span>}
              </div>
              {panelToken && (
                <div style={{ marginTop: 12 }}>
                  <p style={{ margin: '0 0 6px', color: C.sub, fontSize: 12 }}>
                    Token id {shortId(panelToken.id)} · expires {dt(panelToken.expires_at)} · scopes{' '}
                    {panelToken.scopes.join(', ')}
                  </p>
                  <textarea
                    readOnly
                    value={panelToken.token}
                    style={{
                      ...fld,
                      width: '100%',
                      minHeight: 58,
                      fontFamily: 'monospace',
                      resize: 'vertical',
                    }}
                  />
                </div>
              )}
            </div>

            {calibrationItems === null ? (
              <InlineState
                title="Loading calibration backlog"
                body="Fetching IRT calibration candidates from the admin API..."
              />
            ) : (
              <>
                <FilterBar
                  search={calSearch}
                  onSearch={setCalSearch}
                  placeholder="Search item id, format, status or excerpt..."
                  status={calStatus}
                  onStatus={setCalStatus}
                  statuses={uniqSorted(calibrationList.map((item) => item.status))}
                  statusLabel="All item statuses"
                />
                <Card>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr>
                        <th style={th}>Item</th>
                        <th style={th}>Format</th>
                        <th style={th}>Status</th>
                        <th style={th}>Panel n</th>
                        <th style={th}>IRT</th>
                        <th style={th}>Excerpt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calFiltered.length === 0 ? (
                        <TableEmpty colSpan={6}>
                          {calibrationList.length === 0
                            ? 'The calibration queue is healthy and currently empty.'
                            : 'No calibration items match the active filters.'}
                        </TableEmpty>
                      ) : (
                        calFiltered.map((item) => (
                          <tr key={item.id}>
                            <td style={{ ...td, fontFamily: 'monospace' }}>{shortId(item.id)}</td>
                            <td style={td}>{item.format}</td>
                            <td style={td}>{item.status}</td>
                            <td style={td}>{String(item.n)}</td>
                            <td style={td}>
                              b {item.difficulty_b ?? '—'} · a {item.discrimination_a ?? '—'} · c{' '}
                              {item.guessing_c ?? '—'}
                            </td>
                            <td style={{ ...td, whiteSpace: 'normal', minWidth: 320 }}>
                              {item.body_excerpt || '—'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </Card>
              </>
            )}
          </>
        )}

        {tab === 'Assessments' && (
          <>
            <h2 style={{ fontSize: 16, color: C.ink }}>
              Assessments {assessments ? `(${aFiltered.length}/${assessments.length})` : ''}
            </h2>
            {assessments === null ? (
              <InlineState
                title="Loading assessments"
                body="Fetching cross-tenant assessment rows from the admin API..."
              />
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
                      {aSorted.length === 0 ? (
                        <TableEmpty colSpan={7}>
                          {assessmentList.length === 0
                            ? 'The assessment API is healthy and currently has no assessment rows.'
                            : 'No assessments match the active filters.'}
                        </TableEmpty>
                      ) : (
                        aSorted.map((a) => (
                          <tr key={a.id}>
                            <td style={td}>{a.title}</td>
                            <td style={td}>{a.tenant_name ?? shortId(a.tenant_id)}</td>
                            <td style={td}>{a.status}</td>
                            <td style={td}>{n(a.total_questions)}</td>
                            <td style={td}>{n(a.invitations)}</td>
                            <td style={td}>{n(a.attempts)}</td>
                            <td style={td}>{dt(a.created_at)}</td>
                          </tr>
                        ))
                      )}
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
              <InlineState
                title="Loading attempts"
                body="Fetching cross-tenant attempt rows from the admin API..."
              />
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
                      {tSorted.length === 0 ? (
                        <TableEmpty colSpan={7}>
                          {attemptList.length === 0
                            ? 'The attempts API is healthy and currently has no attempt rows.'
                            : 'No attempts match the active filters.'}
                        </TableEmpty>
                      ) : (
                        tSorted.map((a) => (
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
                        ))
                      )}
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
              <InlineState
                title="Loading grade decisions"
                body="Fetching the sanitised AI-grading audit trail..."
              />
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
                      {gdSorted.length === 0 ? (
                        <TableEmpty colSpan={8}>
                          {gradeList.length === 0
                            ? 'The grade-decision API is healthy and currently has no grade rows.'
                            : 'No grade decisions match the active filters.'}
                        </TableEmpty>
                      ) : (
                        gdSorted.map((g) => (
                          <tr key={g.id}>
                            <td style={td}>{g.tenant_name ?? shortId(g.tenant_id)}</td>
                            <td style={td}>{g.grader_source}</td>
                            <td style={td}>{g.model}</td>
                            <td style={td}>{g.score.toFixed(3)}</td>
                            <td style={td}>{g.confidence.toFixed(2)}</td>
                            <td
                              style={{ ...td, whiteSpace: 'normal', maxWidth: 360, color: C.sub }}
                            >
                              {g.reasoning_excerpt || '—'}
                            </td>
                            <td style={{ ...td, fontFamily: 'monospace' }} title={g.reasoning_hash}>
                              {shortId(g.reasoning_hash)}
                            </td>
                            <td style={td}>{dt(g.created_at)}</td>
                          </tr>
                        ))
                      )}
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
              <InlineState
                title="Loading audit events"
                body="Fetching the sanitised cross-tenant audit stream..."
              />
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
                      {evSorted.length === 0 ? (
                        <TableEmpty colSpan={5}>
                          {eventList.length === 0
                            ? 'The audit-event API is healthy and currently has no event rows.'
                            : 'No audit events match the active filters.'}
                        </TableEmpty>
                      ) : (
                        evSorted.map((e) => (
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
                        ))
                      )}
                    </tbody>
                  </table>
                </Card>
              </>
            )}
          </>
        )}

        {tab === 'Bank' && <BankPanel stats={bankStats} />}
      </section>
    </main>
  );
}
