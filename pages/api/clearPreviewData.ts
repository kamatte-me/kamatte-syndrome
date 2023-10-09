import type { NextApiHandler } from 'next';

const handler: NextApiHandler = (_, res) => {
  res.clearPreviewData();
  res.end();
};

export default handler;
