import { Link, useNavigate } from '@tanstack/react-router';
import { type MouseEvent, useId } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/classNames';
import styles from './SiteHeader.module.css';

const navigationLinks = [
  { label: 'Biography', to: '/biography' },
  { label: 'Portfolio', to: '/portfolio' },
  { label: 'Culture', to: '/culture' },
  { label: 'Blog', to: '/blog' },
  { label: 'Subscribe', to: '/subscribe' },
] as const;

type SiteHeaderProps = {
  isMobileMenuOpen: boolean;
  onMobileMenuOpenChange: (isOpen: boolean) => void;
  onNavigate: () => void;
};

export function SiteHeader({
  isMobileMenuOpen,
  onMobileMenuOpenChange,
  onNavigate,
}: SiteHeaderProps) {
  const navigationId = useId();
  const navigate = useNavigate();

  const handleLogoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }

    event.preventDefault();
    onNavigate();
    void navigate({ to: '/' });
  };

  return (
    <header
      className={cn(
        styles.root,
        'relative z-40 shrink-0 px-[clamp(14px,4vw,40px)]',
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 pt-[10px] pb-2 sm:pt-[22px] md:flex-row md:items-end md:justify-between md:gap-6 md:pb-4">
        <div className="relative flex items-center justify-center gap-4 md:justify-between">
          <a
            aria-label="ホームへ戻る"
            className="inline-flex h-[38px] w-[55px] shrink-0 items-center justify-center text-cutout-hole no-underline transition-transform duration-200 hover:-rotate-1 hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-cutout-hole focus-visible:outline-offset-4 sm:h-[72px] sm:w-[103px]"
            href="/"
            onClick={handleLogoClick}
          >
            <Icon className="size-full" src="/logo.svg" />
          </a>

          <button
            aria-controls={navigationId}
            aria-expanded={isMobileMenuOpen}
            aria-label={
              isMobileMenuOpen ? 'メニューを閉じる' : 'メニューを開く'
            }
            className={cn(
              'absolute right-0 inline-flex size-10 items-center justify-center border-0 bg-transparent p-0 text-cutout-hole transition-transform duration-200 hover:scale-[1.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-cutout-hole focus-visible:outline-offset-4 md:static md:hidden',
              isMobileMenuOpen && styles.menuButtonOpen,
            )}
            onClick={() => onMobileMenuOpenChange(!isMobileMenuOpen)}
            type="button"
          >
            <span aria-hidden="true" className={styles.menuIcon} />
          </button>
        </div>

        <nav
          aria-label="Primary navigation"
          className={cn(
            styles.navigation,
            isMobileMenuOpen && styles.navigationOpen,
            'flex-col gap-2 md:flex md:flex-row md:flex-wrap md:justify-end md:gap-[10px]',
          )}
          id={navigationId}
        >
          {navigationLinks.map((link) => (
            <Link
              activeProps={{
                className: cn(
                  styles.activeHeaderLink,
                  'bg-cutout-hole text-black',
                ),
              }}
              key={link.to}
              to={link.to}
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-cutout-hole px-[16px] pt-[3px] pb-1 font-display font-normal text-[1.16rem] text-cutout-hole leading-none no-underline transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cutout-hole focus-visible:outline-offset-4 md:px-[18px] md:text-[1.2rem]"
              onClick={onNavigate}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
