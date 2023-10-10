import { createClient } from '@/lib/microcms/client';
import type {
  Blog,
  Culture,
  History,
  Portfolio,
  Skill,
} from '@/lib/microcms/model';

type EndpointTypeMap = {
  blog: Blog;
  history: History;
  skill: Skill;
  portfolio: Portfolio;
  culture: Culture;
};

export const client = createClient<EndpointTypeMap>({
  serviceId: process.env.MICROCMS_SERVICE_ID,
  apiKey: process.env.MICROCMS_API_KEY,
});
