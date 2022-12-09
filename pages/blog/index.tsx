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
    fields: 'id,title,featuredImage,publishedAt',
    orders: process.env.MICROCMS_GLOBAL_DRAFT_KEY ? '' : '-publishedAt',
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
    },
  };
};

export const getStaticProps: BlogEntriesGetStaticProps = async () => {
  return blogEntriesGetStaticProps(1);
};

const BlogPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  entries,
  pageInfo,
}) => {
  const isTopPage = pageInfo.current <= 1;
  const pageText = isTopPage ? '' : `${pageInfo.current}ページ`;
  const pageTitle = `Blog${isTopPage ? '' : `（${pageText}）`}`;

  return (
    <>
      <NextSeo
        title={pageTitle}
        description={`局所的な人気があるらしい。${
          isTopPage ? '' : `（${pageText}）`
        }`}
        openGraph={{
          title: pageTitle,
        }}
      />
      <BreadcrumbJsonLd
        itemListElements={[
          {
            position: 1,
            name: 'Blog',
            item: `${baseUrl}/blog`,
          },
          ...(isTopPage
            ? []
            : [
                {
                  position: 2,
                  name: pageText,
                  item: `${baseUrl}/blog/page/${pageInfo.current}`,
                },
              ]),
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
              <BlogListItem entry={entry} />
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
