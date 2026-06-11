'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Skill {
  id: string;
  name: string;
  released: number;
}
interface Assessment {
  id: string;
  title: string;
  total_questions: number;
  status: string;
  invites: number;
  attempts: number;
}
interface Attempt {
  id: string;
  status: string;
  score_pct: number | null;
  candidate_email: string;
  candidate_name: string | null;
}
interface ReviewItem {
  response_id: string;
  format: string | null;
  score: number | null;
  reasoning_trace: string | null;
  correct: boolean | null;
}

const C = { teal: '#0d9488', ink: '#0f172a', sub: '#64748b', line: '#e2e8f0', bg: '#f8fafc' };
const card: React.CSSProperties = {
  background: '#fff',
  border: `1px solid ${C.line}`,
  borderRadius: 12,
  padding: 20,
  marginBottom: 16,
};
const btn: React.CSSProperties = {
  background: C.teal,
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '8px 14px',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
};
const inp: React.CSSProperties = {
  padding: '8px 10px',
  border: `1px solid #cbd5e1`,
  borderRadius: 8,
  fontSize: 13,
};

async function api(path: string, init?: RequestInit) {
  const r = await fetch(`/api/v1${path}`, { cache: 'no-store', ...init });
  return r;
}

export function RecruiterDashboard() {
  const router = useRouter();
  const [me, setMe] = useState<{ name: string; email: string } | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [title, setTitle] = useState('');
  const [skillId, setSkillId] = useState('');
  const [count, setCount] = useState(5);
  const [creating, setCreating] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<Record<string, Attempt[]>>({});
  const [invite, setInvite] = useState<Record<string, string>>({});
  const [links, setLinks] = useState<Record<string, string>>({});
  const [review, setReview] = useState<Record<string, ReviewItem[]>>({});

  const loadAssessments = useCallback(async () => {
    const r = await api('/recruiter/assessments');
    if (r.ok) setAssessments((await r.json()).assessments);
  }, []);

  useEffect(() => {
    (async () => {
      const who = await api('/auth/whoami');
      if (!who.ok) {
        router.push('/login');
        return;
      }
      setMe((await who.json()).recruiter);
      const sk = await api('/recruiter/skills');
      if (sk.ok) {
        const list = (await sk.json()).skills as Skill[];
        setSkills(list);
        if (list[0]) setSkillId(list[0].id);
      }
      await loadAssessments();
    })();
  }, [router, loadAssessments]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    const r = await api('/recruiter/assessments', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title, skill_id: skillId, question_count: count }),
    });
    if (r.ok) {
      setTitle('');
      await loadAssessments();
    }
    setCreating(false);
  }

  async function sendInvite(aid: string) {
    const email = invite[aid];
    if (!email) return;
    const r = await api(`/recruiter/assessments/${aid}/invite`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ candidate_email: email }),
    });
    if (r.ok) {
      const d = await r.json();
      setLinks((l) => ({ ...l, [aid]: d.link }));
      await loadAssessments();
    }
  }

  async function toggleAttempts(aid: string) {
    if (openId === aid) {
      setOpenId(null);
      return;
    }
    setOpenId(aid);
    const r = await api(`/recruiter/assessments/${aid}/attempts`);
    if (r.ok) {
      const d = await r.json();
      setAttempts((a) => ({ ...a, [aid]: d.attempts }));
    }
  }

  async function loadReview(attemptId: string) {
    if (review[attemptId]) {
      setReview((rv) => {
        const n = { ...rv };
        delete n[attemptId];
        return n;
      });
      return;
    }
    const r = await api(`/recruiter/attempts/${attemptId}/review`);
    if (r.ok) {
      const d = await r.json();
      setReview((rv) => ({ ...rv, [attemptId]: d.responses }));
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: C.bg, fontFamily: 'system-ui, sans-serif' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 24px',
          background: '#fff',
          borderBottom: `1px solid ${C.line}`,
        }}
      >
        <strong style={{ color: C.teal }}>QOrium · Recruiter</strong>
        <span style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 13 }}>
          <a href="/skills" style={{ color: C.teal }}>
            Skill catalog
          </a>
          <span style={{ color: C.sub }}>{me?.email}</span>
        </span>
      </header>

      <section style={{ maxWidth: 820, margin: '24px auto', padding: '0 20px' }}>
        <div style={card}>
          <h2 style={{ fontSize: 16, marginTop: 0, color: C.ink }}>Create an assessment</h2>
          <form
            onSubmit={create}
            style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}
          >
            <input
              style={{ ...inp, flex: '1 1 200px' }}
              placeholder="Assessment title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <select style={inp} value={skillId} onChange={(e) => setSkillId(e.target.value)}>
              {skills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.released})
                </option>
              ))}
            </select>
            <input
              style={{ ...inp, width: 70 }}
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
            <button type="submit" style={btn} disabled={creating}>
              {creating ? 'Creating…' : 'Create'}
            </button>
          </form>
        </div>

        <h2 style={{ fontSize: 16, color: C.ink }}>Your assessments</h2>
        {assessments.length === 0 && <p style={{ color: C.sub }}>None yet — create one above.</p>}
        {assessments.map((a) => (
          <div key={a.id} style={card}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}
            >
              <strong style={{ color: C.ink }}>{a.title}</strong>
              <span style={{ fontSize: 12, color: C.sub }}>
                {a.total_questions} Q · {a.invites} invited · {a.attempts} attempts
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                gap: 8,
                marginTop: 12,
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <input
                style={{ ...inp, flex: '1 1 200px' }}
                placeholder="candidate@email.com"
                value={invite[a.id] ?? ''}
                onChange={(e) => setInvite((v) => ({ ...v, [a.id]: e.target.value }))}
              />
              <button style={btn} onClick={() => void sendInvite(a.id)}>
                Invite
              </button>
              <button
                style={{ ...btn, background: '#475569' }}
                onClick={() => void toggleAttempts(a.id)}
              >
                {openId === a.id ? 'Hide attempts' : 'View attempts'}
              </button>
            </div>
            {links[a.id] && (
              <p style={{ fontSize: 12, marginTop: 8 }}>
                Invite link:{' '}
                <a href={links[a.id]} style={{ color: C.teal }}>
                  {links[a.id]}
                </a>
              </p>
            )}
            {openId === a.id && (
              <div style={{ marginTop: 14, borderTop: `1px solid ${C.line}`, paddingTop: 12 }}>
                {(attempts[a.id] ?? []).length === 0 ? (
                  <p style={{ fontSize: 13, color: C.sub }}>No attempts yet.</p>
                ) : (
                  (attempts[a.id] ?? []).map((at) => (
                    <div
                      key={at.id}
                      style={{ padding: '8px 0', borderBottom: `1px solid ${C.bg}` }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span style={{ fontSize: 13 }}>
                          {at.candidate_name ?? at.candidate_email}{' '}
                          <span style={{ color: C.sub }}>· {at.status}</span>
                        </span>
                        <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <strong style={{ color: at.score_pct !== null ? C.ink : C.sub }}>
                            {at.score_pct !== null ? `${Math.round(at.score_pct)}%` : '—'}
                          </strong>
                          {at.status === 'graded' && (
                            <button
                              style={{
                                ...btn,
                                background: '#fff',
                                color: C.teal,
                                border: `1px solid ${C.teal}`,
                              }}
                              onClick={() => void loadReview(at.id)}
                            >
                              {review[at.id] ? 'Hide' : 'Review'}
                            </button>
                          )}
                        </span>
                      </div>
                      {review[at.id] && (
                        <div style={{ marginTop: 8 }}>
                          {review[at.id]!.map((rv, i) => (
                            <div
                              key={rv.response_id}
                              style={{ fontSize: 12, color: C.sub, padding: '4px 0' }}
                            >
                              <strong style={{ color: C.ink }}>
                                Q{i + 1} ({rv.format}) —{' '}
                                {rv.score !== null ? Math.round(rv.score) : '—'}/100
                              </strong>
                              <br />
                              <span>{rv.reasoning_trace ?? 'No reasoning recorded.'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}
