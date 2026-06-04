import Link from "next/link";
import { api } from "../../../lib/api";

interface ResultPayload {
  result: { score: number; confidenceBand: string };
  attempt: {
    id: string;
    candidateEmail: string;
    answers: Array<{ questionId: string; grade?: number; confidence?: number; reasoning?: string }>;
  };
}

export default async function ResultPage({ params, searchParams }: { params: Promise<{ attemptId: string }>; searchParams: Promise<{ token?: string }> }) {
  const { attemptId } = await params;
  const { token } = await searchParams;
  const payload = await api<ResultPayload>(`/api/v1/attempts/${attemptId}/result?token=${encodeURIComponent(token ?? "")}`);
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-6">
      <div className="mx-auto max-w-4xl">
        <Link className="text-sm font-semibold text-zinc-600" href="/assessments/new">
          Back to builder
        </Link>
        <div className="mt-4 rounded-md border border-zinc-200 bg-white p-6">
          <p className="text-sm text-zinc-600">{payload.attempt.candidateEmail}</p>
          <h1 className="text-2xl font-semibold">Graded result</h1>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Metric label="Score" value={`${Math.round(payload.result.score * 100)}%`} />
            <Metric label="Confidence" value={payload.result.confidenceBand} />
          </div>
          <div className="mt-6 space-y-3">
            {payload.attempt.answers.map((answer) => (
              <div key={answer.questionId} className="rounded-md border border-zinc-200 p-4">
                <p className="font-semibold">{answer.questionId}</p>
                <p className="mt-1 text-sm text-zinc-700">Score: {Math.round((answer.grade ?? 0) * 100)}% · Confidence: {Math.round((answer.confidence ?? 0) * 100)}%</p>
                <p className="mt-2 text-sm text-zinc-600">{answer.reasoning}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-200 p-4">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-sm text-zinc-500">{label}</p>
    </div>
  );
}
