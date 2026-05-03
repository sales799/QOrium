import { callService, resolveServiceUrls, type FetchOptions, type FetchResult } from './services';

export interface WebhookSubscriptionDto {
  id: string;
  tenantId: string;
  eventType: string;
  endpointUrl: string;
  isActive: boolean;
  consecutiveFailures: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionResponse {
  subscription: WebhookSubscriptionDto;
  signing_secret: string;
}

export interface ListSubscriptionsResponse {
  count: number;
  subscriptions: WebhookSubscriptionDto[];
}

export function listSubscriptions(
  tenantId: string,
  opts?: FetchOptions,
): Promise<FetchResult<ListSubscriptionsResponse>> {
  return callService<ListSubscriptionsResponse>(
    resolveServiceUrls().webhooks,
    '/v1/webhooks/subscriptions',
    { tenantId, ...opts },
  );
}

export function createSubscription(
  tenantId: string,
  body: { event_type: string; endpoint_url: string },
  opts?: FetchOptions,
): Promise<FetchResult<CreateSubscriptionResponse>> {
  return callService<CreateSubscriptionResponse>(
    resolveServiceUrls().webhooks,
    '/v1/webhooks/subscriptions',
    { tenantId, method: 'POST', body, ...opts },
  );
}

export function setSubscriptionActive(
  tenantId: string,
  id: string,
  isActive: boolean,
  opts?: FetchOptions,
): Promise<FetchResult<WebhookSubscriptionDto>> {
  return callService<WebhookSubscriptionDto>(
    resolveServiceUrls().webhooks,
    `/v1/webhooks/subscriptions/${id}`,
    { tenantId, method: 'PATCH', body: { is_active: isActive }, ...opts },
  );
}

export function deleteSubscription(
  tenantId: string,
  id: string,
  opts?: FetchOptions,
): Promise<FetchResult<null>> {
  return callService<null>(resolveServiceUrls().webhooks, `/v1/webhooks/subscriptions/${id}`, {
    tenantId,
    method: 'DELETE',
    ...opts,
  });
}
