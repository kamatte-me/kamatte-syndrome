import { writeFile } from 'node:fs/promises';

import type { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { EnumChangefreq, SitemapStream, streamToPromise } from 'sitemap';
import type { SitemapItemLoose } from 'sitemap/dist/lib/types';

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
        latestHistory[0]?.revisedAt &&
        latestSkill[0]?.revisedAt &&
        latestHistory[0].revisedAt >= latestSkill[0].revisedAt
          ? latestHistory[0].revisedAt
          : latestSkill[0]?.revisedAt,
      priority: 0.8,
    },
    {
      url: '/portfolio',
      changefreq: EnumChangefreq.YEARLY,
      lastmod: latestPortfolio[0]?.revisedAt,
      priority: 0.2,
    },
    {
      url: '/culture',
      changefreq: EnumChangefreq.MONTHLY,
      lastmod: latestCulture[0]?.revisedAt,
      priority: 0.4,
    },
    { url: '/subscribe', changefreq: EnumChangefreq.YEARLY, priority: 0.1 },
    { url: '/terms', changefreq: EnumChangefreq.YEARLY, priority: 0.1 },
    { url: '/privacy', changefreq: EnumChangefreq.YEARLY, priority: 0.1 },
  ];
  staticPages.forEach((page) => stream.write(page));

  // ブログ
  const blogEntries = await client.getAllContents('blog', {
    fields: 'id,publishedAt,revisedAt',
    orders: process.env.MICROCMS_GLOBAL_DRAFT_KEY ? '' : '-publishedAt',
    limit: 100,
  });
  for (let i = 1; i <= Math.ceil(blogEntries.length / 5); i += 1) {
    stream.write({
      url: i === 1 ? '/blog' : `/blog/page/${i}`,
      changefreq: EnumChangefreq.WEEKLY,
      lastmod: blogEntries[0]?.publishedAt,
      priority: i === 1 ? 0.5 : 0.1,
    } as SitemapItemLoose);
  }

  blogEntries.forEach((entry) => {
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
      <meta content="0; url=/sitemap.xml" httpEquiv="refresh" />
      <title>Redirect to /sitemap.xml</title>
    </Head>
  );
};

export default SitemapXML;
