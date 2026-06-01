import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BiographySkills } from './BiographySkills';

describe('BiographySkills', () => {
  it('renders the skills section with one card per skill', () => {
    render(
      <BiographySkills
        skills={[
          { name: 'TypeScript', level: 90 },
          { name: 'CSS', level: 82 },
        ]}
      />,
    );

    expect(
      screen.getByRole('heading', { level: 2, name: 'Skills' }),
    ).toBeInTheDocument();

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(2);
    expect(within(listItems[0]).getByText('TypeScript')).toBeInTheDocument();
    expect(within(listItems[0]).getByText('90')).toBeInTheDocument();
    expect(
      within(listItems[0]).getByRole('progressbar', {
        name: 'TypeScript skill level',
      }),
    ).toHaveAttribute('aria-valuenow', '90');
    expect(within(listItems[1]).getByText('CSS')).toBeInTheDocument();
    expect(within(listItems[1]).getByText('82')).toBeInTheDocument();
  });

  it('keeps page spacing as caller-provided classes', () => {
    const { container } = render(
      <BiographySkills
        className="mt-12 md:mt-16"
        skills={[{ name: 'TypeScript', level: 90 }]}
      />,
    );

    const section = container.firstElementChild;

    expect(section).toHaveClass(
      'border',
      'border-cutout-hole',
      'p-6',
      'sm:p-8',
      'mt-12',
      'md:mt-16',
    );
  });

  it('does not own page-level top margin by default', () => {
    const { container } = render(
      <BiographySkills skills={[{ name: 'TypeScript', level: 90 }]} />,
    );

    const section = container.firstElementChild;

    expect(section).not.toHaveClass('mt-12');
    expect(section).not.toHaveClass('md:mt-16');
  });
});
