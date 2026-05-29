import { cleanup, render, screen, within } from '@testing-library/react';
import type { AnchorHTMLAttributes } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { siteName } from '@/constants/site';
import { SiteFooter } from './SiteFooter';

type MockLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string;
};

vi.mock('@tanstack/react-router', async () => {
  const { createElement } = await import('react');

  return {
    Link: ({ to, ...props }: MockLinkProps) =>
      createElement('a', { ...props, href: to }),
  };
});

afterEach(() => {
  cleanup();
});

describe('SiteFooter', () => {
  it('renders the copyright start year with the shared site name', () => {
    render(<SiteFooter />);

    expect(screen.getByText(`© 2018 ${siteName}`)).toBeInTheDocument();
  });

  it('renders policy navigation links', () => {
    render(<SiteFooter />);

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
