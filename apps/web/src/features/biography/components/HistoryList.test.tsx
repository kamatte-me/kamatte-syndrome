import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HistoryList } from './HistoryList';

describe('HistoryList', () => {
  it('renders each history entry in ascending year order', () => {
    render(
      <HistoryList
        history={[
          { year: 2026, description: 'Refined the biography page' },
          { year: 2018, description: 'Opened the site' },
        ]}
      />,
    );

    expect(
      screen.getAllByRole('term').map(({ textContent }) => textContent),
    ).toEqual(['2018年', '2026年']);
    expect(
      screen.getAllByRole('definition').map(({ textContent }) => textContent),
    ).toEqual(['Opened the site', 'Refined the biography page']);
  });
});
