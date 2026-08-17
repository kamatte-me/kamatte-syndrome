import { createHash } from 'node:crypto';

type FetchFunction = typeof fetch;

export async function broadcastTextToLine(
  text: string,
  options: Readonly<{
    channelAccessToken: string;
    fetchFn?: FetchFunction;
  }>,
): Promise<void> {
  const messageText = text.trim();

  if (messageText === '') {
    throw new Error('LINE text must not be empty.');
  }

  const response = await (options.fetchFn ?? fetch)(
    'https://api.line.me/v2/bot/message/broadcast',
    {
      body: JSON.stringify({
        messages: [
          {
            text: messageText,
            type: 'text',
          },
        ],
      }),
      headers: {
        Authorization: `Bearer ${options.channelAccessToken}`,
        'Content-Type': 'application/json',
        'X-Line-Retry-Key': createLineRetryKey(messageText),
      },
      method: 'POST',
    },
  );

  const isAcceptedRetry =
    response.status === 409 &&
    response.headers.has('x-line-accepted-request-id');

  if (!response.ok && !isAcceptedRetry) {
    throw new Error(`LINE delivery failed with HTTP ${response.status}.`);
  }
}

export function createLineRetryKey(text: string): string {
  const bytes = createHash('sha256')
    .update(`line:${text}`)
    .digest()
    .subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function getInput(name: string): string {
  const value = process.env[`INPUT_${name.toUpperCase().replaceAll('-', '_')}`];

  if (value === undefined || value.trim() === '') {
    throw new Error(`Missing required input: ${name}`);
  }

  return value.trim();
}

async function main(): Promise<void> {
  await broadcastTextToLine(getInput('text'), {
    channelAccessToken: getInput('channel-access-token'),
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void main();
}
