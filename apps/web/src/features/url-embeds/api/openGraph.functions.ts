import { createServerFn } from '@tanstack/react-start';
import {
  setResponseHeader,
  setResponseStatus,
} from '@tanstack/react-start/server';
import { fetchOpenGraphMetadata } from '../server/openGraph.server';
import { validateOpenGraphRequest } from '../utils/openGraph';

export const getOpenGraph = createServerFn({ method: 'GET' })
  .validator(validateOpenGraphRequest)
  .handler(async ({ data }) => {
    try {
      const metadata = await fetchOpenGraphMetadata(data.url);

      setResponseHeader(
        'Cache-Control',
        'public, max-age=0, s-maxage=2592000, stale-while-revalidate=31536000',
      );

      return metadata;
    } catch {
      setResponseStatus(500);

      throw new Error('Unable to fetch Open Graph metadata.');
    }
  });
