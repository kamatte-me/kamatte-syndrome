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

export type EmbedApiResponse = {
  title: string | null;
  description: string | null;
  publisher: string | null;
  logo: string;
  image: string | null;
  date: string | null;
  author: string | null;
};

const scrape = metascraper.default([
  metaScraperTitle(),
  metaScraperDescription(),
  metaScraperPublisher(),
  (
    metaScraperLogo as (option: {
      pickFn: <T extends Record<string, any>>(
        sizes: T[],
        pickDefault: (sizes: T[]) => T,
      ) => T;
    }) => metascraper.RuleSet
  )({
    pickFn: (sizes, pickDefault) => {
      const favicon = sizes.find(item => item.rel.includes('shortcut icon'));
      return favicon || pickDefault(sizes);
    },
  }) as metascraper.Rule,
  metaScraperImage(),
  metaScraperDate(),
  metaScraperAuthor(),
]);

const handler: NextApiHandler<EmbedApiResponse> = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(403).end();
    return;
  }

  const { url } = req.query as EmbedApiRequestQuery;
  try {
    const response = await needle('get', url, null, {
      user_agent: 'Twitterbot/1.0',
      timeout: 30000,
      follow: 3,
    });

    const metadata = await scrape({ html: response.body, url });
    if (response.statusCode) {
      switch (response.statusCode / 100) {
        case 3:
        case 5:
          break;
        default:
          res.setHeader(
            'cache-control',
            'max-age=3600, s-maxage=2592000, stale-while-revalidate=3600',
          );
      }
    }
    res.status(200).json(metadata as unknown as EmbedApiResponse);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(url);
    // eslint-disable-next-line no-console
    console.error(e);
    res.status(500).end();
  }
};

export default handler;
