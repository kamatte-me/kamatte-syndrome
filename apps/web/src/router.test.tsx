import { describe, expect, it, vi } from 'vitest';

const createRouter = vi.hoisted(() => vi.fn());
const routeTree = vi.hoisted(() => ({ routeTree: {} }));

vi.mock('@tanstack/react-router', () => ({ createRouter }));
vi.mock('./routeTree.gen', () => routeTree);

import { getRouter } from './router';

describe('getRouter', () => {
  it('creates a router with the route tree and navigation preload policy', () => {
    const router = { name: 'router' };
    createRouter.mockReturnValue(router);

    expect(getRouter()).toBe(router);
    expect(createRouter).toHaveBeenCalledWith({
      defaultPreload: 'intent',
      defaultPreloadStaleTime: 0,
      routeTree: routeTree.routeTree,
      scrollRestoration: true,
    });
  });
});
