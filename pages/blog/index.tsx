import { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next';
import Link from 'next/link';
import { BreadcrumbJsonLd, NextSeo } from 'next-seo';
import { ParsedUrlQuery } from 'querystring';
import React from 'react';
import { Box, Container } from 'theme-ui';

import { Pagination } from '@/components/elements/Pagination';
import { BlogListItem } from '@/components/pages/blog/BlogListItem';
import { baseUrl } from '@/constants/site';
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
      <NextSeo
        title={`Blog${
          pageInfo.current > 1 ? `（${pageInfo.current}ページ）` : ''
        }`}
        description={`局所的な人気があるらしい。${
          pageInfo.current > 1 ? `（${pageInfo.current}ページ）` : ''
        }`}
      />
      <BreadcrumbJsonLd
        itemListElements={[
          {
            position: 1,
            name: 'Blog',
            item: `${baseUrl}/blog`,
          },
          ...(pageInfo.current > 1
            ? [
                {
                  position: 2,
                  name: `${pageInfo.current}ページ`,
                  item: `${baseUrl}/blog/page/${pageInfo.current}`,
                },
              ]
            : []),
        ]}
      />

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
            <Link href={`/blog/${entry.id}`}>
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a>
                <BlogListItem entry={entry} />
              </a>
            </Link>
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
