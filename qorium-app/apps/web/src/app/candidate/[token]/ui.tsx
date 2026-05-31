"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Play, Send } from "lucide-react";
import { useState } from "react";
import { api } from "../../../lib/api";

const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface Assessment {
  id: string;
  title: string;
  candidateEmail: string;
  questions: Array<{
    id: string;
    type: "mcq" | "multi-select" | "short-answer" | "code-question";
    stem: string;
    options?: string[];
    starterCode?: Record<string, string>;
  }>;
}

export function CandidateAssessment({ token, assessment }: { token: string; assessment: Assessment }) {
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [runOutput, setRunOutput] = useState<Record<string, string>>({});
  const [resultUrl, setResultUrl] = useState("");

  async function runCode(questionId: string) {
    const source = String(answers[questionId] ?? assessment.questions.find((question) => question.id === questionId)?.starterCode?.javascript ?? "");
    const res = await fetch("http://localhost:4102/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: "javascript", source })
    });
    const payload = await res.json() as { stdout: string; stderr: string; durationMs: number };
    setRunOutput((current) => ({ ...current, [questionId]: `${payload.stdout}${payload.stderr ? `\n${payload.stderr}` : ""}\n${payload.durationMs}ms` }));
  }

  async function submit() {
    const payload = await api<{ attempt: { id: string } }>("/api/v1/attempts/submit", {
      method: "POST",
      body: JSON.stringify({
        token,
        candidateEmail: assessment.candidateEmail,
        answers: assessment.questions.map((question) => ({ questionId: question.id, response: answers[question.id] ?? "" }))
      })
    });
    setResultUrl(`/results/${payload.attempt.id}`);
  }

  if (resultUrl) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
        <div className="rounded-md border border-zinc-200 bg-white p-6">
          <h1 className="text-xl font-semibold">Submission received</h1>
          <Link className="mt-4 inline-flex rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white" href={resultUrl}>
            View graded result
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm text-zinc-600">{assessment.candidateEmail}</p>
          <h1 className="text-2xl font-semibold">{assessment.title}</h1>
        </div>
      </header>
      <section className="mx-auto max-w-5xl space-y-4 px-6 py-6">
        {assessment.questions.map((question, index) => (
          <div key={question.id} className="rounded-md border border-zinc-200 bg-white p-5">
            <p className="text-sm font-semibold text-zinc-500">Question {index + 1}</p>
            <h2 className="mt-1 font-semibold">{question.stem}</h2>
            {question.options ? (
              <div className="mt-4 grid gap-2">
                {question.options.map((option, optionIndex) => (
                  <button
                    key={option}
                    className={`rounded-md border p-3 text-left text-sm ${answers[question.id] === optionIndex ? "border-emerald-600 bg-emerald-50" : "border-zinc-200"}`}
                    onClick={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : question.type === "code-question" ? (
              <div className="mt-4">
                <div className="h-72 overflow-hidden rounded-md border border-zinc-200">
                  <Monaco
                    height="288px"
                    defaultLanguage="javascript"
                    value={String(answers[question.id] ?? question.starterCode?.javascript ?? "")}
                    onChange={(value) => setAnswers((current) => ({ ...current, [question.id]: value ?? "" }))}
                    options={{ minimap: { enabled: false }, fontSize: 13 }}
                  />
                </div>
                <button className="mt-3 inline-flex items-center gap-2 rounded-md border border-zinc-300 px-3 py-2 text-sm font-semibold" onClick={() => runCode(question.id)}>
                  <Play size={16} /> Run
                </button>
                {runOutput[question.id] ? <pre className="mt-3 overflow-auto rounded-md bg-zinc-950 p-3 text-xs text-white">{runOutput[question.id]}</pre> : null}
              </div>
            ) : (
              <textarea
                className="mt-4 min-h-32 w-full rounded-md border border-zinc-300 p-3"
                value={String(answers[question.id] ?? "")}
                onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))}
              />
            )}
          </div>
        ))}
        <button className="inline-flex h-11 items-center gap-2 rounded-md bg-zinc-950 px-5 text-sm font-semibold text-white" onClick={submit}>
          <Send size={16} /> Submit
        </button>
      </section>
    </main>
  );
}
