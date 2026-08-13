import { allPosts } from 'content-collections';

export function getPosts() {
  const posts =
    import.meta.env.VITE_SHOW_UNPUBLISHED_CONTENT === '1'
      ? allPosts
      : allPosts.filter(
          (post) =>
            post.publishedAt !== undefined &&
            post.publishedAt.getTime() <= Date.now(),
        );

  return [...posts].sort((a, b) => {
    const aTime = a.publishedAt?.getTime() ?? Number.POSITIVE_INFINITY;
    const bTime = b.publishedAt?.getTime() ?? Number.POSITIVE_INFINITY;

    return bTime - aTime;
  });
}
