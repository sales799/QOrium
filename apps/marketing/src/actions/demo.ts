'use server';

import { headers } from 'next/headers';
import { z } from 'zod';
import { captureMarketingLead, recordMarketingLeadMailResult } from '@/lib/lead-capture';
import { sendMail } from '@/lib/mailer';
import { rateLimit } from '@/lib/rate-limit';

export const DemoSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  company: z.string().min(1).max(120),
  role: z.string().max(80).optional(),
  hiringVolume: z.enum(['<50', '50-500', '500-5000', '5000+']).optional(),
  primarySku: z.enum(['readybank', 'jd-forge', 'stack-vault', 'unsure']).optional(),
  message: z.string().max(4000).optional(),
  website: z.string().max(0).optional(), // honeypot
});

export type DemoInput = z.infer<typeof DemoSchema>;

export type DemoResult =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export async function submitDemo(_prev: unknown, formData: FormData): Promise<DemoResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = DemoSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Please correct the highlighted fields.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const hdrs = await headers();
  const ip =
    hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ?? hdrs.get('x-real-ip') ?? 'unknown';
  const userAgent = hdrs.get('user-agent') ?? undefined;
  const rl = rateLimit(`demo:${ip}`, { max: 5, windowMs: 60 * 60 * 1000 });
  if (!rl.allowed) {
    return { ok: false, message: 'Too many submissions. Try again later.' };
  }

  const { name, email, company, role, hiringVolume, primarySku, message } = parsed.data;
  const metadata: Record<string, string> = {};
  if (hiringVolume) {
    metadata.hiringVolume = hiringVolume;
  }
  if (primarySku) {
    metadata.primarySku = primarySku;
  }

  const lead = await captureMarketingLead({
    source: 'demo',
    name,
    email,
    company,
    ...(role ? { role } : {}),
    ...(message ? { message } : {}),
    ipAddress: ip,
    ...(userAgent ? { userAgent } : {}),
    metadata,
  });

  if (!lead.ok) {
    return {
      ok: false,
      message: 'Could not save your demo request right now. Please email us directly.',
    };
  }

  const subject = `[Qorium] Demo request — ${company} (${name})`;
  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Company: ${company}`,
    role ? `Role: ${role}` : null,
    hiringVolume ? `Hiring volume: ${hiringVolume}` : null,
    primarySku ? `Primary SKU: ${primarySku}` : null,
    '',
    'Message:',
    message ?? '(none)',
  ]
    .filter(Boolean)
    .join('\n');

  const result = await sendMail({ subject, text, replyTo: email });
  await recordMarketingLeadMailResult(lead.id, result);

  if (!result.ok) {
    return {
      ok: true,
      message: 'Thanks. Your demo request was saved; we will follow up directly.',
    };
  }

  return {
    ok: true,
    message:
      result.via === 'console'
        ? 'Thanks. (Mailer not configured in this environment — your demo request was logged.)'
        : 'Thanks. We will reach out within one business day to schedule.',
  };
}
