import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { imageLightboxTriggerSelector } from '@/components/ui/ImageLightbox/ImageLightboxTrigger';
import { BlogPostContentImage } from './BlogPostContentImage';
import { BlogPostContentLink } from './BlogPostContentLink';

describe('BlogPostContentLink', () => {
  it('keeps a directly linked Markdown image noninteractive so link navigation wins', () => {
    const { container } = render(
      <BlogPostContentLink href="/linked-destination">
        <BlogPostContentImage
          alt="リンク付き画像"
          src="/media/linked-image.jpg"
        />
      </BlogPostContentLink>,
    );

    const link = screen.getByRole('link', { name: 'リンク付き画像' });

    expect(link).toHaveAttribute('href', '/linked-destination');
    expect(link).toContainElement(
      screen.getByRole('img', { name: 'リンク付き画像' }),
    );
    expect(container.querySelector(imageLightboxTriggerSelector)).toBeNull();
  });

  it('preserves ordinary Markdown link content', () => {
    render(
      <BlogPostContentLink href="/destination">
        通常のリンク
      </BlogPostContentLink>,
    );

    expect(screen.getByRole('link', { name: '通常のリンク' })).toHaveAttribute(
      'href',
      '/destination',
    );
  });
});
