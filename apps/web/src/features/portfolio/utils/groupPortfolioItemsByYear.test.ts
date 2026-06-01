import { describe, expect, it } from 'vitest';
import type { PortfolioListItem } from '../types';
import { groupPortfolioItemsByYear } from './groupPortfolioItemsByYear';

function createPortfolioItem(
  name: string,
  year: number,
  order: number,
): PortfolioListItem {
  return {
    body: {} as PortfolioListItem['body'],
    category: 'Website',
    name,
    order,
    slug: name.toLowerCase().replaceAll(' ', '-'),
    technologies: ['React'],
    year,
  };
}

describe('groupPortfolioItemsByYear', () => {
  it('groups portfolio items by year while preserving input year order', () => {
    const groups = groupPortfolioItemsByYear([
      createPortfolioItem('Latest', 2026, 3),
      createPortfolioItem('Previous', 2025, 2),
      createPortfolioItem('Another latest', 2026, 1),
    ]);

    expect(groups.map((group) => group.year)).toEqual([2026, 2025]);
    expect(groups[0]?.items.map((item) => item.name)).toEqual([
      'Latest',
      'Another latest',
    ]);
    expect(groups[1]?.items.map((item) => item.name)).toEqual(['Previous']);
  });

  it('returns an empty group list for empty input', () => {
    expect(groupPortfolioItemsByYear([])).toEqual([]);
  });
});
