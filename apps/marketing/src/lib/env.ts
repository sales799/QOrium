import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  CONTACT_TO_EMAIL: z.string().email().default('hello@qorium.in'),
  CONTACT_FROM_EMAIL: z.string().email().default('noreply@qorium.in'),
  GMAIL_USER: z.string().optional(),
  GMAIL_APP_PASSWORD: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env['NEXT_PUBLIC_SITE_URL'],
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: process.env['NEXT_PUBLIC_PLAUSIBLE_DOMAIN'],
  RESEND_API_KEY: process.env['RESEND_API_KEY'],
  CONTACT_TO_EMAIL: process.env['CONTACT_TO_EMAIL'],
  CONTACT_FROM_EMAIL: process.env['CONTACT_FROM_EMAIL'],
  GMAIL_USER: process.env['GMAIL_USER'],
  GMAIL_APP_PASSWORD: process.env['GMAIL_APP_PASSWORD'],
  UPSTASH_REDIS_REST_URL: process.env['UPSTASH_REDIS_REST_URL'],
  UPSTASH_REDIS_REST_TOKEN: process.env['UPSTASH_REDIS_REST_TOKEN'],
});

if (!parsed.success) {
  console.error('[env] Invalid environment variables:', parsed.error.flatten().fieldErrors);
}

export const env = parsed.success
  ? parsed.data
  : {
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
      NEXT_PUBLIC_PLAUSIBLE_DOMAIN: undefined,
      RESEND_API_KEY: undefined,
      CONTACT_TO_EMAIL: 'hello@qorium.in',
      CONTACT_FROM_EMAIL: 'noreply@qorium.in',
      GMAIL_USER: undefined,
      GMAIL_APP_PASSWORD: undefined,
      UPSTASH_REDIS_REST_URL: undefined,
      UPSTASH_REDIS_REST_TOKEN: undefined,
    };

export const isMailerConfigured =
  Boolean(env.RESEND_API_KEY) || Boolean(env.GMAIL_USER && env.GMAIL_APP_PASSWORD);
