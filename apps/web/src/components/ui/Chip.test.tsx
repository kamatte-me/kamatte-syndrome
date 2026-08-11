import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Chip } from './Chip';

describe('Chip', () => {
  it('renders chip styling on a span by default', () => {
    render(<Chip className="custom-chip">Tag</Chip>);

    expect(screen.getByText('Tag')).toHaveClass(
      'inline-flex',
      'rounded-full',
      'border-cutout-hole',
      'custom-chip',
    );
  });

  it('merges the chip styling into its child when requested', () => {
    render(
      <Chip asChild>
        <button type="button">Filter</button>
      </Chip>,
    );

    expect(screen.getByRole('button', { name: 'Filter' })).toHaveClass(
      'inline-flex',
      'rounded-full',
    );
  });
});
