'use client';

import { useServerFn } from '@tanstack/react-start';
import { useEffect, useState } from 'react';
import { getOpenGraph } from '../api/openGraph.functions';
import type { OpenGraphMetadata } from '../utils/openGraph';
import { type LinkCardState, LinkCardView } from './LinkCardView';

export type LinkCardProps = {
  url: string;
  className?: string;
};

const openGraphRequests = new Map<string, Promise<OpenGraphMetadata>>();

export function LinkCard({ url, className }: LinkCardProps) {
  const fetchOpenGraph = useServerFn(getOpenGraph);
  const [state, setState] = useState<LinkCardState>({ status: 'loading' });

  useEffect(() => {
    let isActive = true;
    setState({ status: 'loading' });

    getSharedOpenGraphMetadata(url, () => fetchOpenGraph({ data: { url } }))
      .then((metadata) => {
        if (isActive) {
          setState({ status: 'success', metadata });
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setState({
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      });

    return () => {
      isActive = false;
    };
  }, [fetchOpenGraph, url]);

  return <LinkCardView className={className} state={state} url={url} />;
}

function getSharedOpenGraphMetadata(
  url: string,
  fetchMetadata: () => Promise<OpenGraphMetadata>,
) {
  const existingRequest = openGraphRequests.get(url);
  if (existingRequest) {
    return existingRequest;
  }

  const request = fetchMetadata();
  openGraphRequests.set(url, request);
  request.then(
    () => {
      if (openGraphRequests.get(url) === request) {
        openGraphRequests.delete(url);
      }
    },
    () => {
      if (openGraphRequests.get(url) === request) {
        openGraphRequests.delete(url);
      }
    },
  );

  return request;
}
