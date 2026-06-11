'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function StartButton({
  token,
  requireConsent = false,
}: {
  token: string;
  requireConsent?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // N10: when the tenant's proctoring policy requires explicit consent (a
  // biometric feature is active), Start stays disabled until the candidate
  // checks the acknowledgement. Inert assessments pass requireConsent=false.
  const [consented, setConsented] = useState(false);
  const blocked = loading || (requireConsent && !consented);

  async function start() {
    if (requireConsent && !consented) {
      setError('Please confirm you consent to the monitoring described above before starting.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/v1/invitations/${encodeURIComponent(token)}/start`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{}',
      });
      if (!r.ok) {
        setError('Could not start the assessment. The invite may have expired.');
        setLoading(false);
        return;
      }
      const data = (await r.json()) as {
        attempt_id: string;
        total_questions: number;
        time_limit_sec: number;
      };
      const q = new URLSearchParams({
        token,
        n: String(data.total_questions),
        t: String(data.time_limit_sec),
      });
      router.push(`/attempt/${data.attempt_id}?${q.toString()}`);
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: 18 }}>
      {requireConsent && (
        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 9,
            fontSize: 13,
            color: '#475569',
            marginBottom: 14,
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={consented}
            onChange={(e) => {
              setConsented(e.target.checked);
              if (e.target.checked) setError(null);
            }}
            style={{ marginTop: 2 }}
          />
          <span>I have read and consent to the monitoring described above.</span>
        </label>
      )}
      <button
        onClick={start}
        disabled={blocked}
        style={{
          background: blocked ? '#5eead4' : '#0d9488',
          color: '#fff',
          border: 'none',
          borderRadius: 10,
          padding: '12px 22px',
          fontSize: 15,
          fontWeight: 600,
          cursor: blocked ? 'default' : 'pointer',
        }}
      >
        {loading ? 'Starting…' : 'Start assessment'}
      </button>
      {error && <p style={{ color: '#dc2626', fontSize: 13, marginTop: 10 }}>{error}</p>}
    </div>
  );
}
