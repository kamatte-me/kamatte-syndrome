import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DonationSection } from './DonationSection';

describe('DonationSection', () => {
  it('renders donation content and wishlist link', () => {
    render(<DonationSection />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'お布施' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'これ' })).toHaveAttribute(
      'href',
      'https://www.amazon.jp/hz/wishlist/ls/1ILW0SXR5ZNR6?ref_=wl_share',
    );
    expect(screen.getByText(/誕生日は7月10日です。/)).toBeInTheDocument();
  });
});
