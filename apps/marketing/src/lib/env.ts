import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  CONTACT_TO_EMAIL: z.string().email().default('hello@qorium.in'),
  CONTACT_FROM_EMAIL: z.string().email().default('noreply@qorium.in'),
  // Microsoft Graph API (primary mailer)
  AZURE_TENANT_ID: z.string().optional(),
  AZURE_CLIENT_ID: z.string().optional(),
  AZURE_CLIENT_SECRET: z.string().optional(),
  M365_SENDER_EMAIL: z.string().email().optional(),
  // Legacy SMTP (kept for fallback)
  M365_SMTP_USER: z.string().optional(),
  M365_SMTP_PASS: z.string().optional(),
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
  AZURE_TENANT_ID: process.env['AZURE_TENANT_ID'],
  AZURE_CLIENT_ID: process.env['AZURE_CLIENT_ID'],
  AZURE_CLIENT_SECRET: process.env['AZURE_CLIENT_SECRET'],
  M365_SENDER_EMAIL: process.env['M365_SENDER_EMAIL'],
  M365_SMTP_USER: process.env['M365_SMTP_USER'],
  M365_SMTP_PASS: process.env['M365_SMTP_PASS'],
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
      AZURE_TENANT_ID: undefined,
      AZURE_CLIENT_ID: undefined,
      AZURE_CLIENT_SECRET: undefined,
      M365_SENDER_EMAIL: undefined,
      M365_SMTP_USER: undefined,
      M365_SMTP_PASS: undefined,
      GMAIL_USER: undefined,
      GMAIL_APP_PASSWORD: undefined,
      UPSTASH_REDIS_REST_URL: undefined,
      UPSTASH_REDIS_REST_TOKEN: undefined,
    };

export const isMailerConfigured =
  Boolean(
    env.AZURE_TENANT_ID && env.AZURE_CLIENT_ID && env.AZURE_CLIENT_SECRET && env.M365_SENDER_EMAIL,
  ) ||
  Boolean(env.M365_SMTP_USER && env.M365_SMTP_PASS) ||
  Boolean(env.RESEND_API_KEY) ||
  Boolean(env.GMAIL_USER && env.GMAIL_APP_PASSWORD);

export const mailerStatus = isMailerConfigured ? 'configured' : 'console-fallback';
