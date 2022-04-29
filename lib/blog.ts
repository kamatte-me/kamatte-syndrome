import { Blog } from '@/lib/microcms/model';
import { htmlToTextContent } from '@/lib/parseHTML';

export const parseBlogBody = (
  blogBody: Blog['body'],
): {
  html: string;
  text: string;
  description: string;
} => {
  const html = blogBody.map(b => b.body).join('');
  const text = htmlToTextContent(html);
  const description = text.length <= 100 ? text : `${text.substring(0, 99)}…`;
  return {
    html,
    text,
    description,
  };
};
