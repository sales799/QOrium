import type { Request, RequestHandler } from 'express';
import { HttpProblem } from './problem.js';

/** Cookie-backed browser writes accept JSON, never simple form submissions. */
export function jsonSessionWriteProblem(req: Request): HttpProblem | undefined {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return undefined;
  const type = req.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase();
  if (type === 'application/json') return undefined;
  return new HttpProblem({
    status: 415,
    title: 'Unsupported Media Type',
    detail: 'Session actions require application/json',
  });
}

export const requireJsonSessionWrite: RequestHandler = (req, _res, next) => {
  next(jsonSessionWriteProblem(req));
};
