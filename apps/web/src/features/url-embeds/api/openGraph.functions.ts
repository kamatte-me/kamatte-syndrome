import { createServerFn } from '@tanstack/react-start';
import { fetchOpenGraphMetadata } from '../server/openGraph.server';
import { validateOpenGraphRequest } from '../utils/openGraph';

export const getOpenGraph = createServerFn({ method: 'GET' })
  .validator(validateOpenGraphRequest)
  .handler(async ({ data }) => {
    return fetchOpenGraphMetadata(data.url);
  });
