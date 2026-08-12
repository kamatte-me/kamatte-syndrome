type Size = {
  height: number;
  width: number;
};

export type RenderRegion = Size & {
  x: number;
  y: number;
};

const HIDDEN_HEADER_OFFSET_GUARD = 1;

export function getTopEdgeRenderRegion(
  renderSize: Size,
  containerSize: Size,
  clipHeight: number,
): RenderRegion | null {
  if (
    ![
      renderSize.height,
      renderSize.width,
      containerSize.height,
      containerSize.width,
      clipHeight,
    ].every(Number.isFinite) ||
    renderSize.height <= 0 ||
    renderSize.width <= 0 ||
    containerSize.height <= 0 ||
    containerSize.width <= 0 ||
    clipHeight <= 0
  ) {
    return null;
  }

  // The desktop header can move upward by its full height plus one pixel.
  // Keeping both its current and top-aligned pixels warm avoids a blank frame
  // when the compositor reveals it between the renderer's 30 fps updates.
  const coveredCssHeight = Math.min(
    containerSize.height,
    clipHeight * 2 + HIDDEN_HEADER_OFFSET_GUARD,
  );
  const height = Math.min(
    renderSize.height,
    Math.ceil(coveredCssHeight * (renderSize.height / containerSize.height)),
  );

  if (height <= 0) {
    return null;
  }

  return {
    height,
    width: renderSize.width,
    x: 0,
    y: 0,
  };
}
