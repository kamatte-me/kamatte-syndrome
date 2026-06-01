import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HistoryList } from './HistoryList';

describe('HistoryList', () => {
  it('renders each history year and description', () => {
    render(
      <HistoryList
        history={[
          { year: 2018, description: 'Opened the site' },
          { year: 2026, description: 'Refined the biography page' },
        ]}
      />,
    );

    expect(screen.getByText('2018年')).toBeInTheDocument();
    expect(screen.getByText('Opened the site')).toBeInTheDocument();
    expect(screen.getByText('2026年')).toBeInTheDocument();
    expect(screen.getByText('Refined the biography page')).toBeInTheDocument();
  });
});
