import type { MetadataRoute } from 'next';
import { siteConfig } from '@/content/site.config';

const STATIC_PATHS = [
  '/',
  '/product',
  '/features',
  '/features/readybank',
  '/features/jd-forge',
  '/features/stack-vault',
  '/solutions/platforms',
  '/solutions/enterprises',
  '/solutions/staffing',
  '/pricing',
  '/customers',
  '/security',
  '/about',
  '/contact',
  '/demo',
  '/blog',
  '/changelog',
  '/press-kit',
  '/privacy',
  '/terms',
  '/dpa',
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return STATIC_PATHS.map((path) => ({
    url: `${siteConfig.url}${path === '/' ? '' : path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: path === '/' ? 1.0 : path.startsWith('/blog') ? 0.7 : 0.8,
  }));
}
