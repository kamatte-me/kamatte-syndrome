interface DefaultQuery {
  draftKey?: string;
  fields?: string;
  depth?: number;
}

export type GetContentQuery = DefaultQuery;

export interface GetContentsQuery extends DefaultQuery {
  limit?: number;
  offset?: number;
  orders?: string;
  q?: string;
  ids?: string;
  filters?: string;
}

export type GetAllContentsQuery = Omit<GetContentsQuery, 'offset'>;
