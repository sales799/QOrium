import { NextResponse } from 'next/server';
import { z } from 'zod';
import { signA4Token, newJti } from '@/lib/a4-token';

// POST /api/send-pack
//
// Issues a signed assessment-URL that the employer copies to the candidate.
// At v0 we do NOT persist an invitation row — the token itself is the
// invite. Migration 0015 (content.invitations) will add persistence; the
// token format stays stable so the wire contract does not change.
//
// Inputs are intentionally minimal: tenant_id is read from env; the caller
// supplies (candidate_id, question_id) and we mint the URL.

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SendPackBody = z.object({
  candidate_id: z.string().min(1).max(128),
  question_id: z.string().uuid(),
  skill_id: z.string().uuid().optional(),
  // candidate_email / candidate_name accepted for forward-compat (0015) but
  // ignored by the v0 token. We do not bake PII into the token.
  candidate_email: z.string().email().optional(),
  candidate_name: z.string().max(256).optional(),
  ttl_hours: z
    .number()
    .int()
    .min(1)
    .max(24 * 14)
    .optional(),
});

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v || v.length === 0) throw new Error(`missing env: ${name}`);
  return v;
}

export async function POST(req: Request): Promise<NextResponse> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const parsed = SendPackBody.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_body', violations: parsed.error.flatten() },
      { status: 400 },
    );
  }

  let secret: string;
  let tenantId: string;
  let portalBase: string;
  try {
    secret = requireEnv('A4_TOKEN_SECRET');
    tenantId = requireEnv('ADMIN_DEFAULT_TENANT_ID');
    portalBase = process.env.CANDIDATE_PORTAL_BASE_URL ?? 'http://127.0.0.1:5116';
  } catch (err) {
    return NextResponse.json(
      { error: 'server_misconfigured', detail: (err as Error).message },
      { status: 500 },
    );
  }

  const ttlSeconds = (parsed.data.ttl_hours ?? 7 * 24) * 3600;
  const token = signA4Token(
    {
      jti: newJti(),
      question_id: parsed.data.question_id,
      candidate_id: parsed.data.candidate_id,
      tenant_id: tenantId,
      ...(parsed.data.skill_id ? { skill_id: parsed.data.skill_id } : {}),
      country: 'IN',
    },
    { secret, ttlSeconds },
  );

  const url = `${portalBase.replace(/\/+$/, '')}/assessment/${encodeURIComponent(token)}`;
  return NextResponse.json(
    {
      assessment_url: url,
      candidate_id: parsed.data.candidate_id,
      question_id: parsed.data.question_id,
      tenant_id: tenantId,
      region: 'IN',
      expires_in_seconds: ttlSeconds,
    },
    { status: 201 },
  );
}
