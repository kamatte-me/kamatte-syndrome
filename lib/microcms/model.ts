import { CustomField, Image, Model } from '@/lib/microcms/client/types/model';

export type BlogCustomFieldRichEditor = CustomField<
  'richEditor',
  {
    body: string;
  }
>;

export type BlogCustomFieldHTML = CustomField<
  'html',
  {
    body: string;
  }
>;

export type BlogCustomFieldLinkCard = CustomField<
  'linkCard',
  {
    url: string;
  }
>;

export type Blog = Model<{
  title: string;
  body: string;
  featuredImage?: Image | null;
}>;

export type History = Model<{
  year: number;
  body: string;
}>;

export type Skill = Model<{
  name: string;
  level: number;
}>;

export type Portfolio = Model<{
  year: number;
  title: string;
  url?: string | null;
  featuredImage?: Image | null;
  category: string;
  description: string;
  technologies?: string | null;
}>;

export type Culture = Model<{
  name: string;
  youtubeVideoId: string;
  description: string;
}>;
