import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithRouter } from '@/testing/renderWithRouter';
import { SiteFooter } from './SiteFooter';

describe('SiteFooter', () => {
  it('renders the copyright start year with the English site name', () => {
    renderWithRouter(<SiteFooter />);

    expect(screen.getByText('© 2018 kamatte syndrome')).toBeInTheDocument();
  });

  it('renders policy navigation links', () => {
    renderWithRouter(<SiteFooter />);

    const navigation = screen.getByRole('navigation', {
      name: 'サイトポリシー',
    });
    const termsLink = within(navigation).getByRole('link', { name: 'Terms' });
    const privacyLink = within(navigation).getByRole('link', {
      name: 'Privacy',
    });

    expect(termsLink).toHaveAttribute('href', '/terms');
    expect(privacyLink).toHaveAttribute('href', '/privacy');
  });
});
