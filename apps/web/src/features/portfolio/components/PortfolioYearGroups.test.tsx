import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { PortfolioListItem, PortfolioYearGroup } from '../types';
import { PortfolioYearGroups } from './PortfolioYearGroups';

function createPortfolioItem(
  overrides: Partial<PortfolioListItem> = {},
): PortfolioListItem {
  return {
    body: (<p>Group body</p>) as PortfolioListItem['body'],
    category: 'Website',
    image: undefined,
    link: undefined,
    name: 'Example Work',
    order: 1,
    slug: 'example-work',
    technologies: ['React'],
    year: 2026,
    ...overrides,
  };
}

describe('PortfolioYearGroups', () => {
  it('renders each year group and its portfolio cards', () => {
    const groups: PortfolioYearGroup[] = [
      {
        year: 2026,
        items: [createPortfolioItem()],
      },
      {
        year: 2025,
        items: [
          createPortfolioItem({
            name: 'Previous Work',
            slug: 'previous-work',
            year: 2025,
          }),
        ],
      },
    ];

    render(<PortfolioYearGroups groups={groups} />);

    expect(
      screen.getByRole('heading', { level: 2, name: '2026' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: '2025' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Example Work')).toBeInTheDocument();
    expect(screen.getByText('Previous Work')).toBeInTheDocument();
  });
});
