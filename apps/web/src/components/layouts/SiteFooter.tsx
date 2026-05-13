import { Link } from '@tanstack/react-router';

const policyLinks = [
  { label: 'Terms', to: '/terms' },
  { label: 'Privacy', to: '/privacy' },
] as const;

export function SiteFooter() {
  return (
    <footer className="grid shrink-0 justify-items-center gap-3 px-[clamp(16px,4vw,40px)] pt-[18px] pb-[26px] text-center">
      <p className="m-0 font-bold text-[0.9rem] text-cutout-hole leading-normal">
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
            className="font-bold text-[0.78rem] text-cutout-hole leading-none underline-offset-4 hover:underline hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cutout-hole focus-visible:outline-offset-4"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
