'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const card: React.CSSProperties = {
  maxWidth: 380,
  margin: '80px auto',
  padding: 32,
  border: '1px solid #e2e8f0',
  borderRadius: 14,
  background: '#fff',
  fontFamily: 'system-ui, sans-serif',
  color: '#0f172a',
};
const input: React.CSSProperties = {
  width: '100%',
  padding: '11px 12px',
  marginTop: 6,
  marginBottom: 14,
  border: '1px solid #cbd5e1',
  borderRadius: 9,
  fontSize: 14,
  boxSizing: 'border-box',
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (r.ok) {
        router.push('/dashboard');
        return;
      }
      if (r.status === 423) setError('Account locked after too many attempts. Try again shortly.');
      else setError('Invalid email or password.');
    } catch {
      setError('Network error. Please try again.');
    }
    setBusy(false);
  }

  return (
    <main style={card}>
      <p style={{ color: '#0d9488', fontSize: 12, fontWeight: 600, letterSpacing: 0.4 }}>
        QORIUM · RECRUITER
      </p>
      <h1 style={{ fontSize: 22, margin: '4px 0 18px' }}>Sign in</h1>
      <form onSubmit={submit}>
        <label style={{ fontSize: 13, color: '#475569' }}>
          Work email
          <input
            style={input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
        </label>
        <label style={{ fontSize: 13, color: '#475569' }}>
          Password
          <input
            style={input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          style={{
            width: '100%',
            background: busy ? '#5eead4' : '#0d9488',
            color: '#fff',
            border: 'none',
            borderRadius: 9,
            padding: '12px',
            fontSize: 15,
            fontWeight: 600,
            cursor: busy ? 'default' : 'pointer',
          }}
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        {error && <p style={{ color: '#dc2626', fontSize: 13, marginTop: 12 }}>{error}</p>}
      </form>
    </main>
  );
}
