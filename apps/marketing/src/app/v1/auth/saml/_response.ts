import { NextResponse } from 'next/server';

export function samlProblem(status: number, title: string, detail: string): NextResponse {
  return NextResponse.json(
    {
      ok: false,
      type: 'https://qorium.online/problems/saml-auth',
      title,
      status,
      detail,
    },
    {
      status,
      headers: {
        'Content-Type': 'application/problem+json',
        'Cache-Control': 'no-store',
      },
    },
  );
}
