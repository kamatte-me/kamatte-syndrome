import * as metascraper from 'metascraper';
import metaScraperAuthor from 'metascraper-author';
import metaScraperDate from 'metascraper-date';
import metaScraperDescription from 'metascraper-description';
import metaScraperLogo from 'metascraper-logo-favicon';
import metaScraperPublisher from 'metascraper-publisher';
import metaScraperTitle from 'metascraper-title';
import needle from 'needle';
import { NextApiHandler, NextApiResponse } from 'next';

type RequestQuery = {
  url: string;
};

type Response = {
  title: string;
  description: string;
  publisher: string;
  logo: string;
  date: string;
  author: string;
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
  metaScraperDate(),
  metaScraperAuthor(),
]);

const setCacheControl = (res: NextApiResponse): void => {
  res.setHeader('cache-control', 'public, max-age=86400');
};

const handler: NextApiHandler<Response> = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(403).end();
    return;
  }

  const url = decodeURIComponent((req.query as RequestQuery).url);
  try {
    const html = await needle('get', url, null, {
      user_agent: 'facebookexternalhit/1.1',
      timeout: 30000,
    }).then(response => {
      return response.body;
    });

    const metadata = await scrape({ html, url });
    setCacheControl(res);
    res.status(200).json(metadata as unknown as Response);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(url);
    // eslint-disable-next-line no-console
    console.error(e);
    res.status(500).end();
  }
};

export default handler;
