import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LineOfficialAccountSection } from './LineOfficialAccountSection';

describe('LineOfficialAccountSection', () => {
  it('renders LINE account content and friend link', () => {
    render(<LineOfficialAccountSection />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'LINE公式アカウント' }),
    ).toBeInTheDocument();
    const qrImage = screen.getByRole('img', { name: '友だち追加QRコード' });
    expect(qrImage).toHaveAttribute(
      'src',
      '/src/features/subscribe/assets/line_qr.png',
    );
    expect(qrImage).toHaveAttribute('sizes', '140px');
    expect(qrImage).toHaveAttribute('loading', 'eager');
    expect(qrImage).toHaveAttribute('width', '140');
    expect(qrImage).toHaveAttribute('height', '140');
    const buttonImage = screen.getByRole('img', { name: '友だち追加' });
    expect(buttonImage).toHaveAttribute(
      'src',
      '/src/features/subscribe/assets/line_button.png',
    );
    expect(buttonImage).toHaveAttribute('sizes', '120px');
    expect(buttonImage).toHaveAttribute('loading', 'eager');
    expect(buttonImage).toHaveAttribute('width', '120');
    expect(buttonImage).toHaveAttribute('height', '36');
    expect(screen.getByRole('link', { name: '友だち追加' })).toHaveAttribute(
      'href',
      'https://lin.ee/ZsmmUMP',
    );
    expect(screen.getByText('ブログの更新を通知')).toBeInTheDocument();
  });
});
