type PostWithDate = {
  publishedAt?: Date;
};

export function formatPostDate(date?: Date) {
  if (!date) {
    return 'Date unknown';
  }

  return new Intl.DateTimeFormat('ja-JP', {
    dateStyle: 'long',
    timeZone: 'Asia/Tokyo',
  }).format(date);
}

export function sortPostsByPublishedAtDesc<T extends PostWithDate>(
  posts: Array<T>,
) {
  return [...posts].sort((a, b) => {
    const aTime = a.publishedAt?.getTime() ?? Number.NEGATIVE_INFINITY;
    const bTime = b.publishedAt?.getTime() ?? Number.NEGATIVE_INFINITY;

    return bTime - aTime;
  });
}
