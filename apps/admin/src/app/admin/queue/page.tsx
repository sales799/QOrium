import { getAdminPool } from '@/server/db';
import { listReviewQueue, type QueueRow } from '@/server/queue';
import { resolveDatabaseUrl } from '@qorium/db';
import { DecisionForm } from './_components/decision-form';

export const dynamic = 'force-dynamic';

interface QueueData {
  available: boolean;
  rows: QueueRow[];
  errorMessage?: string;
}

async function loadQueue(): Promise<QueueData> {
  try {
    resolveDatabaseUrl();
  } catch {
    return {
      available: false,
      rows: [],
      errorMessage:
        'DATABASE_URL is not configured. Set it in apps/admin/.env (or the process env) to load real items.',
    };
  }

  try {
    const rows = await listReviewQueue(getAdminPool(), { limit: 50 });
    return { available: true, rows };
  } catch (err) {
    return {
      available: false,
      rows: [],
      errorMessage:
        err instanceof Error ? `Failed to load queue: ${err.message}` : 'Failed to load queue.',
    };
  }
}

export default async function ReviewQueuePage() {
  const data = await loadQueue();

  return (
    <section aria-labelledby="queue-heading" className="mx-auto max-w-5xl space-y-6">
      <header className="space-y-2">
        <h1 id="queue-heading" className="text-2xl font-semibold tracking-tight">
          SME review queue
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Items in <code>content.questions.status = &apos;sme_review&apos;</code> awaiting an accept
          / edit / reject decision. Decisions transition the question and append to{' '}
          <code>content.review_decisions</code> (CTO Architecture §6.3, migration 0003).
        </p>
      </header>

      {!data.available && (
        <div
          role="status"
          className="rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
        >
          {data.errorMessage}
        </div>
      )}

      {data.available && data.rows.length === 0 && (
        <div
          role="status"
          className="rounded-lg border border-dashed border-neutral-300 bg-white p-10 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950"
        >
          No items currently in the SME review queue.
        </div>
      )}

      {data.available && data.rows.length > 0 && (
        <ul className="space-y-4">
          {data.rows.map((row) => (
            <li
              key={row.id}
              className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
            >
              <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <div className="space-y-1">
                  <h2 className="text-base font-semibold tracking-tight">
                    <span className="font-mono text-xs text-neutral-500">
                      {row.uuid.slice(0, 8)}
                    </span>{' '}
                    <span className="ml-1 rounded bg-neutral-100 px-1.5 py-0.5 text-xs font-medium uppercase text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                      {row.format}
                    </span>{' '}
                    <span className="ml-1 rounded bg-neutral-100 px-1.5 py-0.5 text-xs font-medium uppercase text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                      {row.sku}
                    </span>
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Authored by <code>{row.authoredBy}</code> ·{' '}
                    {new Date(row.createdAt).toLocaleString()}
                  </p>
                </div>
              </header>
              <pre className="mb-4 max-h-72 overflow-auto whitespace-pre-wrap rounded bg-neutral-50 p-3 text-xs leading-relaxed dark:bg-neutral-900">
                {row.bodyMd}
              </pre>
              <DecisionForm questionId={row.id} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
