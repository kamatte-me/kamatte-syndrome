/** @jsxRuntime classic */
/** @jsx jsx * */
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import React from 'react';
import { Box, Container, jsx } from 'theme-ui';

import { Seo } from '@/components/elements/Seo';
import { ListItem } from '@/components/pages/blog/ListItem';
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
      <Container variant="layout.blogContainer">
        {posts.map(post => (
          <Box
            sx={{
              ':not(:last-child)': {
                mb: 4,
              },
            }}
          >
            <ListItem post={post} />
          </Box>
        ))}
      </Container>
    </>
  );
};

export default BlogPage;
