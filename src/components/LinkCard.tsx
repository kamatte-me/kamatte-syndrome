'use client';

import { useServerFn } from '@tanstack/react-start';
import { useEffect, useState } from 'react';
import { getOpenGraph } from '@/utils/openGraph.functions';
import { type LinkCardState, LinkCardView } from './LinkCardView';

type LinkCardProps = {
  url: string;
};

export function LinkCard({ url }: LinkCardProps) {
  const fetchOpenGraph = useServerFn(getOpenGraph);
  const [state, setState] = useState<LinkCardState>({ status: 'loading' });

  useEffect(() => {
    let isActive = true;
    setState({ status: 'loading' });

    fetchOpenGraph({ data: { url } })
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

  return <LinkCardView state={state} url={url} />;
}
