import { GetStaticPaths, InferGetStaticPropsType, NextPage } from 'next';
import React from 'react';

import { SEO } from '@/components/elements/SEO';
import { client } from '@/lib/microcms';
import BlogPage, {
  BLOG_ENTRIES_PER_PAGE,
  BlogEntriesGetStaticProps,
  blogEntriesGetStaticProps,
} from '@/pages/blog';

export const getStaticPaths: GetStaticPaths = async () => {
  const data = await client.getContentsRaw('blog');
  const pageCount = Math.ceil(data.totalCount / BLOG_ENTRIES_PER_PAGE);
  const paths = [...Array(pageCount)].map((_, i) => `/blog/page/${i + 1}`);
  return { paths, fallback: false };
};

export const getStaticProps: BlogEntriesGetStaticProps<{
  page: string;
}> = async ({ params }) => {
  return blogEntriesGetStaticProps(Number(params!.page));
};

const BlogPaginatePage: NextPage<
  InferGetStaticPropsType<typeof getStaticProps>
> = props => {
  return (
    <>
      <SEO title={`Blog (${props.pageInfo.current}ページ)`} />
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <BlogPage {...props} />
    </>
  );
};

export default BlogPaginatePage;
