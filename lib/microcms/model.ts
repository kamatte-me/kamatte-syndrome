import {
  CustomField,
  Image,
  Model,
  RepeatedField,
} from '@/lib/microcms/client/types/model';

type BlogCustomFieldRichEditor = CustomField<
  'richEditor',
  {
    body: string;
  }
>;

type BlogCustomFieldHTML = CustomField<
  'html',
  {
    body: string;
  }
>;

export type Blog = Model<{
  title: string;
  body: RepeatedField<BlogCustomFieldRichEditor | BlogCustomFieldHTML>;
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
