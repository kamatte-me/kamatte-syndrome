import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LineOfficialAccountSection } from './LineOfficialAccountSection';

describe('LineOfficialAccountSection', () => {
  it('renders LINE account content and friend link', () => {
    render(<LineOfficialAccountSection />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'LINE公式アカウント' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: '友だち追加QRコード' }),
    ).toHaveAttribute(
      'src',
      'https://qr-official.line.me/gs/M_200qygmw_GW.png',
    );
    expect(screen.getByRole('link', { name: '友だち追加' })).toHaveAttribute(
      'href',
      'https://lin.ee/ZsmmUMP',
    );
    expect(screen.getByText('ブログの更新を通知')).toBeInTheDocument();
  });
});
