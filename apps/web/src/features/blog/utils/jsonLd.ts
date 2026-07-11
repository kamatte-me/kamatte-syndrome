import type { BlogPosting, BreadcrumbList, WithContext } from 'schema-dts';
import {
  authorJsonLdId,
  authorProfileUrl,
  schemaOrgContext,
} from '@/constants/jsonLd';
import { author, baseUrl } from '@/constants/site';

type BlogStructuredDataOptions = {
  description: string;
  featuredImage?: string;
  publishedAt?: Date;
  revisedAt?: Date;
  slug: string;
  title: string;
};

function createBlogPostUrl(slug: string) {
  return new URL(`/blog/${slug}`, baseUrl).href;
}

export function createBlogPostingStructuredData({
  description,
  featuredImage,
  publishedAt,
  revisedAt,
  slug,
  title,
}: BlogStructuredDataOptions): WithContext<BlogPosting> {
  const url = createBlogPostUrl(slug);

  return {
    '@context': schemaOrgContext,
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: title,
    description,
    url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    image: featuredImage ? new URL(featuredImage, baseUrl).href : undefined,
    datePublished: publishedAt?.toISOString(),
    dateModified: revisedAt?.toISOString(),
    author: {
      '@type': 'Person',
      '@id': authorJsonLdId,
      name: author,
      url: authorProfileUrl,
    },
  };
}

export function createBlogBreadcrumbStructuredData({
  slug,
  title,
}: Pick<
  BlogStructuredDataOptions,
  'slug' | 'title'
>): WithContext<BreadcrumbList> {
  const url = createBlogPostUrl(slug);

  return {
    '@context': schemaOrgContext,
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Blog',
        item: new URL('/blog', baseUrl).href,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: title,
        item: url,
      },
    ],
  };
}
