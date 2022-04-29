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
    id: baseUrl,
    link: baseUrl,
    language: 'ja',
    image: `${baseUrl}/icon-48x48.png`,
    favicon: `${baseUrl}/favicon.ico`,
    author,
    copyright: `© ${new Date().getFullYear()} ${siteName}`,
    hub: 'https://pubsubhubbub.appspot.com/',
  });

  let lastUpdated = new Date(0);

  await client
    .getAllContents('blog', {
      orders: process.env.MICROCMS_GLOBAL_DRAFT_KEY ? '' : '-publishedAt',
      limit: 20,
    })
    .then(blogEntries => {
      blogEntries.forEach(entry => {
        const url = `${baseUrl}/blog/${entry.id}`;
        const body = parseBlogBody(entry.body);
        const updated = new Date(entry.revisedAt!);
        feed.addItem({
          title: entry.title,
          id: url,
          link: url,
          published: new Date(entry.publishedAt!),
          date: updated,
          description: body.description,
          content: body.html,
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
      <meta httpEquiv="refresh" content="0; url=/feed.xml" />
      <title>Redirect to /feed.xml</title>
    </Head>
  );
};

export default FeedXML;
