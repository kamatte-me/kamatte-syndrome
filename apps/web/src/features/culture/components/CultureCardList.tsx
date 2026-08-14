import type { CultureListItem } from '../types';
import { CultureCard } from './CultureCard';

type CultureCardListProps = {
  items: CultureListItem[];
  onOpen: (slug: string) => void;
};

export function CultureCardList({ items, onOpen }: CultureCardListProps) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <CultureCard item={item} key={item.slug} onOpen={onOpen} />
      ))}
    </ul>
  );
}
