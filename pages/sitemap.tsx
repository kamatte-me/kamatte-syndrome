import { writeFile } from 'fs/promises';
import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { EnumChangefreq, SitemapStream, streamToPromise } from 'sitemap';
import { SitemapItemLoose } from 'sitemap/dist/lib/types';

import { baseUrl } from '@/constants/site';
import { client } from '@/lib/microcms';

export const getStaticProps: GetStaticProps = async () => {
  const stream = new SitemapStream({
    hostname: baseUrl,
  });

  const getLatestOneQuery = {
    fields: 'revisedAt',
    orders: '-revisedAt',
    limit: 1,
  };
  const [latestHistory, latestSkill, latestPortfolio, latestCulture] =
    await Promise.all([
      client.getContents('history', getLatestOneQuery),
      client.getContents('skill', getLatestOneQuery),
      client.getContents('portfolio', getLatestOneQuery),
      client.getContents('culture', getLatestOneQuery),
    ]);

  const staticPages: SitemapItemLoose[] = [
    { url: '/', changefreq: EnumChangefreq.YEARLY, priority: 1 },
    {
      url: '/biography',
      changefreq: EnumChangefreq.YEARLY,
      lastmod:
        latestHistory[0].revisedAt! >= latestSkill[0].revisedAt!
          ? latestHistory[0].revisedAt
          : latestSkill[0].revisedAt,
      priority: 0.8,
    },
    {
      url: '/portfolio',
      changefreq: EnumChangefreq.YEARLY,
      lastmod: latestPortfolio[0].revisedAt,
      priority: 0.2,
    },
    {
      url: '/culture',
      changefreq: EnumChangefreq.MONTHLY,
      lastmod: latestCulture[0].revisedAt,
      priority: 0.4,
    },
    { url: '/subscribe', changefreq: EnumChangefreq.YEARLY, priority: 0.3 },
  ];
  staticPages.forEach(page => stream.write(page));

  const blogEntries = await client.getAllContents('blog', {
    fields: 'id,publishedAt,revisedAt',
    limit: 50,
  });
  stream.write({
    url: '/blog',
    changefreq: EnumChangefreq.WEEKLY,
    lastmod: blogEntries[0].publishedAt,
    priority: 0.5,
  } as SitemapItemLoose);
  blogEntries.forEach(entry => {
    stream.write({
      url: `/blog/${entry.id}`,
      changefreq: EnumChangefreq.YEARLY,
      lastmod: entry.revisedAt,
      priority: 0.7,
    } as SitemapItemLoose);
  });

  stream.end();
  const buffer = await streamToPromise(stream);
  await writeFile(`${process.cwd()}/public/sitemap.xml`, buffer.toString());

  return {
    props: {},
  };
};

const SitemapXML: NextPage = () => {
  return (
    <Head>
      <meta httpEquiv="refresh" content="0; url=/sitemap.xml" />
      <title>Redirect to /sitemap.xml</title>
    </Head>
  );
};

export default SitemapXML;
