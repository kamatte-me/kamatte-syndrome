import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { PortfolioListItem, PortfolioYearGroup } from '../types';
import { PortfolioYearSection } from './PortfolioYearSection';

function createPortfolioItem(
  overrides: Partial<PortfolioListItem> = {},
): PortfolioListItem {
  return {
    body: (<p>Section body</p>) as PortfolioListItem['body'],
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

describe('PortfolioYearSection', () => {
  it('keeps the desktop year column wide enough for display-font years', () => {
    const group: PortfolioYearGroup = {
      year: 2026,
      items: [createPortfolioItem()],
    };
    const { container } = render(<PortfolioYearSection group={group} />);

    expect(container.firstElementChild).toHaveClass(
      'md:grid-cols-[minmax(8rem,max-content)_minmax(0,1fr)]',
    );
    expect(screen.getByRole('heading', { level: 2, name: '2026' })).toHaveClass(
      'whitespace-nowrap',
    );
  });
});
