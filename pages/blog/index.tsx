/** @jsxRuntime classic */
/** @jsx jsx * */
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import React from 'react';
import { Box, Container, jsx } from 'theme-ui';

import { Seo } from '@/components/elements/Seo';
import { BlogListItem } from '@/components/pages/blog/BlogListItem';
import { getContents } from '@/lib/microcms';
import { Blog } from '@/lib/microcms/model';

export const getStaticProps: GetStaticProps<{
  posts: Blog[];
}> = async () => {
  const posts = await getContents<Blog>('blog', {
    orders: '-publishedAt',
    limit: 5,
  });

  return {
    props: {
      posts,
    },
  };
};

const BlogPage: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = ({
  posts,
}) => {
  return (
    <>
      <Seo title="Blog" description="局所的な人気があるらしい。" />
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
      </Container>
    </>
  );
};

export default BlogPage;
