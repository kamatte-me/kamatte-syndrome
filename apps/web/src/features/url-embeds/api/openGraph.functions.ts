import { createServerFn } from '@tanstack/react-start';
import { setResponseHeader } from '@tanstack/react-start/server';
import { fetchOpenGraphMetadata } from '../server/openGraph.server';
import { validateOpenGraphRequest } from '../utils/openGraph';

export const getOpenGraph = createServerFn({ method: 'GET' })
  .validator(validateOpenGraphRequest)
  .handler(async ({ data }) => {
    setResponseHeader(
      'Cache-Control',
      'public, max-age=0, s-maxage=2592000, stale-while-revalidate=31536000',
    );
    return fetchOpenGraphMetadata(data.url);
  });
