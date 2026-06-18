'use server';

import { headers } from 'next/headers';

import { submitDemoLead, type DemoResult } from '@/lib/lead-submission';

export type { DemoInput, DemoResult } from '@/lib/lead-submission';

export async function submitDemo(_prev: unknown, formData: FormData): Promise<DemoResult> {
  const raw = Object.fromEntries(formData.entries());
  const hdrs = await headers();
  return submitDemoLead(raw, { headers: hdrs });
}
