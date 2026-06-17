'use client';

// apps/my: src/app/skills/page.tsx — recruiter Skill Catalog view. Renders the
// 13-family consolidation (N7) by consuming the live
// GET /v1/recruiter/skill-families endpoint via the cookie-forwarding proxy.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUrl } from '@/lib/auth-navigation';

type Family = {
  id: string;
  name: string;
  released: number;
  skillCount: number;
  topSkills: { name: string; released: number }[];
};

const C = { teal: '#0d9488', ink: '#0f172a', sub: '#64748b', line: '#e2e8f0', bg: '#f8fafc' };
const n = (x: number) => x.toLocaleString('en-IN');

export default function SkillsPage() {
  const router = useRouter();
  const [families, setFamilies] = useState<Family[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/v1/recruiter/skill-families', { credentials: 'include' });
        if (r.status === 401) {
          router.push(loginUrl('/skills'));
          return;
        }
        if (!r.ok) throw new Error(`status ${r.status}`);
        const d = (await r.json()) as { families: Family[] };
        setFamilies(d.families);
      } catch (e) {
        setErr(String(e));
      }
    })();
  }, [router]);

  if (err)
    return (
      <main style={{ padding: 32, fontFamily: 'system-ui' }}>
        <p style={{ color: '#b91c1c' }}>{err}</p>
      </main>
    );
  if (!families)
    return <main style={{ padding: 32, fontFamily: 'system-ui' }}>Loading skill catalog…</main>;

  const totalReleased = families.reduce((s, f) => s + f.released, 0);

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
        <strong style={{ color: C.teal }}>QOrium · Skill catalog</strong>
        <a href="/dashboard" style={{ color: C.teal, fontSize: 13 }}>
          ← Dashboard
        </a>
      </header>

      <section style={{ maxWidth: 880, margin: '24px auto', padding: '0 20px' }}>
        <p style={{ color: C.sub, fontSize: 14 }}>
          {families.length} skill families · {n(totalReleased)} released questions
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
            gap: 12,
          }}
        >
          {families.map((f) => (
            <div
              key={f.id}
              style={{
                padding: 16,
                background: '#fff',
                border: `1px solid ${C.line}`,
                borderRadius: 12,
              }}
            >
              <div style={{ fontWeight: 700, color: C.ink }}>{f.name}</div>
              <div style={{ fontSize: 13, color: C.sub, margin: '4px 0 8px' }}>
                {n(f.released)} questions · {f.skillCount} skills
              </div>
              <ul style={{ margin: 0, paddingLeft: 16, color: C.ink, fontSize: 13 }}>
                {f.topSkills.map((s) => (
                  <li key={s.name}>
                    {s.name} <span style={{ color: C.sub }}>({n(s.released)})</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
