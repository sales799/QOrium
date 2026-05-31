import { createHmac, timingSafeEqual } from "node:crypto";

export interface SignedAssessmentPayload {
  assessmentId: string;
  exp: number;
}

export function signAssessmentLink(payload: SignedAssessmentPayload, secret = getSigningSecret()) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function verifyAssessmentToken(token: string, secret = getSigningSecret()): SignedAssessmentPayload {
  const [body, signature] = token.split(".");
  if (!body || !signature) throw new Error("Malformed assessment token");
  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    throw new Error("Invalid assessment token signature");
  }
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SignedAssessmentPayload;
  if (payload.exp < Date.now()) throw new Error("Assessment token expired");
  return payload;
}

function getSigningSecret() {
  return process.env.QORIUM_SIGNING_SECRET ?? "dev-only-change-me";
}
