const SECURITY_TXT = `Contact: mailto:security@talpro.in
Expires: 2027-05-31T00:00:00Z
Preferred-Languages: en
Canonical: https://app.qorium.online/.well-known/security.txt
Policy: https://qorium.online/privacy
`;

export function GET() {
  return new Response(SECURITY_TXT, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600"
    }
  });
}
