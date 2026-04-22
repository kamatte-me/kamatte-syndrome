type PostWithDate = {
  publishedAt?: Date;
};

const blankLinePattern = /\n\s*\n/g;
const whitespacePattern = /\s+/g;
const markdownLinkPattern = /\[([^\]]+)\]\([^)]+\)/g;
const markdownImagePattern = /!\[[^\]]*]\([^)]+\)/g;
const markdownDecorationPattern = /[*_~`>#-]+/g;

export function toPostSlug(metaPath: string) {
  return metaPath;
}

export function createPostExcerpt(content: string, maxLength = 180) {
  const paragraphs = content.split(blankLinePattern);

  for (const paragraph of paragraphs) {
    const raw = paragraph.trim();

    if (
      !raw ||
      raw.startsWith('#') ||
      raw.startsWith('![') ||
      raw.startsWith('```') ||
      raw.startsWith('import ')
    ) {
      continue;
    }

    const normalized = stripMarkdown(paragraph);

    if (!normalized) {
      continue;
    }

    if (normalized.length <= maxLength) {
      return normalized;
    }

    return `${normalized.slice(0, maxLength).trimEnd()}…`;
  }

  return '';
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

export function sortPostsByPublishedAtDesc<T extends PostWithDate>(
  posts: Array<T>,
) {
  return [...posts].sort((a, b) => {
    const aTime = a.publishedAt?.getTime() ?? Number.NEGATIVE_INFINITY;
    const bTime = b.publishedAt?.getTime() ?? Number.NEGATIVE_INFINITY;

    return bTime - aTime;
  });
}

function stripMarkdown(content: string) {
  return content
    .replace(markdownImagePattern, ' ')
    .replace(markdownLinkPattern, '$1')
    .replace(markdownDecorationPattern, ' ')
    .replace(whitespacePattern, ' ')
    .trim();
}
