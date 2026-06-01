import { proxyChatbotJson, signLeadPayload } from '@/lib/chatbot-proxy';

export async function POST(req: Request) {
  const payload = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const secret = process.env.CHATBOT_LEAD_HMAC_SECRET;
  const headers = secret ? { 'x-qor-signature': signLeadPayload(payload, secret) } : {};
  const proxied = await proxyChatbotJson('/v1/chatbot/leadCapture', payload, headers);
  return Response.json(proxied.body, { status: proxied.status });
}
