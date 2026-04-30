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
        className="not-prose my-6 block overflow-hidden rounded-lg bg-black/40 no-underline transition hover:-translate-y-0.5"
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
  'not-prose my-6 overflow-hidden rounded-lg bg-black/40 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.3)]';

const flowShellClassName =
  'not-prose my-6 rounded-lg bg-black/40 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.3)]';

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
