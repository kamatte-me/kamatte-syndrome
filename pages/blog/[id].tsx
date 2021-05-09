/** @jsxRuntime classic */
/** @jsx jsx * */
import {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useCallback } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  jsx,
  Message,
  Text,
} from 'theme-ui';

import { SEO } from '@/components/elements/SEO';
import { PostPagination } from '@/components/pages/blog/PostPagination';
import { formatDate } from '@/lib/date';
import { htmlToThemed } from '@/lib/htmlToThemed';
import { client } from '@/lib/microcms';
import { Blog } from '@/lib/microcms/model';
import Custom404 from '@/pages/404';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await client.getAllContents('blog');
  const paths = posts.map(post => `/blog/${post.id}`);
  return { paths, fallback: true };
};

export interface BlogPreviewData {
  id: string;
  draftKey: string;
}

export const getStaticProps: GetStaticProps<
  {
    post: Blog;
    prevPost?: Blog | null;
    nextPost?: Blog | null;
    isPreview: boolean;
  },
  {
    id: string;
  }
> = async ({ params, preview, previewData }) => {
  const post = await client.getContent('blog', params!.id, {
    draftKey: preview ? (previewData as BlogPreviewData).draftKey : undefined,
  });

  if (!post) {
    return {
      props: {
        post,
        isPreview: preview || false,
      },
    };
  }

  const [prevPost, nextPost] = await Promise.all([
    client.getContents('blog', {
      limit: 1,
      fields: 'id,title',
      filters: `publishedAt[less_than]${post.publishedAt}`,
      orders: '-publishedAt',
    }),
    client.getContents('blog', {
      limit: 1,
      fields: 'id,title',
      filters: `publishedAt[greater_than]${post.publishedAt}`,
      orders: 'publishedAt',
    }),
  ]);

  return {
    props: {
      post,
      prevPost: prevPost.length > 0 ? prevPost[0] : null,
      nextPost: nextPost.length > 0 ? nextPost[0] : null,
      isPreview: preview || false,
    },
  };
};

const BlogPostPage: NextPage<
  InferGetStaticPropsType<typeof getStaticProps>
> = ({ post, prevPost, nextPost, isPreview }) => {
  if (!post) {
    return <Custom404 />;
  }

  const router = useRouter();
  const handleClearPreview = useCallback(() => {
    fetch('/api/clearPreviewData').then(() => {
      router.reload();
    });
  }, []);

  return (
    <>
      <SEO
        title={post.title}
        ogImageUrl={post.featuredImage && post.featuredImage.url}
      />
      <Container variant="narrowContainer">
        {isPreview && (
          <Message variant="primary" sx={{ textAlign: 'center', mb: 3 }}>
            <Text sx={{ fontWeight: 'bold' }}>プレビュー中</Text>
            <Button
              variant="secondary"
              onClick={() => handleClearPreview()}
              sx={{
                ml: 3,
              }}
            >
              解除
            </Button>
          </Message>
        )}
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
