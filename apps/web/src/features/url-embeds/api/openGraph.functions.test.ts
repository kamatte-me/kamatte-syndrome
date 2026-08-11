import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  fetchOpenGraphMetadata: vi.fn(),
  handler: undefined as
    | undefined
    | ((input: { data: { url: string } }) => Promise<unknown>),
  setResponseHeader: vi.fn(),
}));

vi.mock('@tanstack/react-start', () => ({
  createServerFn() {
    return {
      validator() {
        return {
          handler(
            handler: (input: { data: { url: string } }) => Promise<unknown>,
          ) {
            mocks.handler = handler;
            return handler;
          },
        };
      },
    };
  },
}));

vi.mock('@tanstack/react-start/server', () => ({
  setResponseHeader: mocks.setResponseHeader,
}));

vi.mock('../server/openGraph.server', () => ({
  fetchOpenGraphMetadata: mocks.fetchOpenGraphMetadata,
}));

import './openGraph.functions';

describe('getOpenGraph', () => {
  it('sets the public CDN cache policy before fetching metadata', async () => {
    mocks.fetchOpenGraphMetadata.mockResolvedValue({ title: 'Preview' });

    if (!mocks.handler) {
      throw new Error('Expected the server-function handler to be registered');
    }

    await expect(
      mocks.handler({ data: { url: 'https://example.com/article' } }),
    ).resolves.toEqual({ title: 'Preview' });

    expect(mocks.setResponseHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'public, max-age=0, s-maxage=2592000, stale-while-revalidate=31536000',
    );
    expect(mocks.fetchOpenGraphMetadata).toHaveBeenCalledWith(
      'https://example.com/article',
    );
  });
});
