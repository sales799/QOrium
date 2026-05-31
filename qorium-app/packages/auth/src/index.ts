import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export interface SignedAssessmentPayload {
  assessmentId: string;
  exp: number;
}

export interface SignedRecruiterPayload {
  recruiterId: string;
  email: string;
  orgId: string;
  scopes: string[];
  jti: string;
  exp: number;
}

export function signAssessmentLink(payload: SignedAssessmentPayload, secret = getSigningSecret()) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function signRecruiterToken(payload: Omit<SignedRecruiterPayload, "jti"> & { jti?: string }, secret = getRecruiterJwtSecret()) {
  return signToken({ ...payload, jti: payload.jti ?? randomUUID() }, secret);
}

export function verifyRecruiterToken(token: string, secret = getRecruiterJwtSecret()): SignedRecruiterPayload {
  const payload = verifyToken<SignedRecruiterPayload>(token, secret);
  if (!payload.recruiterId || !payload.email || !payload.orgId || !Array.isArray(payload.scopes) || !payload.jti) {
    throw new Error("Malformed recruiter token payload");
  }
  return payload;
}

export function recruiterCookie(token: string, maxAgeSeconds: number, secure = true) {
  return [
    `qor_rec=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    secure ? "Secure" : "",
    `Max-Age=${maxAgeSeconds}`
  ].filter(Boolean).join("; ");
}

export function clearRecruiterCookie(secure = true) {
  return [
    "qor_rec=; Path=/",
    "HttpOnly",
    "SameSite=Lax",
    secure ? "Secure" : "",
    "Max-Age=0"
  ].filter(Boolean).join("; ");
}

export function readCookie(source: string | undefined, name: string) {
  return source
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

export function verifyAssessmentToken(token: string, secret = getSigningSecret()): SignedAssessmentPayload {
  return verifyToken<SignedAssessmentPayload>(token, secret);
}

function signToken(payload: object, secret: string) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${signature}`;
}

function verifyToken<T extends { exp: number }>(token: string, secret: string): T {
  const [body, signature] = token.split(".");
  if (!body || !signature) throw new Error("Malformed assessment token");
  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    throw new Error("Invalid assessment token signature");
  }
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T;
  if (payload.exp < Date.now()) throw new Error("Assessment token expired");
  return payload;
}

function getSigningSecret() {
  return process.env.QORIUM_SIGNING_SECRET ?? "dev-only-change-me";
}

function getRecruiterJwtSecret() {
  return process.env.QORIUM_RECRUITER_JWT_SECRET ?? getSigningSecret();
}
