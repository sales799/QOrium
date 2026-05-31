"use client";

import { Check, Copy, Library, Link as LinkIcon, Plus, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { api } from "../../../lib/api";

interface Card {
  skill: { id: string; name: string; tags: string[] };
  questionCount: number;
}

interface Props {
  cards: Card[];
  stats: { total: number; skills: number; subSkills: number };
}

export function AssessmentBuilder({ cards, stats }: Props) {
  const [selected, setSelected] = useState<string[]>(cards.slice(0, 3).map((card) => card.skill.id));
  const [candidateEmail, setCandidateEmail] = useState("candidate@example.com");
  const [title, setTitle] = useState("Phase 1 Talent Screen");
  const [shareUrl, setShareUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const selectedCards = useMemo(() => cards.filter((card) => selected.includes(card.skill.id)), [cards, selected]);

  async function saveAssessment() {
    setBusy(true);
    try {
      const payload = await api<{ shareUrl: string }>("/api/v1/assessments", {
        method: "POST",
        body: JSON.stringify({ title, candidateEmail, skillIds: selected })
      });
      setShareUrl(`${window.location.origin}${payload.shareUrl}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-emerald-700">Lane A Phase 1</p>
            <h1 className="text-2xl font-semibold">QOrium Assessment Builder</h1>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <Metric label="Nodes" value={stats.total} />
            <Metric label="Skills" value={stats.skills} />
            <Metric label="Sub-skills" value={stats.subSkills} />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[320px_1fr_360px]">
        <aside className="space-y-4">
          <Field label="Assessment title" value={title} onChange={setTitle} />
          <Field label="Candidate email" value={candidateEmail} onChange={setCandidateEmail} />
          <button
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white disabled:opacity-50"
            disabled={busy || selected.length === 0}
            onClick={saveAssessment}
          >
            <Send size={16} />
            Save and sign link
          </button>
          {shareUrl ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm">
              <div className="mb-2 flex items-center gap-2 font-semibold text-emerald-900">
                <LinkIcon size={16} /> Signed candidate link
              </div>
              <a className="break-all text-emerald-800 underline" href={shareUrl}>
                {shareUrl}
              </a>
              <button className="mt-3 inline-flex items-center gap-2 text-xs font-semibold" onClick={() => navigator.clipboard.writeText(shareUrl)}>
                <Copy size={14} /> Copy
              </button>
            </div>
          ) : null}
        </aside>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Library size={18} /> 25-skill seed library
            </h2>
            <span className="text-sm text-zinc-600">{selected.length} selected</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => {
              const active = selected.includes(card.skill.id);
              return (
                <button
                  key={card.skill.id}
                  className={`min-h-28 rounded-md border bg-white p-4 text-left transition ${active ? "border-emerald-600 ring-2 ring-emerald-100" : "border-zinc-200 hover:border-zinc-400"}`}
                  onClick={() => setSelected((current) => (active ? current.filter((id) => id !== card.skill.id) : [...current, card.skill.id]))}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold">{card.skill.name}</h3>
                    {active ? <Check className="text-emerald-700" size={18} /> : <Plus className="text-zinc-500" size={18} />}
                  </div>
                  <p className="mt-3 text-sm text-zinc-600">{card.questionCount} seeded items with placeholder IRT params.</p>
                </button>
              );
            })}
          </div>
        </section>

        <aside className="rounded-md border border-zinc-200 bg-white p-4">
          <h2 className="text-lg font-semibold">Preview</h2>
          <div className="mt-4 space-y-3">
            {selectedCards.map((card, index) => (
              <div key={card.skill.id} className="rounded-md border border-zinc-200 p-3">
                <p className="text-xs text-zinc-500">Section {index + 1}</p>
                <p className="font-medium">{card.skill.name}</p>
                <p className="text-sm text-zinc-600">2 questions cloned into the assessment.</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-zinc-200 px-3 py-2">
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-zinc-500">{label}</p>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm font-medium">
      <span>{label}</span>
      <input className="mt-1 h-11 w-full rounded-md border border-zinc-300 bg-white px-3" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
