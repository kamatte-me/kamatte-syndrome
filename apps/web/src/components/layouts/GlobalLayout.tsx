import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { PsychedelicBackground } from './PsychedelicBackground';

const navigationLinks = [
  { label: 'HOME', to: '/' },
  { label: 'Biography', to: '/biography' },
  { label: 'Portfolio', to: '/portfolio' },
  { label: 'Culture', to: '/culture' },
  { label: 'Blog', to: '/blog' },
  { label: 'Subscribe', to: '/subscribe' },
] as const;

const policyLinks = [
  { label: 'Terms', to: '/terms' },
  { label: 'Privacy', to: '/privacy' },
] as const;

export function GlobalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh p-2 sm:p-5">
      <PsychedelicBackground />
      <div className="relative z-[1] flex min-h-[calc(100dvh-16px)] flex-col overflow-hidden bg-black text-white sm:min-h-[calc(100dvh-40px)]">
        <SiteHeader />
        <div className="flex min-h-0 flex-1 [&>*]:w-full [&>main]:min-h-0">
          {children}
        </div>
        <SiteFooter />
      </div>
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="flex shrink-0 justify-center px-[clamp(16px,4vw,40px)] pt-[22px] pb-[14px]">
      <nav
        aria-label="Primary navigation"
        className="flex flex-wrap justify-center gap-[10px]"
      >
        {navigationLinks.map((link) => (
          <Link
            activeOptions={link.to === '/' ? { exact: true } : undefined}
            activeProps={{
              className: 'bg-white text-black',
            }}
            key={link.to}
            to={link.to}
            className="inline-flex min-h-10 items-center justify-center rounded-full border border-white px-[18px] font-bold text-[0.78rem] leading-none no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="grid shrink-0 justify-items-center gap-3 px-[clamp(16px,4vw,40px)] pt-[18px] pb-[26px] text-center">
      <p className="m-0 font-bold text-[0.9rem] text-white leading-normal">
        © 2026 かまって☆しんどろ〜む
      </p>
      <nav
        aria-label="サイトポリシー"
        className="flex flex-wrap justify-center gap-x-5 gap-y-2"
      >
        {policyLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="font-bold text-[0.78rem] text-white leading-none underline-offset-4 hover:underline hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
