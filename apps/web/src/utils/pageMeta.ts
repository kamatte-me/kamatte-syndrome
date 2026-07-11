import { baseUrl, siteName } from '@/constants/site';

type PageMetaOptions = {
  description: string;
  image?: string;
  openGraphTitle?: string;
  path: string;
  title: string;
  type?: 'article' | 'website';
};

type PageMeta =
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string };

export function createPageMeta({
  description,
  image = '/icon.png',
  title,
  openGraphTitle = title,
  path,
  type = 'website',
}: PageMetaOptions): PageMeta[] {
  const url = new URL(path, baseUrl).href;
  const imageUrl = new URL(image, baseUrl).href;

  return [
    { title },
    { name: 'description', content: description },
    { property: 'og:title', content: openGraphTitle },
    { property: 'og:description', content: description },
    { property: 'og:type', content: type },
    { property: 'og:url', content: url },
    { property: 'og:site_name', content: siteName },
    { property: 'og:locale', content: 'ja_JP' },
    { property: 'og:image', content: imageUrl },
  ];
}
