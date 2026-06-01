import { z } from 'zod';

import { getGraderExemplar } from '@/content/interactive-proof';
import { ok, problem, rateLimitResponse, readJsonBody } from '../../../../_proof-response';

const FeedbackSchema = z.object({
  vote: z.enum(['up', 'down']),
});

type FeedbackContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: FeedbackContext) {
  const limited = rateLimitResponse(request, 'grader-feedback', {
    max: 30,
    windowMs: 60 * 60 * 1000,
  });
  if (limited) return limited;

  const { id } = await context.params;
  if (!getGraderExemplar(id)) {
    return problem(404, 'Not Found', `No public grader exemplar exists for ${id}.`);
  }

  const parsed = FeedbackSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    return problem(400, 'Bad Request', 'Body must include vote as up or down.');
  }

  return ok(
    {
      exemplarId: id,
      vote: parsed.data.vote,
      recorded: true,
      scoreChanged: false,
    },
    { status: 202 },
  );
}
