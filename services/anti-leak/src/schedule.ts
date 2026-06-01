const DEFAULT_SCAN_INTERVAL_MS = 24 * 60 * 60 * 1000;
const MIN_SCAN_INTERVAL_MS = 60 * 1000;
const MAX_SCAN_INTERVAL_MS = 7 * DEFAULT_SCAN_INTERVAL_MS;

export function parseScanIntervalMs(
  raw: string | undefined,
  fallbackMs: number = DEFAULT_SCAN_INTERVAL_MS,
): number {
  if (!raw) return fallbackMs;

  const normalized = raw.trim().toLowerCase();
  const match = normalized.match(/^(\d+)(ms|s|m|h|d)?$/);
  if (!match) return fallbackMs;

  const value = Number.parseInt(match[1]!, 10);
  if (!Number.isFinite(value) || value <= 0) return fallbackMs;

  const unit = match[2] ?? 'ms';
  const multiplier =
    unit === 'd'
      ? DEFAULT_SCAN_INTERVAL_MS
      : unit === 'h'
        ? 60 * 60 * 1000
        : unit === 'm'
          ? 60 * 1000
          : unit === 's'
            ? 1000
            : 1;

  const intervalMs = value * multiplier;
  if (intervalMs < MIN_SCAN_INTERVAL_MS || intervalMs > MAX_SCAN_INTERVAL_MS) return fallbackMs;

  return intervalMs;
}
