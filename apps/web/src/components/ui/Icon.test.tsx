import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Icon } from './Icon';

describe('Icon', () => {
  it('renders an inaccessible mask icon while retaining caller styles', () => {
    const { container } = render(
      <Icon
        aria-label="Ignored label"
        className="custom-icon"
        src="/icons/check.svg"
        style={{ color: 'red' }}
      />,
    );
    const icon = container.firstElementChild as HTMLElement;

    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).toHaveClass('bg-current', 'custom-icon');
    expect(icon.style.color).toBe('red');
    expect(icon.style.getPropertyValue('--icon-mask-image')).toBe(
      'url("/icons/check.svg")',
    );
  });
});
