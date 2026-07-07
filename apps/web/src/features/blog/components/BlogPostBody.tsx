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
        'prose-h2:border-cutout-hole prose-h2:border-b prose-h2:pb-3 prose-dt:font-bold prose-headings:font-bold prose-strong:font-bold prose-th:font-bold prose-h1:text-2xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg prose-h5:text-base prose-headings:leading-tight sm:prose-h1:text-3xl sm:prose-h2:text-3xl sm:prose-h3:text-2xl sm:prose-h4:text-xl sm:prose-h5:text-lg',
        'prose-pre:border-0',
        '[&_blockquote_p:first-of-type]:before:content-none [&_blockquote_p:last-of-type]:after:content-none',
        '[&_:not(pre)>code]:mx-0.5 [&_:not(pre)>code]:rounded-sm [&_:not(pre)>code]:border [&_:not(pre)>code]:border-cutout-muted [&_:not(pre)>code]:bg-transparent [&_:not(pre)>code]:px-1 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:font-bold [&_:not(pre)>code]:before:content-none [&_:not(pre)>code]:after:content-none',
        className,
      )}
    />
  );
}
