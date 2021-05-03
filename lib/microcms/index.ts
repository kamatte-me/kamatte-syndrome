const baseUrl = `https://${process.env.MICROCMS_SERVICE_ID}.microcms.io/api/v1`;

const httpOption = {
  headers: { 'X-API-KEY': process.env.MICROCMS_API_KEY! },
};

type Endpoint = 'blog' | 'history' | 'skill' | 'portfolio' | 'illustration';

export interface GetContentQuery {
  draftKey?: string;
  fields?: string;
  depth?: number;
}

export interface GetAllContentsQuery extends GetContentQuery {
  limit?: number;
  offset?: number;
  orders?: string;
  q?: string;
  ids?: string;
  filters?: string;
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

export const getAllContents = async <T>(
  endpoint: Endpoint,
  query: GetAllContentsQuery = {},
): Promise<T[]> => {
  const data = await fetch(
    `${baseUrl}/${endpoint}${makeQueryString(query)}`,
    httpOption,
  )
    .then(res => res.json())
    .catch(() => null);
  return data.contents;
};

export const getContent = async <T>(
  endpoint: Endpoint,
  id: string,
  query: GetContentQuery,
): Promise<T> => {
  return fetch(
    `${baseUrl}/${endpoint}/${id}${makeQueryString(query)}`,
    httpOption,
  )
    .then(res => res.json())
    .catch(() => null);
};
