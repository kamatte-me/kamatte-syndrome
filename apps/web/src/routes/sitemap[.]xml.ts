import {
  generateSitemapXml,
  type SitemapEntry,
} from '@kamatte-syndrome/sitemap-generator';
import { createFileRoute } from '@tanstack/react-router';
import {
  allCultures,
  allPortfolios,
  allPosts,
  biography,
  privacyPolicy,
  skills,
  terms,
} from 'content-collections';
import { baseUrl } from '@/constants/site';
import { sortPostsByPublishedAtDesc } from '@/utils/posts';

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () =>
        new Response(
          generateSitemapXml(baseUrl, [
            ...createStaticPageEntries(),
            createBlogIndexEntry(),
            ...createBlogPostEntries(),
          ]),
          {
            headers: {
              'Cache-Control': 'public, max-age=0, s-maxage=600',
              'Content-Type': 'application/xml; charset=utf-8',
            },
          },
        ),
    },
  },
});

function createStaticPageEntries(): SitemapEntry[] {
  return [
    {
      path: '/',
      changefreq: 'yearly',
      priority: 1,
    },
    {
      path: '/biography',
      changefreq: 'yearly',
      lastmod: latestDate(biography.revisedAt, skills.revisedAt),
      priority: 0.8,
    },
    {
      path: '/portfolio',
      changefreq: 'yearly',
      lastmod: latestDate(...allPortfolios.map((item) => item.revisedAt)),
      priority: 0.2,
    },
    {
      path: '/culture',
      changefreq: 'monthly',
      lastmod: latestDate(...allCultures.map((item) => item.revisedAt)),
      priority: 0.4,
    },
    {
      path: '/subscribe',
      changefreq: 'yearly',
      priority: 0.1,
    },
    {
      path: '/terms',
      changefreq: 'yearly',
      lastmod: terms.revisedAt,
      priority: 0.1,
    },
    {
      path: '/privacy',
      changefreq: 'yearly',
      lastmod: privacyPolicy.revisedAt,
      priority: 0.1,
    },
  ];
}

function createBlogIndexEntry(): SitemapEntry {
  const posts = sortPostsByPublishedAtDesc(allPosts);
  const latestPost = posts[0];
  const lastmod = latestPost?.publishedAt ?? latestPost?.revisedAt;

  return {
    path: '/blog',
    changefreq: 'weekly',
    lastmod,
    priority: 0.5,
  };
}

function createBlogPostEntries(): SitemapEntry[] {
  return sortPostsByPublishedAtDesc(allPosts).map((post) => ({
    path: `/blog/${post.slug}`,
    changefreq: 'yearly',
    lastmod: post.revisedAt ?? post.publishedAt,
    priority: 0.7,
  }));
}

function latestDate(...dates: (Date | undefined)[]) {
  return dates.reduce<Date | undefined>((latest, date) => {
    if (!date) {
      return latest;
    }

    if (!latest || date.getTime() > latest.getTime()) {
      return date;
    }

    return latest;
  }, undefined);
}
