import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import CrtEffects from '@/components/RetroEffects/RetroEffects';
import './globals.css';
import { siteName, slogan } from '@/constants/site';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: siteName,
  description: slogan,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CrtEffects />
        <div className="blur"></div>
        <div className="pixelate"></div>
        {children}

        <svg>
          <defs>
            <filter id="pixelate" x="0" y="0">
              <feFlood x="0" y="0" height="1" width="1" />
              <feComposite width="2" height="2" />
              <feTile result="tileResult" />

              <feComposite in="SourceGraphic" in2="tileResult" operator="in" />
              <feMorphology operator="dilate" radius="0.7" />
            </filter>
          </defs>
        </svg>
      </body>
    </html>
  );
}
