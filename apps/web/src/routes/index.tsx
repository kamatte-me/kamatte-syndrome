import { createFileRoute, Link } from '@tanstack/react-router';

import styles from './index.module.css';

export const Route = createFileRoute('/')({ component: App });

const primaryLinkClassName = `${styles.primaryButtonLabel} rounded-full border border-transparent px-5 py-2 font-semibold text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/70`;

const secondaryLinkClassName = `${styles.textHole} rounded-full border border-transparent bg-transparent px-5 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/70`;

const exitLinkClassName = `${styles.textHole} rounded-full border border-transparent bg-transparent px-5 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/70`;

const primaryStencilClassName = `${styles.primaryButtonCutout} rounded-full border border-black px-5 py-2 font-semibold text-sm`;

const secondaryStencilClassName = `${styles.cutoutStencilText} rounded-full border border-black px-5 py-2 text-sm`;

const navigationItems = [
  {
    className: primaryLinkClassName,
    label: 'Enter Blog',
    stencilClassName: primaryStencilClassName,
    to: '/blog',
  },
  {
    className: secondaryLinkClassName,
    label: 'Biography',
    stencilClassName: secondaryStencilClassName,
    to: '/biography',
  },
  {
    className: secondaryLinkClassName,
    label: 'Portfolio',
    stencilClassName: secondaryStencilClassName,
    to: '/portfolio',
  },
  {
    className: secondaryLinkClassName,
    label: 'Culture',
    stencilClassName: secondaryStencilClassName,
    to: '/culture',
  },
  {
    className: secondaryLinkClassName,
    label: 'Subscribe',
    stencilClassName: secondaryStencilClassName,
    to: '/subscribe',
  },
  {
    className: exitLinkClassName,
    href: 'https://kids.yahoo.co.jp/',
    label: 'Exit',
    stencilClassName: secondaryStencilClassName,
  },
] as const;

function App() {
  return (
    <main
      className={`${styles.stage} relative row-start-2 flex min-h-0 flex-1 flex-col items-center justify-center gap-8 p-10 text-center`}
    >
      <svg
        aria-hidden="true"
        className={styles.cutoutFilterSvg}
        focusable="false"
      >
        <defs>
          <filter
            id="index-text-cutout-filter"
            colorInterpolationFilters="sRGB"
          >
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.333 0.333 0.333 0 0"
            />
          </filter>
        </defs>
      </svg>

      <div aria-hidden="true" className={styles.whiteCutoutLayer}>
        <div className="flex h-full min-h-0 flex-col items-center justify-center gap-8 p-10 text-center">
          <div className={styles.avatarSpacer} />
          <HomeTitle className={styles.cutoutStencilText} />
          <HomeLinksSkeleton />
        </div>
      </div>

      <img
        className="relative z-10"
        src="/avatar.svg"
        alt="kamatte"
        width={180}
        height={180}
      />

      <HomeTitle className={`relative z-10 ${styles.textHole}`} />
      <HomeLinks />
    </main>
  );
}

function HomeTitle({ className }: { className?: string }) {
  return (
    <h1
      className={`${className ?? ''} text-center font-bold text-6xl sm:text-left`}
      style={{
        fontFamily: 'var(--font-latin-dot-gothic)',
      }}
    >
      plz
      <br className="sm:hidden" /> kamatte
      <br className="sm:hidden" /> me!!!
    </h1>
  );
}

function HomeLinks() {
  return (
    <div className="relative z-10 flex flex-wrap items-center justify-center gap-4">
      {navigationItems.map((item) =>
        'to' in item ? (
          <Link key={item.label} to={item.to} className={item.className}>
            {item.label}
          </Link>
        ) : (
          <a key={item.label} href={item.href} className={item.className}>
            {item.label}
          </a>
        ),
      )}
    </div>
  );
}

function HomeLinksSkeleton() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      {navigationItems.map((item) => (
        <span key={item.label} className={item.stencilClassName}>
          {item.label}
        </span>
      ))}
    </div>
  );
}
