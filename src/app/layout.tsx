import type { Metadata } from 'next';
import { DotGothic16, Jersey_10 } from 'next/font/google';
import CrtEffects from '@/components/RetroEffects';
import './globals.css';
import { siteName, slogan } from '@/constants/site';
import Osd from '@/components/Osd';

const dotGothic = DotGothic16({
  variable: '--font-dot-gothic',
  weight: '400',
  display: 'block',
});

const latinDotGothic = Jersey_10({
  variable: '--font-latin-dot-gothic',
  weight: '400',
  display: 'block',
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
      <body className={`${dotGothic.variable} ${latinDotGothic.variable}`}>
        <Osd />
        <CrtEffects>{children}</CrtEffects>
      </body>
    </html>
  );
}
