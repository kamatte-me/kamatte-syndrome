import { Model } from '@/lib/microcms/client/types/model';

export interface GetContentsResponse<T extends Model<Record<string, any>>> {
  contents: T[];
  totalCount: number;
  offset: number;
  limit: number;
}
