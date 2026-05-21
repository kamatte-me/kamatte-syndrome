export type SitemapChangeFrequency =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

export type SitemapEntry = {
  changefreq?: SitemapChangeFrequency;
  lastmod?: Date | string;
  path: string;
  priority?: number;
};

export function generateSitemapXml(
  baseUrl: string,
  entries: SitemapEntry[],
): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    entries.map((entry) => renderSitemapEntry(baseUrl, entry)).join('\n'),
    '</urlset>',
    '',
  ].join('\n');
}

function renderSitemapEntry(baseUrl: string, entry: SitemapEntry) {
  const lines = [
    '  <url>',
    `    <loc>${escapeXml(createAbsoluteUrl(baseUrl, entry.path))}</loc>`,
  ];

  if (entry.lastmod) {
    lines.push(
      `    <lastmod>${escapeXml(formatLastmod(entry.lastmod))}</lastmod>`,
    );
  }

  if (entry.changefreq) {
    lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
  }

  if (entry.priority !== undefined) {
    lines.push(`    <priority>${entry.priority}</priority>`);
  }

  lines.push('  </url>');

  return lines.join('\n');
}

function createAbsoluteUrl(baseUrl: string, path: string) {
  return new URL(path, baseUrl).href;
}

function formatLastmod(lastmod: Date | string) {
  return lastmod instanceof Date ? lastmod.toISOString() : lastmod;
}

function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, (character) => {
    switch (character) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '"':
        return '&quot;';
      case "'":
        return '&apos;';
      default:
        return character;
    }
  });
}
