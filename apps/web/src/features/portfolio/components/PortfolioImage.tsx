import portfolioContentImages from 'virtual:content-images?src=@@/kamatte-syndrome-content/media&base=/media&widths=160;176;320;352';
import { ContentImage } from '@/components/ui/ContentImage';
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
    <ContentImage
      src={image}
      alt={item.name}
      width={176}
      height={176}
      loading="lazy"
      manifest={portfolioContentImages}
      sizes="(min-width: 640px) 176px, 160px"
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
