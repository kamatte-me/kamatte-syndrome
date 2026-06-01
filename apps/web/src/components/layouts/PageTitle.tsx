import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/utils/classNames';

type PageTitleProps = Omit<ComponentPropsWithoutRef<'section'>, 'children'> & {
  children: ReactNode;
};

export function PageTitle({ children, className, ...props }: PageTitleProps) {
  return (
    <section
      className={cn('border-cutout-hole border-b-4 pb-8', className)}
      {...props}
    >
      <h1 className="text-center font-display font-normal text-5xl leading-none sm:text-6xl md:text-left">
        {children}
      </h1>
    </section>
  );
}
