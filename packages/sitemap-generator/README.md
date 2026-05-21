# @kamatte-syndrome/sitemap-generator

Sitemap XMLを生成するための小さな内部packageです。

このpackageはURL一覧からXML文字列を作るところだけを担当します。Content CollectionsからどのURLをsitemapに含めるか、HTTP responseとしてどう返すかはapp側の責務です。

## Usage

```ts
import { generateSitemapXml } from '@kamatte-syndrome/sitemap-generator';

const xml = generateSitemapXml('https://example.com', [
  { path: '/', changefreq: 'yearly', priority: 1 },
  {
    path: '/blog/hello',
    lastmod: new Date('2026-05-17T00:00:00+09:00'),
  },
]);
```

## API

```ts
function generateSitemapXml(
  baseUrl: string,
  entries: Array<SitemapEntry>,
): string;

type SitemapEntry = {
  changefreq?: SitemapChangeFrequency;
  lastmod?: Date | string;
  path: string;
  priority?: number;
};
```

`path`は`baseUrl`からの相対URLとして扱います。`lastmod`に`Date`を渡した場合は`toISOString()`で出力します。

## Development

```sh
pnpm --filter @kamatte-syndrome/sitemap-generator test
pnpm --filter @kamatte-syndrome/sitemap-generator typecheck
```
