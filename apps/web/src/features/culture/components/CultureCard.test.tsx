import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { CultureListItem } from '../types';
import { CultureCard } from './CultureCard';

function createCultureItem(
  overrides: Partial<CultureListItem> = {},
): CultureListItem {
  return {
    body: (<p>Culture body</p>) as CultureListItem['body'],
    name: 'Culture Item',
    order: 1,
    slug: 'culture-item',
    youtubeVideoId: 'youtube-id',
    ...overrides,
  };
}

describe('CultureCard', () => {
  it('renders a YouTube thumbnail and opens the matching item', () => {
    const onOpen = vi.fn();
    const { container } = render(
      <CultureCard item={createCultureItem()} onOpen={onOpen} />,
    );

    const button = screen.getByRole('button', { name: 'Culture Item' });
    const thumbnail = container.querySelector('img');

    expect(thumbnail).toHaveAttribute(
      'src',
      'https://img.youtube.com/vi/youtube-id/hqdefault.jpg',
    );
    expect(thumbnail).toHaveAttribute('loading', 'lazy');

    fireEvent.click(button);

    expect(onOpen).toHaveBeenCalledWith('culture-item');
  });
});
