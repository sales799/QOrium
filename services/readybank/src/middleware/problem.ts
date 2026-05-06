import type { Request, Response, NextFunction, RequestHandler, ErrorRequestHandler } from 'express';

/**
 * RFC 7807 Problem Details — used for every error response per
 * CTO Architecture §6 + 92-pt Quality Gate Pillar A "Error handling".
 */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  [key: string]: unknown;
}

const PROBLEM_TYPE_BASE = 'https://qorium.online/problems/';

export class HttpProblem extends Error {
  readonly status: number;
  readonly type: string;
  readonly title: string;
  readonly detail: string | undefined;
  readonly extensions: Record<string, unknown>;

  constructor(args: {
    status: number;
    type?: string;
    title: string;
    detail?: string;
    extensions?: Record<string, unknown>;
  }) {
    super(args.detail ?? args.title);
    this.status = args.status;
    this.type = args.type ?? `${PROBLEM_TYPE_BASE}${args.title.toLowerCase().replace(/\s+/g, '-')}`;
    this.title = args.title;
    this.detail = args.detail;
    this.extensions = args.extensions ?? {};
  }

  toJSON(): ProblemDetails {
    return {
      type: this.type,
      title: this.title,
      status: this.status,
      ...(this.detail !== undefined ? { detail: this.detail } : {}),
      ...this.extensions,
    };
  }
}

export const notFound: RequestHandler = (req: Request, res: Response, _next: NextFunction) => {
  const problem: ProblemDetails = {
    type: `${PROBLEM_TYPE_BASE}not-found`,
    title: 'Not Found',
    status: 404,
    detail: `No route matches ${req.method} ${req.originalUrl}`,
    instance: req.originalUrl,
  };
  res.status(404).type('application/problem+json').json(problem);
};

export function problemHandler(): ErrorRequestHandler {
  return (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
    if (res.headersSent) {
      // Express recommends delegating to the default handler if headers already sent.
      _next(err);
      return;
    }

    if (err instanceof HttpProblem) {
      const body = err.toJSON();
      body.instance = req.originalUrl;
      res.status(err.status).type('application/problem+json').json(body);
      return;
    }

    // Unknown / unexpected error → 500. Log via res.log (pino-http) so it's
    // captured with request_id; do not leak stack to client.
    const message = err instanceof Error ? err.message : 'Unknown error';
    req.log?.error({ err }, 'unhandled error');

    const body: ProblemDetails = {
      type: `${PROBLEM_TYPE_BASE}internal-server-error`,
      title: 'Internal Server Error',
      status: 500,
      detail: 'The service encountered an unexpected condition.',
      instance: req.originalUrl,
      ...(process.env.NODE_ENV !== 'production' ? { debug_message: message } : {}),
    };
    res.status(500).type('application/problem+json').json(body);
  };
}
