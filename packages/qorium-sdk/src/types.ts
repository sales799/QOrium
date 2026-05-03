/**
 * Shared types for the QOrium TypeScript SDK.
 *
 * These mirror the JSON shapes returned by the v0 services so callers
 * can lift them straight from the wire into typed code.
 */

export type Sku = 'readybank' | 'jd_forge' | 'stack_vault';

export type QuestionFormat = 'mcq' | 'multi-select' | 'short-answer' | 'coding' | 'numeric';

export type QuestionStatus =
  | 'draft'
  | 'sme_review'
  | 'calibrating'
  | 'released'
  | 'sme_review_recalc'
  | 'deprecated';

export interface Question {
  id: string;
  uuid: string;
  sku: Sku;
  format: QuestionFormat;
  bodyMd: string;
  bodyJson: Record<string, unknown>;
  status: QuestionStatus;
  authoredBy: string;
  language: string;
  createdAt: string;
  releasedAt: string | null;
}

export interface Pagination {
  limit: number;
  offset: number;
  total?: number;
}

export interface ListResponse<T> extends Pagination {
  items: T[];
}

export interface ErrorBody {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
}

export interface JdForgeOrder {
  id: string;
  tenantId: string;
  tier: 'standard' | 'reviewed' | 'enterprise';
  jdText: string;
  jdHash: string;
  status: 'pending' | 'parsing' | 'generating' | 'reviewing' | 'completed' | 'failed';
  createdAt: string;
  completedAt: string | null;
}

export interface StackVaultBundle {
  id: string;
  tenantId: string;
  tier: string;
  librarySize: number;
  status: string;
  createdAt: string;
}

export interface WebhookSubscription {
  id: string;
  tenantId: string;
  eventType: string;
  endpointUrl: string;
  isActive: boolean;
  consecutiveFailures: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEvent {
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
