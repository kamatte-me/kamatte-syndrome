import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PortfolioTechnologyList } from './PortfolioTechnologyList';

describe('PortfolioTechnologyList', () => {
  it('renders each technology as a list item', () => {
    render(<PortfolioTechnologyList technologies={['React', 'TypeScript']} />);

    const listItems = screen.getAllByRole('listitem');

    expect(listItems).toHaveLength(2);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('keeps spacing as caller-provided classes', () => {
    render(
      <PortfolioTechnologyList
        className="mt-3"
        technologies={['React', 'TypeScript']}
      />,
    );

    expect(screen.getByRole('list')).toHaveClass(
      'flex',
      'flex-wrap',
      'gap-2',
      'mt-3',
    );
  });

  it('does not own top margin by default', () => {
    render(<PortfolioTechnologyList technologies={['React']} />);

    expect(screen.getByRole('list')).not.toHaveClass('mt-3');
  });
});
