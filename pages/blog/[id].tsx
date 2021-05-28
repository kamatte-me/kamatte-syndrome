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
import { BlogEntriesPagination } from '@/components/pages/blog/BlogEntriesPagination';
import { formatDate } from '@/lib/date';
import { htmlToThemed } from '@/lib/htmlToThemed';
import { client } from '@/lib/microcms';
import { Blog } from '@/lib/microcms/model';
import Custom404 from '@/pages/404';

export const getStaticPaths: GetStaticPaths = async () => {
  const entries = await client.getAllContents('blog', {
    fields: 'id',
    limit: 50,
  });
  const paths = entries.map(entry => `/blog/${entry.id}`);
  return { paths, fallback: true };
};

export interface BlogPreviewData {
  id: string;
  draftKey: string;
}

interface BlogPageProps {
  entry: Blog;
  prevEntry?: Blog | null;
  nextEntry?: Blog | null;
  isPreview: boolean;
}

export const getStaticProps: GetStaticProps<
  BlogPageProps,
  {
    id: string;
  }
> = async ({ params, preview, previewData }) => {
  const entry = await client.getContent('blog', params!.id, {
    draftKey: preview ? (previewData as BlogPreviewData).draftKey : undefined,
  });

  if (!entry) {
    return {
      props: {
        entry,
        isPreview: preview || false,
      } as BlogPageProps,
    };
  }

  const [prevEntry, nextEntry] = await Promise.all([
    client.getContents('blog', {
      limit: 1,
      fields: 'id,title',
      filters: `publishedAt[less_than]${entry.publishedAt}`,
      orders: '-publishedAt',
    }),
    client.getContents('blog', {
      limit: 1,
      fields: 'id,title',
      filters: `publishedAt[greater_than]${entry.publishedAt}`,
      orders: 'publishedAt',
    }),
  ]);

  return {
    props: {
      entry,
      prevEntry: prevEntry.length > 0 ? prevEntry[0] : null,
      nextEntry: nextEntry.length > 0 ? nextEntry[0] : null,
      isPreview: preview || false,
    } as BlogPageProps,
  };
};

const BlogEntryPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> =
  ({ entry, prevEntry, nextEntry, isPreview }) => {
    if (!entry) {
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
          title={entry.title}
          ogImageUrl={entry.featuredImage && entry.featuredImage.url}
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
              {entry.title}
            </Heading>
            <Text as="span" sx={{ fontSize: 1, color: 'darkgray' }}>
              {formatDate(entry.publishedAt)}
            </Text>
            {entry.featuredImage && (
              <Flex
                sx={{
                  width: '100%',
                  height: 200,
                  justifyContent: 'center',
                  mt: 2,
                }}
              >
                <Image
                  src={entry.featuredImage.url}
                  alt={entry.title}
                  objectFit="contain"
                  width={entry.featuredImage.width}
                  height={entry.featuredImage.height}
                  priority
                />
              </Flex>
            )}
          </Box>
          <Box>{htmlToThemed(entry.body)}</Box>
          <Box sx={{ mt: 5 }}>
            <BlogEntriesPagination prev={prevEntry} next={nextEntry} />
          </Box>
        </Container>
      </>
    );
  };

export default BlogEntryPage;
