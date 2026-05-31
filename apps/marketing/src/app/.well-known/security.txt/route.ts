const body = `Contact: mailto:security@qorium.online
Preferred-Languages: en
Canonical: https://qorium.online/.well-known/security.txt
Policy: https://qorium.online/security
`;

export const dynamic = 'force-static';

export function GET() {
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
