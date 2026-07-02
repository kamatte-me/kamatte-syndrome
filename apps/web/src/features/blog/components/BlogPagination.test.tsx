import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithRouter } from '@/testing/renderWithRouter';
import { BlogPagination } from './BlogPagination';

describe('BlogPagination', () => {
  it('links to previous and next pages', () => {
    renderWithRouter(<BlogPagination currentPage={2} totalPages={4} />, {
      initialLocation: '/blog?page=2',
    });

    expect(screen.getByRole('link', { name: '前のページ' })).toHaveAttribute(
      'href',
      '/blog',
    );
    expect(screen.getByRole('link', { name: '次のページ' })).toHaveAttribute(
      'href',
      '/blog?page=3',
    );
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('/ 4')).toBeInTheDocument();
  });

  it('omits disabled links at the pagination edges', () => {
    renderWithRouter(<BlogPagination currentPage={1} totalPages={2} />, {
      initialLocation: '/blog',
    });

    expect(screen.queryByRole('link', { name: '前のページ' })).toBeNull();
    expect(screen.getByRole('link', { name: '次のページ' })).toHaveAttribute(
      'href',
      '/blog?page=2',
    );
  });
});
