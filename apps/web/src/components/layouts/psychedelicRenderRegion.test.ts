import { describe, expect, it } from 'vitest';
import { getTopEdgeRenderRegion } from './psychedelicRenderRegion';

describe('getTopEdgeRenderRegion', () => {
  it('covers both the hidden and top-aligned desktop header positions', () => {
    expect(
      getTopEdgeRenderRegion(
        { height: 900, width: 1440 },
        { height: 900, width: 1440 },
        93,
      ),
    ).toEqual({ height: 187, width: 1440, x: 0, y: 0 });
  });

  it('scales fractional edges without leaving a one-pixel seam', () => {
    expect(
      getTopEdgeRenderRegion(
        { height: 450, width: 720 },
        { height: 900, width: 1440 },
        41.25,
      ),
    ).toEqual({ height: 42, width: 720, x: 0, y: 0 });
  });

  it('clamps the covered area to the render target height', () => {
    expect(
      getTopEdgeRenderRegion(
        { height: 100, width: 200 },
        { height: 100, width: 200 },
        80,
      ),
    ).toEqual({ height: 100, width: 200, x: 0, y: 0 });
  });

  it('returns null for an unavailable clipping area', () => {
    expect(
      getTopEdgeRenderRegion(
        { height: 900, width: 1440 },
        { height: 900, width: 1440 },
        0,
      ),
    ).toBeNull();
  });
});
