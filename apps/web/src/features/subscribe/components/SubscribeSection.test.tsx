import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SubscribeSection } from './SubscribeSection';

describe('SubscribeSection', () => {
  it('renders a section heading and children', () => {
    render(
      <SubscribeSection heading="Section title">
        <p>Section body</p>
      </SubscribeSection>,
    );

    expect(
      screen.getByRole('heading', { level: 2, name: 'Section title' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Section body')).toBeInTheDocument();
  });

  it('merges custom class names into the section', () => {
    render(
      <SubscribeSection className="custom-section" heading="Section title">
        <p>Section body</p>
      </SubscribeSection>,
    );

    expect(
      screen
        .getByRole('heading', { level: 2, name: 'Section title' })
        .closest('section'),
    ).toHaveClass('custom-section');
  });
});
