import { createFileRoute } from '@tanstack/react-router';
import {
  allBiographies,
  allCultures,
  allPortfolios,
  allPosts,
  allPrivacyPolicies,
  allSkills,
  allTerms,
} from 'content-collections';
import { baseUrl } from '@/constants/site';
import { sortPostsByPublishedAtDesc } from '@/utils/posts';
import { createSitemapXml, type SitemapEntry } from '@/utils/sitemap';

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () =>
        new Response(
          createSitemapXml(baseUrl, [
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

function createStaticPageEntries(): Array<SitemapEntry> {
  return [
    {
      path: '/',
      changefreq: 'yearly',
      priority: 1,
    },
    {
      path: '/biography',
      changefreq: 'yearly',
      lastmod: latestDate(
        allBiographies[0]?.revisedAt,
        allSkills[0]?.revisedAt,
      ),
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
      lastmod: allTerms[0]?.revisedAt,
      priority: 0.1,
    },
    {
      path: '/privacy',
      changefreq: 'yearly',
      lastmod: allPrivacyPolicies[0]?.revisedAt,
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

function createBlogPostEntries(): Array<SitemapEntry> {
  return sortPostsByPublishedAtDesc(allPosts).map((post) => ({
    path: `/blog/${post.slug}`,
    changefreq: 'yearly',
    lastmod: post.revisedAt ?? post.publishedAt,
    priority: 0.7,
  }));
}

function latestDate(...dates: Array<Date | undefined>) {
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
