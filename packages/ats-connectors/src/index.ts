export type {
  AtsConnector,
  AtsPlatform,
  AssessmentResult,
  AssessmentStatus,
  Candidate,
  IntegrationCredentials,
  InboundEvent,
  InboundWebhook,
  Job,
  PostScoreInput,
  PostScoreOutcome,
  SignatureVerificationResult,
} from './types.js';

export { ConnectorRegistry } from './registry.js';
export { computeHmacSignature, verifyHmacSignature, type HmacVerifyOptions } from './signature.js';
export {
  deriveIdempotencyKey,
  InMemoryIdempotencyCache,
  type DeriveKeyInputs,
} from './idempotency.js';

export { GreenhouseAdapter, type GreenhouseAdapterOptions } from './adapters/greenhouse.js';
export { AshbyAdapter } from './adapters/ashby.js';
export { DarwinboxAdapter } from './adapters/darwinbox.js';
export { WorkdayAdapter } from './adapters/workday.js';

import { GreenhouseAdapter } from './adapters/greenhouse.js';
import { AshbyAdapter } from './adapters/ashby.js';
import { DarwinboxAdapter } from './adapters/darwinbox.js';
import { WorkdayAdapter } from './adapters/workday.js';
import { ConnectorRegistry } from './registry.js';

/** Convenience: a registry pre-populated with all v0 adapters. */
export function defaultRegistry(): ConnectorRegistry {
  const r = new ConnectorRegistry();
  r.register(new GreenhouseAdapter());
  r.register(new AshbyAdapter());
  r.register(new DarwinboxAdapter());
  r.register(new WorkdayAdapter());
  return r;
}
