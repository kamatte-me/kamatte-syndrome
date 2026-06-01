import externalLinkIcon from '@/assets/icons/external_link_line.svg';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { MarkdownContent } from '@/components/ui/MarkdownContent';
import type { PortfolioListItem } from '../types';
import { PortfolioImage } from './PortfolioImage';
import { PortfolioTechnologyList } from './PortfolioTechnologyList';

type PortfolioItemCardProps = {
  item: PortfolioListItem;
};

export function PortfolioItemCard({ item }: PortfolioItemCardProps) {
  const link = item.link || undefined;

  return (
    <li className="border border-cutout-hole">
      <div className="grid items-start gap-5 p-4 sm:p-5 md:grid-cols-[minmax(9rem,11rem)_1fr] md:gap-6">
        <PortfolioImage item={item} link={link} />

        <div className="flex flex-col gap-4 md:min-h-44 md:py-1">
          <header className="grid gap-3">
            <Chip className="font-semibold">{item.category}</Chip>

            <h3 className="font-bold text-2xl leading-tight">
              {link ? (
                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-cutout-hole hover:text-cutout-hole"
                >
                  {item.name}
                  <Icon className="size-4" src={externalLinkIcon} />
                </a>
              ) : (
                item.name
              )}
            </h3>
          </header>

          <MarkdownContent variant="compact">{item.body}</MarkdownContent>

          <PortfolioTechnologyList
            className="mt-3"
            technologies={item.technologies}
          />
        </div>
      </div>
    </li>
  );
}
