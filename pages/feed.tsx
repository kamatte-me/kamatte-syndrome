import { writeFile } from 'node:fs/promises';

import type { Author } from 'feed';
import { Feed } from 'feed';
import type { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';

import {
  author as authorName,
  baseUrl,
  siteName,
  slogan,
} from '@/constants/site';
import { parseBlogBody } from '@/lib/blog';
import { client } from '@/lib/microcms';

export const getStaticProps: GetStaticProps = async () => {
  const author: Author = {
    name: authorName,
    link: `${baseUrl}/biography`,
  };

  const feed = new Feed({
    title: siteName,
    description: slogan,
    id: `${baseUrl}/`,
    link: `${baseUrl}/`,
    language: 'ja',
    image: `${baseUrl}/icon-48x48.png`,
    favicon: `${baseUrl}/favicon.ico`,
    author,
    copyright: `© ${String(new Date().getFullYear())} ${siteName}`,
    hub: 'https://pubsubhubbub.appspot.com/',
  });

  let lastUpdated = new Date(0);

  await client
    .getContents('blog', {
      orders: process.env.MICROCMS_GLOBAL_DRAFT_KEY ? '' : '-publishedAt',
      limit: 10,
    })
    .then((blogEntries) => {
      blogEntries.forEach((entry) => {
        const url = `${baseUrl}/blog/${entry.id}`;
        const { description } = parseBlogBody(entry.body);
        const published = new Date(entry.publishedAt ?? new Date());
        const updated =
          entry.revisedAt !== undefined ? new Date(entry.revisedAt) : published;
        feed.addItem({
          title: entry.title,
          id: url,
          link: url,
          published,
          date: updated,
          description,
          content: entry.body,
          image: entry.featuredImage
            ? entry.featuredImage.url
            : `${baseUrl}/avatar.png`,
          author: [author],
        });

        if (lastUpdated < updated) {
          lastUpdated = updated;
        }
      });
    });

  feed.options.updated = lastUpdated;

  await writeFile(`${process.cwd()}/public/feed.xml`, feed.atom1());

  return {
    props: {},
  };
};

const FeedXML: NextPage = () => {
  return (
    <Head>
      <meta content="0; url=/feed.xml" httpEquiv="refresh" />
      <title>Redirect to /feed.xml</title>
    </Head>
  );
};

export default FeedXML;
