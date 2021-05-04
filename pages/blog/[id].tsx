/** @jsxRuntime classic */
/** @jsx jsx * */
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import Image from 'next/image';
import React from 'react';
import { Box, Container, Flex, Heading, jsx, Text } from 'theme-ui';

import { Seo } from '@/components/elements/Seo';
import { formatDate } from '@/lib/date';
import { htmlToThemed } from '@/lib/htmlToThemed';
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
    <>
      <Seo
        title={post.title}
        ogImageUrl={post.featuredImage && post.featuredImage.url}
      />
      <Container variant="layout.blogContainer">
        <Box sx={{ mb: 4 }}>
          <Heading
            sx={{
              variant: 'text.headingSerif',
              fontSize: 5,
              mb: 2,
            }}
          >
            {post.title}
          </Heading>
          <Text as="span" sx={{ fontSize: 1, color: 'gray' }}>
            {formatDate(post.publishedAt)}
          </Text>
          {post.featuredImage && (
            <Flex
              sx={{
                width: '100%',
                height: 200,
                justifyContent: 'center',
                mt: 2,
              }}
            >
              <Image
                src={post.featuredImage.url}
                objectFit="contain"
                width={post.featuredImage.width}
                height={post.featuredImage.height}
              />
            </Flex>
          )}
        </Box>
        <Box
          sx={{
            overflowX: 'hidden',
          }}
        >
          {htmlToThemed(post.body)}
        </Box>
      </Container>
    </>
  );
};

export default BlogPostPage;
