/**
 * Hand-written OpenAPI 3.1 fragments for each v0 service.
 * The docs site emits these as JSON for tooling integrations and
 * runs validation against them at test time.
 */

export interface OpenApiFragment {
  service: string;
  spec: Record<string, unknown>;
}

export const READYBANK_OPENAPI: OpenApiFragment = {
  service: 'readybank',
  spec: {
    openapi: '3.1.0',
    info: { title: 'QOrium ReadyBank API', version: '0.1.0' },
    servers: [{ url: 'https://api.qorium.online/v1' }],
    paths: {
      '/questions': {
        get: {
          summary: 'List questions',
          parameters: [
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 200 } },
            { name: 'offset', in: 'query', schema: { type: 'integer', minimum: 0 } },
            {
              name: 'sku',
              in: 'query',
              schema: { type: 'string', enum: ['readybank', 'jd_forge', 'stack_vault'] },
            },
            { name: 'status', in: 'query', schema: { type: 'string' } },
          ],
          responses: {
            '200': {
              description: 'Paginated list',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/QuestionList' } },
              },
            },
          },
        },
      },
      '/questions/{id}': {
        get: {
          summary: 'Get a single question',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Question' } },
        },
      },
    },
    components: {
      schemas: {
        QuestionList: {
          type: 'object',
          required: ['items', 'limit', 'offset'],
          properties: {
            items: { type: 'array' },
            limit: { type: 'integer' },
            offset: { type: 'integer' },
            total: { type: 'integer' },
          },
        },
      },
    },
  },
};

export const WEBHOOKS_OPENAPI: OpenApiFragment = {
  service: 'webhooks',
  spec: {
    openapi: '3.1.0',
    info: { title: 'QOrium Webhooks API', version: '0.1.0' },
    paths: {
      '/v1/webhooks/subscriptions': {
        get: { summary: 'List subscriptions', responses: { '200': { description: 'OK' } } },
        post: { summary: 'Create subscription', responses: { '201': { description: 'Created' } } },
      },
      '/v1/webhooks/subscriptions/{id}': {
        get: { summary: 'Get subscription', responses: { '200': { description: 'OK' } } },
        patch: { summary: 'Toggle is_active', responses: { '200': { description: 'OK' } } },
        delete: {
          summary: 'Delete subscription',
          responses: { '204': { description: 'No Content' } },
        },
      },
    },
  },
};

export const SSO_OPENAPI: OpenApiFragment = {
  service: 'sso',
  spec: {
    openapi: '3.1.0',
    info: { title: 'QOrium SSO API', version: '0.1.0' },
    paths: {
      '/v1/auth/saml/metadata': {
        get: { summary: 'Download SP metadata XML', responses: { '200': { description: 'XML' } } },
      },
      '/v1/auth/saml/acs': {
        post: { summary: 'Process SAML assertion', responses: { '200': { description: 'JWT' } } },
      },
      '/v1/auth/logout': {
        post: {
          summary: 'Logout (drop client cookie)',
          responses: { '200': { description: 'OK' } },
        },
      },
      '/v1/sso/configurations': {
        get: { summary: 'Read tenant SSO config', responses: { '200': { description: 'OK' } } },
        put: { summary: 'Upsert tenant SSO config', responses: { '200': { description: 'OK' } } },
      },
    },
  },
};

export const AUDIT_OPENAPI: OpenApiFragment = {
  service: 'audit-log',
  spec: {
    openapi: '3.1.0',
    info: { title: 'QOrium Audit Log API', version: '0.1.0' },
    paths: {
      '/v1/audit/events': {
        get: { summary: 'List audit events', responses: { '200': { description: 'OK' } } },
      },
      '/v1/audit/events/{id}': {
        get: { summary: 'Get a single event', responses: { '200': { description: 'OK' } } },
      },
      '/v1/audit/summary': {
        get: { summary: 'Top-N action counts', responses: { '200': { description: 'OK' } } },
      },
    },
  },
};

export const ALL_FRAGMENTS: OpenApiFragment[] = [
  READYBANK_OPENAPI,
  WEBHOOKS_OPENAPI,
  SSO_OPENAPI,
  AUDIT_OPENAPI,
];

/** Returns true iff every fragment has the required OpenAPI 3.1 top-level keys. */
export function isValidFragment(f: OpenApiFragment): boolean {
  if (!f.spec || typeof f.spec !== 'object') return false;
  const s = f.spec as Record<string, unknown>;
  if (typeof s.openapi !== 'string' || !s.openapi.startsWith('3.')) return false;
  if (typeof s.info !== 'object' || s.info === null) return false;
  const info = s.info as Record<string, unknown>;
  if (typeof info.title !== 'string' || typeof info.version !== 'string') return false;
  if (typeof s.paths !== 'object' || s.paths === null) return false;
  return true;
}
