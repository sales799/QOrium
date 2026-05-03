import { resolveAdminTenantId } from '@/lib/tenant';
import { getConfig } from '@/lib/clients/sso';
import { SsoForm } from './_components/sso-form';

export const dynamic = 'force-dynamic';

export default async function SsoPage() {
  const tenantId = resolveAdminTenantId();
  const result = tenantId ? await getConfig(tenantId) : null;
  const config = result?.ok ? result.body : null;
  const errorMessage = !tenantId
    ? "ADMIN_DEFAULT_TENANT_ID is not configured. Set it in apps/admin/.env to load the tenant's SSO config."
    : result && !result.ok && result.status !== 404
      ? `SSO service unreachable: ${result.error ?? 'unknown error'}`
      : null;

  const status = config?.status ?? 'draft';
  const protocol = config?.protocol ?? 'saml';

  return (
    <section aria-labelledby="sso-heading" className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-2">
        <h1 id="sso-heading" className="text-2xl font-semibold tracking-tight">
          SSO configuration
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Manage the tenant&apos;s SAML 2.0 / OIDC enterprise authentication. Per{' '}
          <code>infra/SSO-SAML-Enterprise-Spec-v0.md</code> §5.
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

      {tenantId && (
        <div className="space-y-4">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="font-medium text-neutral-600 dark:text-neutral-400">Tenant id</dt>
              <dd className="font-mono text-xs">{tenantId}</dd>
            </div>
            <div>
              <dt className="font-medium text-neutral-600 dark:text-neutral-400">Status</dt>
              <dd>
                <StatusPill value={status} />
              </dd>
            </div>
            <div>
              <dt className="font-medium text-neutral-600 dark:text-neutral-400">Protocol</dt>
              <dd className="font-mono text-xs uppercase">{protocol}</dd>
            </div>
            <div>
              <dt className="font-medium text-neutral-600 dark:text-neutral-400">SP metadata</dt>
              <dd>
                <a
                  href="/admin/sso/metadata"
                  className="text-blue-700 underline hover:text-blue-900"
                >
                  Download SP metadata XML
                </a>
              </dd>
            </div>
          </dl>

          <SsoForm config={config} />
        </div>
      )}
    </section>
  );
}

function StatusPill({ value }: { value: string }) {
  const tone =
    value === 'active'
      ? 'bg-emerald-100 text-emerald-800'
      : value === 'test_mode'
        ? 'bg-amber-100 text-amber-800'
        : value === 'disabled'
          ? 'bg-red-100 text-red-800'
          : 'bg-neutral-100 text-neutral-800';
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium uppercase ${tone}`}>{value}</span>
  );
}
