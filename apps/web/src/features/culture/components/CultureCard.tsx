import { cn } from '@/utils/classNames';
import type { CultureListItem } from '../types';
import cultureStyles from './Culture.module.css';

type CultureCardProps = {
  item: CultureListItem;
  onOpen: (slug: string) => void;
};

export function CultureCard({ item, onOpen }: CultureCardProps) {
  return (
    <li>
      <button
        type="button"
        className="group grid h-full w-full cursor-pointer overflow-hidden border border-cutout-hole text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-cutout-hole"
        onClick={() => onOpen(item.slug)}
      >
        <span
          className={cn(
            cultureStyles.cardFrame,
            'relative block aspect-[4/3] overflow-hidden',
          )}
        >
          <span
            data-culture-card-media
            className={cn(
              cultureStyles.cardMedia,
              'block size-full overflow-hidden',
            )}
          >
            <img
              src={`https://img.youtube.com/vi/${item.youtubeVideoId}/hqdefault.jpg`}
              alt=""
              width={480}
              height={360}
              loading="lazy"
              className="block size-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-110"
            />
          </span>
          <span aria-hidden="true" className={cultureStyles.playIndicator} />
        </span>
        <span className="flex min-h-20 items-center justify-center px-4 py-3 text-center font-bold text-cutout-hole text-lg leading-snug [word-break:auto-phrase]">
          {item.name}
        </span>
      </button>
    </li>
  );
}
