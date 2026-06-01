type SitemapEntry = {
  url: string;
  lastModified?: Date | string;
};

function xmlEscape(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function sitemapXml(entries: readonly SitemapEntry[]) {
  const urls = entries
    .map((entry) => {
      const lastmod =
        entry.lastModified instanceof Date
          ? entry.lastModified.toISOString()
          : (entry.lastModified ?? new Date().toISOString());
      return `  <url><loc>${xmlEscape(entry.url)}</loc><lastmod>${xmlEscape(lastmod)}</lastmod></url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export function sitemapResponse(entries: readonly SitemapEntry[]) {
  return new Response(sitemapXml(entries), {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
