import { NextApiHandler } from 'next';

type RequestBody = {
  access_token?: string;
  title?: string;
  url?: string;
};

type LineBroadcastMessagePostBody = {
  messages: {
    type: string;
    text: string;
  }[];
};

const handler: NextApiHandler = (req, res) => {
  if (req.method !== 'POST') {
    res.status(400).end();
    return;
  }

  const { access_token: accessToken, title, url } = req.body as RequestBody;
  if (!accessToken || !title || !url) {
    res.status(400).end();
    return;
  }
  if (accessToken !== process.env.LINE_ACCESS_TOKEN) {
    res.status(401).end();
    return;
  }

  const body: LineBroadcastMessagePostBody = {
    messages: [
      {
        type: 'text',
        text: `ウェブログｺｼｰﾝしますた\n\n${title}\n${url}`,
      },
    ],
  };
  // https://developers.line.biz/ja/reference/messaging-api/#send-broadcast-message
  return fetch('https://api.line.me/v2/bot/message/broadcast', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
    .then(() => {
      res.status(200).end();
    })
    .catch(err => {
      // eslint-disable-next-line no-console
      console.error(err);
      res.status(500).send(err);
    });
};

export default handler;
