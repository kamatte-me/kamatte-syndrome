import type { RenderableServerComponent } from '@tanstack/react-start/rsc';
import type { ReactElement } from 'react';

type RenderedServerComponent = RenderableServerComponent<ReactElement>;

export type PortfolioListItem = {
  body: RenderedServerComponent;
  category: string;
  image?: string;
  link?: string;
  name: string;
  order: number;
  slug: string;
  technologies: string[];
  year: number;
};

export type PortfolioYearGroup = {
  items: PortfolioListItem[];
  year: number;
};
