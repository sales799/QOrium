'use client';

import { useEffect, useReducer, useState } from 'react';
import {
  applyEvent,
  createTracker,
  toSignalsInput,
  type TrackerEvent,
  type TrackerState,
} from '@/lib/signal-tracker';
import {
  OrchestratorClient,
  resolveOrchestratorUrl,
  type SessionDto,
} from '@/lib/orchestrator-client';

interface ChatTurn {
  role: 'candidate' | 'ai_assistant';
  text: string;
}

interface Props {
  sessionId: string;
  initialSession: SessionDto | null;
}

function trackerReducer(state: TrackerState, event: TrackerEvent): TrackerState {
  return applyEvent(state, event);
}

export function CandidateWorkbench({ sessionId, initialSession: _initialSession }: Props) {
  const [code, setCode] = useState<string>('// Write your solution here\n\n');
  const [tracker, dispatch] = useReducer(trackerReducer, undefined, () =>
    createTracker({ seededErrorsTotal: 1 }),
  );
  const [chat, setChat] = useState<ChatTurn[]>([]);
  const [pendingMessage, setPendingMessage] = useState<string>('');
  const [pending, setPending] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<SessionDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const client = new OrchestratorClient({ baseUrl: resolveOrchestratorUrl() });

  useEffect(() => {
    const handle = setInterval(() => dispatch({ kind: 'tick', nowMs: Date.now() }), 1000);
    return () => clearInterval(handle);
  }, []);

  const handleCodeChange = (value: string) => {
    const delta = value.length - code.length;
    if (delta > 0) dispatch({ kind: 'typed', chars: delta });
    setCode(value);
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pasted = event.clipboardData.getData('text');
    if (pasted.length > 0) dispatch({ kind: 'pasted', chars: pasted.length });
  };

  const handleRunTest = () => dispatch({ kind: 'edit_test_cycle' });

  const handleSendMessage = async () => {
    if (pendingMessage.trim().length === 0 || pending) return;
    setPending(true);
    setError(null);
    const text = pendingMessage.trim();
    setPendingMessage('');
    setChat((prev) => [...prev, { role: 'candidate', text }]);
    dispatch({ kind: 'candidate_message' });
    try {
      const turn = await client.submitTurn(sessionId, text);
      setChat((prev) => [...prev, { role: 'ai_assistant', text: turn.ai_message }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setPending(false);
    }
  };

  const handleSubmit = async () => {
    setPending(true);
    setError(null);
    try {
      const result = await client.submitSession(sessionId, code, toSignalsInput(tracker));
      setSubmitted(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setPending(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 360px', gap: 0 }}>
      <section
        style={{
          padding: 24,
          borderRight: '1px solid #2a2a2f',
          color: '#f0f0f0',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2
            style={{ fontSize: 14, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}
          >
            Editor
          </h2>
          <SignalsBadge tracker={tracker} />
        </div>
        <textarea
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          onPaste={handlePaste}
          spellCheck={false}
          style={{
            flex: 1,
            marginTop: 12,
            padding: 16,
            background: '#0d0d0f',
            color: '#f0f0f0',
            border: '1px solid #2a2a2f',
            borderRadius: 6,
            fontFamily: 'ui-monospace, SFMono-Regular, monospace',
            fontSize: 13,
            lineHeight: 1.6,
            resize: 'none',
          }}
          aria-label="Code editor"
          disabled={submitted !== null}
        />
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={handleRunTest}
            disabled={submitted !== null}
            style={{
              padding: '8px 14px',
              background: '#3b3b41',
              color: '#f0f0f0',
              border: 'none',
              borderRadius: 6,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Run / test (cycle: {tracker.editTestCycles})
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={pending || submitted !== null}
            style={{
              padding: '8px 14px',
              background: submitted ? '#3b3b41' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
              cursor: submitted ? 'default' : 'pointer',
            }}
          >
            {submitted ? 'Submitted' : 'Submit final answer'}
          </button>
        </div>
        {submitted && <ResultPanel session={submitted} />}
      </section>

      <aside style={{ padding: 24, color: '#f0f0f0', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: 14, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          AI assistant
        </h2>
        <div
          style={{
            flex: 1,
            marginTop: 12,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {chat.length === 0 && (
            <p style={{ color: '#666', fontSize: 12 }}>Ask the AI a question to begin.</p>
          )}
          {chat.map((turn, idx) => (
            <div
              key={idx}
              style={{
                padding: 12,
                borderRadius: 6,
                background: turn.role === 'candidate' ? '#1f2937' : '#0f172a',
                color: turn.role === 'candidate' ? '#dbeafe' : '#a7f3d0',
                fontSize: 12,
                whiteSpace: 'pre-wrap',
              }}
            >
              <p
                style={{ fontSize: 10, textTransform: 'uppercase', color: '#666', marginBottom: 4 }}
              >
                {turn.role}
              </p>
              {turn.text}
            </div>
          ))}
          {error && (
            <p role="status" style={{ color: '#fca5a5', fontSize: 11 }}>
              {error}
            </p>
          )}
        </div>
        <div style={{ marginTop: 12 }}>
          <textarea
            value={pendingMessage}
            onChange={(e) => setPendingMessage(e.target.value)}
            placeholder="Ask the AI for help…"
            disabled={pending || submitted !== null}
            style={{
              width: '100%',
              minHeight: 60,
              padding: 8,
              background: '#0d0d0f',
              color: '#f0f0f0',
              border: '1px solid #2a2a2f',
              borderRadius: 6,
              fontSize: 12,
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
          <button
            type="button"
            onClick={() => void handleSendMessage()}
            disabled={pending || pendingMessage.trim().length === 0 || submitted !== null}
            style={{
              marginTop: 8,
              padding: '6px 14px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {pending ? 'Sending…' : 'Send'}
          </button>
        </div>
      </aside>
    </div>
  );
}

function SignalsBadge({ tracker }: { tracker: TrackerState }) {
  return (
    <span style={{ fontSize: 11, color: '#666' }}>
      {tracker.typedChars} typed · {tracker.pastedChars} pasted · {tracker.candidateMessageCount}{' '}
      msgs
    </span>
  );
}

function ResultPanel({ session }: { session: SessionDto }) {
  const grades = session.grades as {
    weightedTotal: number;
    percentage: number;
    dimensions: Record<string, { score: number; reasoning: string }>;
  } | null;
  if (!grades) return null;
  return (
    <div style={{ marginTop: 16, padding: 16, background: '#0f172a', borderRadius: 6 }}>
      <h3 style={{ fontSize: 14, marginBottom: 8 }}>
        Grading complete — {grades.percentage.toFixed(1)}%
      </h3>
      <ul style={{ listStyle: 'none', padding: 0, fontSize: 12, color: '#a7f3d0' }}>
        {Object.entries(grades.dimensions).map(([key, val]) => (
          <li key={key} style={{ marginBottom: 4 }}>
            <span style={{ color: '#666' }}>{key}</span>: <strong>{val.score}/5</strong>{' '}
            <span style={{ color: '#888' }}>— {val.reasoning}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
