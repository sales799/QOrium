/**
 * Typed resource accessors for each v0 service. Each method returns a
 * promise of the JSON shape exactly as the upstream service emits it.
 */

import type { QoriumClient } from './client.js';
import type {
  AuditEvent,
  JdForgeOrder,
  ListResponse,
  Question,
  StackVaultBundle,
  WebhookSubscription,
} from './types.js';

export class ReadyBankResource {
  constructor(private readonly client: QoriumClient) {}

  list(
    params: { limit?: number; offset?: number; sku?: string; status?: string } = {},
  ): Promise<ListResponse<Question>> {
    const qs = new URLSearchParams();
    if (params.limit !== undefined) qs.set('limit', String(params.limit));
    if (params.offset !== undefined) qs.set('offset', String(params.offset));
    if (params.sku) qs.set('sku', params.sku);
    if (params.status) qs.set('status', params.status);
    const tail = qs.toString();
    return this.client.get<ListResponse<Question>>(`/questions${tail ? `?${tail}` : ''}`);
  }

  get(id: string): Promise<Question> {
    return this.client.get<Question>(`/questions/${encodeURIComponent(id)}`);
  }
}

export class JdForgeResource {
  constructor(private readonly client: QoriumClient) {}

  createOrder(
    body: { jd_text: string; tier: 'standard' | 'reviewed' | 'enterprise' },
    opts: { idempotencyKey?: string } = {},
  ): Promise<JdForgeOrder> {
    const requestOpts: { idempotencyKey?: string } = {};
    if (opts.idempotencyKey !== undefined) requestOpts.idempotencyKey = opts.idempotencyKey;
    return this.client.post<JdForgeOrder>('/jd-forge/orders', body, requestOpts);
  }

  getOrder(id: string): Promise<JdForgeOrder> {
    return this.client.get<JdForgeOrder>(`/jd-forge/orders/${encodeURIComponent(id)}`);
  }
}

export class StackVaultResource {
  constructor(private readonly client: QoriumClient) {}

  list(): Promise<ListResponse<StackVaultBundle>> {
    return this.client.get<ListResponse<StackVaultBundle>>('/stack-vault/bundles');
  }
}

export class WebhooksResource {
  constructor(private readonly client: QoriumClient) {}

  list(): Promise<{ count: number; subscriptions: WebhookSubscription[] }> {
    return this.client.get('/webhooks/subscriptions');
  }

  create(body: {
    event_type: string;
    endpoint_url: string;
  }): Promise<{ subscription: WebhookSubscription; signing_secret: string }> {
    return this.client.post('/webhooks/subscriptions', body);
  }

  setActive(id: string, isActive: boolean): Promise<WebhookSubscription> {
    return this.client.patch(`/webhooks/subscriptions/${encodeURIComponent(id)}`, {
      is_active: isActive,
    });
  }

  delete(id: string): Promise<void> {
    return this.client.delete(`/webhooks/subscriptions/${encodeURIComponent(id)}`);
  }
}

export class AuditLogResource {
  constructor(private readonly client: QoriumClient) {}

  list(
    params: {
      startDate?: string;
      endDate?: string;
      action?: string;
      resourceType?: string;
      actorId?: string;
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<{ events: AuditEvent[]; total: number; limit: number; offset: number }> {
    const qs = new URLSearchParams();
    if (params.startDate) qs.set('start_date', params.startDate);
    if (params.endDate) qs.set('end_date', params.endDate);
    if (params.action) qs.set('action', params.action);
    if (params.resourceType) qs.set('resource_type', params.resourceType);
    if (params.actorId) qs.set('actor_id', params.actorId);
    if (params.limit !== undefined) qs.set('limit', String(params.limit));
    if (params.offset !== undefined) qs.set('offset', String(params.offset));
    const tail = qs.toString();
    return this.client.get(`/audit/events${tail ? `?${tail}` : ''}`);
  }

  get(id: string): Promise<AuditEvent> {
    return this.client.get<AuditEvent>(`/audit/events/${encodeURIComponent(id)}`);
  }

  summary(params: { startDate?: string; endDate?: string; topN?: number } = {}): Promise<{
    window: { start: string | null; end: string | null };
    top: { action: string; count: number }[];
  }> {
    const qs = new URLSearchParams();
    if (params.startDate) qs.set('start_date', params.startDate);
    if (params.endDate) qs.set('end_date', params.endDate);
    if (params.topN !== undefined) qs.set('top', String(params.topN));
    const tail = qs.toString();
    return this.client.get(`/audit/summary${tail ? `?${tail}` : ''}`);
  }
}
