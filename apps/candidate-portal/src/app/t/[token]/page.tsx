import { notFound } from 'next/navigation';
import { StartButton } from '@/components/start-button';
import { invitationGate } from '@/lib/invitation-gate';
import { buildProctoringNotice, type ProctoringConsentResponse } from '@/lib/proctoring-consent';

// BR-6: candidate landing. Server-fetches the invitation (answer keys never
// touch this path) and renders consent + Start.

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Invitation {
  candidate_name: string | null;
  status: string;
  expires_at: string;
  assessment: {
    title: string;
    total_questions: number;
    time_limit_sec: number;
    pass_score: number;
  };
}

function apiBase(): string {
  return (process.env.QORIUM_API_BASE_URL ?? 'http://127.0.0.1:5101').replace(/\/+$/, '');
}

async function fetchInvitation(token: string): Promise<Invitation | null> {
  try {
    const r = await fetch(`${apiBase()}/v1/invitations/${encodeURIComponent(token)}`, {
      cache: 'no-store',
    });
    if (!r.ok) return null;
    return (await r.json()) as Invitation;
  } catch {
    return null;
  }
}

// N10: resolve this invitation's proctoring policy (sanitized — the API never
// returns the tenant plan id or internal reason). Inert by default; a fetch
// failure degrades to "no proctoring" so the landing page still works.
async function fetchProctoring(token: string): Promise<ProctoringConsentResponse | null> {
  try {
    const r = await fetch(`${apiBase()}/v1/invitations/${encodeURIComponent(token)}/proctoring`, {
      cache: 'no-store',
    });
    if (!r.ok) return null;
    return (await r.json()) as ProctoringConsentResponse;
  } catch {
    return null;
  }
}

const wrap: React.CSSProperties = {
  maxWidth: 640,
  margin: '48px auto',
  padding: '0 20px',
  fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  color: '#0f172a',
};
const card: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: 14,
  padding: 28,
  background: '#ffffff',
  boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
};
const meta: React.CSSProperties = {
  display: 'flex',
  gap: 20,
  flexWrap: 'wrap',
  margin: '18px 0 24px',
  fontSize: 14,
  color: '#475569',
};
const noticeBox: React.CSSProperties = {
  border: '1px solid #fcd34d',
  background: '#fffbeb',
  borderRadius: 10,
  padding: '14px 16px',
  margin: '4px 0 18px',
};

export default async function LandingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const inv = await fetchInvitation(token);
  if (!inv) notFound();

  const minutes = Math.round(inv.assessment.time_limit_sec / 60);
  const gate = invitationGate({ status: inv.status, expiresAt: inv.expires_at });
  // Only resolve proctoring when the candidate can actually start.
  const notice =
    gate === 'open'
      ? buildProctoringNotice(await fetchProctoring(token))
      : buildProctoringNotice(null);

  return (
    <main style={wrap}>
      <p style={{ color: '#0d9488', fontSize: 12, fontWeight: 600, letterSpacing: 0.4 }}>
        QORIUM · SECURE ASSESSMENT
      </p>
      <div style={card}>
        <h1 style={{ fontSize: 24, margin: '4px 0 6px' }}>{inv.assessment.title}</h1>
        <p style={{ color: '#475569', margin: 0 }}>
          {inv.candidate_name ? `Hi ${inv.candidate_name}, ` : ''}you have been invited to take this
          skills assessment.
        </p>
        <div style={meta}>
          <span>
            <strong style={{ color: '#0f172a' }}>{inv.assessment.total_questions}</strong> questions
          </span>
          <span>
            <strong style={{ color: '#0f172a' }}>{minutes}</strong> min limit
          </span>
          <span>
            Pass mark{' '}
            <strong style={{ color: '#0f172a' }}>
              {Math.round(inv.assessment.pass_score * 100)}%
            </strong>
          </span>
        </div>

        {gate === 'submitted' ? (
          <p style={{ color: '#b45309', fontSize: 14 }}>
            This assessment has already been submitted. Thank you.
          </p>
        ) : gate === 'expired' ? (
          <p style={{ color: '#b45309', fontSize: 14 }}>
            This invitation has expired and can no longer be started. Please ask the recruiter who
            invited you for a fresh link.
          </p>
        ) : (
          <>
            <ul style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.7, paddingLeft: 18 }}>
              <li>
                Find a quiet place — the timer starts when you begin and auto-submits at zero.
              </li>
              <li>Stay in this tab. Tab switches, pasting and exiting full screen are recorded.</li>
              <li>Answers save automatically as you go.</li>
            </ul>

            {notice.enabled && (
              <div style={noticeBox}>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: 0.3,
                    color: '#92400e',
                    margin: '0 0 8px',
                  }}
                >
                  PROCTORING ACTIVE FOR THIS ASSESSMENT
                </p>
                <ul
                  style={{
                    fontSize: 13,
                    color: '#78350f',
                    lineHeight: 1.65,
                    margin: 0,
                    paddingLeft: 18,
                  }}
                >
                  {notice.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            <StartButton token={token} requireConsent={notice.requiresExplicitConsent} />
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 14 }}>
              By starting you consent to QOrium recording your responses and integrity signals for
              evaluation, per our candidate privacy notice.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
