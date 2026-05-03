import type { Request } from 'express';

export interface AuthContext {
  apiKeyId: string;
  tenantId: string;
  /** Stored prefix from `app.api_keys.prefix` (e.g. `qor_live`). */
  prefix: string;
  scopes: readonly string[];
  /** Human-readable key name (`app.api_keys.name`), or null if untitled. */
  name: string | null;
}

export interface AuthenticatedRequest extends Request {
  auth?: AuthContext;
}
