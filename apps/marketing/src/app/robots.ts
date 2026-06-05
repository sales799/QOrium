import type { MetadataRoute } from 'next';
import { siteConfig } from '@/content/site.config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/styleguide', '/api/', '/_next/', '/admin'],
      },
    ],
    sitemap: [
      `${siteConfig.url}/sitemap.xml`,
      `${siteConfig.url}/sitemap-library.xml`,
      `${siteConfig.url}/sitemap-roles.xml`,
      `${siteConfig.url}/sitemap-stacks.xml`,
      `${siteConfig.url}/sitemap-compare.xml`,
    ],
    host: siteConfig.url,
  };
}
