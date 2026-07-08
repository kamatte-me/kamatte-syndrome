import { cn } from '@/utils/classNames';
import type { OEmbedMetadata } from '../utils/oEmbed';
import { OEmbedHtml } from './OEmbedHtml';

type OEmbedViewProps = {
  metadata: OEmbedMetadata;
  url: string;
  className?: string;
};

export function OEmbedView({ metadata, url, className }: OEmbedViewProps) {
  if (metadata.type === 'photo' && metadata.photoUrl) {
    return (
      <a
        className={cn(
          'not-prose block overflow-hidden border border-cutout-hole no-underline',
          className,
        )}
        href={url}
        rel="noreferrer"
        target="_blank"
      >
        <img
          alt={getEmbedTitle(metadata, url)}
          className="h-auto w-full object-cover"
          loading="lazy"
          src={metadata.photoUrl}
        />
      </a>
    );
  }

  if (
    (metadata.type === 'video' || metadata.type === 'rich') &&
    metadata.html
  ) {
    const fixedAspect = hasIframe(metadata.html);

    return (
      <div
        className={cn('not-prose', fixedAspect && 'overflow-hidden', className)}
        style={
          fixedAspect
            ? { aspectRatio: getEmbedAspectRatio(metadata) }
            : undefined
        }
      >
        <OEmbedHtml fitIframes={fixedAspect} html={metadata.html} />
      </div>
    );
  }

  return null;
}

function getEmbedTitle(metadata: OEmbedMetadata, fallback: string) {
  return metadata.title ?? metadata.providerName ?? fallback;
}

function getEmbedAspectRatio(metadata: OEmbedMetadata) {
  if (metadata.width && metadata.height) {
    return `${metadata.width} / ${metadata.height}`;
  }

  return '16 / 9';
}

function hasIframe(html: string) {
  return /<iframe\b/i.test(html);
}
