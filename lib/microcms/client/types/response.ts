import type { Model } from '@/lib/microcms/client/types/model';

export interface GetContentsResponse<T extends Model<object>> {
  contents: T[];
  totalCount: number;
  offset: number;
  limit: number;
}
