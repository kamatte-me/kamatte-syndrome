import type { MDXContent } from 'mdx/types';

export type Post = {
  title: string;
  publishedAt?: Date;
  revisedAt?: Date;
  featuredImage?: string;
  content: string;
  slug: string;
  excerpt: string;
  mdx: MDXContent;
};

export declare const allPosts: Post[];
