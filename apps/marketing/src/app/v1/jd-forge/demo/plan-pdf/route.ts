import { z } from 'zod';

import { ok, problem, rateLimitResponse, readJsonBody } from '../../../_proof-response';

const PlanPdfSchema = z.object({
  email: z.string().email(),
  plan_id: z.string().regex(/^jdplan_[a-f0-9]{7}$/i),
});

function signedPlanUrl(planId: string, email: string): string {
  const token = Buffer.from(`${planId}:${email.toLowerCase()}`).toString('base64url').slice(0, 28);
  return `/v1/jd-forge/demo/plan-pdf?token=${token}`;
}

export async function POST(request: Request) {
  const limited = rateLimitResponse(request, 'jd-demo-plan-pdf', {
    max: 10,
    windowMs: 60 * 60 * 1000,
  });
  if (limited) return limited;

  const parsed = PlanPdfSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    return problem(400, 'Bad Request', 'Body must include a valid email and jdplan_* plan_id.');
  }

  return ok(
    {
      delivery: 'email',
      planId: parsed.data.plan_id,
      signedUrl: signedPlanUrl(parsed.data.plan_id, parsed.data.email),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      note: 'The signed assessment-plan PDF link is generated only after email capture.',
    },
    { status: 202 },
  );
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token');
  if (!token) {
    return problem(
      403,
      'Forbidden',
      'Assessment-plan PDFs are email-gated and require a signed token.',
    );
  }

  return new Response('QOrium JD-Forge assessment plan PDF placeholder\n', {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="qorium-jd-forge-plan.pdf"',
      'Cache-Control': 'private, max-age=300',
    },
  });
}
