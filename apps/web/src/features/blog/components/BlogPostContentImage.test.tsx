import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { imageLightboxTriggerSelector } from '@/components/ui/ImageLightbox/ImageLightboxTrigger';
import { BlogPostContentImage } from './BlogPostContentImage';

describe('BlogPostContentImage', () => {
  it('wraps a string source in a lightbox trigger while preserving image props', () => {
    const { container } = render(
      <BlogPostContentImage
        src="/media/example.jpg"
        alt="記事内画像"
        className="custom-image"
        height={360}
        loading="eager"
        sizes="480px"
        width={480}
      />,
    );

    const trigger = screen.getByRole('button', {
      name: '記事内画像を拡大表示',
    });
    const image = screen.getByRole('img', { name: '記事内画像' });

    expect(trigger).toHaveAttribute(
      'data-image-lightbox-src',
      '/media/example.jpg',
    );
    expect(trigger).toHaveClass('my-[2em]', 'mx-auto', 'w-fit');
    expect(image).toHaveAttribute('src', '/media/example.jpg');
    expect(image).toHaveAttribute('loading', 'eager');
    expect(image).toHaveAttribute('sizes', '480px');
    expect(image).toHaveAttribute('width', '480');
    expect(image).toHaveAttribute('height', '360');
    expect(image).toHaveClass('custom-image');
    expect(container.querySelector('a')).toBeNull();
  });

  it('keeps Markdown image defaults and labels an empty-alt image action', () => {
    render(<BlogPostContentImage src="/media/example.jpg" alt="" />);

    const trigger = screen.getByRole('button', {
      name: '画像を拡大表示',
    });
    const image = trigger.querySelector('img');

    expect(image).toHaveAttribute('alt', '');
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveAttribute(
      'sizes',
      'auto, (max-width: 528px) calc(100vw - 3rem), 480px',
    );
  });

  it('renders a noninteractive image when the source is missing', () => {
    const { container } = render(<BlogPostContentImage alt="Missing source" />);

    const image = screen.getByRole('img', { name: 'Missing source' });

    expect(image).not.toHaveAttribute('src');
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(container.querySelector(imageLightboxTriggerSelector)).toBeNull();
  });

  it('keeps a runtime non-string source noninteractive', () => {
    const { container } = render(
      <BlogPostContentImage
        src={123 as unknown as string}
        alt="Runtime source"
      />,
    );

    expect(screen.getByRole('img', { name: 'Runtime source' })).toHaveAttribute(
      'src',
      '123',
    );
    expect(container.querySelector(imageLightboxTriggerSelector)).toBeNull();
  });

  it('renders an empty string source without making it interactive', () => {
    const { container } = render(
      <BlogPostContentImage src="" alt="Empty source" />,
    );

    expect(
      screen.getByRole('img', { name: 'Empty source' }),
    ).not.toHaveAttribute('src');
    expect(container.querySelector(imageLightboxTriggerSelector)).toBeNull();
  });
});
