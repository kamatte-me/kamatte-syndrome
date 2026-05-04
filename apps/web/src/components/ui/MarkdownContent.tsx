import type { ReactNode } from 'react';

type MarkdownContentProps = {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'compact';
};

const baseClassName =
  'prose prose-invert max-w-none prose-a:text-white prose-a:decoration-white/45 prose-code:text-white prose-headings:text-white prose-li:text-white/82 prose-li:marker:text-white/65 prose-p:text-white/82 prose-strong:text-white prose-blockquote:border-white prose-blockquote:text-white/72 prose-hr:border-white prose-pre:border prose-pre:border-white prose-pre:bg-black';

const variantClassNames = {
  default:
    'text-base leading-8 prose-p:my-5 prose-ul:my-5 prose-ol:my-5 prose-li:my-1.5',
  compact:
    'text-[15px] leading-7 prose-headings:mt-5 prose-headings:mb-2 prose-p:my-3 prose-ul:my-3 prose-ol:my-3 prose-li:my-1',
} satisfies Record<NonNullable<MarkdownContentProps['variant']>, string>;

export function MarkdownContent({
  children,
  className,
  variant = 'default',
}: MarkdownContentProps) {
  return (
    <div
      className={[baseClassName, variantClassNames[variant], className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
