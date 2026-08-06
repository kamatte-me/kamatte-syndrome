import { load } from 'cheerio/slim';
import type { MDXComponents, MDXContent } from 'mdx/types';
import type { ComponentPropsWithoutRef } from 'react';
import { resolveContentMediaUrl } from '@/utils/contentMedia';

type FeedUrlEmbedProps = {
  url: string;
};

export async function renderFeedContentHtml(
  MDXContent: MDXContent,
  contentBaseUrl: string,
) {
  const { renderToStaticMarkup } = await import(
    /* @vite-ignore */ 'react-dom/server.node'
  );

  return renderToStaticMarkup(
    <MDXContent components={createFeedMdxComponents(contentBaseUrl)} />,
  );
}

export function createFeedSummaryFromHtml(html: string, maxLength = 100) {
  const $ = load(html);
  $('script, style, noscript').remove();
  $('*').append(' ');

  const text = $.root().text().replace(/\s+/g, ' ').trim();

  return text.length <= maxLength ? text : `${text.slice(0, maxLength - 1)}...`;
}

function createFeedMdxComponents(contentBaseUrl: string): MDXComponents {
  return {
    a: (props) => <FeedAnchor {...props} contentBaseUrl={contentBaseUrl} />,
    img: (props) => <FeedImage {...props} contentBaseUrl={contentBaseUrl} />,
    LinkCard: (props: FeedUrlEmbedProps) => (
      <FeedUrlEmbedLink {...props} contentBaseUrl={contentBaseUrl} />
    ),
    OEmbed: (props: FeedUrlEmbedProps) => (
      <FeedUrlEmbedLink {...props} contentBaseUrl={contentBaseUrl} />
    ),
  };
}

function FeedAnchor({
  contentBaseUrl,
  href,
  ...props
}: ComponentPropsWithoutRef<'a'> & { contentBaseUrl: string }) {
  return (
    <a
      {...props}
      href={
        typeof href === 'string'
          ? createAbsoluteUrl(href, contentBaseUrl)
          : href
      }
    />
  );
}

function FeedImage({
  alt,
  contentBaseUrl,
  src,
  ...props
}: ComponentPropsWithoutRef<'img'> & { contentBaseUrl: string }) {
  return (
    <img
      {...props}
      alt={alt ?? ''}
      loading="lazy"
      src={
        typeof src === 'string'
          ? createAbsoluteUrl(resolveContentMediaUrl(src), contentBaseUrl)
          : src
      }
    />
  );
}

function FeedUrlEmbedLink({
  contentBaseUrl,
  url,
}: FeedUrlEmbedProps & { contentBaseUrl: string }) {
  const href = createAbsoluteUrl(url, contentBaseUrl);

  return <a href={href}>{href}</a>;
}

function createAbsoluteUrl(value: string, baseUrl: string) {
  return new URL(value, baseUrl).href;
}
