'use server';

import { headers } from 'next/headers';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';

const Schema = z.object({
  email: z.string().email('Enter a valid email address'),
  honeypot: z.string().max(0, 'spam').optional(),
});

export type NewsletterResult = { ok: true; message: string } | { ok: false; message: string };

export async function subscribeNewsletter(
  _prev: unknown,
  formData: FormData,
): Promise<NewsletterResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'Invalid email.' };
  }

  // Rate limit
  const hdrs = await headers();
  const ip =
    hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ?? hdrs.get('x-real-ip') ?? 'unknown';
  const rl = rateLimit(`newsletter:${ip}`, { max: 3, windowMs: 60 * 60 * 1000 });
  if (!rl.allowed) {
    return { ok: false, message: 'Too many attempts. Try again later.' };
  }

  const { email } = parsed.data;

  // Log subscriber — will be replaced with Resend audience API when account is restored
  console.log(`[newsletter] new subscriber: ${email} from ${ip} at ${new Date().toISOString()}`);

  return {
    ok: true,
    message: 'You’re in. We’ll send only the good stuff.',
  };
}
