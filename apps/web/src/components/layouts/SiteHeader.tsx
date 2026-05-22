import { Link } from '@tanstack/react-router';
import { cn } from '@/utils/classNames';
import styles from './SiteHeader.module.css';

const navigationLinks = [
  { label: 'HOME', to: '/' },
  { label: 'Biography', to: '/biography' },
  { label: 'Portfolio', to: '/portfolio' },
  { label: 'Culture', to: '/culture' },
  { label: 'Blog', to: '/blog' },
  { label: 'Subscribe', to: '/subscribe' },
] as const;

export function SiteHeader() {
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
              className: cn(styles.activeNavLink, 'bg-cutout-hole text-black'),
            }}
            key={link.to}
            to={link.to}
            className="inline-flex min-h-10 items-center justify-center rounded-full border border-cutout-hole px-[18px] font-display font-normal text-[1.2rem] leading-none no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-cutout-hole focus-visible:outline-offset-4"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
