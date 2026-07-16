import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getPosts } from './getPosts.server';

vi.mock('content-collections', () => ({
  allPosts: [
    {
      publishedAt: new Date('2026-07-18T00:00:00+09:00'),
      slug: 'future',
    },
    {
      publishedAt: new Date('2026-07-16T00:00:00+09:00'),
      slug: 'past',
    },
  ],
}));

describe('getPosts', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-17T00:00:00+09:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it('returns only published posts by default', () => {
    vi.stubEnv('VITE_SHOW_UNPUBLISHED_CONTENT', '0');

    expect(getPosts().map((post) => post.slug)).toEqual(['past']);
  });

  it('returns all posts in descending order when unpublished posts are shown', () => {
    vi.stubEnv('VITE_SHOW_UNPUBLISHED_CONTENT', '1');

    expect(getPosts().map((post) => post.slug)).toEqual(['future', 'past']);
  });
});
