import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PsychedelicBackground } from './PsychedelicBackground';

describe('PsychedelicBackground', () => {
  it('keeps the background shell available when no GPU renderer can be created', () => {
    const getContext = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockImplementation(() => null);

    try {
      const { container } = render(<PsychedelicBackground />);
      const background = container.firstElementChild;

      expect(background).toHaveAttribute('aria-hidden', 'true');
      expect(background).toHaveClass(
        'fixed',
        'bg-black',
        'pointer-events-none',
      );
      expect(background?.querySelector('canvas')).toBeNull();
    } finally {
      getContext.mockRestore();
    }
  });

  it('uses a caller-provided class name for a scoped background', () => {
    const getContext = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockImplementation(() => null);

    try {
      const { container } = render(
        <PsychedelicBackground className="custom-background relative" />,
      );

      expect(container.firstElementChild).toHaveClass(
        'relative',
        'custom-background',
      );
    } finally {
      getContext.mockRestore();
    }
  });
});
