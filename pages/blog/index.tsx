/** @jsxRuntime classic */
/** @jsx jsx * */
import { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next';
import React from 'react';
import { Box, Container, jsx } from 'theme-ui';

import { Pagination } from '@/components/elements/Pagination';
import { SEO } from '@/components/elements/SEO';
import { BlogListItem } from '@/components/pages/blog/BlogListItem';
import { client } from '@/lib/microcms';
import { Blog } from '@/lib/microcms/model';

export const BLOG_POSTS_PER_PAGE = 5;

export type BlogPostListGetStaticProps = GetStaticProps<{
  pageInfo: {
    total: number;
    current: number;
  };
  posts: Blog[];
}>;

export const getStaticPropsBlogPostList = async (
  pageNumber: number,
): ReturnType<BlogPostListGetStaticProps> => {
  const data = await client.getContentsRaw('blog', {
    orders: '-publishedAt',
    fields: 'id,title,featuredImage,publishedAt',
    limit: BLOG_POSTS_PER_PAGE,
    offset: (pageNumber - 1) * BLOG_POSTS_PER_PAGE,
  });

  return {
    props: {
      pageInfo: {
        total: Math.ceil(data.totalCount / BLOG_POSTS_PER_PAGE),
        current: pageNumber,
      },
      posts: data.contents,
    },
  };
};

export const getStaticProps: BlogPostListGetStaticProps = async () => {
  return getStaticPropsBlogPostList(1);
};

const BlogPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  posts,
  pageInfo,
}) => {
  return (
    <>
      <SEO title="Blog" description="局所的な人気があるらしい。" />
      <Container as="ul" variant="narrowContainer">
        {posts.map(post => (
          <Box
            key={post.id}
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
