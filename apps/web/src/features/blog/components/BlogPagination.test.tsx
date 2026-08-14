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
    expect(screen.getByText('/')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(
      screen
        .getByRole('navigation', { name: 'Blog pagination' })
        .querySelectorAll('a [aria-hidden="true"]'),
    ).toHaveLength(2);
  });

  it('hides the previous arrow on the first page while preserving layout', () => {
    renderWithRouter(<BlogPagination currentPage={1} totalPages={2} />, {
      initialLocation: '/blog',
    });
    const pagination = screen.getByRole('navigation', {
      name: 'Blog pagination',
    });

    expect(screen.queryByRole('link', { name: '前のページ' })).toBeNull();
    expect(screen.getByRole('link', { name: '次のページ' })).toHaveAttribute(
      'href',
      '/blog?page=2',
    );
    expect(Array.from(pagination.children)).toHaveLength(3);
    expect(pagination.querySelectorAll('a [aria-hidden="true"]')).toHaveLength(
      1,
    );
  });

  it('hides the next arrow on the final page while preserving layout', () => {
    renderWithRouter(<BlogPagination currentPage={2} totalPages={2} />, {
      initialLocation: '/blog?page=2',
    });
    const pagination = screen.getByRole('navigation', {
      name: 'Blog pagination',
    });

    expect(screen.getByRole('link', { name: '前のページ' })).toHaveAttribute(
      'href',
      '/blog',
    );

    expect(screen.queryByRole('link', { name: '次のページ' })).toBeNull();
    expect(Array.from(pagination.children)).toHaveLength(3);
    expect(pagination.querySelectorAll('a [aria-hidden="true"]')).toHaveLength(
      1,
    );
  });
});
