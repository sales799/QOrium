import Link from 'next/link';

export default function Home() {
  return (
    <main
      style={{
        maxWidth: 720,
        margin: '64px auto',
        padding: '0 32px',
        color: '#f0f0f0',
      }}
    >
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>QOrium Candidate Portal</h1>
      <p style={{ fontSize: 14, color: '#888' }}>
        Wave 3 AI pair-coding assessment runtime (port 5116).
      </p>
      <div
        style={{
          marginTop: 32,
          padding: 24,
          background: '#1a1a1f',
          border: '1px solid #2a2a2f',
          borderRadius: 8,
        }}
      >
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Demo session</h2>
        <p style={{ fontSize: 13, color: '#aaa' }}>
          Open a stub session to preview the candidate UX. The orchestrator at port 5115 must be
          running; otherwise the page will surface the connection error.
        </p>
        <Link
          href="/sessions/00000000-0000-0000-0000-000000000001"
          style={{
            display: 'inline-block',
            marginTop: 16,
            padding: '8px 16px',
            background: '#3b82f6',
            color: 'white',
            borderRadius: 6,
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          Open demo session →
        </Link>
      </div>
    </main>
  );
}
