import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageTitle } from './PageTitle';

describe('PageTitle', () => {
  it('renders the page heading inside a configurable section', () => {
    render(
      <PageTitle aria-label="Page title" className="custom-title">
        Portfolio
      </PageTitle>,
    );

    const section = screen.getByRole('region', { name: 'Page title' });

    expect(section).toHaveClass('border-cutout-hole', 'custom-title');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Portfolio' }),
    ).toHaveClass('font-display', 'text-5xl');
  });
});
