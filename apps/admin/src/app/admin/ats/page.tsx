import { getAtsHealth } from '@/lib/clients/ats';

export const dynamic = 'force-dynamic';

export default async function AtsPage() {
  const result = await getAtsHealth();
  const adapters = result.ok ? (result.body?.adapters ?? []) : [];
  const errorMessage = !result.ok
    ? `ATS bridge service unreachable: ${result.error ?? 'unknown error'}`
    : null;

  return (
    <section aria-labelledby="ats-heading" className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-2">
        <h1 id="ats-heading" className="text-2xl font-semibold tracking-tight">
          ATS integrations
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          v0 adapters registered with <code>services/ats-bridge</code>. Per{' '}
          <code>infra/ATS-Connector-Framework-v0.md</code>. Per-tenant credential management ships
          in Sprint 2.7 alongside <code>services/api-key-mgmt</code>.
        </p>
      </header>

      {errorMessage && (
        <div
          role="status"
          className="rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
        >
          {errorMessage}
        </div>
      )}

      <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
        <h2 className="text-base font-semibold">Registered adapters</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {adapters.map((adapter) => (
            <li
              key={adapter}
              className="flex items-center justify-between rounded border border-neutral-200 px-3 py-2 dark:border-neutral-800"
            >
              <code className="text-xs font-medium uppercase">{adapter}</code>
              <AdapterStatusPill name={adapter} />
            </li>
          ))}
          {adapters.length === 0 && (
            <li className="text-sm text-neutral-500">No adapters registered.</li>
          )}
        </ul>
      </div>

      <div className="rounded border border-neutral-200 bg-neutral-50 p-4 text-xs dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="font-semibold">Tenant credentials</h2>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400">
          Per-tenant OAuth client / API keys are seeded out-of-band by Customer Success during the
          milestone activation:
        </p>
        <ul className="ml-5 mt-2 list-disc space-y-1 text-neutral-600 dark:text-neutral-400">
          <li>Greenhouse → M6 (Harvest API token + webhook secret)</li>
          <li>Ashby → M7 (per-tenant API key)</li>
          <li>Darwinbox → M8 (per-tenant API key + tenant domain)</li>
          <li>Workday → M9 (cert + signing keys; Constitutional Article IX gate)</li>
        </ul>
      </div>
    </section>
  );
}

function AdapterStatusPill({ name }: { name: string }) {
  const tone =
    name === 'greenhouse'
      ? 'bg-emerald-100 text-emerald-800'
      : name === 'workday'
        ? 'bg-red-100 text-red-800'
        : 'bg-amber-100 text-amber-800';
  const label = name === 'greenhouse' ? 'live (M6)' : name === 'workday' ? 'M9 cert' : 'stub';
  return (
    <span className={`rounded px-2 py-0.5 text-[10px] font-medium uppercase ${tone}`}>{label}</span>
  );
}
