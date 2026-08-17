import { describe, expect, it } from 'vitest';
import { publishTextToX, type XCredentials } from './index.ts';

const credentials: XCredentials = {
  accessToken: 'access-token',
  accessTokenSecret: 'access-token-secret',
  apiKey: 'api-key',
  apiKeySecret: 'api-key-secret',
};

describe('publishTextToX', () => {
  it('publishes the supplied text', async () => {
    const requests: Request[] = [];
    const text = 'New post: Example title\nhttps://kamatte.me/blog/example';

    await publishTextToX(text, {
      credentials,
      fetchFn: async (input, init) => {
        requests.push(new Request(input, init));
        return new Response(null, { status: 201 });
      },
    });

    expect(await requests[0]?.json()).toEqual({ text });
    expect(requests[0]?.headers.get('Authorization')).toMatch(/^OAuth /);
  });

  it('reports a definitive API failure', async () => {
    await expect(
      publishTextToX('Example', {
        credentials,
        fetchFn: async () => new Response(null, { status: 403 }),
      }),
    ).rejects.toThrow('X delivery failed with HTTP 403.');
  });

  it('reports an unknown outcome without creating a retryable state', async () => {
    await expect(
      publishTextToX('Example', {
        credentials,
        fetchFn: async () => {
          throw new Error('connection reset');
        },
      }),
    ).rejects.toThrow(
      'X delivery has an unknown outcome and will not be retried automatically: connection reset',
    );
  });
});
