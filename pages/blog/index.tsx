/** @jsxRuntime classic */
/** @jsx jsx * */
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import React from 'react';
import { Box, Container, jsx } from 'theme-ui';

import { Pagination } from '@/components/elements/Pagination';
import { SEO } from '@/components/elements/SEO';
import { BlogListItem } from '@/components/pages/blog/BlogListItem';
import { fetchContentsRaw } from '@/lib/microcms';
import { Blog } from '@/lib/microcms/model';

export const POSTS_PER_PAGE = 5;

export type BlogListGetStaticProps = GetStaticProps<{
  pageInfo: {
    total: number;
    current: number;
  };
  posts: Blog[];
}>;

export const getStaticPropsBlogList = async (
  pageNumber: number,
): ReturnType<BlogListGetStaticProps> => {
  const data = await fetchContentsRaw<Blog>('blog', {
    orders: '-publishedAt',
    limit: POSTS_PER_PAGE,
    offset: (pageNumber - 1) * POSTS_PER_PAGE,
  });

  return {
    props: {
      pageInfo: {
        total: Math.ceil(data.totalCount / POSTS_PER_PAGE),
        current: pageNumber,
      },
      posts: data.contents,
    },
  };
};

export const getStaticProps: BlogListGetStaticProps = async () => {
  return getStaticPropsBlogList(1);
};

const BlogPage: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = ({
  posts,
  pageInfo,
}) => {
  return (
    <>
      <SEO title="Blog" description="局所的な人気があるらしい。" />
      <Container as="ul" variant="layout.blogContainer">
        {posts.map(post => (
          <Box
            as="li"
            sx={{
              ':not(:last-child)': {
                mb: 4,
              },
            }}
          >
            <BlogListItem post={post} />
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
