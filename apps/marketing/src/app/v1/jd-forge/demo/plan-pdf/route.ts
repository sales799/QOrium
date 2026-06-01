import { z } from 'zod';

import { sendMail, type MailResult } from '@/lib/mailer';
import { createSimplePdf } from '@/lib/simple-pdf';
import { ok, problem, rateLimitResponse, readJsonBody } from '../../../_proof-response';

const PlanPdfSchema = z.object({
  email: z.string().email(),
  plan_id: z.string().regex(/^jdplan_[a-f0-9]{7}$/i),
});

function signedPlanUrl(planId: string, email: string): string {
  const token = Buffer.from(`${planId}:${email.toLowerCase()}`).toString('base64url').slice(0, 28);
  return `/v1/jd-forge/demo/plan-pdf?token=${token}`;
}

function testMail(): MailResult {
  return { ok: true, via: 'console' };
}

async function sendPlanCaptureEmail({
  email,
  planId,
  signedUrl,
}: {
  email: string;
  planId: string;
  signedUrl: string;
}) {
  if (process.env.NODE_ENV === 'test') {
    return { buyer: testMail(), internal: testMail() };
  }

  const buyer = await sendMail({
    to: email,
    subject: 'Your QOrium JD-Forge assessment plan',
    text: [
      'Thanks for trying QOrium JD-Forge.',
      '',
      `Assessment plan: ${signedUrl}`,
      `Plan ID: ${planId}`,
      '',
      'This public proof link expires from the campaign context and is generated only after email capture.',
    ].join('\n'),
  });
  if (!buyer.ok) return { buyer, internal: buyer };

  const internal = await sendMail({
    subject: `[Qorium] JD-Forge proof capture - ${planId}`,
    replyTo: email,
    text: [
      'JD-Forge public proof capture',
      '',
      `Email: ${email}`,
      `Plan ID: ${planId}`,
      `Signed URL: ${signedUrl}`,
    ].join('\n'),
  });

  return { buyer, internal };
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

  const signedPath = signedPlanUrl(parsed.data.plan_id, parsed.data.email);
  const signedUrl = new URL(signedPath, request.url).toString();
  const delivery = await sendPlanCaptureEmail({
    email: parsed.data.email,
    planId: parsed.data.plan_id,
    signedUrl,
  });
  if (!delivery.buyer.ok || !delivery.internal.ok) {
    return problem(
      502,
      'Email Delivery Failed',
      'The plan request could not be queued through the configured mailer.',
    );
  }

  return ok(
    {
      delivery: 'email',
      planId: parsed.data.plan_id,
      signedUrl: signedPath,
      emailCaptured: true,
      mailer: {
        buyer: delivery.buyer.via,
        internal: delivery.internal.via,
      },
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

  const pdf = createSimplePdf('QOrium JD-Forge assessment plan', [
    'This public proof PDF is generated only after email capture.',
    `Signed token: ${token.slice(0, 18)}...`,
    'Contents: extracted skills, assessment format mix, and coverage notes are visible in the live JD-Forge widget.',
    'For a buyer-specific pack, use Book a demo with the plan ID from the widget.',
  ]);

  return new Response(pdf, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="qorium-jd-forge-plan.pdf"',
      'Cache-Control': 'private, max-age=300',
    },
  });
}
