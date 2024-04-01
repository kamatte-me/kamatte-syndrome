import type { NextApiHandler } from 'next';

import { client } from '@/lib/microcms';
import type { BlogPreviewData } from '@/pages/blog/[id]';

const handler: NextApiHandler = (req, res) => {
  if (!req.query.id) {
    res.status(404).end();
    return;
  }

  return client
    .getContent('blog', String(req.query.id), {
      fields: 'id',
      draftKey: String(req.query.draftKey),
    })
    .then((entry) => {
      res.setPreviewData({
        id: entry.id,
        draftKey: req.query.draftKey,
      } as BlogPreviewData);
      res.writeHead(307, { Location: `/blog/${entry.id}` });
      res.end('Preview mode enabled');
    })
    .catch((err: unknown) => {
      // eslint-disable-next-line no-console -- designed
      console.error(err);
      res.status(401).json({ message: 'Invalid slug' });
    });
};

export default handler;
