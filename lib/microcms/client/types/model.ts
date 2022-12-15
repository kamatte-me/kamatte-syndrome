export type Model<TSchema extends object> = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  revisedAt?: string;
} & TSchema;

export type RepeatedField<T extends CustomField<string, object>> = T[];

export type CustomField<TID extends string, TSchema extends object> = {
  fieldId: TID;
} & TSchema;

export interface Image {
  url: string;
  height: number;
  width: number;
}
