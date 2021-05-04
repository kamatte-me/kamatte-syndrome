/** @jsxRuntime classic */
/** @jsx jsx * */
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import React from 'react';
import { Box, jsx, Text, Themed } from 'theme-ui';

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
    <Box sx={{ mb: 5 }}>
      <Box sx={{ mb: 4 }}>
        <span sx={{ display: 'block', mb: 1, color: 'gray' }}>
          {formatDate(post.publishedAt)}
        </span>
        <Themed.h1
          sx={{
            fontFamily: 'body',
          }}
        >
          {post.title}
        </Themed.h1>
      </Box>
      <Box
        sx={{
          overflowX: 'hidden',
        }}
      >
        <Text dangerouslySetInnerHTML={{ __html: post.body }} />
      </Box>
    </Box>
  );
};

export default BlogPostPage;
