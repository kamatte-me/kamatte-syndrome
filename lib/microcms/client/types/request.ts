export type GetContentQuery = {
  draftKey?: string;
  fields?: string;
  depth?: number;
};

export type GetContentsQuery = GetContentQuery & {
  limit?: number;
  offset?: number;
  orders?: string;
  q?: string;
  ids?: string;
  filters?: string;
};

export type GetAllContentsQuery = Omit<GetContentsQuery, 'offset'>;
