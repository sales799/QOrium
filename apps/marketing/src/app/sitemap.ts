import type { MetadataRoute } from 'next';
import { siteConfig } from '@/content/site.config';
import { listBlogPosts } from '@/lib/blog';

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

  const staticEntries = STATIC_PATHS.map((path) => ({
    url: `${siteConfig.url}${path === '/' ? '' : path}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: path === '/' ? 1.0 : path.startsWith('/blog') ? 0.7 : 0.8,
  }));

  const blogPosts = listBlogPosts();
  const blogEntries = blogPosts.map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...blogEntries];
}
