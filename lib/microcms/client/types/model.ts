export type Model<TSchema extends Record<string, any>> = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  revisedAt?: string;
} & TSchema;

export type RepeatedField<T extends CustomField<string, Record<string, any>>> =
  T[];

export type CustomField<
  TID extends string,
  TSchema extends Record<string, any>,
> = {
  fieldId: TID;
} & TSchema;

export interface Image {
  url: string;
  height: number;
  width: number;
}
