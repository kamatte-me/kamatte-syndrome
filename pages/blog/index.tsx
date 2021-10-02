/** @jsxRuntime classic */
/** @jsx jsx * */
import { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next';
import { ParsedUrlQuery } from 'querystring';
import React from 'react';
import { Box, Container, jsx } from 'theme-ui';

import { Pagination } from '@/components/elements/Pagination';
import { SEO } from '@/components/elements/SEO';
import { BlogListItem } from '@/components/pages/blog/BlogListItem';
import { client } from '@/lib/microcms';
import { Blog } from '@/lib/microcms/model';

export const BLOG_ENTRIES_PER_PAGE = 5;

interface BlogEntriesPageProps {
  pageInfo: {
    total: number;
    current: number;
  };
  entries: Blog[];
}

export type BlogEntriesGetStaticProps<T extends ParsedUrlQuery = {}> =
  GetStaticProps<BlogEntriesPageProps, T>;

export const blogEntriesGetStaticProps = async (
  pageNumber: number,
): Promise<ReturnType<BlogEntriesGetStaticProps>> => {
  const data = await client.getContentsRaw('blog', {
    orders: process.env.MICROCMS_GLOBAL_DRAFT_KEY ? '' : '-publishedAt',
    fields: 'id,title,featuredImage,publishedAt',
    limit: BLOG_ENTRIES_PER_PAGE,
    offset: (pageNumber - 1) * BLOG_ENTRIES_PER_PAGE,
  });

  return {
    props: {
      pageInfo: {
        total: Math.ceil(data.totalCount / BLOG_ENTRIES_PER_PAGE),
        current: pageNumber,
      },
      entries: data.contents,
    } as BlogEntriesPageProps,
  };
};

export const getStaticProps: BlogEntriesGetStaticProps = async () => {
  return blogEntriesGetStaticProps(1);
};

const BlogPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  entries,
  pageInfo,
}) => {
  return (
    <>
      <SEO title="Blog" description="局所的な人気があるらしい。" />
      <Container as="ul" variant="narrowContainer">
        {entries.map(entry => (
          <Box
            key={entry.id}
            as="li"
            sx={{
              ':not(:last-child)': {
                mb: 4,
              },
            }}
          >
            <BlogListItem entry={entry} />
          </Box>
        ))}

        <Box sx={{ mt: 4 }}>
          <Pagination
            totalPages={pageInfo.total}
            currentPage={pageInfo.current}
            basePath="/blog"
            paginationBasePath="/blog/page/"
          />
        </Box>
      </Container>
    </>
  );
};

export default BlogPage;
