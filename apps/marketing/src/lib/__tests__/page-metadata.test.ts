import { describe, expect, it } from 'vitest';
import { withCanonicalOpenGraph } from '../page-metadata';

describe('server page metadata', () => {
  it('uses the canonical route instead of an inherited homepage social URL', () => {
    const input = {
      title: 'Pricing',
      alternates: { canonical: '/pricing' },
      openGraph: { url: 'https://qorium.online' },
    };
    expect(withCanonicalOpenGraph(input).openGraph?.url).toBe('/pricing');
    expect(input.openGraph.url).toBe('https://qorium.online');
  });
  it('preserves article details, images, robots and language alternates', () => {
    const input = {
      alternates: { canonical: '/blog/example', languages: { 'en-IN': '/blog/example' } },
      robots: { index: true },
      openGraph: {
        type: 'article' as const,
        publishedTime: '2026-01-01',
        authors: ['Author'],
        images: ['/preview.png'],
      },
    };
    expect(withCanonicalOpenGraph(input)).toMatchObject({
      ...input,
      openGraph: { ...input.openGraph, url: '/blog/example' },
    });
  });
  it('supports URL and descriptor canonicals without inventing missing routes', () => {
    const url = new URL('https://qorium.online/security');
    expect(withCanonicalOpenGraph({ alternates: { canonical: url } }).openGraph?.url).toBe(url);
    expect(withCanonicalOpenGraph({ alternates: { canonical: { url } } }).openGraph?.url).toBe(url);
    expect(withCanonicalOpenGraph({ robots: { index: false } })).toEqual({
      robots: { index: false },
    });
  });
});
