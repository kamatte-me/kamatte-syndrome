import type {
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
import { Box, Container, Flex, Heading } from 'theme-ui';

import { BlogEntriesPagination } from '@/components/pages/blog/BlogEntriesPagination';
import { author, baseUrl, siteName } from '@/constants/site';
import { parseBlogBody } from '@/lib/blog';
import { formatDate } from '@/lib/date';
import { client } from '@/lib/microcms';
import type { Blog } from '@/lib/microcms/model';
import { htmlToThemed } from '@/lib/parseHTML';

const PreviewControl = dynamic(
  () => import('@/components/pages/blog/PreviewControl'),
  { ssr: false },
);

export const getStaticPaths: GetStaticPaths = async () => {
  const entries = await client.getAllContents('blog', {
    fields: 'id',
    limit: 100,
  });
  const paths = entries.map((entry) => `/blog/${entry.id}`);
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
  if (!params) {
    return {
      notFound: true,
    };
  }

  const entry = await client
    .getContent('blog', params.id, {
      draftKey: preview ? (previewData as BlogPreviewData).draftKey : undefined,
    })
    .catch(() => undefined);

  if (!entry) {
    return {
      notFound: true,
    };
  }

  const [prevEntry, nextEntry] = entry.publishedAt
    ? await Promise.all([
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
      ])
    : [[], []];

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

  const { text: bodyText, description } = useMemo(
    () => parseBlogBody(entry.body),
    [entry.body],
  );

  return (
    <>
      <NextSeo
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
        title={entry.title}
      />
      <NewsArticleJsonLd
        authorName={author}
        body={bodyText}
        dateCreated={entry.publishedAt ?? new Date().toISOString()}
        dateModified={entry.revisedAt}
        datePublished={entry.publishedAt ?? new Date().toISOString()}
        description={description}
        images={entry.featuredImage ? [entry.featuredImage.url] : []}
        keywords=""
        publisherLogo={`${baseUrl}/icon.png`}
        publisherName={siteName}
        section=""
        title={entry.title}
        type="BlogPosting"
        url={`${baseUrl}/blog/${entry.id}`}
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
          <Box sx={{ fontSize: 1, color: 'darkgray' }}>
            {formatDate(entry.publishedAt)}
          </Box>
          {entry.featuredImage ? (
            <Flex
              sx={{
                justifyContent: 'center',
                mt: 2,
              }}
            >
              <Image
                alt={entry.title}
                height={
                  entry.featuredImage.height > FEATURED_IMAGE_MAX_HEIGHT
                    ? FEATURED_IMAGE_MAX_HEIGHT
                    : entry.featuredImage.height
                }
                priority
                src={entry.featuredImage.url}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                }}
                width={
                  entry.featuredImage.height > FEATURED_IMAGE_MAX_HEIGHT
                    ? entry.featuredImage.width *
                      (FEATURED_IMAGE_MAX_HEIGHT / entry.featuredImage.height)
                    : entry.featuredImage.width
                }
              />
            </Flex>
          ) : null}
        </Box>

        <Box
          key={`blog-body-${entry.id}`} // `DOMException: Failed to execute 'removeChild' on 'Node'` 対策
          sx={{
            fontSize: 2,
            lineHeight: 1.9,
            'p + p': {
              marginTop: '1.2em',
            },
          }}
        >
          {htmlToThemed(entry.body)}
        </Box>
        <Box sx={{ mt: 5 }}>
          <BlogEntriesPagination next={nextEntry} prev={prevEntry} />
        </Box>
      </Container>

      {router.isPreview ? <PreviewControl /> : null}
    </>
  );
};

export default BlogEntryPage;
