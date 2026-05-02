import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import RetroEffects from './RetroEffects';

export function GlobalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-5xl">
      <RetroEffects>
        <div className="flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
      </RetroEffects>
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="px-4 pt-4 pb-8 text-sm text-white/50">
      <nav
        aria-label="サイトポリシー"
        className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
      >
        <Link
          to="/terms"
          className="transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200"
        >
          免責事項
        </Link>
        <Link
          to="/privacy"
          className="transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200"
        >
          プライバシーポリシー
        </Link>
      </nav>
    </footer>
  );
}
