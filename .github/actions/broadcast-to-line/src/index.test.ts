import { describe, expect, it } from 'vitest';
import { broadcastTextToLine, createLineRetryKey, getInput } from './index.ts';

describe('broadcastTextToLine', () => {
  it('reads a hyphenated GitHub Actions input', () => {
    const key = 'INPUT_CHANNEL-ACCESS-TOKEN';
    const original = process.env[key];
    process.env[key] = 'line-token';

    try {
      expect(getInput('channel-access-token')).toBe('line-token');
    } finally {
      if (original === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = original;
      }
    }
  });

  it('broadcasts the supplied text with a deterministic retry key', async () => {
    const requests: Request[] = [];
    const text = '新着記事: Example title\nhttps://kamatte.me/blog/example';

    await broadcastTextToLine(text, {
      channelAccessToken: 'line-token',
      fetchFn: async (input, init) => {
        requests.push(new Request(input, init));
        return new Response(null, { status: 200 });
      },
    });

    expect(await requests[0]?.json()).toEqual({
      messages: [{ text, type: 'text' }],
    });
    expect(requests[0]?.headers.get('X-Line-Retry-Key')).toBe(
      createLineRetryKey(text),
    );
  });

  it('reports a failed broadcast without writing delivery state', async () => {
    await expect(
      broadcastTextToLine('Example', {
        channelAccessToken: 'line-token',
        fetchFn: async () => new Response(null, { status: 500 }),
      }),
    ).rejects.toThrow('LINE delivery failed with HTTP 500.');
  });

  it('accepts a retry that LINE has already processed', async () => {
    await expect(
      broadcastTextToLine('Example', {
        channelAccessToken: 'line-token',
        fetchFn: async () =>
          new Response(null, {
            headers: { 'x-line-accepted-request-id': 'request-id' },
            status: 409,
          }),
      }),
    ).resolves.toBeUndefined();
  });
});
