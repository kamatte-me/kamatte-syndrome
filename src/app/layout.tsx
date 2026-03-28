import type { Metadata } from 'next';
import CrtEffects from '@/components/RetroEffects/RetroEffects';
import './globals.css';
import { siteName, slogan } from '@/constants/site';

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
      <body>
        <CrtEffects>{children}</CrtEffects>
      </body>
    </html>
  );
}
