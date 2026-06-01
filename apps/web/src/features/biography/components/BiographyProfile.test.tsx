import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { author } from '@/constants/site';
import { BiographyProfile } from './BiographyProfile';

describe('BiographyProfile', () => {
  it('renders the avatar, author, GitHub link, and history entries', () => {
    render(
      <BiographyProfile
        history={[
          { year: 2020, description: 'Started making websites' },
          { year: 2024, description: 'Released kamatte-syndrome' },
        ]}
      />,
    );

    expect(
      screen.getByRole('heading', { level: 2, name: author }),
    ).toBeInTheDocument();

    const avatar = screen.getByRole('img', { name: author });
    expect(avatar).toHaveAttribute('src', '/avatar.svg');
    expect(avatar).toHaveAttribute('width', '288');
    expect(avatar).toHaveAttribute('height', '288');

    const githubLink = screen.getByRole('link', { name: 'GitHub' });
    expect(githubLink).toHaveAttribute('href', 'https://github.com/kamatte-me');
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noreferrer');

    expect(screen.getByText('2020年')).toBeInTheDocument();
    expect(screen.getByText('Started making websites')).toBeInTheDocument();
    expect(screen.getByText('2024年')).toBeInTheDocument();
    expect(screen.getByText('Released kamatte-syndrome')).toBeInTheDocument();
  });
});
