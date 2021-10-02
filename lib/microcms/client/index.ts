import pLimit from 'p-limit';

import { Model } from '@/lib/microcms/client/types/model';
import {
  GetAllContentsQuery,
  GetContentQuery,
  GetContentsQuery,
} from '@/lib/microcms/client/types/request';
import { GetContentsResponse } from '@/lib/microcms/client/types/response';

// 全件取得の同時並列数
const MAX_CONCURRENCY = 5;

type GetContentFn<T> = <K extends keyof T>(
  endpoint: K,
  id: string,
  query?: GetContentQuery,
) => Promise<T[K] & Model>;

type GetContentsRawFn<T> = <K extends keyof T>(
  endpoint: K,
  query?: GetContentsQuery,
) => Promise<GetContentsResponse<T[K] & Model>>;

type GetContentsFn<T> = <K extends keyof T>(
  endpoint: K,
  query?: GetContentsQuery,
) => Promise<(T[K] & Model)[]>;

type GetAllContentsFn<T> = <K extends keyof T>(
  endpoint: K,
  query?: GetAllContentsQuery,
) => Promise<(T[K] & Model)[]>;

interface Client<T extends EndpointTypeMap> {
  getContent: GetContentFn<T>;
  getContentsRaw: GetContentsRawFn<T>;
  getContents: GetContentsFn<T>;
  getAllContents: GetAllContentsFn<T>;
}

export interface ClientConfig {
  serviceId: string;
  apiKey: string;
}

const makeQueryString = (query: object): string => {
  let queryStr = Object.entries(query)
    .map(([key, value]) => {
      return value ? `${key}=${value}` : '';
    })
    .join('&');
  if (queryStr.length > 0) {
    queryStr = `?${queryStr}`;
  }
  return queryStr;
};

interface EndpointTypeMap {
  [endpoint: string]: object;
}

export const createClient = <T extends EndpointTypeMap>(
  config: ClientConfig,
): Client<T> => {
  const baseUrl = `https://${config.serviceId}.microcms.io/api/v1`;
  const headers: HeadersInit = new Headers({
    'X-API-KEY': process.env.MICROCMS_API_KEY,
  });
  if (process.env.MICROCMS_GLOBAL_DRAFT_KEY) {
    headers.set('X-GLOBAL-DRAFT-KEY', process.env.MICROCMS_GLOBAL_DRAFT_KEY);
  }
  const httpOption: RequestInit = {
    headers,
  };

  const getContent: GetContentFn<T> = async (endpoint, id, query = {}) => {
    return fetch(
      `${baseUrl}/${endpoint}/${id}${makeQueryString(query)}`,
      httpOption,
    )
      .then(res => res.json())
      .catch(() => null);
  };

  const getContentsRaw: GetContentsRawFn<T> = async (endpoint, query = {}) => {
    return fetch(`${baseUrl}/${endpoint}${makeQueryString(query)}`, httpOption)
      .then(res => res.json())
      .catch(() => []);
  };

  const getContents: GetContentsFn<T> = async (endpoint, query = {}) => {
    const data = await getContentsRaw(endpoint, query);
    return data.contents;
  };

  const getAllContents: GetAllContentsFn<T> = async (endpoint, query = {}) => {
    const allContents = [];

    // 初めに全件数を取得
    const firstData = await getContentsRaw(endpoint, {
      ...query,
      offset: 0,
    });
    allContents.push(...firstData.contents);

    // 残りの件数を並列で取得
    if (firstData.limit < firstData.totalCount) {
      const promiseLimit = pLimit(MAX_CONCURRENCY);
      const allData = await Promise.all(
        [...Array(Math.ceil(firstData.totalCount / firstData.limit) - 1)].map(
          (_, i) => {
            return promiseLimit(() =>
              getContents(endpoint, {
                ...query,
                offset: firstData.limit * (i + 1),
              }),
            );
          },
        ),
      );
      allData.forEach(contents => {
        allContents.push(...contents);
      });
    }

    return allContents;
  };

  return {
    getContent,
    getContentsRaw,
    getContents,
    getAllContents,
  };
};
