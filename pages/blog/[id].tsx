import {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { BreadcrumbJsonLd, NewsArticleJsonLd, NextSeo } from 'next-seo';
import React, { Fragment, useMemo } from 'react';
import { Box, Container, Flex, Heading, Text } from 'theme-ui';

import { BlogEntriesPagination } from '@/components/pages/blog/BlogEntriesPagination';
import { PreviewControl } from '@/components/pages/blog/PreviewControl';
import { author, baseUrl, siteName } from '@/constants/site';
import { formatDate } from '@/lib/date';
import { client } from '@/lib/microcms';
import { Blog } from '@/lib/microcms/model';
import { htmlToTextContent, htmlToThemed } from '@/lib/parseHTML';
import Custom404 from '@/pages/404';

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
  const entry = await client.getContent('blog', params!.id, {
    draftKey: preview ? (previewData as BlogPreviewData).draftKey : undefined,
  });

  if (!entry) {
    return {
      props: { entry },
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

  if (!entry) {
    return <Custom404 />;
  }

  const bodyText = entry.body.map(b => htmlToTextContent(b.body)).join('');

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const description = useMemo(() => {
    if (bodyText.length <= 100) {
      return bodyText;
    }
    return `${bodyText.substring(0, 99)}…`;
  }, [bodyText]);

  return (
    <>
      <NextSeo
        title={entry.title}
        description={description}
        openGraph={{
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
                    : entry.featuredImage.url
                }
                priority
              />
            </Flex>
          )}
        </Box>

        <Box
          sx={{
            lineHeight: 1.9,
            '>': {
              '*:first-child': {
                marginTop: 0,
              },
            },
          }}
        >
          {entry.body.map((b, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <Fragment key={`body-${i}`}>{htmlToThemed(b.body)}</Fragment>
          ))}
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
