import Link from "next/link";
import { api } from "../../../lib/api";

interface ResultPayload {
  result: { headline: string; summary: string; highlights: string[] };
  attempt: {
    id: string;
    answerCount: number;
    submittedAt: string;
  };
}

export default async function ResultPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
  const payload = await api<ResultPayload>(`/api/v1/attempts/${attemptId}/result`);
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-6">
      <div className="mx-auto max-w-4xl">
        <Link className="text-sm font-semibold text-zinc-600" href="/assessments/new">
          Back to builder
        </Link>
        <div className="mt-4 rounded-md border border-zinc-200 bg-white p-6">
          <p className="text-sm text-zinc-600">Submission {payload.attempt.id}</p>
          <h1 className="text-2xl font-semibold">{payload.result.headline}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">{payload.result.summary}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Metric label="Responses captured" value={String(payload.attempt.answerCount)} />
            <Metric label="Submission status" value="Received" />
          </div>
          <div className="mt-6 grid gap-3">
            {payload.result.highlights.map((highlight) => (
              <div key={highlight} className="rounded-md border border-zinc-200 p-4">
                <p className="text-sm text-zinc-700">{highlight}</p>
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
