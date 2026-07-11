import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { server } from '@/testing/setup-tests';
import type { CultureListItem } from '../types';
import { CultureItemModal } from './CultureItemModal';

function createCultureItem(
  overrides: Partial<CultureListItem> = {},
): CultureListItem {
  return {
    body: (<p>Culture modal body</p>) as CultureListItem['body'],
    name: 'Culture Item',
    order: 1,
    slug: 'culture-item',
    youtubeVideoId: 'youtube-id',
    ...overrides,
  };
}

describe('CultureItemModal', () => {
  beforeEach(() => {
    server.use(
      http.get('https://www.youtube.com/embed/youtube-id', () =>
        HttpResponse.text('', {
          headers: { 'content-type': 'text/html' },
        }),
      ),
    );
  });

  it('renders the content-layer YouTube embed and item body', async () => {
    render(
      <div data-cutout-layer="content">
        <CultureItemModal item={createCultureItem()} onClose={vi.fn()} />
      </div>,
    );

    const iframe = await screen.findByTitle('Culture Item - YouTube');

    expect(
      screen.getByRole('dialog', { name: 'Culture Item' }),
    ).toBeInTheDocument();
    expect(iframe).toHaveAttribute(
      'src',
      'https://www.youtube.com/embed/youtube-id?autoplay=1',
    );
    expect(iframe.parentElement?.parentElement).toHaveClass(
      'md:col-start-1',
      'md:row-start-2',
    );
    expect(
      screen.getByRole('heading', { name: 'Culture Item' }).parentElement,
    ).toHaveClass('md:col-span-2', 'md:row-start-1');
    expect(screen.getByRole('heading', { name: 'Culture Item' })).toHaveClass(
      'md:text-center',
    );
    expect(screen.getByText('Culture modal body').parentElement).toHaveClass(
      'md:col-start-2',
      'md:row-start-2',
    );
  });

  it('uses Modal close interactions', async () => {
    const onClose = vi.fn();

    render(
      <div data-cutout-layer="content">
        <CultureItemModal item={createCultureItem()} onClose={onClose} />
      </div>,
    );

    await screen.findByRole('dialog', { name: 'Culture Item' });

    fireEvent.keyDown(window, { key: 'Escape' });

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
