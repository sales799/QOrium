import { createHmac } from 'node:crypto';

type JsonObject = Record<string, unknown>;

export function chatbotServiceUrl(raw: string | undefined = process.env.CHATBOT_SERVICE_URL) {
  return (raw ?? 'http://localhost:5105').replace(/\/+$/, '');
}

export function signLeadPayload(payload: JsonObject, secret: string): string {
  return createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
}

export async function proxyChatbotJson(
  path: string,
  payload: JsonObject,
  headers: HeadersInit = {},
) {
  const res = await fetch(`${chatbotServiceUrl()}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const body = (await res.json().catch(() => ({
    ok: false,
    data: null,
    error: { code: 'bad_gateway', message: 'Chatbot service returned invalid JSON.' },
  }))) as unknown;

  return { status: res.status, body };
}
