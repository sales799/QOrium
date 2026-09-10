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
  if (![payload.recruiterId, payload.email, payload.orgId, payload.jti].every(isNonEmptyString) ||
      !Array.isArray(payload.scopes) || payload.scopes.length > 64 || !payload.scopes.every(isNonEmptyString)) {
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
  const payload = verifyToken<SignedAssessmentPayload>(token, secret);
  if (!isNonEmptyString(payload.assessmentId)) throw new Error("Malformed assessment token payload");
  return payload;
}

function signToken(payload: object, secret: string) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${signature}`;
}

function verifyToken<T extends { exp: number }>(token: string, secret: string): T {
  if (typeof token !== "string" || token.length > 8192) throw new Error("Malformed token");
  const parts = token.split(".");
  const [body, signature] = parts;
  if (parts.length !== 2 || !body || !signature || !/^[A-Za-z0-9_-]+$/.test(body) || !/^[A-Za-z0-9_-]{43}$/.test(signature)) {
    throw new Error("Malformed token");
  }
  const decoded = Buffer.from(body, "base64url");
  if (decoded.toString("base64url") !== body) throw new Error("Malformed token encoding");
  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) throw new Error("Invalid token signature");
  let payload: unknown;
  try { payload = JSON.parse(decoded.toString("utf8")); }
  catch { throw new Error("Malformed token payload"); }
  if (!payload || typeof payload !== "object" || Array.isArray(payload) || !("exp" in payload) ||
      typeof payload.exp !== "number" || !Number.isSafeInteger(payload.exp)) {
    throw new Error("Malformed token expiry");
  }
  if (payload.exp <= Date.now()) throw new Error("Token expired");
  return payload as T;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= 512;
}

function getSigningSecret() {
  const value = process.env.QORIUM_SIGNING_SECRET;
  if (process.env.NODE_ENV === "production") return requiredProductionSecret("QORIUM_SIGNING_SECRET", value);
  return value ?? "dev-only-change-me";
}

function getRecruiterJwtSecret() {
  const value = process.env.QORIUM_RECRUITER_JWT_SECRET;
  if (process.env.NODE_ENV === "production") return requiredProductionSecret("QORIUM_RECRUITER_JWT_SECRET", value);
  return value ?? getSigningSecret();
}

function requiredProductionSecret(name: string, value: string | undefined) {
  if (!value || value.trim().length < 32 || value === "dev-only-change-me") {
    throw new Error(`${name} must be explicitly configured with at least 32 characters in production`);
  }
  return value;
}

export function assertProductionSigningConfiguration() {
  if (process.env.NODE_ENV !== "production") return;
  if (getSigningSecret() === getRecruiterJwtSecret()) throw new Error("Production signing keys must be distinct");
}
