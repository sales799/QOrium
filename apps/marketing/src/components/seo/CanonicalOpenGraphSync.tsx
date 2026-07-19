'use client';

import { useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';
import { siteConfig } from '@/content/site.config';

export function canonicalUrlForPath(baseUrl: string, pathname: string) {
  const normalized = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  return new URL(normalized, `${baseUrl.replace(/\/+$/, '')}/`).href;
}

/**
 * Next merges the root Open Graph object into child metadata. Without this
 * sync, every route inherits the home-page og:url even when its canonical is
 * route-specific. Ahrefs then reports the entire site as an OG/canonical
 * mismatch. Keep the rendered og:url aligned with the canonical link.
 */
export function CanonicalOpenGraphSync() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;
    const url = canonical || canonicalUrlForPath(siteConfig.url, pathname);
    const tags = Array.from(document.querySelectorAll<HTMLMetaElement>('meta[property="og:url"]'));
    const tag = tags[0] ?? document.createElement('meta');

    if (tags.length === 0) {
      tag.setAttribute('property', 'og:url');
      document.head.appendChild(tag);
    }

    tag.setAttribute('content', url);
    for (const duplicate of tags.slice(1)) duplicate.remove();
  }, [pathname]);

  return null;
}
