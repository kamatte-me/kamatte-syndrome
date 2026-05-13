import type { ComponentPropsWithoutRef } from 'react';
import styles from './MarkdownContent.module.css';

type MarkdownContentProps = ComponentPropsWithoutRef<'div'> & {
  variant?: 'default' | 'compact';
};

const baseClassName =
  'prose prose-invert max-w-none prose-li:marker:text-cutout-readable prose-pre:border';

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
  ...props
}: MarkdownContentProps) {
  return (
    <div
      {...props}
      className={[
        styles.root,
        baseClassName,
        variantClassNames[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
