export type ImageVariant = Readonly<{
  src: string;
  width: number;
}>;

export type ImageVariantEntry = Readonly<{
  avif: readonly ImageVariant[];
  height: number;
  src: string;
  webp: readonly ImageVariant[];
  width: number;
}>;

export type ImageVariantManifest = Readonly<
  Record<string, ImageVariantEntry | undefined>
>;
