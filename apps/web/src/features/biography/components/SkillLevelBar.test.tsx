import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SkillLevelBar } from './SkillLevelBar';

describe('SkillLevelBar', () => {
  it('renders an accessible progressbar with a matching visual width', () => {
    render(<SkillLevelBar level={76} name="CSS" />);

    const progressbar = screen.getByRole('progressbar', {
      name: 'CSS skill level',
    });

    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuenow', '76');
    expect(progressbar.firstElementChild).toHaveStyle({ width: '76%' });
  });
});
