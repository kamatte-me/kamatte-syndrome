import { NextApiHandler } from 'next';

const handler: NextApiHandler = (_, res) => {
  res.clearPreviewData();
  return res.end();
};

export default handler;
