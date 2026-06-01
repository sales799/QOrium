import { z } from 'zod';

import { getSamplePack, signedSamplePackToken } from '@/content/interactive-proof';
import { ok, problem, rateLimitResponse, readJsonBody } from '../../../_proof-response';

const UnlockSchema = z.object({
  email: z.string().email(),
  company: z.string().min(2).max(160),
  role: z.string().min(2).max(120),
});

type UnlockContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: Request, context: UnlockContext) {
  const limited = rateLimitResponse(request, 'sample-pack-unlock', {
    max: 12,
    windowMs: 60 * 60 * 1000,
  });
  if (limited) return limited;

  const { slug } = await context.params;
  const pack = getSamplePack(slug);
  if (!pack) {
    return problem(404, 'Not Found', `No public sample pack exists for ${slug}.`);
  }

  const parsed = UnlockSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    return problem(400, 'Bad Request', 'Body must include valid email, company, and role.');
  }

  return ok({
    pack,
    lead: {
      email: parsed.data.email,
      company: parsed.data.company,
      role: parsed.data.role,
      captured: true,
    },
    pdfDelivery: 'email',
    emailToken: signedSamplePackToken(slug, parsed.data.email),
  });
}
