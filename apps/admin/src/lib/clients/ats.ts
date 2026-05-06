import { callService, resolveServiceUrls, type FetchOptions, type FetchResult } from './services';

export interface AtsHealthDto {
  status: string;
  service: string;
  adapters: string[];
}

export function getAtsHealth(opts?: FetchOptions): Promise<FetchResult<AtsHealthDto>> {
  return callService<AtsHealthDto>(resolveServiceUrls().atsBridge, '/healthz', opts);
}
