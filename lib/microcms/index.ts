const BASE_URL = `https://${process.env.MICROCMS_SERVICE_ID}.microcms.io/api/v1`;

const HTTP_OPTION = {
  headers: { 'X-API-KEY': process.env.MICROCMS_API_KEY! },
};

const GET_ALL_CONTENTS_LIMIT = 10;

type Endpoint = 'blog' | 'history' | 'skill' | 'portfolio' | 'culture';

export interface GetContentQuery {
  draftKey?: string;
  fields?: string;
  depth?: number;
}

interface GetContentsQuery extends GetContentQuery {
  limit?: number;
  offset?: number;
  orders?: string;
  q?: string;
  ids?: string;
  filters?: string;
}

interface GetAllContentsQuery extends Omit<GetContentsQuery, 'offset'> {}

const makeQueryString = (query: object): string => {
  let queryStr = Object.entries(query)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  if (queryStr.length > 0) {
    queryStr = `?${queryStr}`;
  }
  return queryStr;
};

interface GetContentsResponse<T> {
  contents: T[];
  totalCount: number;
  offset: number;
  limit: 10;
}

export const fetchContentsRaw = async <T>(
  endpoint: Endpoint,
  query: GetContentsQuery = {},
): Promise<GetContentsResponse<T>> => {
  return fetch(
    `${BASE_URL}/${endpoint}${makeQueryString(query)}`,
    HTTP_OPTION,
  ).then(res => res.json() as Promise<GetContentsResponse<T>>);
};

export const fetchContents = async <T>(
  endpoint: Endpoint,
  query: GetContentsQuery = {},
): Promise<T[]> => {
  const data = await fetchContentsRaw<T>(endpoint, query);
  return data.contents;
};

export const fetchAllContents = async <T>(
  endpoint: Endpoint,
  query: GetAllContentsQuery = {},
): Promise<T[]> => {
  const allContents: T[] = [];

  let offset = 0;
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const data = await fetchContentsRaw<T>(endpoint, {
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

export const fetchContent = async <T>(
  endpoint: Endpoint,
  id: string,
  query: GetContentQuery = {},
): Promise<T> => {
  return fetch(
    `${BASE_URL}/${endpoint}/${id}${makeQueryString(query)}`,
    HTTP_OPTION,
  ).then(res => res.json() as Promise<T>);
};
