import { describe, expect, it } from 'vitest';
import { cn } from './classNames';

describe('cn', () => {
  it('drops falsy class inputs', () => {
    expect(
      cn('base', false && 'hidden', null, undefined, 0, '', {
        active: true,
        inactive: false,
      }),
    ).toBe('base active');
  });

  it('keeps the later Tailwind class when utilities conflict', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('keeps text size and custom cutout color utilities together', () => {
    expect(cn('text-base', 'text-cutout-hole')).toBe(
      'text-base text-cutout-hole',
    );
  });
});
