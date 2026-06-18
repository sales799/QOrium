import { NextResponse } from 'next/server';

import {
  submitContactLead,
  submitDemoLead,
  type LeadSubmissionResult,
} from '@/lib/lead-submission';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const noStoreHeaders = { 'Cache-Control': 'no-store' };

function responseStatus(result: LeadSubmissionResult): number {
  if (result.ok) {
    return 200;
  }
  if (result.message.startsWith('Too many')) {
    return 429;
  }
  if (result.message.startsWith('Could not save')) {
    return 503;
  }
  return 400;
}

function json(result: LeadSubmissionResult, status = responseStatus(result)) {
  return NextResponse.json(result, { status, headers: noStoreHeaders });
}

export async function POST(request: Request) {
  let raw: Record<string, unknown>;

  try {
    raw = Object.fromEntries((await request.formData()).entries());
  } catch {
    return json({ ok: false, message: 'Could not read the form submission.' }, 400);
  }

  if (raw.intent === 'demo') {
    return json(await submitDemoLead(raw, { headers: request.headers }));
  }

  if (raw.intent === 'contact') {
    return json(await submitContactLead(raw, { headers: request.headers }));
  }

  return json({ ok: false, message: 'Unknown lead capture form.' }, 400);
}
