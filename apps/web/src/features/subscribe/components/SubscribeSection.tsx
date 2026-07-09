import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/utils/classNames';

export type SubscribeSectionProps = ComponentPropsWithoutRef<'section'> & {
  heading: ReactNode;
};

export function SubscribeSection({
  children,
  className,
  heading,
  ...props
}: SubscribeSectionProps) {
  return (
    <section
      {...props}
      className={cn('sm:border sm:border-cutout-hole sm:p-7 md:p-9', className)}
    >
      <h2 className="mb-6 border-cutout-hole border-b pb-3 font-bold text-2xl text-cutout-hole leading-tight sm:text-3xl">
        {heading}
      </h2>

      {children}
    </section>
  );
}
