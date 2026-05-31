import { NextResponse } from 'next/server';

type ApiContext = {
  params: Promise<{
    path?: string[];
  }>;
};

export async function GET(_request: Request, context: ApiContext) {
  const params = await context.params;
  const path = `/${params.path?.join('/') ?? ''}`;

  return NextResponse.json(
    {
      type: 'https://qorium.online/problems/not-found',
      title: 'API route not found',
      status: 404,
      detail: `No QOrium marketing API route exists at ${path}.`,
      instance: `/api${path}`,
    },
    {
      status: 404,
      headers: {
        'Content-Type': 'application/problem+json',
        'Cache-Control': 'no-store, max-age=0',
      },
    },
  );
}

export { GET as POST, GET as PUT, GET as PATCH, GET as DELETE };
