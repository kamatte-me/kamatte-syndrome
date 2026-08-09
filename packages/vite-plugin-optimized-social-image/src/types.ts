export const socialImageFormats = ['gif', 'jpeg', 'png'] as const;

export type SocialImageFormat = (typeof socialImageFormats)[number];

export type SocialImage = Readonly<{
  format: SocialImageFormat;
  height: number;
  src: string;
  width: number;
}>;

export type SocialImageManifest = Readonly<
  Record<string, SocialImage | undefined>
>;
