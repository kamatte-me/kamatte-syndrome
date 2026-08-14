import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { CultureListItem } from '../types';
import { CultureCardList } from './CultureCardList';

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

describe('CultureCardList', () => {
  it('renders culture cards and forwards open events', () => {
    const onOpen = vi.fn();

    render(
      <CultureCardList
        items={[
          createCultureItem(),
          createCultureItem({
            name: 'Another Culture Item',
            slug: 'another-culture-item',
            youtubeVideoId: 'another-youtube-id',
          }),
        ]}
        onOpen={onOpen}
      />,
    );

    expect(screen.getAllByRole('listitem')).toHaveLength(2);

    fireEvent.click(
      screen.getByRole('button', { name: 'Another Culture Item' }),
    );

    expect(onOpen).toHaveBeenCalledWith('another-culture-item');
  });
});
