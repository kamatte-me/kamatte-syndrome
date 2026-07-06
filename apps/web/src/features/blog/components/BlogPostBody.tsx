import type { ComponentPropsWithoutRef } from 'react';
import { MarkdownContent } from '@/components/ui/MarkdownContent';
import { cn } from '@/utils/classNames';

export type BlogPostBodyProps = ComponentPropsWithoutRef<
  typeof MarkdownContent
>;

export function BlogPostBody({ className, ...props }: BlogPostBodyProps) {
  return (
    <MarkdownContent
      {...props}
      className={cn(
        'prose-img:mx-auto prose-img:block prose-img:h-auto prose-img:max-h-[360px] prose-img:w-auto prose-img:max-w-[min(100%,480px)] prose-img:object-contain',
        className,
      )}
    />
  );
}
