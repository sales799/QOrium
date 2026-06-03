/**
 * HMAC-SHA256 request signing helper per
 * `infra/API-Documentation-v0.md` §2.1.
 *
 *   message = `${method}\n${path}\n${body}\n${timestamp}`
 *   signature = HMAC_SHA256(message, secret)
 *
 * Pure logic; the caller is expected to attach the produced
 * `Authorization` + `X-QOR-Date` headers to the outbound request.
 */

import { createHmac } from 'node:crypto';

export interface SignRequestInputs {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  body: string;
  timestamp: string;
  credential: string;
  secret: string;
  /** Headers to include in SignedHeaders. Default `host;x-qor-date`. */
  signedHeaders?: string;
}

export interface SignedRequest {
  authorization: string;
  signedHeadersValue: string;
  signature: string;
}

export function signRequest(inputs: SignRequestInputs): SignedRequest {
  const signedHeaders = inputs.signedHeaders ?? 'host;x-qor-date';
  const message = `${inputs.method}\n${inputs.path}\n${inputs.body}\n${inputs.timestamp}`;
  const signature = createHmac('sha256', inputs.secret).update(message).digest('hex');
  const authorization = `QOR-HMAC-SHA256 Credential=${inputs.credential}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  return { authorization, signedHeadersValue: signedHeaders, signature };
}

export function isoTimestamp(now: Date = new Date()): string {
  return now.toISOString();
}
