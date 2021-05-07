import { Model } from '@/lib/microcms/client/types/model';

export interface GetContentsResponse<T extends object & Model> {
  contents: T[];
  totalCount: number;
  offset: number;
  limit: number;
}
