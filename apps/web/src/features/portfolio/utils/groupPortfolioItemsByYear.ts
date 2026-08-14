import type { PortfolioListItem, PortfolioYearGroup } from '../types';

export function groupPortfolioItemsByYear(
  items: PortfolioListItem[],
): PortfolioYearGroup[] {
  const groups = new Map<number, PortfolioListItem[]>();

  for (const item of items) {
    const group = groups.get(item.year);

    if (group) {
      group.push(item);
    } else {
      groups.set(item.year, [item]);
    }
  }

  return Array.from(groups, ([year, groupedItems]): PortfolioYearGroup => {
    return {
      year,
      items: groupedItems,
    };
  });
}
