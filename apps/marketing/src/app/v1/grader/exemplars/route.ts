import { listGraderExemplars } from '@/content/interactive-proof';
import { ok } from '../../_proof-response';

export async function GET(request: Request) {
  const skill = new URL(request.url).searchParams.get('skill') ?? undefined;
  return ok(
    { exemplars: listGraderExemplars(skill) },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
      },
    },
  );
}
