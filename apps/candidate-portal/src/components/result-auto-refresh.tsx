'use client';

// N11 candidate UX: while an attempt is still being graded, the result page
// previously dead-ended on a static "being processed" message — the candidate
// had to manually reload to discover their score. This component refreshes the
// (force-dynamic) server route on a bounded schedule so the score appears on
// its own, with a manual "Check now" fallback. Polling stops after a few tries
// to avoid hammering the API for a stuck attempt.

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DEFAULT_DELAY_MS, DEFAULT_MAX_POLLS, nextPoll } from '../lib/result-poll';

export function ResultAutoRefresh({
  maxPolls = DEFAULT_MAX_POLLS,
  delayMs = DEFAULT_DELAY_MS,
}: {
  maxPolls?: number;
  delayMs?: number;
}) {
  const router = useRouter();
  const attemptsDone = useRef(0);
  const [active, setActive] = useState(true);

  const schedule = useCallback(() => {
    const decision = nextPoll(attemptsDone.current, maxPolls, delayMs);
    if (!decision.poll) {
      setActive(false);
      return undefined;
    }
    const timer = setTimeout(() => {
      attemptsDone.current += 1;
      router.refresh();
    }, decision.delayMs);
    return () => clearTimeout(timer);
  }, [router, maxPolls, delayMs]);

  useEffect(() => {
    const cancel = schedule();
    return cancel;
  }, [schedule]);

  const checkNow = useCallback(() => {
    attemptsDone.current += 1;
    router.refresh();
  }, [router]);

  return (
    <div style={{ marginTop: 14 }} aria-live="polite">
      <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>
        {active
          ? 'Checking for your score… this page updates automatically.'
          : 'Still being graded. Use the button below to check again.'}
      </p>
      <button
        type="button"
        onClick={checkNow}
        style={{
          marginTop: 10,
          fontSize: 13,
          fontWeight: 600,
          color: '#0f766e',
          background: '#f0fdfa',
          border: '1px solid #99f6e4',
          borderRadius: 999,
          padding: '6px 16px',
          cursor: 'pointer',
        }}
      >
        Check now
      </button>
    </div>
  );
}
