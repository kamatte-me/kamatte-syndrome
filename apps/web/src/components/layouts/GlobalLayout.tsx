import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import styles from './GlobalLayout.module.css';
import { PsychedelicBackground } from './PsychedelicBackground';

const policyLinks = [
  { label: '免責事項', to: '/terms' },
  { label: 'プライバシーポリシー', to: '/privacy' },
] as const;

export function GlobalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <PsychedelicBackground />
      <TextCutoutFilter />
      <div className={styles.contentLayer}>
        <div className="flex min-h-screen flex-col pb-5">
          <div className="flex flex-1">{children}</div>
          <SiteFooter />
        </div>
      </div>
    </div>
  );
}

function TextCutoutFilter() {
  return (
    <svg
      aria-hidden="true"
      className={styles.cutoutFilterSvg}
      focusable="false"
    >
      <defs>
        <filter id="text-cutout-filter" colorInterpolationFilters="sRGB">
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.333 0.333 0.333 0 0"
          />
        </filter>
      </defs>
    </svg>
  );
}

function SiteFooter() {
  const linkClassName = `${styles.footerTextHole} transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-black/50`;

  return (
    <footer className={`${styles.framedFooter} mx-5 text-sm`}>
      <div aria-hidden="true" className={styles.footerCutoutLayer}>
        <FooterPolicyStencil />
      </div>
      <FooterPolicyNav
        className={styles.footerContent}
        linkClassName={linkClassName}
      />
    </footer>
  );
}

function FooterPolicyNav({
  className,
  linkClassName,
}: {
  className: string;
  linkClassName: string;
}) {
  return (
    <nav
      aria-label="サイトポリシー"
      className={`${className} flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 pt-4 pb-8`}
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
