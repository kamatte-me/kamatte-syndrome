import {
  Children,
  type ComponentPropsWithoutRef,
  cloneElement,
  isValidElement,
  type ReactNode,
} from 'react';
import {
  BlogPostContentImage,
  type BlogPostContentImageProps,
} from './BlogPostContentImage';

export type BlogPostContentLinkProps = ComponentPropsWithoutRef<'a'>;

function preserveLinkedImageNavigation(child: ReactNode) {
  if (
    !isValidElement<BlogPostContentImageProps>(child) ||
    child.type !== BlogPostContentImage
  ) {
    return child;
  }

  return cloneElement(child, { lightboxDisabled: true });
}

export function BlogPostContentLink({
  children,
  ...props
}: BlogPostContentLinkProps) {
  return (
    <a {...props}>{Children.map(children, preserveLinkedImageNavigation)}</a>
  );
}
