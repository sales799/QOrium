import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminConsole, { type Overview } from './AdminConsole';
import { loginUrl } from '@/lib/auth-navigation';

export const dynamic = 'force-dynamic';

type GateResult =
  | { status: 'allowed'; overview: Overview }
  | { status: 'unauthorised' }
  | { status: 'forbidden' }
  | { status: 'degraded'; message: string };

function apiBase(): string {
  return (process.env.QORIUM_API_BASE_URL ?? 'http://127.0.0.1:5101').replace(/\/+$/, '');
}

async function loadAdminGate(): Promise<GateResult> {
  const incomingHeaders = await headers();
  const cookie = incomingHeaders.get('cookie');

  try {
    const init: RequestInit = { cache: 'no-store' };
    if (cookie) init.headers = { cookie };

    const res = await fetch(`${apiBase()}/v1/admin/overview`, {
      ...init,
    });

    if (res.status === 401) return { status: 'unauthorised' };
    if (res.status === 403) return { status: 'forbidden' };

    if (!res.ok) {
      return {
        status: 'degraded',
        message: `Admin overview returned HTTP ${res.status}.`,
      };
    }

    return { status: 'allowed', overview: (await res.json()) as Overview };
  } catch (error) {
    return {
      status: 'degraded',
      message: error instanceof Error ? error.message : 'Admin API is unreachable.',
    };
  }
}

function GateState({
  title,
  body,
  tone = 'danger',
}: {
  title: string;
  body: string;
  tone?: 'danger' | 'warning';
}) {
  const accent = tone === 'danger' ? '#b91c1c' : '#b45309';

  return (
    <main
      style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}
    >
      <section
        style={{
          maxWidth: 680,
          margin: '0 auto',
          padding: '72px 20px',
        }}
      >
        <div
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderLeft: `4px solid ${accent}`,
            borderRadius: 12,
            padding: 24,
          }}
        >
          <p style={{ color: accent, fontSize: 13, fontWeight: 700, margin: '0 0 8px' }}>
            Admin console
          </p>
          <h1 style={{ color: '#0f172a', fontSize: 24, margin: '0 0 8px' }}>{title}</h1>
          <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.6, margin: '0 0 18px' }}>
            {body}
          </p>
          <a href="/dashboard" style={{ color: '#0d9488', fontSize: 13, fontWeight: 700 }}>
            Back to dashboard
          </a>
        </div>
      </section>
    </main>
  );
}

export default async function AdminPage() {
  const gate = await loadAdminGate();

  if (gate.status === 'unauthorised') {
    redirect(loginUrl('/admin'));
  }

  if (gate.status === 'forbidden') {
    return (
      <GateState
        title="Forbidden"
        body="This account is signed in, but it is not attached to an active internal tenant. The admin API refused the session with 403."
      />
    );
  }

  if (gate.status === 'degraded') {
    return (
      <GateState
        title="Admin API unavailable"
        body={`The console could not complete its server-side access check. ${gate.message}`}
        tone="warning"
      />
    );
  }

  return <AdminConsole initialOverview={gate.overview} />;
}
