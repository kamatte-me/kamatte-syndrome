import { GetStaticPaths, InferGetStaticPropsType } from 'next';
import React from 'react';

import { SEO } from '@/components/elements/SEO';
import { fetchContentsRaw } from '@/lib/microcms';
import { Blog } from '@/lib/microcms/model';
import BlogPage, {
  BlogListGetStaticProps,
  getStaticPropsBlogList,
  POSTS_PER_PAGE,
} from '@/pages/blog';

export const getStaticPaths: GetStaticPaths = async () => {
  const data = await fetchContentsRaw<Blog>('blog');
  const pageCount = Math.ceil(data.totalCount / POSTS_PER_PAGE);
  const paths = [...Array(pageCount)].map((_, i) => `/blog/page/${i + 1}`);
  return { paths, fallback: false };
};

export const getStaticProps: BlogListGetStaticProps = async context => {
  return getStaticPropsBlogList(Number(context.params!.page));
};

const BlogPaginatePage: React.FC<
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
