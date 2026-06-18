'use server';

import { headers } from 'next/headers';

import { submitContactLead, type ContactResult } from '@/lib/lead-submission';

export type { ContactInput, ContactResult } from '@/lib/lead-submission';

export async function submitContact(_prev: unknown, formData: FormData): Promise<ContactResult> {
  const raw = Object.fromEntries(formData.entries());
  const hdrs = await headers();
  return submitContactLead(raw, { headers: hdrs });
}
