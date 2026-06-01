import type { RenderableServerComponent } from '@tanstack/react-start/rsc';
import type { ReactElement } from 'react';

type RenderedServerComponent = RenderableServerComponent<ReactElement>;

export type CultureListItem = {
  body: RenderedServerComponent;
  name: string;
  order: number;
  slug: string;
  youtubeVideoId: string;
};
