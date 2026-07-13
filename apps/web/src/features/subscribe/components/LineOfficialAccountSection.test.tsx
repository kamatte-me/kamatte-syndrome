import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import lineButtonImage from '../assets/line_button.png';
import lineQrImage from '../assets/line_qr.png';
import { LineOfficialAccountSection } from './LineOfficialAccountSection';

describe('LineOfficialAccountSection', () => {
  it('renders LINE account content and friend link', () => {
    render(<LineOfficialAccountSection />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'LINE公式アカウント' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: '友だち追加QRコード' }),
    ).toHaveAttribute('src', lineQrImage);
    expect(screen.getByRole('img', { name: '友だち追加' })).toHaveAttribute(
      'src',
      lineButtonImage,
    );
    expect(screen.getByRole('link', { name: '友だち追加' })).toHaveAttribute(
      'href',
      'https://lin.ee/ZsmmUMP',
    );
    expect(screen.getByText('ブログの更新を通知')).toBeInTheDocument();
  });
});
