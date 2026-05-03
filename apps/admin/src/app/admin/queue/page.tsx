export const dynamic = 'force-dynamic';

export default function ReviewQueuePage() {
  return (
    <section aria-labelledby="queue-heading" className="mx-auto max-w-5xl space-y-6">
      <header className="space-y-2">
        <h1 id="queue-heading" className="text-2xl font-semibold tracking-tight">
          SME review queue
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Items pending Subject-Matter-Expert review. Stub view; live data wires in Sprint 1.3 once{' '}
          <code>GET /admin/v1/sme/review-queue</code> is online (CTO Architecture §6.3).
        </p>
      </header>
      <div
        role="status"
        className="rounded-lg border border-dashed border-neutral-300 bg-white p-10 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950"
      >
        No items in queue (scaffold).
      </div>
    </section>
  );
}
