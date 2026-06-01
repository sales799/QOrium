import { z } from 'zod';

import { getSamplePack, signedSamplePackToken } from '@/content/interactive-proof';
import { sendMail, type MailResult } from '@/lib/mailer';
import { ok, problem, rateLimitResponse, readJsonBody } from '../../../_proof-response';

const UnlockSchema = z.object({
  email: z.string().email(),
  company: z.string().min(2).max(160),
  role: z.string().min(2).max(120),
});

type UnlockContext = {
  params: Promise<{ slug: string }>;
};

function testMail(): MailResult {
  return { ok: true, via: 'console' };
}

async function sendSamplePackCaptureEmail({
  email,
  company,
  role,
  packTitle,
  signedUrl,
}: {
  email: string;
  company: string;
  role: string;
  packTitle: string;
  signedUrl: string;
}) {
  if (process.env.NODE_ENV === 'test') {
    return { buyer: testMail(), internal: testMail() };
  }

  const buyer = await sendMail({
    to: email,
    subject: `Your QOrium sample pack: ${packTitle}`,
    text: [
      `Here is the gated QOrium sample pack you requested: ${packTitle}`,
      '',
      signedUrl,
      '',
      'The pack contains authored preview and gated items with calibration status shown honestly.',
    ].join('\n'),
  });
  if (!buyer.ok) return { buyer, internal: buyer };

  const internal = await sendMail({
    subject: `[Qorium] Sample-pack proof capture - ${company}`,
    replyTo: email,
    text: [
      'Sample-pack public proof capture',
      '',
      `Email: ${email}`,
      `Company: ${company}`,
      `Role: ${role}`,
      `Pack: ${packTitle}`,
      `Signed URL: ${signedUrl}`,
    ].join('\n'),
  });

  return { buyer, internal };
}

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

  const emailToken = signedSamplePackToken(slug, parsed.data.email);
  const signedPath = `/v1/sample-packs/${slug}/pdf?token=${emailToken}`;
  const signedUrl = new URL(signedPath, request.url).toString();
  const delivery = await sendSamplePackCaptureEmail({
    email: parsed.data.email,
    company: parsed.data.company,
    role: parsed.data.role,
    packTitle: pack.title,
    signedUrl,
  });
  if (!delivery.buyer.ok || !delivery.internal.ok) {
    return problem(
      502,
      'Email Delivery Failed',
      'The sample-pack request could not be queued through the configured mailer.',
    );
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
    emailToken,
    pdfUrl: signedPath,
    mailer: {
      buyer: delivery.buyer.via,
      internal: delivery.internal.via,
    },
  });
}
