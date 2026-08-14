import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SkillCard } from './SkillCard';

describe('SkillCard', () => {
  it('renders the skill name, visible level, and accessible progressbar', () => {
    render(<SkillCard skill={{ name: 'React', level: 88 }} />);

    expect(
      screen.getByRole('heading', { level: 3, name: 'React' }),
    ).toBeInTheDocument();
    expect(screen.getByText('88')).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: 'React skill level' }),
    ).toHaveAttribute('aria-valuenow', '88');
  });
});
