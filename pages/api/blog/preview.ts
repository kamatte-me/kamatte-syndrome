import { NextApiHandler } from 'next';

import { client } from '@/lib/microcms';
import { BlogPreviewData } from '@/pages/blog/[id]';

const handler: NextApiHandler = async (req, res) => {
  if (!req.query.id) {
    return res.status(404).end();
  }

  const entry = await client.getContent('blog', String(req.query.id), {
    fields: 'id',
    draftKey: String(req.query.draftKey),
  });

  if (!entry) {
    return res.status(401).json({ message: 'Invalid slug' });
  }

  res.setPreviewData({
    id: entry.id,
    draftKey: req.query.draftKey,
  } as BlogPreviewData);
  res.writeHead(307, { Location: `/blog/${entry.id}` });
  return res.end('Preview mode enabled');
};

export default handler;
