import { createServerFn } from '@tanstack/react-start';
import { validateOpenGraphRequest } from './openGraph';

export const getOpenGraph = createServerFn({ method: 'GET' })
  .inputValidator(validateOpenGraphRequest)
  .handler(async ({ data }) => {
    const { fetchOpenGraphMetadata } = await import('./openGraph.server');
    return fetchOpenGraphMetadata(data.url);
  });
