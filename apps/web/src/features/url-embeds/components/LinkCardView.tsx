import { cn } from '@/utils/classNames';
import type { OpenGraphMetadata } from '../utils/openGraph';
import styles from './LinkCardView.module.css';

export type LinkCardState =
  | { status: 'loading' }
  | { status: 'success'; metadata: OpenGraphMetadata }
  | { status: 'error'; message: string };

type LinkCardViewProps = {
  url: string;
  state: LinkCardState;
  className?: string;
};

export function LinkCardView({ url, state, className }: LinkCardViewProps) {
  const displayUrl = formatDisplayUrl(url);
  const metadata = state.status === 'success' ? state.metadata : undefined;
  const title = metadata?.title ?? displayUrl;
  const description = metadata?.description;
  const image = metadata?.image;
  const siteName = metadata?.siteName ?? displayUrl;
  const hasImage = Boolean(image);

  return (
    <a
      className={cn(
        'not-prose grid h-32 overflow-hidden border border-cutout-hole text-cutout-hole no-underline',
        styles.card,
        hasImage
          ? 'grid-cols-[minmax(0,1fr)_8rem] sm:grid-cols-[minmax(0,1fr)_160px] md:grid-cols-[minmax(0,1fr)_auto]'
          : 'grid-cols-1',
        className,
      )}
      href={url}
      rel="noreferrer"
      target="_blank"
    >
      <span className="flex min-h-full min-w-0 flex-col gap-1.5 p-3 sm:p-4">
        <span className="line-clamp-2 min-w-0 font-bold text-base leading-5">
          {title}
        </span>
        {description ? (
          <span
            className={cn(
              'line-clamp-1 text-cutout-readable text-xs leading-4',
              styles.readableText,
            )}
          >
            {description}
          </span>
        ) : null}
        <span className="mt-auto flex min-w-0 items-center gap-1.5 text-[11px] text-cutout-muted leading-4">
          {metadata?.favicon ? (
            <img
              alt=""
              className="h-3.5 w-3.5 shrink-0 rounded-sm"
              height={16}
              src={metadata.favicon}
              width={16}
            />
          ) : null}
          <span className={cn('truncate', styles.mutedText)}>{siteName}</span>
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
        <span className="min-h-full overflow-hidden border-cutout-hole border-l bg-transparent md:w-auto md:max-w-64">
          <img
            alt=""
            className="h-full w-full object-cover md:w-auto md:max-w-64 md:object-contain"
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
