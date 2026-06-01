import { cn } from '@/utils/classNames';
import type { PortfolioListItem } from '../types';
import { PortfolioImagePlaceholder } from './PortfolioImagePlaceholder';

type PortfolioImageProps = {
  item: PortfolioListItem;
  link?: string;
};

const frameClassName =
  'block aspect-square w-40 max-w-full justify-self-center overflow-hidden sm:w-44 md:w-full md:justify-self-start';

export function PortfolioImage({ item, link }: PortfolioImageProps) {
  const image = item.image || undefined;
  const imageContent = image ? (
    <img
      src={image}
      alt={item.name}
      width={440}
      height={440}
      loading="lazy"
      className="h-full w-full object-contain"
    />
  ) : (
    <PortfolioImagePlaceholder />
  );

  if (!link) {
    return <div className={frameClassName}>{imageContent}</div>;
  }

  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      className={cn(frameClassName, 'hover:opacity-80')}
      aria-label={`${item.name} を開く`}
    >
      {imageContent}
    </a>
  );
}
