import { callService, resolveServiceUrls } from '@/lib/clients/services';

export const dynamic = 'force-dynamic';

interface UptimeStatus {
  generatedAt: string;
  summary: { passed: number; failed: number; skipped: number };
  latest: Record<string, { name: string; status: string; details?: string; durationMs: number }>;
  consecutiveFailures: Record<string, number>;
}

interface SloBody {
  window: string;
  totalChecks: number;
  failedChecks: number;
  availability: number;
}

export default async function UptimePage() {
  const url = resolveServiceUrls().uptime;
  const [status, slo24h, slo1h] = await Promise.all([
    callService<UptimeStatus>(url, '/v1/uptime/status'),
    callService<SloBody>(url, '/v1/uptime/slo?window=24h'),
    callService<SloBody>(url, '/v1/uptime/slo?window=1h'),
  ]);

  const errorMessage = !status.ok
    ? `Uptime monitor unreachable (${status.error ?? 'unknown error'}). The monitor at port 5114 may not be running yet.`
    : null;
  const latest = status.body?.latest ?? {};
  const failures = status.body?.consecutiveFailures ?? {};

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Uptime monitor</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Live snapshot from <code>services/uptime-monitor</code> (port 5114). Tick interval default
          60s. Ten internal checks: postgres, redis, and every service health endpoint.
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

      <div className="grid grid-cols-2 gap-4">
        <SloTile label="1h availability" body={slo1h.body} />
        <SloTile label="24h availability" body={slo24h.body} />
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
        <h2 className="mb-3 text-base font-semibold">Latest check matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-[11px] font-medium uppercase text-neutral-600 dark:bg-neutral-900">
              <tr>
                <th className="px-3 py-2">Check</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Latency</th>
                <th className="px-3 py-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(latest).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-neutral-500">
                    No checks yet. The monitor runs the first tick on boot.
                  </td>
                </tr>
              )}
              {Object.values(latest).map((c) => (
                <tr key={c.name} className="border-t border-neutral-200">
                  <td className="px-3 py-2 font-mono">{c.name}</td>
                  <td className="px-3 py-2">
                    <StatusPill status={c.status} />
                    {failures[c.name] && failures[c.name]! > 1 && (
                      <span className="ml-2 text-[10px] text-red-700">×{failures[c.name]}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-neutral-500">{c.durationMs} ms</td>
                  <td className="px-3 py-2 text-neutral-600">{c.details ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function SloTile({ label, body }: { label: string; body: SloBody | null }) {
  const pct = body ? (body.availability * 100).toFixed(2) : '—';
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
      <p className="text-xs uppercase text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{pct}%</p>
      <p className="mt-1 text-xs text-neutral-500">
        {body ? `${body.failedChecks} fail / ${body.totalChecks} total` : 'no data'}
      </p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === 'pass'
      ? 'bg-emerald-100 text-emerald-800'
      : status === 'fail'
        ? 'bg-red-100 text-red-800'
        : 'bg-neutral-100 text-neutral-700';
  return (
    <span className={`rounded px-2 py-0.5 text-[10px] font-medium uppercase ${tone}`}>
      {status}
    </span>
  );
}
