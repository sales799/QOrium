import { callService, resolveServiceUrls, type FetchOptions, type FetchResult } from './services';

export interface AuditEventDto {
  id: string;
  tenantId: string | null;
  actorId: string | null;
  actorType: string;
  action: string;
  resourceType: string | null;
  resourceId: string | null;
  changes: unknown;
  payload: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  occurredAt: string;
}

export interface ListEventsResponse {
  events: AuditEventDto[];
  total: number;
  limit: number;
  offset: number;
}

export interface ListEventsFilter {
  startDate?: string;
  endDate?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  actorId?: string;
  limit?: number;
  offset?: number;
}

function toQuery(filter: ListEventsFilter): string {
  const params = new URLSearchParams();
  if (filter.startDate) params.set('start_date', filter.startDate);
  if (filter.endDate) params.set('end_date', filter.endDate);
  if (filter.action) params.set('action', filter.action);
  if (filter.resourceType) params.set('resource_type', filter.resourceType);
  if (filter.resourceId) params.set('resource_id', filter.resourceId);
  if (filter.actorId) params.set('actor_id', filter.actorId);
  if (filter.limit !== undefined) params.set('limit', String(filter.limit));
  if (filter.offset !== undefined) params.set('offset', String(filter.offset));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function listEvents(
  tenantId: string,
  filter: ListEventsFilter = {},
  opts?: FetchOptions,
): Promise<FetchResult<ListEventsResponse>> {
  return callService<ListEventsResponse>(
    resolveServiceUrls().auditLog,
    `/v1/audit/events${toQuery(filter)}`,
    { tenantId, ...opts },
  );
}

export interface SummaryResponse {
  window: { start: string | null; end: string | null };
  top: { action: string; count: number }[];
}

export function getSummary(
  tenantId: string,
  filter: { startDate?: string; endDate?: string; topN?: number } = {},
  opts?: FetchOptions,
): Promise<FetchResult<SummaryResponse>> {
  const params = new URLSearchParams();
  if (filter.startDate) params.set('start_date', filter.startDate);
  if (filter.endDate) params.set('end_date', filter.endDate);
  if (filter.topN !== undefined) params.set('top', String(filter.topN));
  const qs = params.toString();
  return callService<SummaryResponse>(
    resolveServiceUrls().auditLog,
    `/v1/audit/summary${qs ? `?${qs}` : ''}`,
    { tenantId, ...opts },
  );
}

export function getEvent(
  tenantId: string,
  id: string,
  opts?: FetchOptions,
): Promise<FetchResult<AuditEventDto>> {
  return callService<AuditEventDto>(resolveServiceUrls().auditLog, `/v1/audit/events/${id}`, {
    tenantId,
    ...opts,
  });
}
