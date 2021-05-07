import { Model } from '@/lib/microcms/client/types/model';
import {
  GetAllContentsQuery,
  GetContentQuery,
  GetContentsQuery,
} from '@/lib/microcms/client/types/request';
import { GetContentsResponse } from '@/lib/microcms/client/types/response';

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
    .map(([key, value]) => `${key}=${value}`)
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
  const httpOption = {
    headers: { 'X-API-KEY': process.env.MICROCMS_API_KEY! },
  };

  const getContent: GetContentFn<T> = async (endpoint, id, query = {}) => {
    return fetch(
      `${baseUrl}/${endpoint}/${id}${makeQueryString(query)}`,
      httpOption,
    ).then(res => res.json());
  };

  const getContentsRaw: GetContentsRawFn<T> = async (endpoint, query = {}) => {
    return fetch(
      `${baseUrl}/${endpoint}${makeQueryString(query)}`,
      httpOption,
    ).then(res => res.json());
  };

  const getContents: GetContentsFn<T> = async (endpoint, query = {}) => {
    const data = await getContentsRaw(endpoint, query);
    return data.contents;
  };

  const getAllContents: GetAllContentsFn<T> = async (endpoint, query = {}) => {
    const allContents = [];

    let offset = 0;
    for (;;) {
      // eslint-disable-next-line no-await-in-loop
      const data = await getContentsRaw(endpoint, {
        ...query,
        offset,
      });
      allContents.push(...data.contents);
      offset += data.limit;
      if (offset > data.totalCount) {
        break;
      }
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
