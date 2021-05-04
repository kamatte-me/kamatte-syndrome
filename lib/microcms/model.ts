interface Model {
  id: string;
}

interface Image {
  url: string;
  height: number;
  width: number;
}

export interface Blog extends Model {
  title: string;
  body: string;
  featuredImage?: Image | null;
}

export interface History extends Model {
  year: number;
  body: string;
}

export interface Skill extends Model {
  name: string;
  level: number;
}

export interface Portfolio extends Model {
  year: number;
  title: string;
  url?: string | null;
  featuredImage?: Image | null;
  category: string;
  description: string;
  technologies?: string | null;
}

export interface Culture extends Model {
  name: string;
  youtubeVideoId: string;
  description: string;
}
