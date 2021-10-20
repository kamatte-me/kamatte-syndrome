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

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(400).end();
  }

  const { access_token: accessToken, title, url } = req.body as RequestBody;
  if (!accessToken || !title || !url) {
    return res.status(400).end();
  }
  if (accessToken !== process.env.LINE_ACCESS_TOKEN) {
    return res.status(401).end();
  }

  try {
    // https://developers.line.biz/ja/reference/messaging-api/#send-broadcast-message
    await fetch('https://api.line.me/v2/bot/message/broadcast', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            type: 'text',
            text: `ウェブログｺｼｰﾝしますた\n\n${title}\n${url}`,
          },
        ],
      } as LineBroadcastMessagePostBody),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send(err);
  }

  return res.status(200).end();
};

export default handler;
