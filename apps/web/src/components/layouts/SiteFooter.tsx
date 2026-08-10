import { Link } from '@tanstack/react-router';
import { copyrightStartYear, englishSiteName } from '@/constants/site';

const policyLinks = [
  { label: 'Terms', to: '/terms' },
  { label: 'Privacy', to: '/privacy' },
] as const;

export function SiteFooter() {
  return (
    <footer className="grid shrink-0 justify-items-center gap-3 px-4 pt-5 pb-6 text-center sm:px-8 lg:px-10">
      <p className="m-0 text-cutout-hole text-sm leading-normal">
        © {copyrightStartYear} {englishSiteName}
      </p>
      <nav
        aria-label="サイトポリシー"
        className="flex flex-wrap justify-center gap-x-5 gap-y-2"
      >
        {policyLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="text-cutout-hole text-xs leading-none underline-offset-4 hover:underline hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cutout-hole focus-visible:outline-offset-4"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
