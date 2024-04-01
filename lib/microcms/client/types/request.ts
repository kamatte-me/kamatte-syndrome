type DefaultQuery = {
  draftKey?: string;
  fields?: string;
  depth?: number;
};

export type GetContentQuery = DefaultQuery;

export type GetContentsQuery = DefaultQuery & {
  limit?: number;
  offset?: number;
  orders?: string;
  q?: string;
  ids?: string;
  filters?: string;
};

export type GetAllContentsQuery = Omit<GetContentsQuery, 'offset'>;
