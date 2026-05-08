/**
 * OpenTelemetry SDK bootstrap.
 *
 * No-op when OTEL_EXPORTER_OTLP_ENDPOINT is unset (dev / cred-bound prod).
 * When set, lazily imports `@opentelemetry/sdk-node` so the dependency is
 * not pulled into the cold-path require graph in environments that don't
 * use it.
 *
 * Designed to be called once at service entry (services/readybank/src/index.ts):
 *
 *   import { initOtel } from './observability/otel.js';
 *   await initOtel({ serviceName: 'readybank' });
 *
 * Subsequent calls are no-ops. SIGTERM hook flushes spans within 5 sec.
 *
 * NOT installed as a dependency in this PR — adding @opentelemetry/sdk-node
 * to package.json + npm install is part of the cred-bound apply phase.
 * This file is the contract; consumers ship the dependency once cred-drop.
 */

export interface InitOtelOptions {
  serviceName: string;
  /** Service version, defaults to package.json version or "0.0.0" */
  serviceVersion?: string;
  /** Override the OTLP endpoint (defaults to env). */
  endpoint?: string;
  /** Disable even if env is set (for tests). */
  disabled?: boolean;
}

let initialized = false;

export async function initOtel(opts: InitOtelOptions): Promise<{ shutdown: () => Promise<void> }> {
  if (initialized) return { shutdown: async () => undefined };

  const endpoint = opts.endpoint ?? process.env['OTEL_EXPORTER_OTLP_ENDPOINT'];
  if (!endpoint || opts.disabled) {
    initialized = true;
    return { shutdown: async () => undefined };
  }

  // Lazy import keeps cold-path light when OTel is unconfigured. Until
  // the OpenTelemetry packages are installed (cred-bound, post cred-drop)
  // this returns a silent no-op. Specifier is built at runtime so TS
  // does not try to resolve the (intentionally absent) module type.
  const sdkSpec = '@open' + 'telemetry/sdk-node';
  type NodeSdkLike = {
    start(): Promise<void>;
    shutdown(): Promise<void>;
  };
  type NodeSdkCtor = new (cfg: { serviceName: string; serviceVersion?: string }) => NodeSdkLike;
  let NodeSDKCtor: NodeSdkCtor | undefined;
  try {
    const mod = (await import(sdkSpec)) as { NodeSDK?: NodeSdkCtor };
    NodeSDKCtor = mod.NodeSDK;
  } catch {
    // Not installed — quiet no-op until cred-drop wires the package in.
    initialized = true;
    return { shutdown: async () => undefined };
  }
  if (!NodeSDKCtor) {
    initialized = true;
    return { shutdown: async () => undefined };
  }

  const sdk = new NodeSDKCtor({
    serviceName: opts.serviceName,
    ...(opts.serviceVersion ? { serviceVersion: opts.serviceVersion } : {}),
  });
  await sdk.start();
  initialized = true;

  const shutdown = async (): Promise<void> => {
    try {
      await Promise.race([
        sdk.shutdown(),
        new Promise<void>((resolve) => setTimeout(resolve, 5000)),
      ]);
    } catch {
      // best-effort flush
    }
  };

  process.once('SIGTERM', () => {
    void shutdown();
  });

  return { shutdown };
}

/**
 * Test helper to reset the initialized flag (vitest setup uses this).
 */
export function _resetOtelForTests(): void {
  initialized = false;
}
