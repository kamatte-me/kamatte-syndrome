import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/utils/classNames';
import styles from './MarkdownContent.module.css';

type MarkdownContentProps = ComponentPropsWithoutRef<'div'> & {
  variant?: 'default' | 'compact';
};

export function MarkdownContent({
  children,
  className,
  variant = 'default',
  ...props
}: MarkdownContentProps) {
  return (
    <div
      {...props}
      className={cn(
        styles.root,
        'prose prose-invert max-w-none prose-h2:border-cutout-hole prose-pre:border-0 prose-h2:border-b prose-h2:pb-3 prose-dt:font-bold prose-headings:font-bold prose-strong:font-bold prose-th:font-bold prose-h1:text-2xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg prose-h5:text-base prose-headings:leading-tight prose-li:marker:text-cutout-readable sm:prose-h1:text-3xl sm:prose-h2:text-3xl sm:prose-h3:text-2xl sm:prose-h4:text-xl sm:prose-h5:text-lg [&>:first-child]:mt-0 [&>:last-child]:mb-0 [&_:not(pre)>code]:mx-0.5 [&_:not(pre)>code]:rounded-sm [&_:not(pre)>code]:border [&_:not(pre)>code]:border-cutout-muted [&_:not(pre)>code]:bg-transparent [&_:not(pre)>code]:px-1 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:font-bold [&_:not(pre)>code]:before:content-none [&_:not(pre)>code]:after:content-none [&_blockquote_p:first-of-type]:before:content-none [&_blockquote_p:last-of-type]:after:content-none',
        variant === 'compact'
          ? 'prose-li:my-0.5 prose-ol:my-2 prose-p:my-2 prose-ul:my-2 prose-headings:mt-4 prose-headings:mb-1 text-[15px] leading-6'
          : 'prose-li:my-1.5 prose-ol:my-5 prose-p:my-5 prose-ul:my-5 text-base',
        className,
      )}
    >
      {children}
    </div>
  );
}
