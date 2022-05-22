import React, { Fragment } from 'react';

import { LinkCard } from '@/components/elements/LinkCard';
import {
  Blog,
  BlogCustomFieldHTML,
  BlogCustomFieldRichEditor,
} from '@/lib/microcms/model';
import { htmlToTextContent, htmlToThemed } from '@/lib/parseHTML';

export const parseBlogBody = (
  blogBody: Blog['body'],
): {
  Component: React.FC;
  html: string;
  text: string;
  description: string;
} => {
  const ReactComponent: React.FC = () => (
    <>
      {blogBody.map((b, index) => {
        const key = `blog-body-${index}`;
        switch (b.fieldId) {
          case 'linkCard':
            return <LinkCard key={key} url={b.url} />;
          default:
            return <Fragment key={key}>{htmlToThemed(b.body)}</Fragment>;
        }
      })}
    </>
  );

  const htmlOnly = blogBody.filter(b => b.fieldId !== 'linkCard') as (
    | BlogCustomFieldRichEditor
    | BlogCustomFieldHTML
  )[];
  const html = htmlOnly.map(b => b.body).join('');
  const text = htmlToTextContent(html);
  const description = text.length <= 100 ? text : `${text.substring(0, 99)}…`;
  return {
    Component: ReactComponent,
    html,
    text,
    description,
  };
};
