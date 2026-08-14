import { type ComponentPropsWithoutRef, forwardRef } from 'react';
import { cn } from '@/utils/classNames';

type PageMainSize = 'narrow';

type PageMainProps = Omit<ComponentPropsWithoutRef<'main'>, 'size'> & {
  size?: PageMainSize;
};

const defaultSizeClassName = 'max-w-5xl';

const sizeClassNames = {
  narrow: 'max-w-4xl',
} as const satisfies Record<PageMainSize, string>;

export const PageMain = forwardRef<HTMLElement, PageMainProps>(
  function PageMain({ children, className, size, ...props }, ref) {
    return (
      <main
        ref={ref}
        className={cn(
          'mx-auto flex flex-col px-6 py-8 sm:px-8',
          size ? sizeClassNames[size] : defaultSizeClassName,
          className,
        )}
        {...props}
      >
        {children}
      </main>
    );
  },
);
