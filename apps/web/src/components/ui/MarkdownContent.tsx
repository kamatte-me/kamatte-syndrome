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
        'prose prose-invert max-w-none prose-pre:border prose-li:marker:text-cutout-readable [&>:first-child]:mt-0 [&>:last-child]:mb-0',
        variant === 'compact'
          ? 'prose-li:my-0.5 prose-ol:my-2 prose-p:my-2 prose-ul:my-2 prose-headings:mt-4 prose-headings:mb-1 text-[15px] leading-6'
          : 'prose-li:my-1.5 prose-ol:my-5 prose-p:my-5 prose-ul:my-5 text-base leading-8',
        className,
      )}
    >
      {children}
    </div>
  );
}
