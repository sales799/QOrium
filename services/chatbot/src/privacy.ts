import { createHash } from 'node:crypto';

const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_RE = /(?:\+?\d[\s-]?){8,15}\d/g;

export function redactPii(value: string): string {
  return value.replace(EMAIL_RE, '[email]').replace(PHONE_RE, '[phone]');
}

export function redactEmail(email: string): string {
  const [local = '', domain = ''] = email.split('@');
  const maskedLocal = local.length <= 2 ? `${local[0] ?? '*'}*` : `${local.slice(0, 2)}***`;
  return `${maskedLocal}@${domain}`;
}

export function hashValue(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}
