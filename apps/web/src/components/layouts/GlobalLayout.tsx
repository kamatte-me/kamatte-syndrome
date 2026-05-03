import { Link, useRouterState } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import styles from './GlobalLayout.module.css';
import RetroEffects from './RetroEffects';

const policyLinks = [
  { label: '免責事項', to: '/terms' },
  { label: 'プライバシーポリシー', to: '/privacy' },
] as const;

export function GlobalLayout({ children }: { children: ReactNode }) {
  const isHome = useRouterState({
    select: (state) => state.location.pathname === '/',
  });

  return (
    <div className={isHome ? 'min-h-screen' : 'mx-auto min-h-screen max-w-5xl'}>
      <RetroEffects>
        <div
          className={
            isHome
              ? 'flex min-h-screen flex-col pb-5'
              : 'flex min-h-screen flex-col'
          }
        >
          <div className={isHome ? 'flex flex-1' : 'flex-1'}>{children}</div>
          <SiteFooter framed={isHome} />
        </div>
      </RetroEffects>
    </div>
  );
}

function SiteFooter({ framed }: { framed: boolean }) {
  const linkClassName = framed
    ? `${styles.footerTextHole} transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-black/50`
    : 'transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200';

  return (
    <footer
      className={
        framed
          ? `${styles.framedFooter} mx-5 text-sm`
          : 'px-4 pt-4 pb-8 text-sm text-white/50'
      }
    >
      {framed ? (
        <div aria-hidden="true" className={styles.footerCutoutLayer}>
          <FooterPolicyStencil />
        </div>
      ) : null}
      <FooterPolicyNav
        className={framed ? styles.footerContent : undefined}
        linkClassName={linkClassName}
      />
    </footer>
  );
}

function FooterPolicyNav({
  className,
  linkClassName,
}: {
  className?: string;
  linkClassName: string;
}) {
  return (
    <nav
      aria-label="サイトポリシー"
      className={`${className ?? ''} flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 pt-4 pb-8`}
    >
      {policyLinks.map((link) => (
        <Link key={link.to} to={link.to} className={linkClassName}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

function FooterPolicyStencil() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 pt-4 pb-8">
      {policyLinks.map((link) => (
        <span key={link.to} className={styles.footerStencilText}>
          {link.label}
        </span>
      ))}
    </div>
  );
}
