export type GifSocialImageFormatOptions = Readonly<{
  /** CPU effort from 1 (fastest) to 10 (smallest output). Defaults to 7. */
  effort?: number;
}>;

export type JpegSocialImageFormatOptions = Readonly<{
  /** Output quality from 1 to 100. Defaults to 80. */
  quality?: number;
}>;

export type PngSocialImageFormatOptions = Readonly<{
  /** zlib compression level from 0 to 9. Defaults to 6. */
  compressionLevel?: number;
}>;

export type SocialImageFormatSettings = Readonly<{
  gif: Readonly<{ effort: number }>;
  jpeg: Readonly<{ quality: number }>;
  png: Readonly<{ compressionLevel: number }>;
}>;

export const defaultSocialImageFormatSettings = {
  gif: { effort: 7 },
  jpeg: { quality: 80 },
  png: { compressionLevel: 6 },
} as const satisfies SocialImageFormatSettings;

export function resolveSocialImageFormatSettings({
  gif,
  jpeg,
  png,
}: Readonly<{
  gif?: GifSocialImageFormatOptions;
  jpeg?: JpegSocialImageFormatOptions;
  png?: PngSocialImageFormatOptions;
}> = {}): SocialImageFormatSettings {
  return {
    gif: {
      effort: resolveIntegerOption(
        'gif.effort',
        gif?.effort,
        defaultSocialImageFormatSettings.gif.effort,
        1,
        10,
      ),
    },
    jpeg: {
      quality: resolveIntegerOption(
        'jpeg.quality',
        jpeg?.quality,
        defaultSocialImageFormatSettings.jpeg.quality,
        1,
        100,
      ),
    },
    png: {
      compressionLevel: resolveIntegerOption(
        'png.compressionLevel',
        png?.compressionLevel,
        defaultSocialImageFormatSettings.png.compressionLevel,
        0,
        9,
      ),
    },
  };
}

function resolveIntegerOption(
  name: string,
  value: number | undefined,
  defaultValue: number,
  minimum: number,
  maximum: number,
) {
  const resolvedValue = value ?? defaultValue;
  if (
    !Number.isInteger(resolvedValue) ||
    resolvedValue < minimum ||
    resolvedValue > maximum
  ) {
    throw new Error(`${name} must be an integer from ${minimum} to ${maximum}`);
  }
  return resolvedValue;
}
