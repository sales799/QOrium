import { listBlogPosts } from '@/lib/blog';
import { siteConfig } from '@/content/site.config';

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const posts = listBlogPosts();
  const url = siteConfig.url;

  const items = posts
    .map(
      (p) => `
    <item>
      <title>${escape(p.title)}</title>
      <link>${url}/blog/${p.slug}</link>
      <guid isPermaLink="true">${url}/blog/${p.slug}</guid>
      <description>${escape(p.description)}</description>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <author>${escape(p.author)}</author>
    </item>`,
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escape(siteConfig.name)} — Blog</title>
    <link>${url}/blog</link>
    <description>Field notes from building the assessment-content layer.</description>
    <language>en-IN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600',
    },
  });
}
