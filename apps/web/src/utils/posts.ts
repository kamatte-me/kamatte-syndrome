type PostWithDate = {
  publishedAt?: Date;
};

export const BLOG_POSTS_PER_PAGE = 5;

export function parseBlogPageSearchParam(value: unknown) {
  if (typeof value === 'number') {
    return Number.isInteger(value) && value >= 2 ? value : undefined;
  }

  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
    return undefined;
  }

  const page = Number(value);
  return page >= 2 ? page : undefined;
}

export function paginateItems<T>(
  items: T[],
  currentPage: number,
  perPage = BLOG_POSTS_PER_PAGE,
) {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const start = (currentPage - 1) * perPage;

  return {
    items: items.slice(start, start + perPage),
    pageInfo: {
      totalItems,
      totalPages,
      currentPage,
      perPage,
    },
  };
}

export function formatPostDate(date?: Date) {
  if (!date) {
    return 'Date unknown';
  }

  return new Intl.DateTimeFormat('ja-JP', {
    dateStyle: 'long',
    timeZone: 'Asia/Tokyo',
  }).format(date);
}

export function sortPostsByPublishedAtDesc<T extends PostWithDate>(posts: T[]) {
  return [...posts].sort((a, b) => {
    const aTime = a.publishedAt?.getTime() ?? Number.NEGATIVE_INFINITY;
    const bTime = b.publishedAt?.getTime() ?? Number.NEGATIVE_INFINITY;

    return bTime - aTime;
  });
}
