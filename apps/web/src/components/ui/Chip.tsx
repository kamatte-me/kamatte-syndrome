import { Slot } from '@radix-ui/react-slot';
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/utils/classNames';

type ChipProps = ComponentPropsWithoutRef<'span'> & {
  asChild?: boolean;
};

export function Chip({ asChild = false, className, ...props }: ChipProps) {
  const Component = asChild ? Slot : 'span';

  return (
    <Component
      {...props}
      className={cn(
        'inline-flex rounded-full border border-cutout-hole px-3 py-1 text-cutout-hole text-xs',
        className,
      )}
    />
  );
}
