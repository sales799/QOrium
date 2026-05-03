import { resolveAdminTenantId } from '@/lib/tenant';
import { getConfig } from '@/lib/clients/sso';
import { listSubscriptions } from '@/lib/clients/webhooks';
import { getSummary } from '@/lib/clients/audit';

export const dynamic = 'force-dynamic';

interface ChecklistItem {
  label: string;
  done: boolean;
  detail: string;
}

export default async function CustomersPage() {
  const tenantId = resolveAdminTenantId();
  if (!tenantId) {
    return (
      <section className="mx-auto max-w-4xl space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
        <div
          role="status"
          className="rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
        >
          ADMIN_DEFAULT_TENANT_ID is not configured. Set it to load the tenant&apos;s onboarding
          state.
        </div>
      </section>
    );
  }

  const [ssoResult, webhooksResult, summaryResult] = await Promise.all([
    getConfig(tenantId),
    listSubscriptions(tenantId),
    getSummary(tenantId, { topN: 5 }),
  ]);

  const ssoActive = ssoResult.ok && ssoResult.body?.status === 'active';
  const webhooksCount = webhooksResult.ok ? (webhooksResult.body?.count ?? 0) : 0;
  const auditEventsRecent = summaryResult.ok
    ? (summaryResult.body?.top.reduce((acc, t) => acc + t.count, 0) ?? 0)
    : 0;

  const checklist: ChecklistItem[] = [
    {
      label: 'SSO configured',
      done: ssoActive,
      detail: ssoActive
        ? `Active (${ssoResult.body?.protocol.toUpperCase()})`
        : ssoResult.ok
          ? `Status: ${ssoResult.body?.status ?? 'unknown'}`
          : 'No SSO configuration',
    },
    {
      label: 'Webhook subscribed',
      done: webhooksCount > 0,
      detail: `${webhooksCount} subscription${webhooksCount === 1 ? '' : 's'}`,
    },
    {
      label: 'Audit log activity',
      done: auditEventsRecent > 0,
      detail: `${auditEventsRecent} events (top-5 actions)`,
    },
    {
      label: 'API key issued',
      done: false,
      detail: 'Pending Sprint 2.7 (services/api-key-mgmt)',
    },
    {
      label: 'Billing subscription',
      done: false,
      detail: 'Pending Sprint 2.6 (services/billing)',
    },
  ];

  const completed = checklist.filter((c) => c.done).length;

  return (
    <section aria-labelledby="customers-heading" className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-2">
        <h1 id="customers-heading" className="text-2xl font-semibold tracking-tight">
          Customer onboarding
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Tenant-scoped onboarding checklist for the active session. v0 ships
          one-tenant-per-session; multi-tenant tenant switcher follows once{' '}
          <code>services/api-key-mgmt</code> issues per-user JWTs.
        </p>
      </header>

      <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
        <p className="text-sm font-medium">
          Tenant <code className="ml-2 font-mono text-xs">{tenantId}</code>
        </p>
        <p className="text-xs text-neutral-500">
          {completed}/{checklist.length} onboarding steps complete
        </p>
      </div>

      <ul className="space-y-2">
        {checklist.map((c) => (
          <li
            key={c.label}
            className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 text-sm dark:border-neutral-800 dark:bg-neutral-950"
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full ${
                  c.done ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-500'
                }`}
              >
                {c.done ? '✓' : '·'}
              </span>
              <div>
                <p className="font-medium">{c.label}</p>
                <p className="text-xs text-neutral-500">{c.detail}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
