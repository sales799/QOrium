import { proxyChatbotJson } from '@/lib/chatbot-proxy';

export async function POST(req: Request) {
  const payload = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const proxied = await proxyChatbotJson('/v1/chatbot/message', payload);
  return Response.json(proxied.body, { status: proxied.status });
}
