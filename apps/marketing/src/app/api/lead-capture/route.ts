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

function normalizeServerActionFields(raw: Record<string, unknown>): Record<string, unknown> {
  const normalized = { ...raw };

  for (const [key, value] of Object.entries(raw)) {
    const match = /^_\d+_(.+)$/.exec(key);
    if (match?.[1] && normalized[match[1]] === undefined) {
      normalized[match[1]] = value;
    }
  }

  return normalized;
}

export async function POST(request: Request) {
  let raw: Record<string, unknown>;

  try {
    raw = normalizeServerActionFields(Object.fromEntries((await request.formData()).entries()));
  } catch {
    return json({ ok: false, message: 'Could not read the form submission.' }, 400);
  }

  const intent = raw.intent ?? new URL(request.url).searchParams.get('intent');

  if (intent === 'demo') {
    return json(await submitDemoLead(raw, { headers: request.headers }));
  }

  if (intent === 'contact') {
    return json(await submitContactLead(raw, { headers: request.headers }));
  }

  return json({ ok: false, message: 'Unknown lead capture form.' }, 400);
}
