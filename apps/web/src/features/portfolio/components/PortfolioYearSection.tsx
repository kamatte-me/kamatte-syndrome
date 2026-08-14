import type { PortfolioYearGroup } from '../types';
import { PortfolioItemCard } from './PortfolioItemCard';

type PortfolioYearSectionProps = {
  group: PortfolioYearGroup;
};

export function PortfolioYearSection({ group }: PortfolioYearSectionProps) {
  return (
    <section className="grid gap-5 md:grid-cols-[minmax(8rem,max-content)_minmax(0,1fr)] md:gap-x-6">
      <h2 className="top-6 h-fit whitespace-nowrap text-center font-display font-normal text-4xl text-cutout-hole sm:text-5xl md:text-left">
        {group.year}
      </h2>

      <ul className="grid gap-5">
        {group.items.map((item) => (
          <PortfolioItemCard item={item} key={item.slug} />
        ))}
      </ul>
    </section>
  );
}
