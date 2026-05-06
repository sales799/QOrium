export const dynamic = 'force-dynamic';

export default function CalibrationPage() {
  return (
    <section aria-labelledby="calibration-heading" className="mx-auto max-w-5xl space-y-6">
      <header className="space-y-2">
        <h1 id="calibration-heading" className="text-2xl font-semibold tracking-tight">
          IRT calibration panel
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Items awaiting calibration sampling and 2-PL fit review. Stub view; live data wires in
          Sprint 1.5 alongside the IRT Calibration Pipeline (per{' '}
          <code>infra/IRT-Calibration-Pipeline-v0-Spec.md</code>).
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
