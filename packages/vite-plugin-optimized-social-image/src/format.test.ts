import { describe, expect, it } from 'vitest';
import {
  defaultSocialImageFormatSettings,
  resolveSocialImageFormatSettings,
} from './format.ts';

describe('resolveSocialImageFormatSettings', () => {
  it('uses Sharp defaults when no format options are supplied', () => {
    expect(resolveSocialImageFormatSettings()).toEqual(
      defaultSocialImageFormatSettings,
    );
  });

  it('resolves each compatible output format independently', () => {
    expect(
      resolveSocialImageFormatSettings({
        gif: { effort: 10 },
        jpeg: { quality: 65 },
        png: { compressionLevel: 9 },
      }),
    ).toEqual({
      gif: { effort: 10 },
      jpeg: { quality: 65 },
      png: { compressionLevel: 9 },
    });
  });

  it.each([
    [{ jpeg: { quality: 0 } }, 'jpeg.quality must be an integer from 1 to 100'],
    [
      { png: { compressionLevel: 10 } },
      'png.compressionLevel must be an integer from 0 to 9',
    ],
    [{ gif: { effort: 0 } }, 'gif.effort must be an integer from 1 to 10'],
  ] as const)('rejects invalid settings: %o', (options, message) => {
    expect(() => resolveSocialImageFormatSettings(options)).toThrow(message);
  });
});
