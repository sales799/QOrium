/**
 * Connector registry. The bridge service uses this to resolve a tenant's
 * configured ATS platform name (`ats_integrations.ats_platform`) to a
 * concrete adapter instance.
 *
 * The registry is mutable (`register`) so the bridge service can mix in
 * vendor-supplied or in-house custom adapters at boot time.
 */

import type { AtsConnector, AtsPlatform } from './types.js';

export class ConnectorRegistry {
  private readonly map = new Map<AtsPlatform, AtsConnector>();

  register(connector: AtsConnector): void {
    this.map.set(connector.platform, connector);
  }

  get(platform: AtsPlatform): AtsConnector {
    const c = this.map.get(platform);
    if (!c) throw new Error(`no adapter registered for platform: ${platform}`);
    return c;
  }

  has(platform: AtsPlatform): boolean {
    return this.map.has(platform);
  }

  platforms(): AtsPlatform[] {
    return Array.from(this.map.keys());
  }
}
