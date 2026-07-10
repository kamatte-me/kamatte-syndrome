import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/utils/classNames';

type ArticleLayoutProps = Omit<ComponentPropsWithoutRef<'article'>, 'title'> & {
  metadata: ReactNode;
  title: ReactNode;
};

export function ArticleLayout({
  children,
  className,
  metadata,
  title,
  ...props
}: ArticleLayoutProps) {
  return (
    <article
      {...props}
      className={cn('sm:border sm:border-cutout-hole sm:p-7 md:p-9', className)}
    >
      <header className="mb-8 border-cutout-hole border-b-4 pb-5">
        <h1 className="font-bold text-3xl leading-tight sm:text-4xl">
          {title}
        </h1>
        <div className="mt-3 text-cutout-muted text-sm">{metadata}</div>
      </header>

      {children}
    </article>
  );
}
