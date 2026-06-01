import { getGraderExemplar } from '@/content/interactive-proof';
import { ok, problem } from '../../../_proof-response';

type ExemplarContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: ExemplarContext) {
  const { id } = await context.params;
  const exemplar = getGraderExemplar(id);
  if (!exemplar) {
    return problem(404, 'Not Found', `No public grader exemplar exists for ${id}.`);
  }

  return ok(exemplar, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
    },
  });
}
