import { siteConfig } from '@/content/site.config';

export const dynamic = 'force-static';

// Minimal, honest OpenAPI 3.1 description of the public QOrium marketing API surface.
// The full product API (assessments, grading, ATS) is documented separately and gated;
// this spec covers only what is publicly reachable on qorium.online.
const spec = {
  openapi: '3.1.0',
  info: {
    title: 'QOrium Marketing API',
    version: '1.0.0',
    description:
      'Public endpoints exposed by the QOrium marketing site (qorium.online). The product assessment API is documented separately and requires access.',
    contact: { name: 'QOrium', url: `${siteConfig.url}/contact`, email: 'help@qorium.online' },
  },
  servers: [{ url: siteConfig.url }],
  paths: {
    '/api/health': {
      get: {
        operationId: 'getHealth',
        summary: 'Service health check',
        responses: {
          '200': {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    service: { type: 'string', example: 'qorium-marketing' },
                    version: { type: 'string' },
                    uptimeSeconds: { type: 'integer' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                  required: ['status', 'service', 'timestamp'],
                },
              },
            },
          },
        },
      },
    },
  },
} as const;

export function GET() {
  return new Response(JSON.stringify(spec, null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
}
