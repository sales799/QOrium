import { resolveAdminTenantId } from '@/lib/tenant';
import { listEvents, type ListEventsFilter } from '@/lib/clients/audit';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function pickString(
  query: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const v = query[key];
  if (typeof v === 'string' && v.length > 0) return v;
  if (Array.isArray(v) && typeof v[0] === 'string') return v[0];
  return undefined;
}

export default async function AuditPage({ searchParams }: PageProps) {
  const tenantId = resolveAdminTenantId();
  const query = (await searchParams) ?? {};
  const filter: ListEventsFilter = { limit: 50 };
  const startDate = pickString(query, 'start_date');
  if (startDate !== undefined) filter.startDate = startDate;
  const endDate = pickString(query, 'end_date');
  if (endDate !== undefined) filter.endDate = endDate;
  const action = pickString(query, 'action');
  if (action !== undefined) filter.action = action;
  const resourceType = pickString(query, 'resource_type');
  if (resourceType !== undefined) filter.resourceType = resourceType;
  const actorId = pickString(query, 'actor_id');
  if (actorId !== undefined) filter.actorId = actorId;

  const result = tenantId ? await listEvents(tenantId, filter) : null;
  const errorMessage = !tenantId
    ? 'ADMIN_DEFAULT_TENANT_ID is not configured. Set it in apps/admin/.env to load events.'
    : result && !result.ok
      ? `Audit-log service unreachable: ${result.error ?? 'unknown error'}`
      : null;
  const events = result?.ok ? (result.body?.events ?? []) : [];

  return (
    <section aria-labelledby="audit-heading" className="mx-auto max-w-6xl space-y-6">
      <header className="space-y-2">
        <h1 id="audit-heading" className="text-2xl font-semibold tracking-tight">
          Audit log
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Tenant-scoped audit events. Per <code>infra/Audit-Log-API-Spec-v0.md</code> §3.
        </p>
      </header>

      <form className="grid grid-cols-5 gap-3 rounded-lg border border-neutral-200 bg-white p-4 text-sm dark:border-neutral-800 dark:bg-neutral-950">
        <Field label="Action" name="action" defaultValue={filter.action ?? ''} />
        <Field
          label="Resource type"
          name="resource_type"
          defaultValue={filter.resourceType ?? ''}
        />
        <Field label="Actor id" name="actor_id" defaultValue={filter.actorId ?? ''} />
        <Field
          label="Start date"
          name="start_date"
          type="datetime-local"
          defaultValue={filter.startDate ?? ''}
        />
        <Field
          label="End date"
          name="end_date"
          type="datetime-local"
          defaultValue={filter.endDate ?? ''}
        />
        <div className="col-span-5">
          <button
            type="submit"
            className="rounded bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900"
          >
            Apply filters
          </button>
        </div>
      </form>

      {errorMessage && (
        <div
          role="status"
          className="rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
        >
          {errorMessage}
        </div>
      )}

      {tenantId && (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-[11px] font-medium uppercase text-neutral-600 dark:bg-neutral-900">
              <tr>
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">Resource</th>
                <th className="px-3 py-2">Actor</th>
                <th className="px-3 py-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-neutral-500">
                    No events match these filters.
                  </td>
                </tr>
              )}
              {events.map((e) => (
                <tr
                  key={e.id}
                  className="border-t border-neutral-200 align-top dark:border-neutral-800"
                >
                  <td className="px-3 py-2 font-mono text-[11px]">
                    {new Date(e.occurredAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 font-medium">{e.action}</td>
                  <td className="px-3 py-2 text-neutral-600">
                    {e.resourceType ?? '—'}
                    {e.resourceId ? ` / ${e.resourceId}` : ''}
                  </td>
                  <td className="px-3 py-2 text-neutral-600">
                    <span className="text-[11px] uppercase">{e.actorType}</span>
                    {e.actorId && <code className="ml-1 text-[10px]">{e.actorId.slice(0, 8)}</code>}
                  </td>
                  <td className="px-3 py-2">
                    <details>
                      <summary className="cursor-pointer text-blue-700">view</summary>
                      <pre className="mt-2 max-h-48 overflow-auto rounded bg-neutral-50 p-2 text-[10px] dark:bg-neutral-900">
                        {JSON.stringify({ payload: e.payload, changes: e.changes }, null, 2)}
                      </pre>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

interface FieldProps {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
}
function Field({ label, name, defaultValue, type = 'text' }: FieldProps) {
  return (
    <label className="block space-y-1">
      <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
        {label}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="block w-full rounded border border-neutral-300 bg-white px-3 py-1.5 text-xs dark:border-neutral-700 dark:bg-neutral-900"
      />
    </label>
  );
}
