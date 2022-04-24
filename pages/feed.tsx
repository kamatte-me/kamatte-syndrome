import { Author, Feed } from 'feed';
import { writeFile } from 'fs/promises';
import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';

import {
  author as authorName,
  baseUrl,
  siteName,
  slogan,
} from '@/constants/site';
import { client } from '@/lib/microcms';

export const getStaticProps: GetStaticProps = async () => {
  const author: Author = {
    name: authorName,
    link: `${baseUrl}/biography`,
  };

  const feed = new Feed({
    title: siteName,
    description: slogan,
    id: `${baseUrl}`,
    link: `${baseUrl}`,
    language: 'ja',
    image: `${baseUrl}/avatar.png`,
    favicon: `${baseUrl}/favicon.ico`,
    copyright: `© ${new Date().getFullYear()} ${siteName}`,
    author,
  });

  const blogEntries = await client.getAllContents('blog', {
    orders: process.env.MICROCMS_GLOBAL_DRAFT_KEY ? '' : '-publishedAt',
    limit: 20,
  });

  blogEntries.forEach(entry => {
    const url = `${baseUrl}/blog/${entry.id}`;
    const body = entry.body.map(b => b.body).join('');
    feed.addItem({
      title: entry.title,
      id: url,
      link: url,
      date: new Date(entry.publishedAt!),
      description: body,
      content: body,
      image: entry.featuredImage
        ? entry.featuredImage.url
        : `${baseUrl}/avatar.png`,
      author: [author],
    });
  });

  await writeFile(`${process.cwd()}/public/feed.xml`, feed.rss2());

  return {
    props: {},
  };
};

const FeedXML: NextPage = () => {
  return (
    <Head>
      <meta httpEquiv="refresh" content="0; url=/feed.xml" />
      <title>Redirect to /feed.xml</title>
    </Head>
  );
};

export default FeedXML;
