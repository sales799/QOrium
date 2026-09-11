export {
  parseApiKey,
  hashApiKey,
  timingSafeEqualHex,
  lookupApiKey,
  touchLastUsed,
  InvalidApiKeyFormatError,
} from './api-key.js';
export type { ApiKeyFamily, ParsedApiKey, ApiKeyRow } from './api-key.js';

export { recordAuditEvent } from './audit.js';
export type { AuditEvent, RecordAuditOptions } from './audit.js';

export { canonicalAuditEventJson, computeAuditHash, verifyAuditChain } from './audit-hash.js';
export type { HashableAuditEvent, ChainEvent, ChainVerificationResult } from './audit-hash.js';

export { createRedisRateLimiter, createMemoryRateLimiter } from './rate-limit.js';
export type { RateLimitConfig, RateLimiterAbstract, RateLimiterRes } from './rate-limit.js';

export { apiKeyAuth } from './middleware.js';
export type { ApiKeyAuthOptions } from './middleware.js';
export type { AuthContext, AuthenticatedRequest } from './types.js';

export {
  verifyRecruiterToken,
  signRecruiterToken,
  hashRecruiterSessionId,
  InvalidRecruiterSession,
  RECRUITER_AUDIENCE,
  PASSWORD_ISSUER,
  SAML_ISSUER,
} from './recruiter-session.js';
export type {
  RecruiterMethod,
  RecruiterTokenClaims,
  RecruiterSigningKeys,
} from './recruiter-session.js';
