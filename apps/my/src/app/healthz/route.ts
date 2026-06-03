/**
 * Healthcheck endpoint — Setu's uptime monitor pings this on its 60s loop.
 */
export async function GET(): Promise<Response> {
  return new Response(JSON.stringify({ status: 'ok', service: 'qorium-my' }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
