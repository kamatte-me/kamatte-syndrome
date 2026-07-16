import { createFileRoute } from '@tanstack/react-router';
import { type Author, Feed as FeedGenerator } from 'feed';
import { author, baseUrl, siteName, slogan } from '@/constants/site';
import { getPosts } from '@/features/blog/server/getPosts.server';
import {
  createFeedSummaryFromHtml,
  renderFeedContentHtml,
} from '@/features/feed/server/feedContent.server';

const feedItemLimit = 10;

const feedAuthor: Author = {
  name: author,
  link: createAbsoluteUrl('/biography'),
};

export const Route = createFileRoute('/feed.xml')({
  server: {
    handlers: {
      GET: async () => {
        const entries = await Promise.all(
          getPosts()
            .slice(0, feedItemLimit)
            .map(async (post) => {
              const url = createAbsoluteUrl(`/blog/${post.slug}`);
              const contentHtml = await renderFeedContentHtml(post.mdx, url);

              return {
                contentHtml,
                image: post.featuredImage ?? '/avatar.png',
                published: post.publishedAt,
                summary: createFeedSummaryFromHtml(contentHtml),
                title: post.title,
                updated: post.revisedAt ?? post.publishedAt ?? new Date(0),
                url,
              };
            }),
        );

        const feed = new FeedGenerator({
          author: feedAuthor,
          copyright: `© ${String(new Date().getFullYear())} ${siteName}`,
          description: slogan,
          favicon: createAbsoluteUrl('/favicon.ico'),
          feedLinks: {
            atom: createAbsoluteUrl('/feed.xml'),
          },
          generator: false,
          hub: 'https://pubsubhubbub.appspot.com/',
          id: createAbsoluteUrl('/'),
          image: createAbsoluteUrl('/icon-48x48.png'),
          language: 'ja',
          link: createAbsoluteUrl('/'),
          title: siteName,
        });

        feed.options.updated = entries.reduce(
          (latest, entry) =>
            entry.updated.getTime() > latest.getTime() ? entry.updated : latest,
          new Date(0),
        );

        entries.forEach((entry) => {
          feed.addItem({
            author: [feedAuthor],
            content: entry.contentHtml,
            date: entry.updated,
            description: entry.summary,
            id: entry.url,
            image: createAbsoluteUrl(entry.image),
            link: entry.url,
            published: entry.published,
            title: entry.title,
          });
        });

        return new Response(feed.atom1(), {
          headers: {
            'Cache-Control': 'public, max-age=0, s-maxage=600',
            'Content-Type': 'application/atom+xml; charset=utf-8',
          },
        });
      },
    },
  },
});

function createAbsoluteUrl(path: string) {
  return new URL(path, baseUrl).href;
}
