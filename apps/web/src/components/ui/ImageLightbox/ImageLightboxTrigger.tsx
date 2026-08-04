import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/utils/classNames';

export const imageLightboxTriggerSelector = '[data-image-lightbox-trigger]';

export type ImageLightboxTriggerProps = Omit<
  ComponentPropsWithoutRef<'button'>,
  'aria-haspopup' | 'aria-label' | 'children' | 'type'
> & {
  alt?: string;
  children: ReactNode;
  originalSrc: string;
};

export function ImageLightboxTrigger({
  alt,
  children,
  className,
  originalSrc,
  ...props
}: ImageLightboxTriggerProps) {
  const normalizedAlt = alt?.trim();

  return (
    <button
      {...props}
      type="button"
      aria-haspopup="dialog"
      aria-label={
        normalizedAlt ? `${normalizedAlt}を拡大表示` : '画像を拡大表示'
      }
      data-image-lightbox-trigger=""
      data-image-lightbox-src={originalSrc}
      className={cn(
        'inline-block max-w-full cursor-zoom-in appearance-none border-0 bg-transparent p-0 align-middle leading-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-cutout-readable focus-visible:outline-offset-4',
        className,
      )}
    >
      {children}
    </button>
  );
}
