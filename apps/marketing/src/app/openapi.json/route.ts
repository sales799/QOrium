import { publicOpenApiSpec } from '@/content/api-docs';

export function GET() {
  return Response.json(publicOpenApiSpec, {
    headers: {
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
    },
  });
}
