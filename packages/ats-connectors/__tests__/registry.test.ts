import { describe, expect, it } from 'vitest';
import { ConnectorRegistry, defaultRegistry } from '../src';

describe('ConnectorRegistry', () => {
  it('registers and looks up adapters', () => {
    const r = defaultRegistry();
    expect(r.has('greenhouse')).toBe(true);
    expect(r.get('greenhouse').platform).toBe('greenhouse');
  });

  it('throws on unknown platform', () => {
    const r = new ConnectorRegistry();
    expect(() => r.get('greenhouse')).toThrow(/no adapter/);
  });

  it('lists registered platforms', () => {
    const r = defaultRegistry();
    expect(r.platforms().sort()).toEqual(['ashby', 'darwinbox', 'greenhouse', 'workday']);
  });
});
