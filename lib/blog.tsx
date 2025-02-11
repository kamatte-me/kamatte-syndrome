import type { Blog } from '@/lib/microcms/model';
import { htmlToTextContent } from '@/lib/parseHTML';

export const parseBlogBody = (
  blogBody: Blog['body'],
): {
  text: string;
  description: string;
} => {
  const text = htmlToTextContent(blogBody);
  const description = text.length <= 100 ? text : `${text.slice(0, 99)}…`;
  return {
    text,
    description,
  };
};
