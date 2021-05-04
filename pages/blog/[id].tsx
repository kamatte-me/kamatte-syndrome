/** @jsxRuntime classic */
/** @jsx jsx * */
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import React from 'react';
import { Box, Container, jsx, Text, Themed } from 'theme-ui';

import { formatDate } from '@/lib/date';
import { getAllContents, getContent } from '@/lib/microcms';
import { Blog } from '@/lib/microcms/model';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getAllContents<Blog>('blog');
  const paths = posts.map(post => `/blog/${post.id}`);
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<{
  post: Blog;
}> = async context => {
  const post = await getContent<Blog>('blog', context.params!.id! as string);

  return {
    props: {
      post,
    },
  };
};

const BlogPostPage: React.FC<
  InferGetStaticPropsType<typeof getStaticProps>
> = ({ post }) => {
  return (
    <Container variant="layout.blogContainer">
      <Box sx={{ mb: 4 }}>
        <Themed.h1
          sx={{
            mb: 2,
          }}
        >
          {post.title}
        </Themed.h1>
        <Text as="span" sx={{ fontSize: 1, color: 'gray' }}>
          {formatDate(post.publishedAt)}
        </Text>
      </Box>
      <Box
        sx={{
          overflowX: 'hidden',
        }}
      >
        <Text dangerouslySetInnerHTML={{ __html: post.body }} />
      </Box>
    </Container>
  );
};

export default BlogPostPage;
