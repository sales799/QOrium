import { resolveAdminTenantId } from '@/lib/tenant';
import { listSubscriptions } from '@/lib/clients/webhooks';
import { CreateSubscriptionForm } from './_components/create-subscription';
import { SubscriptionRow } from './_components/subscription-row';

export const dynamic = 'force-dynamic';

export default async function WebhooksPage() {
  const tenantId = resolveAdminTenantId();
  const result = tenantId ? await listSubscriptions(tenantId) : null;
  const errorMessage = !tenantId
    ? 'ADMIN_DEFAULT_TENANT_ID is not configured. Set it in apps/admin/.env to load subscriptions.'
    : result && !result.ok
      ? `Webhooks service unreachable: ${result.error ?? 'unknown error'}`
      : null;
  const subscriptions = result?.ok ? (result.body?.subscriptions ?? []) : [];

  return (
    <section aria-labelledby="webhooks-heading" className="mx-auto max-w-5xl space-y-6">
      <header className="space-y-2">
        <h1 id="webhooks-heading" className="text-2xl font-semibold tracking-tight">
          Webhook subscriptions
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Outbound webhook endpoints for this tenant. Per{' '}
          <code>infra/Webhooks-Service-v0-Spec.md</code> §6 + §8. Signing secrets are returned{' '}
          <strong>once</strong> at creation; persist them yourself before closing the modal.
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
        <>
          <CreateSubscriptionForm />
          <div className="space-y-3">
            <h2 className="text-base font-semibold">
              Existing subscriptions ({subscriptions.length})
            </h2>
            {subscriptions.length === 0 && (
              <div
                role="status"
                className="rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500"
              >
                No subscriptions configured yet.
              </div>
            )}
            <ul className="space-y-2">
              {subscriptions.map((s) => (
                <li key={s.id}>
                  <SubscriptionRow subscription={s} />
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </section>
  );
}
