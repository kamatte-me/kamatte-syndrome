import { describe, expect, it } from 'vitest';
import { getRectOverlap } from './cutoutGeometry';

function createRect({
  height,
  left,
  top,
  width,
}: {
  height: number;
  left: number;
  top: number;
  width: number;
}): DOMRect {
  return {
    bottom: top + height,
    height,
    left,
    right: left + width,
    toJSON: () => ({}),
    top,
    width,
    x: left,
    y: top,
  } as DOMRect;
}

describe('getRectOverlap', () => {
  it('returns the foreground overlap relative to the background rect', () => {
    expect(
      getRectOverlap(
        createRect({ height: 160, left: 40, top: 24, width: 220 }),
        createRect({ height: 80, left: 0, top: 0, width: 320 }),
      ),
    ).toEqual({
      height: 56,
      left: 40,
      top: 24,
      width: 220,
    });
  });

  it('clips overlap to the background rect', () => {
    expect(
      getRectOverlap(
        createRect({ height: 80, left: -24, top: -12, width: 120 }),
        createRect({ height: 60, left: 0, top: 0, width: 100 }),
      ),
    ).toEqual({
      height: 60,
      left: 0,
      top: 0,
      width: 96,
    });
  });

  it('returns null when rects do not overlap', () => {
    expect(
      getRectOverlap(
        createRect({ height: 40, left: 120, top: 0, width: 40 }),
        createRect({ height: 80, left: 0, top: 0, width: 100 }),
      ),
    ).toBeNull();
  });

  it('returns null when rects only touch at an edge', () => {
    expect(
      getRectOverlap(
        createRect({ height: 40, left: 100, top: 0, width: 40 }),
        createRect({ height: 80, left: 0, top: 0, width: 100 }),
      ),
    ).toBeNull();
  });
});
