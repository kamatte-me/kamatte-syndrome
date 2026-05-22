import type { ComponentPropsWithoutRef, CSSProperties } from 'react';
import { cn } from '@/utils/classNames';
import styles from './Icon.module.css';

type IconStyle = CSSProperties & {
  '--icon-mask-image': string;
};

export type IconProps = Omit<ComponentPropsWithoutRef<'span'>, 'children'> & {
  src: string;
};

export function Icon({ className, src, style, ...props }: IconProps) {
  const iconStyle: IconStyle = {
    ...style,
    '--icon-mask-image': `url(${JSON.stringify(src)})`,
  };

  return (
    <span
      {...props}
      aria-hidden="true"
      className={cn(
        'inline-block size-[1em] shrink-0 bg-current',
        styles.icon,
        className,
      )}
      style={iconStyle}
    />
  );
}
