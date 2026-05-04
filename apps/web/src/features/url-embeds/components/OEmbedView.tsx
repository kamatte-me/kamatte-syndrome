import type { OEmbedMetadata } from '../utils/oEmbed';
import { OEmbedHtml } from './OEmbedHtml';

type OEmbedViewProps = {
  metadata: OEmbedMetadata;
  url: string;
};

export function OEmbedView({ metadata, url }: OEmbedViewProps) {
  if (metadata.type === 'photo' && metadata.photoUrl) {
    return (
      <a
        className="not-prose my-6 block overflow-hidden border border-white no-underline"
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
        className={fixedAspect ? fixedAspectShellClassName : flowShellClassName}
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

const fixedAspectShellClassName =
  'not-prose my-6 overflow-hidden border border-white p-4';

const flowShellClassName = 'not-prose my-6 border border-white p-4';

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
