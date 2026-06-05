'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function StartButton({ token }: { token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
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
      <button
        onClick={start}
        disabled={loading}
        style={{
          background: loading ? '#5eead4' : '#0d9488',
          color: '#fff',
          border: 'none',
          borderRadius: 10,
          padding: '12px 22px',
          fontSize: 15,
          fontWeight: 600,
          cursor: loading ? 'default' : 'pointer',
        }}
      >
        {loading ? 'Starting…' : 'Start assessment'}
      </button>
      {error && <p style={{ color: '#dc2626', fontSize: 13, marginTop: 10 }}>{error}</p>}
    </div>
  );
}
