import {
  createMemoryHistory,
  createRouter,
  RouterContextProvider,
} from '@tanstack/react-router';
import {
  type RenderOptions,
  render as renderWithTestingLibrary,
} from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { routeTree } from '@/routeTree.gen';

type RenderWithRouterOptions = Omit<RenderOptions, 'wrapper'> & {
  initialLocation?: string;
};

export function createTestRouter(initialLocation = '/') {
  return createRouter({
    routeTree,
    history: createMemoryHistory({
      initialEntries: [initialLocation],
    }),
  });
}

export function renderWithRouter(
  ui: ReactElement,
  { initialLocation = '/', ...renderOptions }: RenderWithRouterOptions = {},
) {
  const router = createTestRouter(initialLocation);

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <RouterContextProvider router={router}>{children}</RouterContextProvider>
    );
  }

  return {
    ...renderWithTestingLibrary(ui, { wrapper: Wrapper, ...renderOptions }),
    router,
  };
}
