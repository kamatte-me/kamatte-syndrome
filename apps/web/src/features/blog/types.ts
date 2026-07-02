import type { Post } from 'content-collections';

export type BlogListPost = Pick<
  Post,
  'featuredImage' | 'publishedAt' | 'slug' | 'title'
>;
