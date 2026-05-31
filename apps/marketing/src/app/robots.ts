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
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
