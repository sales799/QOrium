import { describe, expect, it } from 'vitest';
import { canonicalUrlForPath } from '../CanonicalOpenGraphSync';

describe('canonical Open Graph URL', () => {
  it('keeps the home URL canonical', () => {
    expect(canonicalUrlForPath('https://qorium.online', '/')).toBe('https://qorium.online/');
  });

  it('normalizes route trailing slashes without collapsing the route', () => {
    expect(canonicalUrlForPath('https://qorium.online/', '/library/senior-python/')).toBe(
      'https://qorium.online/library/senior-python',
    );
  });
});
