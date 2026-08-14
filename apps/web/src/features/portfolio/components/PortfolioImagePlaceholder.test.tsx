import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PortfolioImagePlaceholder } from './PortfolioImagePlaceholder';

describe('PortfolioImagePlaceholder', () => {
  it('renders the unavailable-image note and display label', () => {
    render(<PortfolioImagePlaceholder />);

    expect(screen.getByText('大人の事情で')).toHaveClass('text-xs');
    expect(screen.getByText('No Image')).toHaveClass(
      'font-display',
      'text-2xl',
      'sm:text-3xl',
    );
  });
});
