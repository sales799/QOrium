import { AttemptRunner } from '@/components/attempt-runner';

// BR-7: test runner host. Token + counts come from the landing redirect query.

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function AttemptPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string; n?: string; t?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const token = typeof sp.token === 'string' ? sp.token : '';
  const total = Number.parseInt(sp.n ?? '0', 10) || 0;
  const timeLimit = Number.parseInt(sp.t ?? '3600', 10) || 3600;

  if (!UUID.test(id) || !token) {
    return (
      <main
        style={{
          maxWidth: 600,
          margin: '64px auto',
          padding: '0 20px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <h1 style={{ fontSize: 20 }}>Invalid session</h1>
        <p style={{ color: '#64748b' }}>This assessment link is missing its access token.</p>
      </main>
    );
  }

  return <AttemptRunner attemptId={id} token={token} total={total} timeLimitSec={timeLimit} />;
}
