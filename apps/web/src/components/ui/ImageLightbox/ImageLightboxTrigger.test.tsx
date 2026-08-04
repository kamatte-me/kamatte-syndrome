import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  ImageLightboxTrigger,
  imageLightboxTriggerSelector,
} from './ImageLightboxTrigger';

describe('ImageLightboxTrigger', () => {
  it('renders a semantic lightbox trigger with the original image source', () => {
    const { container } = render(
      <ImageLightboxTrigger alt="海辺の夕焼け" originalSrc="/media/sunset.jpg">
        <img src="/media/sunset.jpg" alt="海辺の夕焼け" />
      </ImageLightboxTrigger>,
    );

    const trigger = screen.getByRole('button', {
      name: '海辺の夕焼けを拡大表示',
    });

    expect(trigger).toHaveAttribute('type', 'button');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('data-image-lightbox-trigger', '');
    expect(trigger).toHaveAttribute(
      'data-image-lightbox-src',
      '/media/sunset.jpg',
    );
    expect(trigger).toHaveClass('cursor-zoom-in');
    expect(trigger).toHaveClass('focus-visible:outline-cutout-readable');
    expect(container.querySelector(imageLightboxTriggerSelector)).toBe(trigger);
  });

  it('uses a generic action label when alt text is empty', () => {
    render(
      <ImageLightboxTrigger alt="  " originalSrc="/media/decorative.jpg">
        <img src="/media/decorative.jpg" alt="" />
      </ImageLightboxTrigger>,
    );

    expect(
      screen.getByRole('button', { name: '画像を拡大表示' }),
    ).toBeInTheDocument();
  });

  it('accepts additional button props and classes without changing invariants', () => {
    render(
      <ImageLightboxTrigger
        alt="画像"
        originalSrc="/media/example.jpg"
        className="custom-trigger"
        data-testid="trigger"
      >
        <img src="/media/example.jpg" alt="画像" />
      </ImageLightboxTrigger>,
    );

    const trigger = screen.getByTestId('trigger');

    expect(trigger).toHaveClass('custom-trigger');
    expect(trigger).toHaveAttribute('type', 'button');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
  });
});
