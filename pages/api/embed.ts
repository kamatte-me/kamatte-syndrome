import { load } from 'cheerio';
import * as metascraper from 'metascraper';
import metaScraperAuthor from 'metascraper-author';
import metaScraperDate from 'metascraper-date';
import metaScraperDescription from 'metascraper-description';
import metaScraperImage from 'metascraper-image';
import metaScraperLogo from 'metascraper-logo-favicon';
import metaScraperPublisher from 'metascraper-publisher';
import metaScraperTitle from 'metascraper-title';
import needle from 'needle';
import { NextApiHandler } from 'next';

export type EmbedApiRequestQuery = {
  url: string;
};

type MetaScraperMetadata = {
  title: string | null;
  description: string | null;
  publisher: string | null;
  logo: string | null;
  image: string | null;
  date: string | null;
  author: string | null;
};

type Metadata = MetaScraperMetadata & {
  favicon: string | null;
  twitter_card: 'summary' | 'summary_large_image' | 'app' | 'player' | null;
};

export type EmbedApiResponse = Metadata;

const scrape = metascraper.default([
  metaScraperTitle(),
  metaScraperDescription(),
  metaScraperPublisher(),
  metaScraperLogo(),
  metaScraperImage(),
  metaScraperDate(),
  metaScraperAuthor(),
]) as unknown as (
  options: metascraper.ScrapOptions,
) => Promise<MetaScraperMetadata>;

const isValidURL = (url: string) => {
  try {
    // eslint-disable-next-line no-new
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
};

const hrefToURL = (
  href: string | undefined,
  origin: string,
): string | undefined => {
  if (href === undefined) {
    return undefined;
  }

  if (isValidURL(href)) {
    return href;
  }
  try {
    return new URL(href, origin).toString();
  } catch (e) {
    return undefined;
  }
};

const handler: NextApiHandler<EmbedApiResponse> = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(403).end();
    return;
  }

  const url = new URL((req.query as EmbedApiRequestQuery).url);
  try {
    const response = await needle('get', url.toString(), null, {
      user_agent: 'Twitterbot/1.0',
      timeout: 30000,
      follow: 3,
    });

    if (response.statusCode) {
      switch (response.statusCode / 100) {
        case 3:
        case 5:
          break;
        default:
          res.setHeader(
            'cache-control',
            'max-age=3600, s-maxage=86400, stale-while-revalidate=2592000',
          );
      }
    }

    // メタデータパース
    const metadata = await scrape({
      html: response.body,
      url: url.toString(),
    });

    const $ = load(response.body);
    const resBody: Metadata = {
      ...metadata,
      favicon: (() => {
        const faviconHref = $('link[rel~="icon"]').attr('href');
        if (faviconHref) {
          return hrefToURL(faviconHref, url.origin) || null;
        }
        return `${url.origin}/favicon.ico`;
      })(),
      image:
        // @metascraper/helperで依存しているnormalize-urlにバグがあるため、まず自前で取得
        // https://github.com/sindresorhus/normalize-url/issues/165
        hrefToURL(
          $('meta[property="og:image:secure_url"]').attr('content') ||
            $('meta[property="og:image:url"]').attr('content') ||
            $('meta[property="og:image"]').attr('content') ||
            $('meta[name="twitter:image:src"]').attr('content') ||
            $('meta[property="twitter:image:src"]').attr('content') ||
            $('meta[name="twitter:image"]').attr('content') ||
            $('meta[property="twitter:image"]').attr('content') ||
            $('meta[itemprop="image"]').attr('content'),
          url.origin,
        ) || metadata.image,
      twitter_card: ($('meta[name="twitter:card"]').attr('content') ||
        $('meta[property="twitter:card"]').attr('content') ||
        null) as EmbedApiResponse['twitter_card'],
    };

    res.status(200).json(resBody);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(url);
    // eslint-disable-next-line no-console
    console.error(e);
    res.status(500).end();
  }
};

export default handler;
