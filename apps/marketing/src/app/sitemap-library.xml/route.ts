import { seoSitemapFamilies } from '@/content/seo-graph';
import { sitemapResponse } from '@/lib/sitemap-xml';

export function GET() {
  return sitemapResponse(seoSitemapFamilies.library);
}
