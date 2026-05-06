'use server';

import { revalidatePath } from 'next/cache';
import {
  createSubscription,
  deleteSubscription,
  setSubscriptionActive,
} from '@/lib/clients/webhooks';
import { resolveAdminTenantId } from '@/lib/tenant';

export interface WebhookActionState {
  status: 'idle' | 'success' | 'error';
  message?: string;
  signingSecret?: string;
  subscriptionId?: string;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function readString(formData: FormData, key: string): string | undefined {
  const v = formData.get(key);
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

export async function createSubscriptionAction(
  _prev: WebhookActionState,
  formData: FormData,
): Promise<WebhookActionState> {
  const tenantId = resolveAdminTenantId();
  if (!tenantId) return { status: 'error', message: 'ADMIN_DEFAULT_TENANT_ID is not configured.' };

  const eventType = readString(formData, 'event_type') ?? '*';
  const endpointUrl = readString(formData, 'endpoint_url');
  if (!endpointUrl) return { status: 'error', message: 'endpoint_url is required.' };

  const result = await createSubscription(tenantId, {
    event_type: eventType,
    endpoint_url: endpointUrl,
  });
  if (!result.ok) {
    return { status: 'error', message: result.error ?? `HTTP ${result.status}` };
  }
  revalidatePath('/admin/webhooks');
  const out: WebhookActionState = {
    status: 'success',
    message: 'Subscription created. Copy the signing secret now — it is shown only once.',
  };
  if (result.body?.signing_secret) out.signingSecret = result.body.signing_secret;
  if (result.body?.subscription?.id) out.subscriptionId = result.body.subscription.id;
  return out;
}

export async function toggleSubscriptionAction(
  _prev: WebhookActionState,
  formData: FormData,
): Promise<WebhookActionState> {
  const tenantId = resolveAdminTenantId();
  if (!tenantId) return { status: 'error', message: 'ADMIN_DEFAULT_TENANT_ID is not configured.' };

  const id = readString(formData, 'id');
  if (!id || !UUID_REGEX.test(id)) return { status: 'error', message: 'Invalid subscription id.' };

  const desired = readString(formData, 'is_active') === 'true';
  const result = await setSubscriptionActive(tenantId, id, desired);
  if (!result.ok) return { status: 'error', message: result.error ?? `HTTP ${result.status}` };
  revalidatePath('/admin/webhooks');
  return {
    status: 'success',
    message: desired ? 'Activated.' : 'Deactivated.',
    subscriptionId: id,
  };
}

export async function deleteSubscriptionAction(
  _prev: WebhookActionState,
  formData: FormData,
): Promise<WebhookActionState> {
  const tenantId = resolveAdminTenantId();
  if (!tenantId) return { status: 'error', message: 'ADMIN_DEFAULT_TENANT_ID is not configured.' };

  const id = readString(formData, 'id');
  if (!id || !UUID_REGEX.test(id)) return { status: 'error', message: 'Invalid subscription id.' };

  const result = await deleteSubscription(tenantId, id);
  if (!result.ok) return { status: 'error', message: result.error ?? `HTTP ${result.status}` };
  revalidatePath('/admin/webhooks');
  return { status: 'success', message: 'Deleted.', subscriptionId: id };
}
