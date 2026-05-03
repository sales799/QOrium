/**
 * QOrium TypeScript SDK — entry point.
 *
 * Usage:
 *   import { QoriumClient, ReadyBankResource } from '@qorium/sdk';
 *
 *   const client = new QoriumClient({
 *     baseUrl: 'https://api.qorium.io/v1',
 *     apiKey: process.env.QORIUM_API_KEY,
 *     tenantId: '11111111-2222-3333-4444-555555555555',
 *   });
 *   const readyBank = new ReadyBankResource(client);
 *   const page = await readyBank.list({ limit: 50 });
 */

export { QoriumClient, QoriumApiError } from './client.js';
export type { ClientOptions, RequestOptions } from './client.js';

export {
  ReadyBankResource,
  JdForgeResource,
  StackVaultResource,
  WebhooksResource,
  AuditLogResource,
} from './resources.js';

export { signRequest, isoTimestamp } from './signing.js';
export type { SignRequestInputs, SignedRequest } from './signing.js';

export type {
  Sku,
  Question,
  QuestionFormat,
  QuestionStatus,
  Pagination,
  ListResponse,
  ErrorBody,
  JdForgeOrder,
  StackVaultBundle,
  WebhookSubscription,
  AuditEvent,
} from './types.js';
