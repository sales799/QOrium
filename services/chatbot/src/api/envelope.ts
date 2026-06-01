export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export type ApiEnvelope<T> =
  | {
      ok: true;
      data: T;
      error: null;
    }
  | {
      ok: false;
      data: null;
      error: ApiError;
    };

export function ok<T>(data: T): ApiEnvelope<T> {
  return { ok: true, data, error: null };
}

export function fail(code: string, message: string, details?: unknown): ApiEnvelope<never> {
  return {
    ok: false,
    data: null,
    error: details === undefined ? { code, message } : { code, message, details },
  };
}
