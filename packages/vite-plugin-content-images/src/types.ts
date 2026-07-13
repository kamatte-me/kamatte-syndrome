export type ContentImageVariant = Readonly<{
  src: string;
  width: number;
}>;

export type ContentImageEntry = Readonly<{
  avif: readonly ContentImageVariant[];
  height: number;
  src: string;
  webp: readonly ContentImageVariant[];
  width: number;
}>;

export type ContentImageManifest = Readonly<Record<string, ContentImageEntry>>;
