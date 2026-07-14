import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LineOfficialAccountSection } from './LineOfficialAccountSection';

vi.mock(
  'virtual:image-variant?src=../assets/line_qr.png&widths=140;280',
  () => ({
    default: {
      avif: [
        { src: '/line_qr-140.avif', width: 140 },
        { src: '/line_qr-280.avif', width: 280 },
      ],
      height: 360,
      src: '/line_qr.png',
      webp: [
        { src: '/line_qr-140.webp', width: 140 },
        { src: '/line_qr-280.webp', width: 280 },
      ],
      width: 360,
    },
  }),
);
vi.mock(
  'virtual:image-variant?src=../assets/line_button.png&widths=120;240',
  () => ({
    default: {
      avif: [
        { src: '/line_button-120.avif', width: 120 },
        { src: '/line_button-232.avif', width: 232 },
      ],
      height: 72,
      src: '/line_button.png',
      webp: [
        { src: '/line_button-120.webp', width: 120 },
        { src: '/line_button-232.webp', width: 232 },
      ],
      width: 232,
    },
  }),
);

describe('LineOfficialAccountSection', () => {
  it('renders LINE account content and friend link', () => {
    const { container } = render(<LineOfficialAccountSection />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'LINE公式アカウント' }),
    ).toBeInTheDocument();
    const qrImage = screen.getByRole('img', { name: '友だち追加QRコード' });
    expect(qrImage).toHaveAttribute('src', '/line_qr.png');
    expect(qrImage).toHaveAttribute('sizes', '140px');
    expect(qrImage).toHaveAttribute('loading', 'eager');
    expect(
      qrImage.closest('picture')?.querySelector('source[type="image/avif"]'),
    ).toHaveAttribute(
      'srcset',
      '/line_qr-140.avif 140w, /line_qr-280.avif 280w',
    );
    const buttonImage = screen.getByRole('img', { name: '友だち追加' });
    expect(buttonImage).toHaveAttribute('src', '/line_button.png');
    expect(buttonImage).toHaveAttribute('sizes', '120px');
    expect(buttonImage).toHaveAttribute('loading', 'eager');
    expect(
      buttonImage
        .closest('picture')
        ?.querySelector('source[type="image/webp"]'),
    ).toHaveAttribute(
      'srcset',
      '/line_button-120.webp 120w, /line_button-232.webp 232w',
    );
    expect(container.querySelectorAll('picture')).toHaveLength(2);
    expect(screen.getByRole('link', { name: '友だち追加' })).toHaveAttribute(
      'href',
      'https://lin.ee/ZsmmUMP',
    );
    expect(screen.getByText('ブログの更新を通知')).toBeInTheDocument();
  });
});
