import { Blog, Culture, History, Portfolio, Skill } from '@/lib/microcms/model';

const BASE_URL = `https://${process.env.MICROCMS_SERVICE_ID}.microcms.io/api/v1`;

const HTTP_OPTION = {
  headers: { 'X-API-KEY': process.env.MICROCMS_API_KEY! },
};

const GET_ALL_CONTENTS_LIMIT = 10;

type EndpointTypeMap = {
  blog: Blog;
  history: History;
  skill: Skill;
  portfolio: Portfolio;
  culture: Culture;
};

interface FetchContentQuery {
  draftKey?: string;
  fields?: string;
  depth?: number;
}

interface FetchContentsQuery extends FetchContentQuery {
  limit?: number;
  offset?: number;
  orders?: string;
  q?: string;
  ids?: string;
  filters?: string;
}

interface FetchAllContentsQuery extends Omit<FetchContentsQuery, 'offset'> {}

interface GetContentsResponse<T> {
  contents: T[];
  totalCount: number;
  offset: number;
  limit: number;
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

// 引数値によって返り値の型がいい感じに変わる
// https://github.com/microsoft/TypeScript/issues/24929
type IFetchContentsRawFn<T extends keyof EndpointTypeMap> = (
  endpoint: T,
  query?: FetchContentsQuery,
) => Promise<GetContentsResponse<EndpointTypeMap[T]>>;
type FetchContentsRawFn = IFetchContentsRawFn<'blog'> &
  IFetchContentsRawFn<'history'> &
  IFetchContentsRawFn<'skill'> &
  IFetchContentsRawFn<'portfolio'> &
  IFetchContentsRawFn<'culture'> &
  IFetchContentsRawFn<any>;
export const fetchContentsRaw: FetchContentsRawFn = async (
  endpoint: keyof EndpointTypeMap,
  query: FetchContentsQuery = {},
) => {
  return fetch(
    `${BASE_URL}/${endpoint}${makeQueryString(query)}`,
    HTTP_OPTION,
  ).then(res => res.json());
};

type IFetchContentsFn<T extends keyof EndpointTypeMap> = (
  endpoint: T,
  query?: FetchContentsQuery,
) => Promise<EndpointTypeMap[T][]>;
type FetchContentsFn = IFetchContentsFn<'blog'> &
  IFetchContentsFn<'history'> &
  IFetchContentsFn<'skill'> &
  IFetchContentsFn<'portfolio'> &
  IFetchContentsFn<'culture'>;
export const fetchContents: FetchContentsFn = async (
  endpoint: keyof EndpointTypeMap,
  query: FetchContentsQuery = {},
) => {
  const data = await fetchContentsRaw(endpoint, query);
  return data.contents;
};

type IFetchAllContentsFn<T extends keyof EndpointTypeMap> = (
  endpoint: T,
  query?: FetchAllContentsQuery,
) => Promise<EndpointTypeMap[T][]>;
type FetchAllContentsFn = IFetchAllContentsFn<'blog'> &
  IFetchAllContentsFn<'history'> &
  IFetchAllContentsFn<'skill'> &
  IFetchAllContentsFn<'portfolio'> &
  IFetchAllContentsFn<'culture'>;
export const fetchAllContents: FetchAllContentsFn = async (
  endpoint: keyof EndpointTypeMap,
  query: FetchAllContentsQuery = {},
) => {
  const allContents = [];

  let offset = 0;
  for (;;) {
    // eslint-disable-next-line no-await-in-loop
    const data = await fetchContentsRaw(endpoint, {
      limit: GET_ALL_CONTENTS_LIMIT,
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

type IFetchContentFn<T extends keyof EndpointTypeMap> = (
  endpoint: T,
  id: string,
  query?: FetchContentQuery,
) => Promise<EndpointTypeMap[T]>;
type FetchContentFn = IFetchContentFn<'blog'> &
  IFetchContentFn<'history'> &
  IFetchContentFn<'skill'> &
  IFetchContentFn<'portfolio'> &
  IFetchContentFn<'culture'>;
export const fetchContent: FetchContentFn = async (
  endpoint: keyof EndpointTypeMap,
  id: string,
  query: FetchContentQuery = {},
) => {
  return fetch(
    `${BASE_URL}/${endpoint}/${id}${makeQueryString(query)}`,
    HTTP_OPTION,
  ).then(res => res.json());
};
