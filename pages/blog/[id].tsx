/** @jsxRuntime classic */
/** @jsx jsx * */
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import Image from 'next/image';
import React from 'react';
import { Box, Container, Flex, Heading, jsx, Text } from 'theme-ui';

import { SEO } from '@/components/elements/SEO';
import { PostPagination } from '@/components/pages/blog/PostPagination';
import { formatDate } from '@/lib/date';
import { htmlToThemed } from '@/lib/htmlToThemed';
import { client } from '@/lib/microcms';
import { Blog } from '@/lib/microcms/model';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await client.getAllContents('blog');
  const paths = posts.map(post => `/blog/${post.id}`);
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<{
  post: Blog;
  prevPost?: Blog | null;
  nextPost?: Blog | null;
}> = async context => {
  const post = await client.getContent('blog', context.params!.id! as string);

  // TODO: パラレルfetch
  const prevPost = await client.getContents('blog', {
    limit: 1,
    fields: 'id,title',
    filters: `publishedAt[less_than]${post.publishedAt}`,
    orders: '-publishedAt',
  });
  const nextPost = await client.getContents('blog', {
    limit: 1,
    fields: 'id,title',
    filters: `publishedAt[greater_than]${post.publishedAt}`,
    orders: 'publishedAt',
  });

  return {
    props: {
      post,
      prevPost: prevPost.length > 0 ? prevPost[0] : null,
      nextPost: nextPost.length > 0 ? nextPost[0] : null,
    },
  };
};

const BlogPostPage: React.FC<
  InferGetStaticPropsType<typeof getStaticProps>
> = ({ post, prevPost, nextPost }) => {
  return (
    <>
      <SEO
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
          <Text as="span" sx={{ fontSize: 1, color: 'darkgray' }}>
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
                priority
              />
            </Flex>
          )}
        </Box>
        <Box>{htmlToThemed(post.body)}</Box>
        <Box sx={{ mt: 5 }}>
          <PostPagination prev={prevPost} next={nextPost} />
        </Box>
      </Container>
    </>
  );
};

export default BlogPostPage;
