/** @jsxRuntime classic */
/** @jsx jsx * */
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import React from 'react';

import { fetchContentsRaw } from '@/lib/microcms';
import { Blog } from '@/lib/microcms/model';
import BlogPage, {
  getStaticPropsBlogsPerPage,
  POSTS_PER_PAGE,
} from '@/pages/blog';

export const getStaticPaths: GetStaticPaths = async () => {
  const data = await fetchContentsRaw<Blog>('blog');
  const pageCount = Math.ceil(data.totalCount / POSTS_PER_PAGE);
  const paths = [...Array(pageCount)].map((_, i) => `/blog/page/${i + 1}`);
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<{
  posts: Blog[];
}> = async context => {
  return getStaticPropsBlogsPerPage(Number(context.params!.page));
};

const BlogPaginatePage: React.FC<
  InferGetStaticPropsType<typeof getStaticProps>
> = BlogPage;

export default BlogPaginatePage;
