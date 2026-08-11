import type { Metadata } from 'sharp';
import { describe, expect, it } from 'vitest';
import { getImageDisplayDimensions, getSharpEncoderVersion } from './sharp.ts';

describe('Sharp helpers', () => {
  it('prefers auto-oriented dimensions and frame height for animated images', () => {
    expect(
      getImageDisplayDimensions({
        autoOrient: { height: 120, width: 80 },
        height: 80,
        pageHeight: 60,
        pages: 2,
        width: 120,
      } as Metadata),
    ).toEqual({ height: 60, width: 80 });
  });

  it('uses unchanged auto-oriented dimensions for a static image', () => {
    expect(
      getImageDisplayDimensions({
        autoOrient: { height: 60, width: 90 },
        height: 60,
        width: 90,
      } as Metadata),
    ).toEqual({ height: 60, width: 90 });
  });

  it('returns a stable, sorted description of available encoders', () => {
    const encoderVersion = getSharpEncoderVersion();
    const entries = encoderVersion.split('\0');

    expect(entries).toContainEqual(expect.stringMatching(/^sharp:/));
    expect(entries).toEqual([...entries].sort());
  });
});
