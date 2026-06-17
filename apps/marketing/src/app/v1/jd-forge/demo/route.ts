import { z } from 'zod';

import { runJdForgeDemo, runJdForgeFromJobTitle } from '@/content/interactive-proof';
import { ok, problem, rateLimitResponse, readJsonBody } from '../../_proof-response';

const DemoBodySchema = z
  .object({
    jd_text: z.string().min(20).max(12_000).optional(),
    job_title: z.string().min(3).max(160).optional(),
  })
  .refine((body) => Boolean(body.jd_text || body.job_title), {
    message: 'Body must include jd_text or job_title.',
  });

export async function POST(request: Request) {
  const limited =
    rateLimitResponse(request, 'jd-demo-minute', { max: 10, windowMs: 60 * 1000 }) ??
    rateLimitResponse(request, 'jd-demo-day', { max: 100, windowMs: 24 * 60 * 60 * 1000 });
  if (limited) return limited;

  const parsed = DemoBodySchema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    return problem(
      400,
      'Bad Request',
      'Body must include jd_text between 20 and 12000 characters or job_title between 3 and 160 characters.',
    );
  }

  const demo = parsed.data.jd_text
    ? runJdForgeDemo(parsed.data.jd_text)
    : runJdForgeFromJobTitle(parsed.data.job_title!);
  return ok(demo);
}
