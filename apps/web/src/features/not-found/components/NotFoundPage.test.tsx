import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NotFoundPage } from './NotFoundPage';

describe('NotFoundPage', () => {
  it('renders the 404 message from the previous site', () => {
    render(<NotFoundPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: '404' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('This page exists in the future!!!'),
    ).toBeInTheDocument();
  });
});
