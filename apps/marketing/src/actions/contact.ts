'use server';

import { headers } from 'next/headers';
import { z } from 'zod';
import { captureMarketingLead, recordMarketingLeadMailResult } from '@/lib/lead-capture';
import { sendMail } from '@/lib/mailer';
import { rateLimit } from '@/lib/rate-limit';

export const ContactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  email: z.string().email('Valid email is required'),
  company: z.string().max(120).optional(),
  role: z.string().max(80).optional(),
  message: z.string().min(10, 'Tell us a little more').max(4000),
  // Honeypot field — must be empty
  website: z.string().max(0, 'spam').optional(),
});

export type ContactInput = z.infer<typeof ContactSchema>;

export type ContactResult =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export async function submitContact(_prev: unknown, formData: FormData): Promise<ContactResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = ContactSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Please correct the highlighted fields.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // Rate limit by IP
  const hdrs = await headers();
  const ip =
    hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ?? hdrs.get('x-real-ip') ?? 'unknown';
  const userAgent = hdrs.get('user-agent') ?? undefined;
  const rl = rateLimit(`contact:${ip}`, { max: 5, windowMs: 60 * 60 * 1000 });
  if (!rl.allowed) {
    return {
      ok: false,
      message: 'Too many submissions. Try again later.',
    };
  }

  const { name, email, company, role, message } = parsed.data;
  const lead = await captureMarketingLead({
    source: 'contact',
    name,
    email,
    ...(company ? { company } : {}),
    ...(role ? { role } : {}),
    message,
    ipAddress: ip,
    ...(userAgent ? { userAgent } : {}),
  });

  if (!lead.ok) {
    return {
      ok: false,
      message: 'Could not save your message right now. Please email us directly.',
    };
  }

  const subject = `[Qorium] Contact from ${name}${company ? ` (${company})` : ''}`;
  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    company ? `Company: ${company}` : null,
    role ? `Role: ${role}` : null,
    '',
    'Message:',
    message,
  ]
    .filter(Boolean)
    .join('\n');

  const result = await sendMail({ subject, text, replyTo: email });
  await recordMarketingLeadMailResult(lead.id, result);

  if (!result.ok) {
    return {
      ok: true,
      message: 'Thanks. Your message was saved; we will follow up directly.',
    };
  }

  return {
    ok: true,
    message:
      result.via === 'console'
        ? 'Thanks. (Mailer not configured in this environment — your message was logged for review.)'
        : 'Thanks. We will be in touch within one business day.',
  };
}
