import {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from 'next';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { BreadcrumbJsonLd, NewsArticleJsonLd, NextSeo } from 'next-seo';
import React, { Fragment, useMemo } from 'react';
import { Box, Container, Flex, Heading, Text } from 'theme-ui';

import { BlogEntriesPagination } from '@/components/pages/blog/BlogEntriesPagination';
import { author, baseUrl, siteName } from '@/constants/site';
import { parseBlogBody } from '@/lib/blog';
import { formatDate } from '@/lib/date';
import { client } from '@/lib/microcms';
import { Blog } from '@/lib/microcms/model';

const PreviewControl = dynamic(
  () => import('@/components/pages/blog/PreviewControl'),
  { ssr: false },
);

export const getStaticPaths: GetStaticPaths = async () => {
  const entries = await client.getAllContents('blog', {
    fields: 'id',
    limit: 100,
  });
  const paths = entries.map(entry => `/blog/${entry.id}`);
  return { paths, fallback: 'blocking' };
};

export interface BlogPreviewData {
  id: string;
  draftKey: string;
}

interface BlogPageProps {
  entry: Blog;
  prevEntry?: Blog | null;
  nextEntry?: Blog | null;
}

const FEATURED_IMAGE_MAX_HEIGHT = 400;

export const getStaticProps: GetStaticProps<
  BlogPageProps,
  {
    id: string;
  }
> = async ({ params, preview, previewData }) => {
  const entry = await client
    .getContent('blog', params!.id, {
      draftKey: preview ? (previewData as BlogPreviewData).draftKey : undefined,
    })
    .catch(() => undefined);

  if (!entry) {
    return {
      notFound: true,
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
    },
  };
};

const BlogEntryPage: NextPage<
  InferGetStaticPropsType<typeof getStaticProps>
> = ({ entry, prevEntry, nextEntry }) => {
  const router = useRouter();

  const {
    Component: BlogBody,
    text: bodyText,
    description,
  } = useMemo(() => {
    return parseBlogBody(entry.body);
  }, [entry.body]);

  return (
    <>
      <NextSeo
        title={entry.title}
        description={description}
        openGraph={{
          title: entry.title,
          images: entry.featuredImage
            ? [
                {
                  url: entry.featuredImage.url,
                  width: entry.featuredImage.width,
                  height: entry.featuredImage.height,
                },
              ]
            : undefined,
          type: 'article',
          article: {
            publishedTime: entry.publishedAt,
            modifiedTime: entry.revisedAt,
            authors: [author],
          },
        }}
      />
      <NewsArticleJsonLd
        type="BlogPosting"
        url={`${baseUrl}/blog/${entry.id}`}
        title={entry.title}
        description={description}
        images={entry.featuredImage ? [entry.featuredImage.url] : []}
        authorName={author}
        keywords=""
        section=""
        body={bodyText}
        datePublished={entry.publishedAt!}
        dateModified={entry.revisedAt}
        dateCreated={entry.publishedAt!}
        publisherLogo={`${baseUrl}/icon.png`}
        publisherName={siteName}
      />
      <BreadcrumbJsonLd
        itemListElements={[
          {
            position: 1,
            name: 'Blog',
            item: `${baseUrl}/blog`,
          },
          {
            position: 2,
            name: entry.title,
            item: `${baseUrl}/blog/${entry.id}`,
          },
        ]}
      />

      <Container as="article" variant="narrowContainer">
        <Box sx={{ mb: 4 }}>
          <Heading
            as="h1"
            sx={{
              variant: 'text.headingSerif',
              fontSize: 5,
              mb: 2,
              lineHeight: 1.3,
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
                justifyContent: 'center',
                mt: 2,
              }}
            >
              <Image
                src={entry.featuredImage.url}
                alt={entry.title}
                width={
                  entry.featuredImage.height > FEATURED_IMAGE_MAX_HEIGHT
                    ? entry.featuredImage.width *
                      (FEATURED_IMAGE_MAX_HEIGHT / entry.featuredImage.height)
                    : entry.featuredImage.width
                }
                height={
                  entry.featuredImage.height > FEATURED_IMAGE_MAX_HEIGHT
                    ? FEATURED_IMAGE_MAX_HEIGHT
                    : entry.featuredImage.height
                }
                priority
              />
            </Flex>
          )}
        </Box>

        <Box
          key={`blog-body-${entry.id}`} // `DOMException: Failed to execute 'removeChild' on 'Node'` 対策
          sx={{
            fontSize: 2,
            lineHeight: 1.9,
          }}
        >
          <BlogBody />
        </Box>
        <Box sx={{ mt: 5 }}>
          <BlogEntriesPagination prev={prevEntry} next={nextEntry} />
        </Box>
      </Container>

      {router.isPreview && <PreviewControl />}
    </>
  );
};

export default BlogEntryPage;
