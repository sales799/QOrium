import { z } from 'zod';

import { captureMarketingLead, recordMarketingLeadMailResult } from '@/lib/lead-capture';
import { sendMail } from '@/lib/mailer';
import { rateLimit } from '@/lib/rate-limit';

export type LeadSubmissionResult =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

interface HeaderReader {
  get(name: string): string | null;
}

export interface LeadSubmissionRequestContext {
  headers: HeaderReader;
}

function emptyStringToUndefined(value: unknown): unknown {
  if (typeof value === 'string' && value.trim() === '') {
    return undefined;
  }
  return value;
}

const optionalText = (max: number) =>
  z.preprocess(emptyStringToUndefined, z.string().trim().max(max).optional());

const honeypot = z.preprocess(emptyStringToUndefined, z.string().max(0, 'spam').optional());

export const DemoSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  company: z.string().trim().min(1).max(120),
  role: optionalText(80),
  hiringVolume: z.preprocess(
    emptyStringToUndefined,
    z.enum(['<50', '50-500', '500-5000', '5000+']).optional(),
  ),
  primarySku: z.preprocess(
    emptyStringToUndefined,
    z.enum(['readybank', 'jd-forge', 'stack-vault', 'unsure']).optional(),
  ),
  message: optionalText(4000),
  website: honeypot,
});

export type DemoInput = z.infer<typeof DemoSchema>;
export type DemoResult = LeadSubmissionResult;

export const ContactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  email: z.string().trim().email('Valid email is required'),
  company: optionalText(120),
  role: optionalText(80),
  message: z.string().trim().min(10, 'Tell us a little more').max(4000),
  website: honeypot,
});

export type ContactInput = z.infer<typeof ContactSchema>;
export type ContactResult = LeadSubmissionResult;

function getRequester(context: LeadSubmissionRequestContext) {
  const forwardedFor = context.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = forwardedFor || context.headers.get('x-real-ip') || 'unknown';
  const userAgent = context.headers.get('user-agent') ?? undefined;
  return { ip, userAgent };
}

export async function submitDemoLead(
  raw: Record<string, unknown>,
  context: LeadSubmissionRequestContext,
): Promise<DemoResult> {
  const parsed = DemoSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Please correct the highlighted fields.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { ip, userAgent } = getRequester(context);
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

  const subject = `[Qorium] Demo request - ${company} (${name})`;
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
        ? 'Thanks. (Mailer not configured in this environment - your demo request was logged.)'
        : 'Thanks. We will reach out within one business day to schedule.',
  };
}

export async function submitContactLead(
  raw: Record<string, unknown>,
  context: LeadSubmissionRequestContext,
): Promise<ContactResult> {
  const parsed = ContactSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Please correct the highlighted fields.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { ip, userAgent } = getRequester(context);
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
        ? 'Thanks. (Mailer not configured in this environment - your message was logged for review.)'
        : 'Thanks. We will be in touch within one business day.',
  };
}
