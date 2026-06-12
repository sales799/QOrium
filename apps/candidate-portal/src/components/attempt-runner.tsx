'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { buildResumePlan, progressPercent } from '../lib/resume-state';

interface QuestionPayload {
  idx: number;
  total: number;
  question: {
    id: string;
    format: string;
    skill_id: string | null;
    language: string | null;
    body_md: string | null;
    body: { options?: unknown[] } & Record<string, unknown>;
  };
}

type ResponseBody = Record<string, unknown>;

const COLORS = { teal: '#0d9488', ink: '#0f172a', sub: '#64748b', line: '#e2e8f0' };

function isMcq(format: string): boolean {
  const f = format.toLowerCase();
  return f === 'mcq' || f === 'msq' || f.startsWith('mcq') || f === 'sjt-mcq';
}
function isCode(format: string): boolean {
  const f = format.toLowerCase();
  return f.includes('code') || f === 'sql';
}

export function AttemptRunner({
  attemptId,
  token,
  total,
  timeLimitSec,
}: {
  attemptId: string;
  token: string;
  total: number;
  timeLimitSec: number;
}) {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [payload, setPayload] = useState<QuestionPayload | null>(null);
  const [answers, setAnswers] = useState<Record<string, ResponseBody>>({});
  const [busy, setBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [remaining, setRemaining] = useState(timeLimitSec);
  const [answeredIdx, setAnsweredIdx] = useState<Set<number>>(() => new Set());
  const integrity = useRef({
    tab_switches: 0,
    paste_events: 0,
    focus_loss: 0,
    fullscreen_exits: 0,
  });
  const submittedRef = useRef(false);
  const totalQ = payload?.total ?? total;

  const loadQuestion = useCallback(
    async (i: number) => {
      setBusy(true);
      try {
        const r = await fetch(
          `/api/v1/attempts/${attemptId}/question/${i}?token=${encodeURIComponent(token)}`,
          { cache: 'no-store' },
        );
        if (r.ok) setPayload((await r.json()) as QuestionPayload);
      } finally {
        setBusy(false);
      }
    },
    [attemptId, token],
  );

  // anti-cheat signals
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'hidden') integrity.current.tab_switches += 1;
    };
    const onBlur = () => {
      integrity.current.focus_loss += 1;
    };
    const onPaste = () => {
      integrity.current.paste_events += 1;
    };
    const onFs = () => {
      if (!document.fullscreenElement) integrity.current.fullscreen_exits += 1;
    };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('blur', onBlur);
    window.addEventListener('paste', onPaste);
    document.addEventListener('fullscreenchange', onFs);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('paste', onPaste);
      document.removeEventListener('fullscreenchange', onFs);
    };
  }, []);

  const doSubmit = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    await fetch(`/api/v1/attempts/${attemptId}/submit`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    router.push(`/attempt/${attemptId}/result?token=${encodeURIComponent(token)}`);
  }, [attemptId, token, router]);

  // Resume-after-disconnect: on (re)mount fetch the leak-safe attempt state
  // and jump to the first unanswered question, restoring the countdown. If the
  // attempt is already over we finalize instead of re-entering it. Any failure
  // degrades to a fresh start (question 0, default clock).
  const bootstrap = useCallback(async () => {
    let startIdx = 0;
    try {
      const r = await fetch(
        `/api/v1/attempts/${attemptId}/state?token=${encodeURIComponent(token)}`,
        { cache: 'no-store' },
      );
      if (r.ok) {
        const plan = buildResumePlan(await r.json());
        if (plan.ok) {
          if (plan.expired) {
            void doSubmit();
            return;
          }
          startIdx = plan.startIdx;
          setIdx(startIdx);
          setAnsweredIdx(new Set(plan.answeredIndices));
          if (plan.remainingSec !== null) setRemaining(plan.remainingSec);
        }
      }
    } catch {
      // network/parse failure -> fall through to a fresh start
    }
    await loadQuestion(startIdx);
  }, [attemptId, token, loadQuestion, doSubmit]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  // countdown
  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((s) => {
        if (s <= 1) {
          clearInterval(id);
          void doSubmit();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [doSubmit]);

  const saveAnswer = useCallback(
    async (questionId: string, body: ResponseBody, atIdx: number) => {
      await fetch(`/api/v1/attempts/${attemptId}/answer`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          token,
          question_id: questionId,
          response_body: body,
          current_idx: atIdx,
          integrity_events: { ...integrity.current },
        }),
      });
    },
    [attemptId, token],
  );

  const setAnswer = (qid: string, body: ResponseBody) => setAnswers((a) => ({ ...a, [qid]: body }));

  async function go(delta: number) {
    if (!payload) return;
    const qid = payload.question.id;
    if (answers[qid]) {
      await saveAnswer(qid, answers[qid]!, idx);
      setAnsweredIdx((prev) => new Set(prev).add(idx));
    }
    const next = Math.min(Math.max(idx + delta, 0), totalQ - 1);
    setIdx(next);
    await loadQuestion(next);
  }

  async function finish() {
    if (payload && answers[payload.question.id]) {
      await saveAnswer(payload.question.id, answers[payload.question.id]!, idx);
      setAnsweredIdx((prev) => new Set(prev).add(idx));
    }
    await doSubmit();
  }

  const answeredCount = answeredIdx.size;
  const pct = progressPercent(answeredCount, totalQ);
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  const q = payload?.question;
  const current = q ? answers[q.id] : undefined;

  return (
    <main
      style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          borderBottom: `1px solid ${COLORS.line}`,
          background: '#fff',
        }}
      >
        <strong style={{ color: COLORS.teal }}>QOrium</strong>
        <span style={{ fontSize: 13, color: COLORS.sub }}>
          Question {Math.min(idx + 1, totalQ)} / {totalQ}
        </span>
        <span
          style={{
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 600,
            color: remaining < 60 ? '#dc2626' : COLORS.ink,
          }}
        >
          {mm}:{ss}
        </span>
      </header>

      <div
        aria-label={`Answered ${answeredCount} of ${totalQ}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '8px 20px',
          borderBottom: `1px solid ${COLORS.line}`,
          background: '#fff',
        }}
      >
        <span style={{ fontSize: 12, color: COLORS.sub, whiteSpace: 'nowrap' }}>
          Answered {answeredCount} / {totalQ}
        </span>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          style={{
            flex: 1,
            height: 6,
            borderRadius: 999,
            background: '#e5e7eb',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: '100%',
              background: COLORS.teal,
              transition: 'width .2s',
            }}
          />
        </div>
        {totalQ <= 30 ? (
          <div style={{ display: 'flex', gap: 4 }} aria-hidden="true">
            {Array.from({ length: totalQ }, (_, i) => (
              <span
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: answeredIdx.has(i) ? COLORS.teal : '#cbd5e1',
                  outline: i === idx ? `2px solid ${COLORS.teal}` : 'none',
                  outlineOffset: 1,
                }}
              />
            ))}
          </div>
        ) : (
          <span style={{ fontSize: 12, color: COLORS.sub, fontVariantNumeric: 'tabular-nums' }}>
            {pct}%
          </span>
        )}
      </div>

      <section style={{ maxWidth: 760, margin: '28px auto', padding: '0 20px' }}>
        {busy && !q ? (
          <p style={{ color: COLORS.sub }}>Loading…</p>
        ) : q ? (
          <div
            style={{
              background: '#fff',
              border: `1px solid ${COLORS.line}`,
              borderRadius: 14,
              padding: 26,
            }}
          >
            <p style={{ fontSize: 16, lineHeight: 1.6, color: COLORS.ink, marginTop: 0 }}>
              {q.body_md ?? 'Answer the question below.'}
            </p>

            {isMcq(q.format) && Array.isArray(q.body.options) ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                {(q.body.options as unknown[]).map((opt, i) => {
                  const selected = (current?.answer_index as number | undefined) === i;
                  return (
                    <label
                      key={i}
                      style={{
                        display: 'flex',
                        gap: 12,
                        alignItems: 'flex-start',
                        border: `1px solid ${selected ? COLORS.teal : COLORS.line}`,
                        background: selected ? '#f0fdfa' : '#fff',
                        borderRadius: 10,
                        padding: '12px 14px',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="radio"
                        name="opt"
                        checked={selected}
                        onChange={() => setAnswer(q.id, { answer_index: i })}
                        style={{ marginTop: 3 }}
                      />
                      <span style={{ fontSize: 14.5, color: COLORS.ink }}>
                        {typeof opt === 'string' ? opt : JSON.stringify(opt)}
                      </span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <textarea
                value={(current?.[isCode(q.format) ? 'code' : 'text'] as string | undefined) ?? ''}
                onChange={(e) =>
                  setAnswer(
                    q.id,
                    isCode(q.format) ? { code: e.target.value } : { text: e.target.value },
                  )
                }
                placeholder={isCode(q.format) ? 'Write your code here…' : 'Type your answer…'}
                spellCheck={!isCode(q.format)}
                style={{
                  width: '100%',
                  minHeight: 200,
                  marginTop: 8,
                  padding: 14,
                  border: `1px solid ${COLORS.line}`,
                  borderRadius: 10,
                  fontFamily: isCode(q.format)
                    ? 'ui-monospace, SFMono-Regular, monospace'
                    : 'inherit',
                  fontSize: 14,
                  resize: 'vertical',
                }}
              />
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 22 }}>
              <button
                onClick={() => void go(-1)}
                disabled={idx === 0 || busy}
                style={{
                  background: '#fff',
                  border: `1px solid ${COLORS.line}`,
                  borderRadius: 9,
                  padding: '10px 18px',
                  color: idx === 0 ? '#cbd5e1' : COLORS.ink,
                  cursor: idx === 0 ? 'default' : 'pointer',
                }}
              >
                Previous
              </button>
              {idx >= totalQ - 1 ? (
                <button
                  onClick={() => void finish()}
                  disabled={submitting}
                  style={{
                    background: '#0f766e',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 9,
                    padding: '10px 22px',
                    fontWeight: 600,
                    cursor: submitting ? 'default' : 'pointer',
                  }}
                >
                  {submitting ? 'Submitting…' : 'Submit assessment'}
                </button>
              ) : (
                <button
                  onClick={() => void go(1)}
                  disabled={busy}
                  style={{
                    background: COLORS.teal,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 9,
                    padding: '10px 22px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Save &amp; next
                </button>
              )}
            </div>
          </div>
        ) : (
          <p style={{ color: COLORS.sub }}>No question available.</p>
        )}
      </section>
    </main>
  );
}
