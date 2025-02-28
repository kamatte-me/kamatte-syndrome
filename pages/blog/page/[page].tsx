import type { GetStaticPaths, InferGetStaticPropsType, NextPage } from 'next';

import { client } from '@/lib/microcms';
import type { BlogEntriesGetStaticProps } from '@/pages/blog';
import BlogPage, {
  BLOG_ENTRIES_PER_PAGE,
  blogEntriesGetStaticProps,
} from '@/pages/blog';

export const getStaticPaths: GetStaticPaths = async () => {
  const data = await client.getContentsRaw('blog');
  const pageCount = Math.ceil(data.totalCount / BLOG_ENTRIES_PER_PAGE);
  const paths = [...Array<never>(pageCount)].map(
    (_, i) => `/blog/page/${String(i + 1)}`,
  );
  return { paths, fallback: false };
};

export const getStaticProps: BlogEntriesGetStaticProps<{
  page: string;
}> = async ({ params }) => {
  return blogEntriesGetStaticProps(Number(params?.page));
};

const BlogPaginatePage: NextPage<
  InferGetStaticPropsType<typeof getStaticProps>
> = (props) => {
  return <BlogPage {...props} />;
};

export default BlogPaginatePage;
