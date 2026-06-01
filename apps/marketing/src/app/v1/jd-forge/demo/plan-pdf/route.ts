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

  return new Response(renderPlanPdf(token), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="qorium-jd-forge-plan.pdf"',
      'Cache-Control': 'private, max-age=300',
    },
  });
}

function renderPlanPdf(token: string): string {
  const issuedAt = new Date().toISOString();
  const lines = [
    'QOrium JD-Forge Assessment Plan',
    'This gated buyer artifact summarizes the live demo output contract.',
    `Token: ${token.slice(0, 12)}...`,
    `Issued: ${issuedAt}`,
    'Sections: skill extraction, assessment blueprint, calibration status, and recruiter handoff.',
  ];
  const content = [
    'BT',
    '/F1 16 Tf',
    '72 760 Td',
    ...lines.map((line, index) =>
      index === 0 ? `(${escapePdfText(line)}) Tj` : `0 -26 Td (${escapePdfText(line)}) Tj`,
    ),
    'ET',
  ].join('\n');
  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    `5 0 obj << /Length ${content.length} >> stream\n${content}\nendstream endobj`,
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  }
  const xrefAt = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (const offset of offsets.slice(1)) {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF\n`;
  return pdf;
}

function escapePdfText(value: string): string {
  return value.replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)');
}
