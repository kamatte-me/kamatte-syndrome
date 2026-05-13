import type { OpenGraphMetadata } from '../utils/openGraph';

export type LinkCardState =
  | { status: 'loading' }
  | { status: 'success'; metadata: OpenGraphMetadata }
  | { status: 'error'; message: string };

type LinkCardViewProps = {
  url: string;
  state: LinkCardState;
};

export function LinkCardView({ url, state }: LinkCardViewProps) {
  const displayUrl = formatDisplayUrl(url);
  const metadata = state.status === 'success' ? state.metadata : undefined;
  const title = metadata?.title ?? displayUrl;
  const description = metadata?.description;
  const image = metadata?.image;
  const siteName = metadata?.siteName ?? displayUrl;

  return (
    <a
      className="not-prose my-6 grid overflow-hidden border border-cutout-hole text-cutout-hole no-underline sm:grid-cols-[minmax(0,1fr)_180px]"
      href={url}
      rel="noreferrer"
      target="_blank"
    >
      <span className="flex min-w-0 flex-col gap-3 p-4 sm:p-5">
        <span className="min-w-0 font-semibold text-base leading-6">
          {title}
        </span>
        {description ? (
          <span className="line-clamp-2 text-cutout-readable text-sm leading-6">
            {description}
          </span>
        ) : null}
        <span className="flex min-w-0 items-center gap-2 text-cutout-muted text-xs">
          {metadata?.favicon ? (
            <img
              alt=""
              className="h-4 w-4 shrink-0 rounded-sm"
              height={16}
              src={metadata.favicon}
              width={16}
            />
          ) : null}
          <span className="truncate">{siteName}</span>
          {state.status === 'loading' ? (
            <span className="shrink-0 text-cutout-muted">Loading</span>
          ) : null}
          {state.status === 'error' ? (
            <span className="shrink-0 text-cutout-muted">
              Preview unavailable
            </span>
          ) : null}
        </span>
      </span>
      {image ? (
        <span className="hidden min-h-full bg-transparent sm:block">
          <img
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            src={image}
          />
        </span>
      ) : null}
    </a>
  );
}

function formatDisplayUrl(value: string) {
  try {
    const url = new URL(value);
    return url.hostname.replace(/^www\./, '');
  } catch {
    return value;
  }
}
