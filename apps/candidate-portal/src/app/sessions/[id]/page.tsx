import { OrchestratorClient, resolveOrchestratorUrl } from '@/lib/orchestrator-client';
import { CandidateWorkbench } from '@/components/candidate-workbench';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function SessionPage(props: PageProps) {
  const { id } = await props.params;
  if (!UUID_REGEX.test(id)) {
    return (
      <main style={{ maxWidth: 600, margin: '64px auto', color: '#f0f0f0', padding: '0 32px' }}>
        <h1 style={{ fontSize: 22 }}>Invalid session id</h1>
        <p style={{ color: '#aaa' }}>The candidate session URL must include a valid UUID.</p>
      </main>
    );
  }

  const client = new OrchestratorClient({ baseUrl: resolveOrchestratorUrl() });
  let initial: Awaited<ReturnType<typeof client.getSession>> | null = null;
  let errorMessage: string | null = null;
  try {
    initial = await client.getSession(id);
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : String(err);
  }

  return (
    <main style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          padding: '12px 24px',
          borderBottom: '1px solid #2a2a2f',
          color: '#f0f0f0',
          background: '#0d0d0f',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <span style={{ fontWeight: 600 }}>QOrium Candidate Portal</span>
        <span style={{ fontSize: 11, color: '#666', fontFamily: 'monospace' }}>
          session {id.slice(0, 8)}
        </span>
        {initial && (
          <span style={{ fontSize: 11, color: '#3b82f6' }}>status: {initial.status}</span>
        )}
      </header>
      {errorMessage ? (
        <div style={{ padding: 24, color: '#fca5a5', fontSize: 13 }}>
          Orchestrator unreachable ({errorMessage}). Ensure
          <code style={{ marginLeft: 6 }}>services/ai-pair-coding-orchestrator</code> is running on
          port 5115.
        </div>
      ) : (
        <CandidateWorkbench sessionId={id} initialSession={initial} />
      )}
    </main>
  );
}
